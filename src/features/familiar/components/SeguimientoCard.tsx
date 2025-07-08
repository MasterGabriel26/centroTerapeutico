// components/SeguimientoCard.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Activity,
  MoreHorizontal,
  ImageIcon,
  VideoIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Seguimiento {
  id: string;
  urls: string[];
  descripcion: string;
  fecha: string;
  comportamiento: string;
  isActive: boolean;
}

interface SeguimientoCardProps {
  seguimiento: Seguimiento;
  onMediaClick: (urls: string[], index: number) => void;
  mediaLoadErrors: Set<string>;
  onRetryMedia: (url: string) => void;
}

const formatFechaCorta = (fecha: string) => {
  try {
    return format(new Date(fecha), "dd MMM yyyy", { locale: es });
  } catch (err) {
    console.warn("Error al formatear fecha:", fecha, err);
    return fecha;
  }
};

// Función mejorada para detectar videos
const isVideo = (url?: string) => {
  if (!url) return false;
  
  // Detectar por extensión
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|m4v|3gp|mkv|flv|wmv)$/i;
  if (videoExtensions.test(url)) return true;
  
  // Detectar por Content-Type en la URL o patrones comunes
  const videoPatterns = [
    /\/video\//i,
    /\.mp4/i,
    /\.webm/i,
    /youtube\.com\/embed/i,
    /vimeo\.com\/video/i,
    /stream/i,
  ];
  
  return videoPatterns.some(pattern => pattern.test(url));
};

// Función para detectar si una URL es válida para video
const isValidVideoUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    
    const timeoutId = setTimeout(() => {
      resolve(false);
    }, 5000); // Timeout de 5 segundos
    
    video.onloadedmetadata = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };
    
    video.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    video.src = url;
  });
};

const SeguimientoCard: React.FC<SeguimientoCardProps> = ({
  seguimiento,
  onMediaClick,
  mediaLoadErrors,
  onRetryMedia,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [mediaStates, setMediaStates] = useState<{
    [key: string]: {
      isLoading: boolean;
      isLoaded: boolean;
      hasError: boolean;
      isVideo: boolean;
    };
  }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filtrar URLs válidas
  const validUrls = seguimiento.urls?.filter(url => !!url) || [];
  const hasMedia = validUrls.length > 0;
  const currentUrl = validUrls[currentIndex] || '';
  const currentMediaState = mediaStates[currentUrl] || {
    isLoading: false,
    isLoaded: false,
    hasError: false,
    isVideo: false,
  };

  // Inicializar estado de medios
  useEffect(() => {
    const initializeMediaStates = async () => {
      const newStates: typeof mediaStates = {};
      
      for (const url of validUrls) {
        if (!mediaStates[url]) {
          const isVideoUrl = isVideo(url);
          newStates[url] = {
            isLoading: true,
            isLoaded: false,
            hasError: mediaLoadErrors.has(url),
            isVideo: isVideoUrl,
          };
          
          // Si es video, verificar si es válido
          if (isVideoUrl) {
            try {
              const isValid = await isValidVideoUrl(url);
              newStates[url] = {
                ...newStates[url],
                isLoading: false,
                hasError: !isValid,
              };
            } catch (error) {
              newStates[url] = {
                ...newStates[url],
                isLoading: false,
                hasError: true,
              };
            }
          }
        }
      }
      
      if (Object.keys(newStates).length > 0) {
        setMediaStates(prev => ({ ...prev, ...newStates }));
      }
    };

    if (validUrls.length > 0) {
      initializeMediaStates();
    }
  }, [validUrls, mediaLoadErrors]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validUrls.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validUrls.length) % validUrls.length);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleMediaLoad = (url: string) => {
    setMediaStates(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        isLoading: false,
        isLoaded: true,
        hasError: false,
      }
    }));
  };

  const handleMediaError = (url: string) => {
    console.error('Error loading media:', url);
    setMediaStates(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        isLoading: false,
        isLoaded: false,
        hasError: true,
      }
    }));
  };

  const handleRetryMedia = (url: string) => {
    setMediaStates(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        isLoading: true,
        isLoaded: false,
        hasError: false,
      }
    }));
    onRetryMedia(url);
  };

  const handleVideoCanPlay = (url: string) => {
    console.log('Video can play:', url);
    handleMediaLoad(url);
  };

  const handleVideoLoadStart = (url: string) => {
    console.log('Video load started:', url);
    setMediaStates(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        isLoading: true,
      }
    }));
  };

  if (!seguimiento) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md max-w-sm">
      {/* Header del post */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Seguimiento</p>
            <p className="text-xs text-gray-500">{formatFechaCorta(seguimiento.fecha)}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Galería de medios */}
      {hasMedia && (
        <div className="relative">
          {/* Mostrar el medio actual */}
          {!currentMediaState.hasError ? (
            <div
              className="aspect-square w-full cursor-pointer overflow-hidden bg-gray-100 relative"
              onClick={() => onMediaClick(validUrls, currentIndex)}
            >
              {currentMediaState.isVideo ? (
                <div className="w-full h-full relative bg-black">
                  {/* Video elemento */}
                  <video
                    ref={videoRef}
                    src={currentUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                    onLoadStart={() => handleVideoLoadStart(currentUrl)}
                    onCanPlay={() => handleVideoCanPlay(currentUrl)}
                    onLoadedData={() => handleMediaLoad(currentUrl)}
                    onError={() => handleMediaError(currentUrl)}
                    onLoadedMetadata={() => handleMediaLoad(currentUrl)}
                    onSuspend={() => console.log('Video suspended:', currentUrl)}
                    onStalled={() => console.log('Video stalled:', currentUrl)}
                  />
                  
                  {/* Overlay con botón de play */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                    <div className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors">
                      <Play className="h-6 w-6 text-gray-800 ml-0.5" />
                    </div>
                  </div>

                  {/* Indicador de carga para video */}
                  {currentMediaState.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <img
                    src={currentUrl}
                    alt={`Medio de seguimiento ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    onLoad={() => handleMediaLoad(currentUrl)}
                    onError={() => handleMediaError(currentUrl)}
                    loading="lazy"
                  />
                  
                  {/* Indicador de carga para imagen */}
                  {currentMediaState.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                    </div>
                  )}
                </>
              )}

              {/* Navegación entre medios */}
              {validUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors z-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors z-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
              {currentMediaState.isVideo ? (
                <VideoIcon className="h-6 w-6 text-gray-400 mb-2" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400 mb-2" />
              )}
              <p className="text-gray-500 text-xs font-medium mb-2">
                Error al cargar {currentMediaState.isVideo ? 'video' : 'imagen'}
              </p>
              <button
                onClick={() => handleRetryMedia(currentUrl)}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium bg-white px-3 py-1 rounded-full shadow-sm"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Indicador de medios */}
          {validUrls.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {validUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`Ir a medio ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Contador de medios e indicador de tipo */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {currentMediaState.isVideo && (
              <div className="bg-black/40 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                <VideoIcon className="h-3 w-3" />
              </div>
            )}
            {validUrls.length > 1 && (
              <div className="bg-black/40 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                {currentIndex + 1}/{validUrls.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido del post */}
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{seguimiento.comportamiento}</h4>
        <p className={`text-gray-600 text-xs leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
          {seguimiento.descripcion}
        </p>
        
        {/* Botón para expandir/contraer */}
        {seguimiento.descripcion.length > 150 && (
          <button
            onClick={toggleExpand}
            className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1"
          >
            {expanded ? "Mostrar menos" : "Mostrar más"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SeguimientoCard;