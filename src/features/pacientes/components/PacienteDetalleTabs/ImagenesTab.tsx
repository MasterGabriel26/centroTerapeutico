// features/pacientes/components/PacienteDetalleTabs/ImagenesTab.tsx
import { useState, useRef, useEffect } from "react";
import { Plus, Image as ImageIcon, Trash2, X, Upload } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { useImagenes } from "../../hooks/useImagenes";

import Compressor from "compressorjs";

const ImagenesTab = ({ pacienteId }: { pacienteId: string }) => {
  const { imagenes,  error, fetchImagenes, subirImagen } = useImagenes(pacienteId);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true); // Nuevo estado para controlar carga inicial

  useEffect(() => {
    // Solo cargar imágenes si es la carga inicial
    if (initialLoad) {
      fetchImagenes().finally(() => {
        setInitialLoad(false);
      });
    }
  }, [fetchImagenes, initialLoad]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
          reject(file); // Si falla, subir el original
        },
      });
    });
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      setIsUploading(true);
      try {
        // Comprimir la imagen antes de subir
        const compressedFile = await compressImage(selectedFile);
        await subirImagen(compressedFile, descripcion);
        setOpenModal(false);
        resetForm();
        // Forzar recarga de imágenes después de subir
        setInitialLoad(true);
      } catch (err) {
        console.error('Error al subir imagen:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescripcion("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 font-poppins">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={24} />
            Seguimiento Fotográfico
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de imágenes médicas del paciente
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Subir imagen
        </Button>
      </div>

      {/* Modal para subir imágenes */}
      <Dialog 
        isOpen={openModal} 
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }} 
        title="Subir nueva imagen"
      >
        <div className="p-4 space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
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
                  className="max-h-60 mx-auto rounded-lg"
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
                <Upload className="mx-auto text-gray-400" size={40} />
                <p className="mt-2 text-gray-500">Haz clic para subir una imagen</p>
                <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, GIF</p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <input
              type="text"
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Hoy presentó un mejor estado"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
           
            >
              {isUploading ? 'Subiendo...' : 'Subir imagen'}
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

          {/* Mensaje cuando no hay imágenes */}
          {!initialLoad && imagenes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <ImageIcon className="text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mt-4">No hay imágenes registradas</h3>
              <p className="text-gray-500 text-sm mt-2">
                Aún no se han agregado imágenes para este paciente
              </p>
              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Subir primera imagen
              </Button>
            </div>
          )}

          {/* Galería de imágenes */}
          {!initialLoad && imagenes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {imagenes.map((imagen) => (
                <div 
                  key={imagen.id} 
                  className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="relative group">
                    <img 
                      src={imagen.url} 
                      alt={imagen.descripcion || "Imagen médica"} 
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        className="p-2 rounded-full bg-white text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setDeletingId(imagen.id!)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {imagen.descripcion || "Sin descripción"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(imagen.fecha)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      <Dialog 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Confirmar eliminación"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                // Aquí iría la lógica para eliminar
                console.log("Eliminar imagen:", deletingId);
                setDeletingId(null);
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

export default ImagenesTab;