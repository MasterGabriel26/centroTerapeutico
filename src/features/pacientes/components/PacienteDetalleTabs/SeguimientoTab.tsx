// features/pacientes/components/PacienteDetalleTabs/SeguimientosTab.tsx
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Calendar, FileText, Trash2, Eye, ChevronDown, ChevronUp, X ,ImageIcon} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { storage } from "../../../../utils/firebase";
import Compressor from "compressorjs";
import { useSeguimientos } from "../../hooks/useSeguimiento";
import { useAuthStore } from "../../../../store/authStore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Seguimiento } from "../../types/seguimiento";

const SeguimientosTab = ({ pacienteId }: { pacienteId: string }) => {
  const { usuario } = useAuthStore();
  const { seguimientos, error, fetchSeguimientos, agregarSeguimiento, toggleSeguimientoStatus } = useSeguimientos(pacienteId);
  const [openModal, setOpenModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState<Seguimiento | null>(null);
  const [formData, setFormData] = useState<Omit<Seguimiento, 'id'>>({
    url: '',
    idDoctor: usuario?.id || '',
    descripcion: '',
    fecha: new Date().toISOString(),
    comportamiento: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
const [filters, setFilters] = useState({
  isActive: 'active', // Cambiado de 'all' a 'active' para mostrar solo activos por defecto
  dateFrom: '',
  dateTo: ''
});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Seguimiento; direction: 'asc' | 'desc' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrado y ordenación
  const filteredSeguimientos = seguimientos.filter(seguimiento => {
    const matchesSearch = 
      seguimiento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguimiento.comportamiento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      (filters.isActive === 'all' || 
       (filters.isActive === 'active' && seguimiento.isActive) || 
       (filters.isActive === 'inactive' && !seguimiento.isActive)) &&
      (!filters.dateFrom || new Date(seguimiento.fecha) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(seguimiento.fecha) <= new Date(filters.dateTo + 'T23:59:59'));
    
    return matchesSearch && matchesFilter;
  });

  const sortedSeguimientos = [...filteredSeguimientos].sort((a, b) => {
    if (!sortConfig) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });


   const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        success(result) {
          resolve(new File([result], file.name, {
            type: result.type,
            lastModified: Date.now()
          }));
        },
        error(err) {
          console.error('Error al comprimir imagen:', err);
          reject(file);
        },
      });
    });
  };

  const requestSort = (key: keyof Seguimiento) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (initialLoad) {
      fetchSeguimientos().finally(() => {
        setInitialLoad(false);
      });
    }
  }, [fetchSeguimientos, initialLoad]);

  useEffect(() => {
    if (usuario) {
      setFormData(prev => ({ ...prev, idDoctor: usuario.id }));
    }
  }, [usuario]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

 const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      
      if (selectedFile) {
        const compressedFile = await compressImage(selectedFile);
        const storageRef = ref(storage, `pacientes/${pacienteId}/seguimientos/${compressedFile.name}`);
        await uploadBytes(storageRef, compressedFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await agregarSeguimiento({
        ...formData,
        url: imageUrl,
        fecha: new Date().toISOString(),
        idDoctor: usuario?.id || '',
        isActive: true
      });
      
      setOpenModal(false);
      resetForm();
      setInitialLoad(true);
    } catch (err) {
      console.error('Error al agregar seguimiento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({
      url: '',
      idDoctor: usuario?.id || '',
      descripcion: '',
      fecha: new Date().toISOString(),
      comportamiento: '',
      isActive: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleSeguimientoStatus(id);
      setInitialLoad(true);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleViewDetails = (seguimiento: Seguimiento) => {
    setSelectedSeguimiento(seguimiento);
    setDetailModal(true);
  };

  // Bloquear scroll cuando los modales están abiertos
  useEffect(() => {
    if (openModal || detailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openModal, detailModal]);

  return (
    <div className="p-4 font-poppins">
      {/* Header y controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
            Seguimientos Clínicos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Registro de seguimientos y evolución del paciente
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Nuevo Seguimiento
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar en seguimientos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={18} />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Desde"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
            
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Hasta"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Modal para agregar seguimiento */}
       <Dialog 
        isOpen={openModal} 
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }} 
        title="Agregar nuevo seguimiento"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            {/* Subida de imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen (opcional)
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-40 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto text-gray-400" size={40} />
                    <p className="mt-2 text-gray-500">Haz clic para subir una imagen</p>
                    <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, GIF</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="comportamiento" className="block text-sm font-medium text-gray-700 mb-1">
                Comportamiento
              </label>
              <input
                type="text"
                id="comportamiento"
                name="comportamiento"
                value={formData.comportamiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describa el comportamiento observado"
                required
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Detalles del seguimiento..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!formData.descripcion || !formData.comportamiento || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Seguimiento'}
            </Button>
          </div>
        </div>
      </Dialog>


      {/* Dialog para ver detalles */}
      <Dialog 
        isOpen={detailModal} 
        onClose={() => setDetailModal(false)} 
        title="Detalles del Seguimiento"
        size="lg"
      >
        {selectedSeguimiento && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha</p>
                <p className="text-gray-900">{formatDate(selectedSeguimiento.fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedSeguimiento.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSeguimiento.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Comportamiento</p>
                <p className="text-gray-900">{selectedSeguimiento.comportamiento}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Descripción</p>
              <p className="text-gray-900 whitespace-pre-line">{selectedSeguimiento.descripcion}</p>
            </div>

            {selectedSeguimiento.url && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Imagen adjunta</p>
                <img 
                  src={selectedSeguimiento.url} 
                  alt="Seguimiento médico" 
                  className="max-h-96 rounded-lg border border-gray-200 mx-auto"
                />
              </div>
            )}

         <div className="flex justify-between pt-4">
        <Button
          variant="danger"
          onClick={() => {
            handleToggleStatus(selectedSeguimiento.id!);
            setDetailModal(false);
          }}
          icon={<Trash2 size={16} />}
        >
          {selectedSeguimiento.isActive ? 'Eliminar' : 'Restaurar'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setDetailModal(false)}
        >
          Cerrar
        </Button>
      </div>
          </div>
        )}
      </Dialog>

      {/* Estado de carga */}
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

          {/* Tabla de seguimientos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('fecha')}
                    >
                      <div className="flex items-center">
                        Fecha
                        {sortConfig?.key === 'fecha' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('comportamiento')}
                    >
                      <div className="flex items-center">
                        Comportamiento
                        {sortConfig?.key === 'comportamiento' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 h-4 w-4" /> : 
                            <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSeguimientos.length > 0 ? (
                    sortedSeguimientos.map((seguimiento) => (
                      <tr key={seguimiento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(seguimiento.fecha)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {seguimiento.comportamiento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            seguimiento.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {seguimiento.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye size={16} />}
                              onClick={() => handleViewDetails(seguimiento)}
                            >
                              Ver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron seguimientos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SeguimientosTab;