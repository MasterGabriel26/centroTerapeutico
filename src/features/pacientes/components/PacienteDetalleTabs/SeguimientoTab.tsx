// features/pacientes/components/PacienteDetalleTabs/SeguimientosTab.tsx
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Calendar, FileText, Trash2, Eye, ChevronDown, ChevronUp, X, ImageIcon, Clock, User } from "lucide-react";
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
    isActive: 'active',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Seguimiento; direction: 'asc' | 'desc' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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
    setSelectedFile(null);
    setPreviewUrl(null);
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
    <div className="p-3 sm:p-4 font-poppins">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-full sm:w-auto">
          <h2 className="text-lg sm:text-xl font-light text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
            <span className="truncate">Seguimientos Clínicos</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Registro de seguimientos y evolución del paciente
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto text-sm"
        >
          <span className="hidden sm:inline">Nuevo Seguimiento</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {/* Barra de búsqueda y filtros responsiva */}
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-3 sm:space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar en seguimientos..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botón de filtros en móvil */}
          <div className="flex items-center justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="w-4 h-4" />}
              className="text-sm"
            >
              Filtros
            </Button>
            <span className="text-xs text-gray-500">
              {filteredSeguimientos.length} resultado(s)
            </span>
          </div>
          
          {/* Filtros */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-500 w-4 h-4 hidden sm:block" />
                <select
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.isActive}
                  onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Desde"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
                
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Hasta"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <div className="relative inline-block">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-32 sm:max-h-40 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <ImageIcon className="mx-auto text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />
                    <p className="mt-2 text-sm text-gray-500">Toca para subir una imagen</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (máx. 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="comportamiento" className="block text-sm font-medium text-gray-700 mb-2">
                Comportamiento *
              </label>
              <input
                type="text"
                id="comportamiento"
                name="comportamiento"
                value={formData.comportamiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Describa el comportamiento observado"
                required
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={4}
                placeholder="Detalles del seguimiento..."
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!formData.descripcion || !formData.comportamiento || isSubmitting}
              className="w-full sm:w-auto"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Fecha</p>
                <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedSeguimiento.fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedSeguimiento.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSeguimiento.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Comportamiento</p>
              <p className="text-sm sm:text-base text-gray-900 break-words">{selectedSeguimiento.comportamiento}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Descripción</p>
              <p className="text-sm sm:text-base text-gray-900 whitespace-pre-line break-words">{selectedSeguimiento.descripcion}</p>
            </div>

            {selectedSeguimiento.url && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Imagen adjunta</p>
                <div className="text-center">
                  <img 
                    src={selectedSeguimiento.url} 
                    alt="Seguimiento médico" 
                    className="max-h-64 sm:max-h-96 w-auto rounded-lg border border-gray-200 mx-auto"
                  />
                                  </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="danger"
                onClick={() => {
                  handleToggleStatus(selectedSeguimiento.id!);
                  setDetailModal(false);
                }}
                icon={<Trash2 className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {selectedSeguimiento.isActive ? 'Eliminar' : 'Restaurar'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDetailModal(false)}
                className="w-full sm:w-auto"
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
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 sm:p-4 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Vista móvil - Cards */}
          <div className="block sm:hidden">
            {sortedSeguimientos.length > 0 ? (
              <div className="space-y-3">
                {sortedSeguimientos.map((seguimiento) => (
                  <div key={seguimiento.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(seguimiento.fecha)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        seguimiento.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {seguimiento.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Comportamiento</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{seguimiento.comportamiento}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{seguimiento.descripcion}</p>
                    </div>
                    
                    {seguimiento.url && (
                      <div className="mb-3">
                        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={seguimiento.url} 
                            alt="Seguimiento" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(seguimiento)}
                        icon={<Eye className="w-4 h-4" />}
                        className="text-sm"
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm">No se encontraron seguimientos</p>
                <p className="text-xs text-gray-400 mt-1">
                  Los seguimientos aparecerán aquí cuando se agreguen
                </p>
              </div>
            )}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('fecha')}
                    >
                      <div className="flex items-center">
                        Fecha
                        {sortConfig?.key === 'fecha' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 w-4 h-4" /> : 
                            <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('comportamiento')}
                    >
                      <div className="flex items-center">
                        Comportamiento
                        {sortConfig?.key === 'comportamiento' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="ml-1 w-4 h-4" /> : 
                            <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSeguimientos.length > 0 ? (
                    sortedSeguimientos.map((seguimiento) => (
                      <tr key={seguimiento.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{formatDate(seguimiento.fecha)}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs xl:max-w-md">
                            <p className="truncate" title={seguimiento.comportamiento}>
                              {seguimiento.comportamiento}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1" title={seguimiento.descripcion}>
                              {seguimiento.descripcion}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            seguimiento.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {seguimiento.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => handleViewDetails(seguimiento)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Ver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 lg:px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <FileText className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-sm">No se encontraron seguimientos</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Los seguimientos aparecerán aquí cuando se agreguen
                          </p>
                        </div>
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