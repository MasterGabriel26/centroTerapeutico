import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Trash2, Pill, User, Loader2, Eye, ChevronDown, ChevronUp, Search, RefreshCw, FileDown } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { useRecetas } from "../../hooks/useRecetas";
import { useMedicamentos } from "../../../medicamentos/hooks/useMedicamentos";
import { Receta, MedicamentoReceta } from "../../types/receta";
import { useAuthStore } from "../../../../store/authStore";
import { getDoc, doc, increment, runTransaction, collection } from "firebase/firestore";
import { db } from "../../../../utils/firebase";

const RecetasTab = ({ pacienteId }: { pacienteId: string }) => {
  const navigate = useNavigate();
  const { usuario: doctor } = useAuthStore();
  
  const { 
    recetas, 
    loading, 
    error, 
    cargarRecetas, 
    crearReceta,
    actualizarReceta,
    totalGastado,
    obtenerMedicamentosUnicos
  } = useRecetas(pacienteId);

  const { medicamentos: todosMedicamentos, getMedicamentoById } = useMedicamentos();
  
  const [openModal, setOpenModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [riesgos, setRiesgos] = useState(""); // Nuevo estado para riesgos
  const [medicamentosReceta, setMedicamentosReceta] = useState<MedicamentoReceta[]>([]);
  const [currentMedicamento, setCurrentMedicamento] = useState<{
    medicamentoId: string;
    posologia: string;
    tiempoUso: string;
    cantidad: number;
    notasAdicionales: string;
  }>({
    medicamentoId: "",
    posologia: "",
    tiempoUso: "",
    cantidad: 1,
    notasAdicionales: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detalleReceta, setDetalleReceta] = useState<Receta | null>(null);
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<{id: string, nombre: string}[]>([]);

  // Cargar recetas al montar el componente
  useEffect(() => {
    if (initialLoad) {
      cargarRecetas().finally(() => setInitialLoad(false));
    }
  }, [cargarRecetas, initialLoad]);

  // Cargar información de doctores
  useEffect(() => {
    const loadDoctorInfo = async () => {
      const doctorIds = Array.from(new Set(recetas.map(r => r.idDoctor)));
      const info: Record<string, string> = {};
      
      for (const id of doctorIds) {
        if (!doctoresInfo[id]) {
          try {
            const docRef = doc(db, "users", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              info[id] = docSnap.data().nombre_completo || "Médico desconocido";
            } else {
              info[id] = "Médico no encontrado";
            }
          } catch (error) {
            console.error("Error cargando información del médico:", error);
            info[id] = "Error al cargar";
          }
        }
      }
      
      setDoctoresInfo(prev => ({ ...prev, ...info }));
    };
    
    if (recetas.length > 0) {
      loadDoctorInfo();
    }
  }, [recetas]);

  // Cargar medicamentos disponibles
  useEffect(() => {
    const medicamentosIds = obtenerMedicamentosUnicos();
    const disponibles = medicamentosIds.map(id => {
      const med = getMedicamentoById(id);
      return med ? { id, nombre: med.nombre } : null;
    }).filter(Boolean) as {id: string, nombre: string}[];
    
    setMedicamentosDisponibles(disponibles);
  }, [todosMedicamentos, obtenerMedicamentosUnicos, getMedicamentoById]);

  // Filtrar recetas según término de búsqueda y estado
  const filteredRecetas = useMemo(() => {
    return recetas.filter(receta => {
      if (statusFilter === "active" && !receta.isActive) return false;
      if (statusFilter === "inactive" && receta.isActive) return false;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        
        const matchesMotivo = receta.motivo.toLowerCase().includes(term);
        const matchesDoctor = (doctoresInfo[receta.idDoctor] || "").toLowerCase().includes(term);
        const matchesFolio = receta.folio?.toLowerCase().includes(term);
        const matchesRiesgos = receta.riesgos?.toLowerCase().includes(term) || false;
        const matchesMedicamento = receta.medicamentos.some(m => {
          return (
            m.nombre.toLowerCase().includes(term) || 
            m.posologia.toLowerCase().includes(term)
          );
        });
        
        return matchesMotivo || matchesDoctor || matchesMedicamento || matchesFolio || matchesRiesgos;
      }
      
      return true;
    });
  }, [recetas, searchTerm, statusFilter, doctoresInfo]);

  const resetForm = useCallback(() => {
    setMotivo("");
    setRiesgos("");
    setMedicamentosReceta([]);
    setCurrentMedicamento({
      medicamentoId: "",
      posologia: "",
      tiempoUso: "",
      cantidad: 1,
      notasAdicionales: ""
    });
    setFormError(null);
  }, []);

// En el handleAddMedicamento
const handleAddMedicamento = useCallback(() => {
  if (!currentMedicamento.medicamentoId || !currentMedicamento.posologia.trim()) {
    setFormError("Debes seleccionar un medicamento y especificar la posología");
    return;
  }
  
  const medicamentoInfo = getMedicamentoById(currentMedicamento.medicamentoId);
  if (!medicamentoInfo) {
    setFormError("Medicamento no encontrado");
    return;
  }
  
  if (medicamentoInfo.stock < currentMedicamento.cantidad) {
    setFormError(`No hay suficiente stock de ${medicamentoInfo.nombre}. Stock disponible: ${medicamentoInfo.stock}`);
    return;
  }

  const precioUnitario = Number(medicamentoInfo.precioVenta) || 0;
  const subtotal = precioUnitario * currentMedicamento.cantidad;
  
  setMedicamentosReceta(prev => [...prev, {
    ...currentMedicamento,
    nombre: medicamentoInfo.nombre,
    precioUnitario: precioUnitario,
    subtotal: subtotal
  }]);
  
  // Restablecer el formulario
  setCurrentMedicamento({
    medicamentoId: "",
    posologia: "",
    tiempoUso: "",
    cantidad: 1,
    notasAdicionales: ""
  });
  setFormError(null);
}, [currentMedicamento, getMedicamentoById]);


const handleRemoveMedicamento = useCallback((index: number) => {
    setMedicamentosReceta(prev => prev.filter((_, i) => i !== index));
  }, []);

const handleSubmit = useCallback(async () => {
  if (!doctor?.id) {
    setFormError("No se pudo identificar al médico");
    return;
  }
  
  if (!motivo.trim()) {
    setFormError("El motivo es obligatorio");
    return;
  }
  
  if (medicamentosReceta.length === 0) {
    setFormError("Debe agregar al menos un medicamento");
    return;
  }
  
  setIsSubmitting(true);
  setFormError(null);
  
  try {
    // Calcular el total
    const total = medicamentosReceta.reduce((sum, med) => sum + (med.subtotal || 0), 0);

    // Generar folio único
    const timestamp = new Date().getTime().toString();
    const randomPart = Math.floor(Math.random() * 900) + 100; // 100-999
    const folio = `REC-${timestamp.slice(-6)}-${randomPart}`;

    // Usar transacción para asegurar la integridad de los datos
    await runTransaction(db, async (transaction) => {
      // 1. Verificar stock y preparar actualizaciones
      const updates = [];
      for (const med of medicamentosReceta) {
        const medRef = doc(db, "medicamentos", med.medicamentoId);
        const medDoc = await transaction.get(medRef);
        
        if (!medDoc.exists()) {
          throw new Error(`Medicamento ${med.medicamentoId} no encontrado`);
        }
        
        const currentStock = medDoc.data().stock;
        if (currentStock < med.cantidad) {
          throw new Error(`No hay suficiente stock de ${med.nombre}. Stock disponible: ${currentStock}`);
        }
        
        // Preparar actualización de stock
        updates.push({
          ref: medRef,
          newStock: currentStock - med.cantidad
        });
      }

      // 2. Aplicar todas las actualizaciones de stock
      for (const update of updates) {
        transaction.update(update.ref, { stock: update.newStock });
      }

      // 3. Crear la receta CON EL FOLIO INCLUIDO
      const recetaRef = doc(collection(db, `pacientes/${pacienteId}/recetas`));
      transaction.set(recetaRef, {
        idDoctor: doctor.id,
        motivo,
        medicamentos: medicamentosReceta.map(med => ({
          medicamentoId: med.medicamentoId,
          nombre: med.nombre,
          posologia: med.posologia,
          tiempoUso: med.tiempoUso,
          cantidad: med.cantidad,
          precioUnitario: med.precioUnitario,
          subtotal: med.subtotal,
          notasAdicionales: med.notasAdicionales
        })),
        total,
        isActive: true,
        fecha: new Date(),
        folio // AÑADE ESTA LÍNEA PARA INCLUIR EL FOLIO
      });

      console.log('Receta creada con folio:', folio); // Para depuración
    });

    setOpenModal(false);
    resetForm();
    await cargarRecetas();
  } catch (err) {
    setFormError(err instanceof Error ? err.message : "Error al crear la receta");
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
}, [doctor, motivo, medicamentosReceta, pacienteId, cargarRecetas, resetForm]);

  const formatDate = useCallback((date?: Date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const toggleRowExpand = useCallback((id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleToggleRecetaStatus = useCallback(async (id: string) => {
    try {
      const receta = recetas.find(r => r.id === id);
      if (receta) {
        await actualizarReceta(id, { isActive: !receta.isActive });
        await cargarRecetas();
      }
    } catch (error) {
      console.error("Error actualizando receta:", error);
    } finally {
      setDeletingId(null);
    }
  }, [recetas, actualizarReceta, cargarRecetas]);

  return (
    <div className="p-4 font-poppins">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
            <Pill className="text-blue-500" size={24} />
            Recetas Médicas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de recetas médicas del paciente
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon={<FileDown size={16} />}
            onClick={() => navigate(`/pacientes/${pacienteId}/recetas/pdf`)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          >
            <span className="hidden sm:inline">Generar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600">Total gastado</p>
            <p className="font-medium text-blue-800">
              ${totalGastado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <span className="hidden sm:inline">Nueva Receta</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
         <input
  type="text"
  placeholder="Buscar recetas (folio, médico, motivo, medicamento...)"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
/>
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600 whitespace-nowrap hidden sm:block">Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="active">Activas</option>
            <option value="inactive">Eliminadas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      {/* Modal para crear receta */}
      <Dialog 
        isOpen={openModal} 
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }} 
        title="Nueva Receta Médica"
        size="md"
      >
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
              {formError}
            </div>
          )}

          {/* Información del médico */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
            <h3 className="font-medium text-blue-800 text-sm mb-1">Médico responsable</h3>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" size={16} />
              <div>
                <p className="font-medium">{doctor?.nombre_completo || "No disponible"}</p>
                <p className="text-xs text-gray-600">ID: {doctor?.id || "No disponible"}</p>
              </div>
            </div>
          </div>

          {/* Campo motivo */}
          <div className="mb-4">
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la receta <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Infección respiratoria"
              rows={2}
              required
            />
          </div>

   <div className="mb-4">
            <label htmlFor="riesgos" className="block text-sm font-medium text-gray-700 mb-1">
              Riesgos detectados
            </label>
            <textarea
              id="riesgos"
              value={riesgos}
              onChange={(e) => setRiesgos(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Alergias conocidas, interacciones medicamentosas, etc."
              rows={2}
            />
          </div>

          {/* Sección de medicamentos */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Medicamentos <span className="text-red-500">*</span></h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {medicamentosReceta.length} {medicamentosReceta.length === 1 ? 'medicamento' : 'medicamentos'}
              </span>
            </div>
            
            {/* Lista de medicamentos */}
            {medicamentosReceta.length > 0 && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Medicamento</th>
                      <th className="text-left py-2 px-3 font-medium">Posología</th>
                      <th className="text-right py-2 px-3 font-medium">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicamentosReceta.map((med, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <div className="font-medium">{med.nombre}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div>{med.posologia}</div>
                          {med.tiempoUso && <div className="text-xs text-gray-500">{med.tiempoUso}</div>}
                        </td>
                        <td className="py-2 px-3 text-right">
                          ${med.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveMedicamento(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Formulario para agregar medicamento */}
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label htmlFor="medicamentoId" className="block text-xs font-medium text-gray-600 mb-1">
                    Seleccionar medicamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="medicamentoId"
                    value={currentMedicamento.medicamentoId}
                    onChange={(e) => setCurrentMedicamento({
                      ...currentMedicamento,
                      medicamentoId: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Seleccione un medicamento</option>
                    {todosMedicamentos
                      .filter(med => med.estado === 'activo')
                      .map(med => (
                        <option key={med.id} value={med.id || ''}>
                          {med.nombre} ({med.presentacion}) - ${med.precioVenta} (Stock: {med.stock})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="medPosologia" className="block text-xs font-medium text-gray-600 mb-1">
                    Posología <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="medPosologia"
                    value={currentMedicamento.posologia}
                    onChange={(e) => setCurrentMedicamento({
                      ...currentMedicamento, 
                      posologia: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Ej: 500mg cada 8 horas"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="medTiempoUso" className="block text-xs font-medium text-gray-600 mb-1">
                      Tiempo de uso
                    </label>
                    <input
                      type="text"
                      id="medTiempoUso"
                      value={currentMedicamento.tiempoUso}
                      onChange={(e) => setCurrentMedicamento({
                        ...currentMedicamento, 
                        tiempoUso: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      placeholder="Ej: 7 días"
                    />
                  </div>

                  <div>
                    <label htmlFor="medCantidad" className="block text-xs font-medium text-gray-600 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      id="medCantidad"
                      value={currentMedicamento.cantidad}
                      onChange={(e) => setCurrentMedicamento({
                        ...currentMedicamento, 
                        cantidad: Number(e.target.value) || 1
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="medNotas" className="block text-xs font-medium text-gray-600 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    id="medNotas"
                    value={currentMedicamento.notasAdicionales}
                    onChange={(e) => setCurrentMedicamento({
                      ...currentMedicamento, 
                      notasAdicionales: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Observaciones importantes"
                    rows={2}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddMedicamento}
                disabled={!currentMedicamento.medicamentoId || !currentMedicamento.posologia}
                className="w-full py-2 text-sm flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Agregar medicamento
              </Button>
            </div>
          </div>

          {/* Resumen y total */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total estimado:</span>
              <span className="text-lg font-bold">
                ${medicamentosReceta.reduce((sum, med) => sum + (med.subtotal || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="text-sm px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || medicamentosReceta.length === 0}
              className="text-sm px-4 py-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Creando...
                </span>
              ) : 'Crear Receta'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Estado de carga INICIAL */}
      {initialLoad ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Mensaje cuando no hay recetas */}
          {!initialLoad && filteredRecetas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <Pill className="text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mt-4 text-center px-4">
                {statusFilter === "active" 
                  ? "No hay recetas activas" 
                  : statusFilter === "inactive" 
                    ? "No hay recetas eliminadas" 
                    : "No hay recetas registradas"}
              </h3>
              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear nueva receta
              </Button>
            </div>
          )}

          {/* Tabla de recetas - Versión responsiva */}
          {!initialLoad && filteredRecetas.length > 0 && (
            <>
              {/* Versión móvil */}
              <div className="sm:hidden space-y-3">
                {filteredRecetas.map((receta) => (
                  <div key={receta.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{receta.folio}</p>
                        <p className="font-medium">{formatDate(receta.fecha)}</p>
                        <p className="text-sm text-gray-600">
                          {doctoresInfo[receta.idDoctor] || "Cargando..."}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        receta.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {receta.isActive ? 'Activa' : 'Eliminada'}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium">Medicamentos:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {receta.medicamentos.map(m => m.nombre).join(', ')}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <p className="font-medium">
                        ${receta.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                      </p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setDetalleReceta(receta)}
                          className="text-blue-600 p-1"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {receta.isActive ? (
                          <button
                            onClick={() => setDeletingId(receta.id!)}
                            className="text-red-600 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleRecetaStatus(receta.id!)}
                            className="text-green-600 p-1"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Versión desktop */}
              <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Folio
      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Médico
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicamentos
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecetas.map((receta) => (
                      <tr 
                        key={receta.id} 
                        className={`hover:bg-gray-50 ${!receta.isActive ? 'bg-gray-100 text-gray-500' : ''}`}
                      >
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {receta.folio}
        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(receta.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctoresInfo[receta.idDoctor] || "Cargando..."}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <div className="truncate max-w-[300px]">
                            {receta.medicamentos.map(m => m.nombre).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          ${receta.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            receta.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {receta.isActive ? 'Activa' : 'Eliminada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => setDetalleReceta(receta)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                            >
                              <Eye size={14} />
                              <span className="hidden md:inline">Detalle</span>
                            </Button>
                            
                            {receta.isActive ? (
                              <Button
                                variant="outline"
                                onClick={() => setDeletingId(receta.id!)}
                                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                                <span className="hidden md:inline">Eliminar</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => handleToggleRecetaStatus(receta.id!)}
                                className="text-green-600 border-green-200 hover:bg-green-50 flex items-center gap-1"
                              >
                                <RefreshCw size={14} />
                                <span className="hidden md:inline">Restaurar</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal de detalle de receta */}
      <Dialog 
        isOpen={!!detalleReceta} 
        onClose={() => setDetalleReceta(null)} 
        title="Detalle de receta"
        size="lg"
      >
        {detalleReceta && (
          <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                <div>
          <p className="text-sm text-gray-500 mb-1">Folio</p>
          <p className="font-medium">{detalleReceta.folio}</p>
        </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha</p>
                <p className="font-medium">{formatDate(detalleReceta.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Médico</p>
                <p className="font-medium">{doctoresInfo[detalleReceta.idDoctor] || "Cargando..."}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Motivo</p>
                <p className="font-medium">{detalleReceta.motivo}</p>
              </div>
               {detalleReceta.riesgos && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Riesgos detectados</p>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800">{detalleReceta.riesgos}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Estado</p>
                <p className={`font-medium ${
                  detalleReceta.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {detalleReceta.isActive ? 'Activa' : 'Eliminada'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="font-medium">
                  ${detalleReceta.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Medicamentos</h3>
              <div className="space-y-3">
                {detalleReceta.medicamentos.map((med, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{med.nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${med.subtotal?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {med.cantidad} unidad(es) x ${med.precioUnitario?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-1"><span className="font-medium">Posología:</span> {med.posologia}</p>
                    {med.tiempoUso && <p className="text-sm mb-1"><span className="font-medium">Duración:</span> {med.tiempoUso}</p>}
                    {med.notasAdicionales && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Notas:</span> {med.notasAdicionales}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title={recetas.find(r => r.id === deletingId)?.isActive ? "Desactivar receta" : "Activar receta"}
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            {recetas.find(r => r.id === deletingId)?.isActive
              ? "¿Estás seguro de que deseas desactivar esta receta? No se podrá ver en el listado principal pero podrá ser reactivada."
              : "¿Estás seguro de que deseas reactivar esta receta? Volverá a aparecer en el listado principal."}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button 
              variant={recetas.find(r => r.id === deletingId)?.isActive ? "danger" : "primary"}
              onClick={() => {
                if (deletingId) {
                  handleToggleRecetaStatus(deletingId);
                }
              }}
            >
              {recetas.find(r => r.id === deletingId)?.isActive ? "Desactivar" : "Activar"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default RecetasTab;