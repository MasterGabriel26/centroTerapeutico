import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pill, User, Loader2, Eye, ChevronDown, ChevronUp, Search, RefreshCw } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { useRecetas } from "../../hooks/useRecetas";
import { Receta, Medicamento } from "../../types/receta";
import { useAuthStore } from "../../../../store/authStore";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../../utils/firebase";

const RecetasTab = ({ pacienteId }: { pacienteId: string }) => {
  const { usuario: doctor } = useAuthStore();
  
  const { 
    recetas, 
    loading, 
    error, 
    cargarRecetas, 
    crearReceta,
    actualizarReceta // Nueva función para actualizar
  } = useRecetas(pacienteId);
  
  const [openModal, setOpenModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [currentMedicamento, setCurrentMedicamento] = useState<Medicamento>({ nombre: "", posologia: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detalleReceta, setDetalleReceta] = useState<Receta | null>(null);
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Nuevos estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

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

  // Filtrar recetas según término de búsqueda y estado
  const filteredRecetas = useMemo(() => {
    return recetas.filter(receta => {
      // Filtrar por estado
      if (statusFilter === "active" && !receta.isActive) return false;
      if (statusFilter === "inactive" && receta.isActive) return false;
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesMotivo = receta.motivo.toLowerCase().includes(term);
        const matchesDoctor = (doctoresInfo[receta.idDoctor] || "").toLowerCase().includes(term);
        const matchesMedicamento = receta.medicamentos.some(m => 
          m.nombre.toLowerCase().includes(term) || 
          m.posologia.toLowerCase().includes(term)
        );
        
        return matchesMotivo || matchesDoctor || matchesMedicamento;
      }
      
      return true;
    });
  }, [recetas, searchTerm, statusFilter, doctoresInfo]);

  const resetForm = () => {
    setMotivo("");
    setMedicamentos([]);
    setCurrentMedicamento({ nombre: "", posologia: "" });
    setFormError(null);
  };

  const handleAddMedicamento = () => {
    if (!currentMedicamento.nombre.trim() || !currentMedicamento.posologia.trim()) {
      setFormError("Por favor, complete ambos campos del medicamento");
      return;
    }
    
    setMedicamentos([...medicamentos, currentMedicamento]);
    setCurrentMedicamento({ nombre: "", posologia: "" });
    setFormError(null);
  };

  const handleRemoveMedicamento = (index: number) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos.splice(index, 1);
    setMedicamentos(newMedicamentos);
  };

  const handleSubmit = async () => {
    if (!doctor?.id) {
      setFormError("No se pudo identificar al médico. Por favor, inicie sesión nuevamente.");
      return;
    }
    
    if (!motivo.trim()) {
      setFormError("Por favor, indique el motivo de la receta");
      return;
    }
    
    if (medicamentos.length === 0) {
      setFormError("Debe agregar al menos un medicamento");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await crearReceta({ 
        idDoctor: doctor.id, 
        motivo, 
        medicamentos,
        isActive: true 
      });
      setOpenModal(false);
      resetForm();
      setInitialLoad(true);
    } catch (err) {
      setFormError("Error al crear la receta. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleRecetaStatus = async (id: string, isActive: boolean) => {
    try {
      await actualizarReceta(id, { isActive: !isActive });
      setInitialLoad(true); // Forzar recarga de recetas
    } catch (error) {
      console.error("Error actualizando receta:", error);
    }
  };

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
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Nueva Receta
        </Button>
      </div>

      {/* Nuevo: Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar recetas por motivo, médico o medicamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600 whitespace-nowrap">Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
        title="Crear nueva receta"
      >
        <div className="p-4 space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          {/* Información del médico */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
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
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la receta 
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Infección respiratoria"
              rows={2}
            />
          </div>

          {/* Sección de medicamentos */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Medicamentos</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {medicamentos.length} {medicamentos.length === 1 ? 'agregado' : 'agregados'}
              </span>
            </div>
            
            {/* Lista de medicamentos en tabla */}
            {medicamentos.length > 0 && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Medicamento</th>
                      <th className="text-left py-2 px-3 font-medium">Posología</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicamentos.map((med, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3">{med.nombre}</td>
                        <td className="py-2 px-3">{med.posologia}</td>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="medNombre" className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre del medicamento
                  </label>
                  <input
                    type="text"
                    id="medNombre"
                    value={currentMedicamento.nombre}
                    onChange={(e) => setCurrentMedicamento({...currentMedicamento, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Ej: Amoxicilina"
                  />
                </div>

                <div>
                  <label htmlFor="medPosologia" className="block text-xs font-medium text-gray-600 mb-1">
                    Posología
                  </label>
                  <input
                    type="text"
                    id="medPosologia"
                    value={currentMedicamento.posologia}
                    onChange={(e) => setCurrentMedicamento({...currentMedicamento, posologia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Ej: 500mg cada 8 horas"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddMedicamento}
                className="w-full py-2 text-sm flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Agregar medicamento
              </Button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              disabled={isSubmitting || medicamentos.length === 0}
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
              <h3 className="text-lg font-medium text-gray-600 mt-4">
                {statusFilter === "active" 
                  ? "No hay recetas activas" 
                  : statusFilter === "inactive" 
                    ? "No hay recetas eliminadas" 
                    : "No hay recetas registradas"}
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                {statusFilter === "active" 
                  ? "Crea una nueva receta para comenzar" 
                  : "No se encontraron recetas con este estado"}
              </p>
              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear nueva receta
              </Button>
            </div>
          )}

          {/* Tabla de recetas */}
          {!initialLoad && filteredRecetas.length > 0 && (
            <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecetas.map((receta) => {
                    // Crear una lista de nombres de medicamentos truncada
                    const medicamentosLista = receta.medicamentos.map(m => m.nombre);
                    const medicamentosTexto = medicamentosLista.join(', ');
                    const medicamentosPreview = medicamentosTexto.length > 50 
                      ? medicamentosTexto.substring(0, 47) + '...' 
                      : medicamentosTexto;
                      
                    return (
                      <>
                        <tr 
                          key={receta.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${!receta.isActive ? 'bg-gray-100 text-gray-500' : ''}`} 
                          onClick={() => toggleRowExpand(receta.id!)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDate(receta.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctoresInfo[receta.idDoctor] || "Cargando..."}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="group relative">
                              <div className="truncate max-w-[300px]">
                                {medicamentosPreview}
                              </div>
                              {medicamentosTexto.length > 50 && (
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10">
                                  {medicamentosTexto}
                                </div>
                              )}
                            </div>
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetalleReceta(receta);
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                              >
                                <Eye size={14} />
                                Detalle
                              </Button>
                              
                              {receta.isActive ? (
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingId(receta.id!);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleRecetaStatus(receta.id!, receta.isActive);
                                  }}
                                  className="text-green-600 border-green-200 hover:bg-green-50 flex items-center gap-1"
                                >
                                  <RefreshCw size={14} />
                                  Restaurar
                                </Button>
                              )}
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpand(receta.id!);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedRows[receta.id!] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[receta.id!] && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="text-sm">
                                <p className="font-medium text-gray-700 mb-2">Medicamentos completos:</p>
                                <ul className="space-y-2">
                                  {receta.medicamentos.map((med, index) => (
                                    <li key={index} className="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-200">
                                      <div>
                                        <p className="font-medium">{med.nombre}</p>
                                        <p className="text-sm text-gray-600">{med.posologia}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle de receta */}
      <Dialog 
        isOpen={!!detalleReceta} 
        onClose={() => setDetalleReceta(null)} 
        title="Detalle de receta médica"
        size="lg"
      >
        {detalleReceta && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <p className="text-sm text-gray-500 mb-1">Estado</p>
                <p className={`font-medium ${
                  detalleReceta.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {detalleReceta.isActive ? 'Activa' : 'Eliminada'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Medicamentos</h3>
              <div className="space-y-3">
                {detalleReceta.medicamentos.map((med, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{med.nombre}</p>
                        <p className="text-sm text-gray-600">{med.posologia}</p>
                      </div>
                    </div>
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
        title="Confirmar eliminación"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">¿Estás seguro de que deseas marcar esta receta como eliminada? La receta se ocultará del listado principal pero podrá ser recuperada.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={async () => {
                if (deletingId) {
                  await handleToggleRecetaStatus(deletingId, true);
                  setDeletingId(null);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default RecetasTab;