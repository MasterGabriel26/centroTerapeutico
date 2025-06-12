import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, User, Loader2, Eye, ChevronDown, ChevronUp, Search, RefreshCw, Phone } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { useVisitas } from "../../hooks/useVisitas";
import { Visita } from "../../types/visitas";
import { useAuthStore } from "../../../../store/authStore";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../../utils/firebase";

const VisitasTab = ({ pacienteId }: { pacienteId: string }) => {
  const { usuario: currentUser } = useAuthStore();
  
  const { 
    visitas, 
    loading, 
    error, 
    cargarVisitas, 
    crearVisita,
    aplicarFiltroFecha
  } = useVisitas(pacienteId);
  
  const [openModal, setOpenModal] = useState(false);
  const [visitantes, setVisitantes] = useState<{nombre: string, parentesco: string, telefono: string}[]>([]);
  const [currentVisitante, setCurrentVisitante] = useState({
    nombre: "", 
    parentesco: "",
    telefono: ""
  });
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [detalleVisita, setDetalleVisita] = useState<Visita | null>(null);
  const [registradoresInfo, setRegistradoresInfo] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});

  useEffect(() => {
    if (initialLoad) {
      cargarVisitas().finally(() => setInitialLoad(false));
    }
  }, [cargarVisitas, initialLoad]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      aplicarFiltroFecha(dateRange.start, dateRange.end);
    } else {
      cargarVisitas();
    }
  }, [dateRange]);

  useEffect(() => {
    const loadRegistradorInfo = async () => {
      const registradorIds = Array.from(new Set(visitas.map(v => v.registradoPor)));
      const info: Record<string, string> = {};
      
      for (const id of registradorIds) {
        if (!registradoresInfo[id]) {
          try {
            const docRef = doc(db, "users", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              info[id] = docSnap.data().nombre_completo || "Usuario desconocido";
            } else {
              info[id] = "Usuario no encontrado";
            }
          } catch (error) {
            console.error("Error cargando información del usuario:", error);
            info[id] = "Error al cargar";
          }
        }
      }
      
      setRegistradoresInfo(prev => ({ ...prev, ...info }));
    };
    
    if (visitas.length > 0) {
      loadRegistradorInfo();
    }
  }, [visitas]);

  const filteredVisitas = useMemo(() => {
    return visitas.filter(visita => {
      if (!searchTerm) return true;
      
      const term = searchTerm.toLowerCase();
      const matchesVisitantes = visita.visitantes.some(visitante => 
        visitante.nombre.toLowerCase().includes(term) || 
        visitante.parentesco.toLowerCase().includes(term) ||
        (visitante.telefono && visitante.telefono.toLowerCase().includes(term))
      );
      const matchesRegistrador = (registradoresInfo[visita.registradoPor] || "").toLowerCase().includes(term);
      const matchesObservaciones = visita.observaciones?.toLowerCase().includes(term) || false;
      
      return matchesVisitantes || matchesRegistrador || matchesObservaciones;
    });
  }, [visitas, searchTerm, registradoresInfo]);

  const resetForm = () => {
    setVisitantes([]);
    setCurrentVisitante({nombre: "", parentesco: "", telefono: ""});
    setObservaciones("");
    setFormError(null);
  };

  const handleAddVisitante = () => {
    if (!currentVisitante.nombre.trim() || !currentVisitante.parentesco.trim()) {
      setFormError("Por favor, complete los campos obligatorios del visitante");
      return;
    }
    
    setVisitantes([...visitantes, currentVisitante]);
    setCurrentVisitante({nombre: "", parentesco: "", telefono: ""});
    setFormError(null);
  };

  const handleRemoveVisitante = (index: number) => {
    const newVisitantes = [...visitantes];
    newVisitantes.splice(index, 1);
    setVisitantes(newVisitantes);
  };

  const handleSubmit = async () => {
    if (!currentUser?.id) {
      setFormError("No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.");
      return;
    }
    
    if (visitantes.length === 0) {
      setFormError("Debe agregar al menos un visitante");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await crearVisita({ 
        visitantes: visitantes,
        observaciones: observaciones || "",
        registradoPor: currentUser.id
      });
      
      setOpenModal(false);
      resetForm();
      setInitialLoad(true);
    } catch (err) {
      setFormError("Error al registrar la visita. Por favor, intente de nuevo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="p-4 font-poppins">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
            <User className="text-blue-500" size={24} />
            Registro de Visitas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Control de visitas de familiares y amigos
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Nueva Visita
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar visitas por nombre, parentesco, teléfono o observaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600 whitespace-nowrap">Rango de fechas:</label>
          <input
            type="date"
            onChange={(e) => setDateRange({...dateRange, start: e.target.valueAsDate || undefined})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <span>a</span>
          <input
            type="date"
            onChange={(e) => setDateRange({...dateRange, end: e.target.valueAsDate || undefined})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {(dateRange.start || dateRange.end) && (
            <Button
              variant="secondary"
              onClick={() => setDateRange({})}
              className="text-sm"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Modal para registrar visita */}
      <Dialog 
        isOpen={openModal} 
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }} 
        title="Registrar nueva visita"
      >
        <div className="p-4 space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          {/* Información del registrador */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 text-sm mb-1">Registrado por</h3>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" size={16} />
              <div>
                <p className="font-medium">{currentUser?.nombre_completo || "No disponible"}</p>
                <p className="text-xs text-gray-600">ID: {currentUser?.id || "No disponible"}</p>
              </div>
            </div>
          </div>

          {/* Sección de visitantes */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Visitantes</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {visitantes.length} {visitantes.length === 1 ? 'agregado' : 'agregados'}
              </span>
            </div>
            
            {/* Lista de visitantes en tabla */}
            {visitantes.length > 0 && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Nombre</th>
                      <th className="text-left py-2 px-3 font-medium">Parentesco</th>
                      <th className="text-left py-2 px-3 font-medium">Teléfono</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitantes.map((visitante, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3">{visitante.nombre}</td>
                        <td className="py-2 px-3">{visitante.parentesco}</td>
                        <td className="py-2 px-3">{visitante.telefono || '-'}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveVisitante(index)}
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

            {/* Formulario para agregar visitante */}
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="visitNombre" className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="visitNombre"
                    value={currentVisitante.nombre}
                    onChange={(e) => setCurrentVisitante({...currentVisitante, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Ej: María González"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="visitParentesco" className="block text-xs font-medium text-gray-600 mb-1">
                    Parentesco
                  </label>
                  <input
                    type="text"
                    id="visitParentesco"
                    value={currentVisitante.parentesco}
                    onChange={(e) => setCurrentVisitante({...currentVisitante, parentesco: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Ej: Esposa, Hijo, Amigo"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="visitTelefono" className="block text-xs font-medium text-gray-600 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="visitTelefono"
                    value={currentVisitante.telefono}
                    onChange={(e) => setCurrentVisitante({...currentVisitante, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Ej: 555-1234567"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddVisitante}
                className="w-full py-2 text-sm flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Agregar visitante
              </Button>
            </div>
          </div>

          {/* Campo observaciones */}
          <div className="mt-4">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Notas adicionales sobre la visita"
              rows={3}
            />
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
              disabled={isSubmitting || visitantes.length === 0}
              className="text-sm px-4 py-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Registrando...
                </span>
              ) : 'Registrar Visita'}
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

          {/* Mensaje cuando no hay visitas */}
          {!initialLoad && filteredVisitas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <User className="text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mt-4">
                {dateRange.start || dateRange.end 
                  ? "No hay visitas en este rango de fechas" 
                  : "No hay visitas registradas"}
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                Registra una nueva visita para comenzar
              </p>
              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Nueva visita
              </Button>
            </div>
          )}

          {/* Tabla de visitas */}
          {!initialLoad && filteredVisitas.length > 0 && (
            <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitantes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrado por
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisitas.map((visita) => {
                    const visitantesLista = visita.visitantes.map(visitante => 
                      `${visitante.nombre} (${visitante.parentesco})${visitante.telefono ? ` - Tel: ${visitante.telefono}` : ''}`
                    );
                    const visitantesTexto = visitantesLista.join(', ');
                    const visitantesPreview = visitantesTexto.length > 50 
                      ? visitantesTexto.substring(0, 47) + '...' 
                      : visitantesTexto;
                      
                    return (
                      <>
                        <tr 
                          key={visita.id} 
                          className="hover:bg-gray-50 cursor-pointer" 
                          onClick={() => toggleRowExpand(visita.id!)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDate(visita.fecha)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="group relative">
                              <div className="truncate max-w-[300px]">
                                {visitantesPreview}
                              </div>
                              {visitantesTexto.length > 50 && (
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10">
                                  {visitantesTexto}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registradoresInfo[visita.registradoPor] || "Cargando..."}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetalleVisita(visita);
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                              >
                                <Eye size={14} />
                                Detalle
                              </Button>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpand(visita.id!);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedRows[visita.id!] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[visita.id!] && (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 bg-gray-50">
                              <div className="text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <p className="text-gray-500 mb-1">Fecha y hora:</p>
                                    <p className="font-medium">{formatDate(visita.fecha)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 mb-1">Registrado por:</p>
                                    <p className="font-medium">{registradoresInfo[visita.registradoPor] || "Cargando..."}</p>
                                  </div>
                                </div>
                                
                                <p className="text-gray-500 mb-1">Visitantes:</p>
                                <ul className="space-y-2 mb-4">
                                  {visita.visitantes.map((visitante, index) => (
                                    <li key={index} className="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-200">
                                      <div>
                                        <p className="font-medium">{visitante.nombre}</p>
                                        <p className="text-sm text-gray-600">{visitante.parentesco}</p>
                                        {visitante.telefono && (
                                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                            <Phone size={14} className="text-gray-500" />
                                            {visitante.telefono}
                                          </p>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                                
                                {visita.observaciones && (
                                  <>
                                    <p className="text-gray-500 mb-1">Observaciones:</p>
                                    <p className="bg-white p-3 rounded-lg border border-gray-200">
                                      {visita.observaciones}
                                    </p>
                                  </>
                                )}
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

      {/* Modal de detalle de visita */}
      <Dialog 
        isOpen={!!detalleVisita} 
        onClose={() => setDetalleVisita(null)} 
        title="Detalle completo de visita"
        size="lg"
      >
        {detalleVisita && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha y hora</p>
                <p className="font-medium">{formatDate(detalleVisita.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Registrado por</p>
                <p className="font-medium">{registradoresInfo[detalleVisita.registradoPor] || "Cargando..."}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Visitantes</h3>
              <div className="space-y-3">
                {detalleVisita.visitantes.map((visitante, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{visitante.nombre}</p>
                        <p className="text-sm text-gray-600">{visitante.parentesco}</p>
                        {visitante.telefono && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <Phone size={14} className="text-gray-500" />
                            {visitante.telefono}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {detalleVisita.observaciones && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Observaciones</h3>
                <p className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {detalleVisita.observaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default VisitasTab;