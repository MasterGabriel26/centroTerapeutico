import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Trash2, AlertTriangle, User, Loader2, Eye, X, ChevronLeft, ChevronRight,ImageIcon, RefreshCw,Search } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { useNovedades } from "../../hooks/useNovedades";
import { Novedad } from "../../types/novedad";
import { useAuthStore } from "../../../../store/authStore";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../../utils/firebase";
import Compressor from "compressorjs";

const NovedadesTab = ({ pacienteId }: { pacienteId: string }) => {
  const { usuario: doctor } = useAuthStore();
  
  const { 
    novedades, 
    loading, 
    error, 
    cargarNovedades, 
    crearNovedad
   
  } = useNovedades(pacienteId);
  
  const [openModal, setOpenModal] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [gravedad, setGravedad] = useState<"leve" | "moderado" | "grave">("leve");
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detalleNovedad, setDetalleNovedad] = useState<Novedad | null>(null);
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lightbox para imágenes
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [gravedadFilter, setGravedadFilter] = useState<"all" | "leve" | "moderado" | "grave">("all");

  // Cargar novedades al montar
  useEffect(() => {
    if (initialLoad) {
      cargarNovedades().finally(() => setInitialLoad(false));
    }
  }, [cargarNovedades, initialLoad]);

  // Cargar información de doctores
  useEffect(() => {
    const loadDoctorInfo = async () => {
      const uniqueDoctorIds = [...new Set(novedades.map(n => n.idDoctor))];
      const info: Record<string, string> = {};
      
      for (const id of uniqueDoctorIds) {
        if (!doctoresInfo[id]) {
          try {
            const docRef = doc(db, "users", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              info[id] = docSnap.data().nombre_completo || "Médico";
            }
          } catch (error) {
            console.error("Error cargando información del médico:", error);
          }
        }
      }
      
      setDoctoresInfo(prev => ({ ...prev, ...info }));
    };
    
    if (novedades.length > 0) {
      loadDoctorInfo();
    }
  }, [novedades]);

  // Filtrar novedades
  const filteredNovedades = useMemo(() => {
    return novedades.filter(novedad => {
      // Filtro por estado
      if (statusFilter === "active" && !novedad.isActive) return false;
      if (statusFilter === "inactive" && novedad.isActive) return false;
      
      // Filtro por gravedad
      if (gravedadFilter !== "all" && novedad.gravedad !== gravedadFilter) return false;
      
      // Filtro por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = novedad.descripcion.toLowerCase().includes(term);
        const matchesDoctor = (doctoresInfo[novedad.idDoctor] || "").toLowerCase().includes(term);
        
        return matchesDesc || matchesDoctor;
      }
      
      return true;
    });
  }, [novedades, searchTerm, statusFilter, gravedadFilter, doctoresInfo]);

  const resetForm = () => {
    setDescripcion("");
    setGravedad("leve");
    setEvidencias([]);
    setFormError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limitar a 5 imágenes
    if (evidencias.length + files.length > 5) {
      setFormError("Máximo 5 imágenes permitidas");
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.match('image.*')) {
        setFormError("Solo se permiten archivos de imagen");
        return;
      }

      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        success(result) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setEvidencias(prev => [...prev, base64]);
          };
          reader.readAsDataURL(result);
        },
        error(err) {
          console.error('Error comprimiendo imagen:', err);
          setFormError("Error al procesar la imagen");
        },
      });
    });
  };

  const handleRemoveEvidencia = (index: number) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!doctor?.id) {
      setFormError("No se pudo identificar al médico");
      return;
    }
    
    if (!descripcion.trim()) {
      setFormError("Por favor, describa la novedad");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await crearNovedad({ 
        idDoctor: doctor.id, 
        descripcion,
        evidencia: evidencias,
        gravedad,
        isActive: true 
      });
      setOpenModal(false);
      resetForm();
      setInitialLoad(true);
    } catch (err) {
      setFormError("Error al registrar la novedad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleNovedadStatus = async (id: string, isActive: boolean) => {
    try {
      await actualizarNovedad(id, { isActive: !isActive });
      setInitialLoad(true);
    } catch (error) {
      console.error("Error actualizando novedad:", error);
    }
  };

  const getGravedadColor = (gravedad: string) => {
    switch (gravedad) {
      case 'leve': return 'bg-yellow-100 text-yellow-800';
      case 'moderado': return 'bg-orange-100 text-orange-800';
      case 'grave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Lightbox functions
  const openLightbox = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!detalleNovedad) return;
    
    const images = detalleNovedad.evidencia;
    let newIndex = currentImageIndex;
    
    if (direction === 'prev') {
      newIndex = (currentImageIndex - 1 + images.length) % images.length;
    } else {
      newIndex = (currentImageIndex + 1) % images.length;
    }
    
    setSelectedImage(images[newIndex]);
    setCurrentImageIndex(newIndex);
  };

  return (
    <div className="p-4 font-poppins">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-blue-500" size={24} />
            Novedades del Paciente
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Registro de incidentes, recaídas y novedades
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Registrar Novedad
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar novedades por descripción..."
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
        
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600 whitespace-nowrap">Gravedad:</label>
          <select
            value={gravedadFilter}
            onChange={(e) => setGravedadFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">Todas</option>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="grave">Grave</option>
          </select>
        </div>
      </div>

      {/* Modal para crear novedad */}
      <Dialog 
        isOpen={openModal} 
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }} 
        title="Registrar nueva novedad"
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
              </div>
            </div>
          </div>

          {/* Campo descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción de la novedad 
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Paciente se cayó en el pasillo principal"
              rows={3}
            />
          </div>

          {/* Campo gravedad */}
          <div>
            <label htmlFor="gravedad" className="block text-sm font-medium text-gray-700 mb-1">
              Gravedad
            </label>
            <select
              id="gravedad"
              value={gravedad}
              onChange={(e) => setGravedad(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="leve">Leve</option>
              <option value="moderado">Moderado</option>
              <option value="grave">Grave</option>
            </select>
          </div>

          {/* Sección de evidencias */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Evidencias</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {evidencias.length}/5 imágenes
              </span>
            </div>
            
            {/* Previsualización de imágenes */}
            {evidencias.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {evidencias.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={img} 
                      alt={`Evidencia ${index+1}`} 
                      className="rounded-lg w-full h-full object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveEvidencia(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para agregar imágenes */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 text-sm flex items-center justify-center gap-2"
              disabled={evidencias.length >= 5}
            >
              <ImageIcon size={14} />
              {evidencias.length > 0 ? 'Agregar más imágenes' : 'Agregar imágenes'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
              disabled={evidencias.length >= 5}
            />
            <p className="text-xs text-gray-500 mt-2">Máximo 5 imágenes (JPG, PNG)</p>
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
              disabled={isSubmitting}
              className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Registrando...
                </span>
              ) : 'Registrar Novedad'}
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

          {/* Mensaje cuando no hay novedades */}
          {!initialLoad && filteredNovedades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <AlertTriangle className="text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mt-4">
                {statusFilter === "active" 
                  ? "No hay novedades activas" 
                  : statusFilter === "inactive" 
                    ? "No hay novedades eliminadas" 
                    : "No hay novedades registradas"}
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                {statusFilter === "active" 
                  ? "Registra una nueva novedad para comenzar" 
                  : "No se encontraron novedades con estos filtros"}
              </p>
              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Registrar novedad
              </Button>
            </div>
          )}

          {/* Tabla de novedades - Versión simplificada */}
          {!initialLoad && filteredNovedades.length > 0 && (
            <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Fecha
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/6">
                      Descripción
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Gravedad
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNovedades.map((novedad) => {
                    const descPreview = novedad.descripcion.length > 100 
                      ? novedad.descripcion.substring(0, 97) + '...' 
                      : novedad.descripcion;
                      
                    return (
                      <tr 
                        key={novedad.id} 
                        className={`hover:bg-gray-50 ${!novedad.isActive ? 'bg-gray-100 text-gray-500' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="text-xs">{formatDate(novedad.fecha)}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="line-clamp-2">{descPreview}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGravedadColor(novedad.gravedad)}`}>
                            {novedad.gravedad}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            novedad.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {novedad.isActive ? 'Activa' : 'Eliminada'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDetalleNovedad(novedad)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye size={14} />
                            </Button>
                            
                            {novedad.isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeletingId(novedad.id!)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleNovedadStatus(novedad.id!, novedad.isActive)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <RefreshCw size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle de novedad */}
      <Dialog 
        isOpen={!!detalleNovedad} 
        onClose={() => setDetalleNovedad(null)} 
        title="Detalle de novedad"
        size="xl"
      >
        {detalleNovedad && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha</p>
                <p className="font-medium">{formatDate(detalleNovedad.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Médico</p>
                <p className="font-medium">{doctoresInfo[detalleNovedad.idDoctor] || "Médico"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gravedad</p>
                <p className={`font-medium ${getGravedadColor(detalleNovedad.gravedad)} px-2 py-1 rounded-full inline-block text-xs`}>
                  {detalleNovedad.gravedad}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estado</p>
                <p className={`font-medium ${
                  detalleNovedad.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {detalleNovedad.isActive ? 'Activa' : 'Eliminada'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Descripción</p>
                <p className="font-medium whitespace-pre-wrap">{detalleNovedad.descripcion}</p>
              </div>
            </div>

            {detalleNovedad.evidencia.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Evidencias</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {detalleNovedad.evidencia.map((img, index) => (
                    <button
                      key={index}
                      className="rounded-lg overflow-hidden border border-gray-200 aspect-square"
                      onClick={() => openLightbox(img, index)}
                    >
                      <img 
                        src={img} 
                        alt={`Evidencia ${index+1}`} 
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Lightbox para imágenes */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button 
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-4xl w-full mx-4">
            <img 
              src={selectedImage} 
              alt="Evidencia" 
              className="max-h-[80vh] w-full object-contain"
            />
            
            {detalleNovedad && detalleNovedad.evidencia.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  onClick={() => navigateLightbox('prev')}
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  onClick={() => navigateLightbox('next')}
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {detalleNovedad.evidencia.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <Dialog 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Confirmar eliminación"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">¿Estás seguro de que deseas marcar esta novedad como eliminada?</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={async () => {
                if (deletingId) {
                  await handleToggleNovedadStatus(deletingId, true);
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

export default NovedadesTab;