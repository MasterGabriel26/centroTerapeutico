// components/MediaModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, Download, X, ChevronLeft, ChevronRight, VideoIcon, ImageIcon, AlertCircle, Play, Pause } from "lucide-react";

interface MediaModalProps {
  mediaUrls: string[];
  initialIndex: number;
  onClose: () => void;
  isOpen: boolean;
}

// Función mejorada para detectar videos
const isVideo = (url: string) => {
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

const MediaModal: React.FC<MediaModalProps> = ({ mediaUrls, initialIndex, onClose, isOpen }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaStates, setMediaStates] = useState<{
    [key: string]: {
      isLoading: boolean;
      isLoaded: boolean;
      hasError: boolean;
      isVideo: boolean;
      isValidVideo?: boolean;
    };
  }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentUrl = mediaUrls[currentIndex];
  const currentMediaState = mediaStates[currentUrl] || {
    isLoading: true,
    isLoaded: false,
    hasError: false,
    isVideo: false,
    isValidVideo: false,
  };
  const isCurrentVideo = currentMediaState.isVideo && currentMediaState.isValidVideo;

  // Inicializar estado de medios
  useEffect(() => {
    const initializeMediaStates = async () => {
      const newStates: typeof mediaStates = {};
      
      for (const url of mediaUrls) {
        if (!mediaStates[url]) {
          const isVideoUrl = isVideo(url);
          newStates[url] = {
            isLoading: true,
            isLoaded: false,
            hasError: false,
            isVideo: isVideoUrl,
            isValidVideo: false,
          };
          
          // Si es video, verificar si es válido
          if (isVideoUrl) {
            try {
              const isValid = await isValidVideoUrl(url);
              newStates[url] = {
                ...newStates[url],
                isLoading: false,
                isValidVideo: isValid,
                hasError: !isValid,
              };
            } catch (error) {
              newStates[url] = {
                ...newStates[url],
                isLoading: false,
                isValidVideo: false,
                hasError: true,
              };
            }
          } else {
            newStates[url] = {
              ...newStates[url],
              isLoading: false,
            };
          }
        }
      }
      
      if (Object.keys(newStates).length > 0) {
        setMediaStates(prev => ({ ...prev, ...newStates }));
      }
    };

    if (mediaUrls.length > 0 && isOpen) {
      initializeMediaStates();
    }
  }, [mediaUrls, isOpen]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " " && isCurrentVideo) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isCurrentVideo]);

  const handleNext = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
    resetZoom();
  };

  const handlePrev = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    resetZoom();
  };

  const resetZoom = () => {
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    if (isCurrentVideo) return;
    
    if (isZoomed) {
      resetZoom();
    } else {
      setIsZoomed(true);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed && !isCurrentVideo) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed && !isCurrentVideo) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentUrl;
    link.download = `seguimiento-${Date.now()}.${isCurrentVideo ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    console.error('Error loading media in modal:', url);
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
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoCanPlay = (url: string) => {
    console.log('Video can play in modal:', url);
    handleMediaLoad(url);
  };

  const handleVideoLoadStart = (url: string) => {
    console.log('Video load started in modal:', url);
    setMediaStates(prev => ({
      ...prev,
      [url]: {
        ...prev[url],
        isLoading: true,
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Header del modal */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div>
              <h3 className="text-white font-semibold text-xl">Medios de Seguimiento</h3>
              <p className="text-white/70 text-sm mt-1">
                {currentIndex + 1} de {mediaUrls.length} • 
                {isCurrentVideo 
                  ? ` Video ${isPlaying ? '• Reproduciendo' : '• Pausado'}`
                  : (isZoomed ? " Arrastra para mover • Clic para alejar" : " Clic para acercar")}
              </p>
            </div>
            <div className="flex gap-3">
              {!isCurrentVideo && (
                <button
                  onClick={toggleZoom}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm"
                  title="Zoom"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              )}
              {isCurrentVideo && (
                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm"
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              )}
              <button
                onClick={handleDownload}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm"
                title="Descargar"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navegación entre medios */}
        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 z-20 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-sm"
              title="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-20 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-sm"
              title="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Contenedor del medio */}
        <div
          className={`relative max-w-6xl max-h-[90vh] w-full overflow-hidden rounded-2xl bg-black shadow-2xl ${
            !isCurrentVideo && isZoomed ? 'cursor-move' : 'cursor-default'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mostrar loading o error */}
          {(currentMediaState.isLoading || currentMediaState.hasError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              {currentMediaState.isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <p className="text-white">Cargando {currentMediaState.isVideo ? 'video' : 'imagen'}...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <p className="text-white mb-4">Error al cargar {currentMediaState.isVideo ? 'video' : 'imagen'}</p>
                  <button
                    onClick={() => handleRetryMedia(currentUrl)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className={`relative w-full h-full ${!isCurrentVideo && isZoomed ? 'cursor-move' : 'cursor-default'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={!isCurrentVideo ? toggleZoom : undefined}
          >
            {isCurrentVideo ? (
              <video
                ref={videoRef}
                src={currentUrl}
                className="w-full h-auto max-h-[90vh] object-contain bg-black"
                controls
                autoPlay
                playsInline
                onLoadStart={() => handleVideoLoadStart(currentUrl)}
                onCanPlay={() => handleVideoCanPlay(currentUrl)}
                onLoadedData={() => handleMediaLoad(currentUrl)}
                onError={() => handleMediaError(currentUrl)}
                onLoadedMetadata={() => handleMediaLoad(currentUrl)}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <img
                src={currentUrl}
                alt={`Medio de seguimiento ${currentIndex + 1}`}
                className={`w-full h-auto max-h-[90vh] object-contain bg-black transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={{
                  transform: isZoomed
                    ? `scale(1.5) translate(${imagePosition.x / 1.5}px, ${imagePosition.y / 1.5}px)`
                    : "scale(1)",
                  minHeight: "400px",
                }}
                onLoad={() => handleMediaLoad(currentUrl)}
                onError={() => handleMediaError(currentUrl)}
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* Indicadores en la parte inferior */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isCurrentVideo ? (
              <VideoIcon className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            <span>{isCurrentVideo ? "Video" : "Imagen"}</span>
          </div>
          {mediaUrls.length > 1 && (
            <span className="mx-1">
              {currentIndex + 1} de {mediaUrls.length}
            </span>
          )}
          {!isCurrentVideo && (
            <span>{isZoomed ? "Arrastra para mover • Clic para alejar" : "Clic para acercar"}</span>
          )}
          {isCurrentVideo && (
            <span>Espacio para {isPlaying ? 'pausar' : 'reproducir'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;