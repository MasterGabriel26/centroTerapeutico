import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { useParams, useNavigate } from "react-router-dom";
import { Paciente } from "../types/paciente";
import { Button } from "../../../components/ui/Button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { ArrowLeft, FileDown, AlertCircle } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useFamiliares } from "../hooks/useFamiliares";
import { useSeguimientos } from "../hooks/useSeguimiento";
import { useRecetas } from "../hooks/useRecetas";
import { useCuentaDeCobro } from "../../pagos/hooks/useCuentaDeCobro";
import { useIngresos } from "../hooks/useIngresos";
import { useVisitas } from "../hooks/useVisitas";
import { getPlantillasTests, subscribeToTestsRealizados } from '../../tests_psicologicos/services/testPsicologicoService';
import { TestRealizado, PlantillaTestPsicologico } from '../../tests_psicologicos/types/test_psicologico';

// Función para crear imagen placeholder
const createPlaceholderImage = (originalUrl: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 400;
  canvas.height = 300;
  
  if (ctx) {
    // Fondo gris
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Ícono de imagen rota
    ctx.fillStyle = '#9ca3af';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📷', canvas.width / 2, canvas.height / 2 - 30);
    
    // Texto
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Imagen no disponible', canvas.width / 2, canvas.height / 2);
    
    // Nombre del archivo
    const fileName = originalUrl.substring(
      originalUrl.lastIndexOf('/') + 1, 
      originalUrl.indexOf('?') > -1 ? originalUrl.indexOf('?') : originalUrl.length
    );
    ctx.font = '10px Arial';
    ctx.fillText(
      fileName.length > 40 ? fileName.substring(0, 40) + '...' : fileName, 
      canvas.width / 2, 
      canvas.height / 2 + 20
    );
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  
  return '';
};

// Función para convertir imagen usando canvas con múltiples intentos
const convertImageWithFallback = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    const convertToCanvas = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(createPlaceholderImage(url));
        return;
      }
      
      // Redimensionar para optimizar
      const maxWidth = 600;
      const maxHeight = 400;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      try {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataURL = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataURL);
      } catch (error) {
        console.error('Error en canvas:', error);
        resolve(createPlaceholderImage(url));
      }
    };
    
    img.onload = convertToCanvas;
    img.onerror = () => {
      console.log('Error cargando imagen, creando placeholder...');
      resolve(createPlaceholderImage(url));
    };
    
    // Configurar CORS y cargar imagen
    img.crossOrigin = 'anonymous';
    
    // Intentar con diferentes URLs
    const attempts = [
      url,
      url.replace('http://', 'https://'),
      `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=600&h=400&fit=inside&we`
    ];
    
    let currentAttempt = 0;
    
    const tryLoad = () => {
      if (currentAttempt >= attempts.length) {
        resolve(createPlaceholderImage(url));
        return;
      }
      
      img.src = attempts[currentAttempt];
      
      // Timeout para cada intento
      setTimeout(() => {
        if (!img.complete) {
          currentAttempt++;
          tryLoad();
        }
      }, 5000);
    };
    
    tryLoad();
  });
};

// Hook personalizado para manejar la conversión de imágenes
const useImageConverter = (urls: string[]) => {
  const [convertedImages, setConvertedImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (urls.length === 0) return;

    const convertImages = async () => {
      setLoading(true);
      setProgress(0);
      
      const converted: Record<string, string> = {};
      const uniqueUrls = [...new Set(urls)]; // Eliminar duplicados
      
      // Procesar en lotes para no sobrecargar
      const batchSize = 3;
      for (let i = 0; i < uniqueUrls.length; i += batchSize) {
        const batch = uniqueUrls.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (url) => {
          try {
            const convertedImage = await convertImageWithFallback(url);
            return { url, image: convertedImage };
          } catch (error) {
            console.error('Error procesando imagen:', url, error);
            return { url, image: createPlaceholderImage(url) };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ url, image }) => {
          converted[url] = image;
        });
        
        setProgress(((i + batch.length) / uniqueUrls.length) * 100);
        setConvertedImages({ ...converted });
        
        // Pausa entre lotes
        if (i + batchSize < uniqueUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setLoading(false);
    };

    convertImages();
  }, [JSON.stringify(urls)]);

  return { convertedImages, loading, progress };
};

// Componente para mostrar imágenes con estado de carga
const PDFImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          border: '1px solid #e5e7eb',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

const SuperPdfPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { familiares, cargarFamiliares } = useFamiliares(id || "");
  const { seguimientos, fetchSeguimientos } = useSeguimientos(id || "");
  const { recetas, cargarRecetas } = useRecetas(id || "");
  const { cuentas, refetch: refetchCuentas } = useCuentaDeCobro();
  const { ingresos, cargarIngresos } = useIngresos();
  const { visitas, cargarVisitas } = useVisitas(id || "");
  const [testsRealizados, setTestsRealizados] = useState<TestRealizado[]>([]);

  // Obtener todas las URLs de imágenes
  const allImageUrls = React.useMemo(() => {
    return seguimientos.flatMap(seg => seg.urls || []);
  }, [seguimientos]);

  // Usar el hook para convertir imágenes
  const { convertedImages, loading: imagesLoading, progress } = useImageConverter(allImageUrls);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const capitalize = (text: string | undefined) => {
    if (!text) return "No especificado";
    return text.charAt(0).toUpperCase() + text.slice(1).replace('_', ' ');
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const docRef = doc(db, "pacientes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPaciente({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Paciente, "id">),
          });

          await Promise.all([
            cargarFamiliares(),
            fetchSeguimientos(),
            cargarRecetas(),
            refetchCuentas(),
            cargarIngresos(id),
            cargarVisitas(),
          ]);

          const unsubscribe = subscribeToTestsRealizados(id, (tests) => {
            setTestsRealizados(tests as TestRealizado[]);
          });
          return () => unsubscribe();

        } else {
          console.log("No se encontró el paciente!");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, cargarFamiliares, fetchSeguimientos, cargarRecetas, refetchCuentas, cargarIngresos, cargarVisitas]);

  const handleGeneratePdf = () => {
    if (imagesLoading) {
      alert('Las imágenes aún se están procesando. Por favor, espere un momento.');
      return;
    }

    const element = document.getElementById("pdf-content");
    if (element) {
      const options = {
        margin: [10, 10, 10, 10],
        filename: `informe_completo_${paciente?.nombre_completo?.replace(/\s+/g, '_') || 'paciente'}_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: false, // Cambiado a false ya que usamos imágenes base64
          letterRendering: true,
          allowTaint: true, // Permitir imágenes "tainted"
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.avoid-break'
        }
      };

      html2pdf()
        .set(options)
        .from(element)
        .save()
        .catch((error) => {
          console.error('Error generando PDF:', error);
          alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos para el PDF...</p>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Paciente no encontrado</h2>
          <p className="text-gray-600 mb-6">No se pudo cargar la información para generar el PDF.</p>
          <Button
            onClick={() => navigate(`/pacientes/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Volver a la página del paciente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* Estilos para PDF */}
      <style>{`
        @media print, (min-width: 0) {
          .pdf-page {
            page-break-before: always;
            min-height: 90vh;
            padding: 20px;
            margin-bottom: 20px;
          }
          .pdf-page:first-child {
            page-break-before: auto;
          }
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .page-break-before {
            page-break-before: always;
          }
          .pdf-header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .pdf-section {
            margin-bottom: 25px;
          }
          .pdf-item {
            margin-bottom: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .pdf-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .pdf-table th,
          .pdf-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          .pdf-table th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .pdf-image-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header de la página (no se incluye en PDF) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button
            onClick={() => navigate(`/pacientes/${id}`)}
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Generar PDF Consolidado</h1>
          <div className="flex items-center gap-4">
            {imagesLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                <span>Procesando imágenes... {Math.round(progress)}%</span>
              </div>
            )}
            <Button
              onClick={handleGeneratePdf}
              disabled={imagesLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown size={16} />
              {imagesLoading ? 'Procesando...' : 'Descargar PDF'}
            </Button>
          </div>
        </div>

        {/* Alerta si hay imágenes procesándose */}
        {imagesLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-blue-800 font-medium">Procesando imágenes para el PDF</p>
                <p className="text-blue-600 text-sm">
                  Se están convirtiendo {allImageUrls.length} imágenes para asegurar su correcta visualización en el PDF. 
                  Progreso: {Math.round(progress)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del PDF */}
        <div id="pdf-content" className="bg-white">
          {/* Resto del contenido igual que antes hasta la sección de seguimientos... */}
          
          {/* Página 1: Portada e Información General */}
          <div className="pdf-page">
            {/* Portada */}
            <div className="text-center mb-16">
              <div className="pdf-header">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  INFORME MÉDICO COMPLETO
                </h1>
                <h2 className="text-xl text-gray-600 mb-4">
                  {paciente?.nombre_completo}
                </h2>
                <div className="text-sm text-gray-500">
                  <p>Documento: {paciente?.documento}</p>
                  <p>Expediente: {paciente?.numero_expediente}</p>
                  <p>Fecha de generación: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
                </div>
              </div>
            </div>

            {/* Información General */}
            <div className="pdf-section avoid-break">
              <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">
                1. INFORMACIÓN GENERAL DEL PACIENTE
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="font-semibold">Nombre Completo:</span> {paciente.nombre_completo}</p>
                  <p><span className="font-semibold">Documento de Identidad:</span> {paciente.documento}</p>
                  <p><span className="font-semibold">Fecha de Nacimiento:</span> {formatDate(paciente.fecha_nacimiento)}</p>
                  <p><span className="font-semibold">Edad:</span> {paciente.edad} años</p>
                  <p><span className="font-semibold">Sexo:</span> {capitalize(paciente.sexo)}</p>
                  <p><span className="font-semibold">Estado Civil:</span> {capitalize(paciente.estado_civil)}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-semibold">Teléfono:</span> {paciente.telefono}</p>
                  <p><span className="font-semibold">Email:</span> {paciente.email || "No especificado"}</p>
                  <p><span className="font-semibold">Dirección:</span> {paciente.direccion}</p>
                  <p><span className="font-semibold">Escolaridad:</span> {paciente.escolaridad}</p>
                  <p><span className="font-semibold">Estado Actual:</span> {capitalize(paciente.estado)}</p>
                  <p><span className="font-semibold">Fecha de Ingreso:</span> {formatDate(paciente.fecha_ingreso)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resto de páginas igual que antes hasta seguimientos... */}
          
          {/* Página de Seguimientos Médicos - MODIFICADA */}
                  {/* Página de Seguimientos Médicos - MODIFICADA */}
          {seguimientos.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-yellow-800">4. SEGUIMIENTOS MÉDICOS</h2>
              </div>
              <div className="pdf-section">
                {seguimientos.map((seg, index) => (
                  <div key={seg.id} className="pdf-item avoid-break border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-yellow-700">Seguimiento #{index + 1}</h4>
                      <span className="text-sm text-gray-600">{formatDate(seg.fecha)}</span>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><span className="font-semibold">Comportamiento Observado:</span> {seg.comportamiento}</p>
                      <p><span className="font-semibold">Descripción Detallada:</span></p>
                      <p className="bg-gray-50 p-3 rounded">{seg.descripcion}</p>

                      {/* Mostrar imágenes de evidencia - MEJORADO */}
                      {seg.urls && seg.urls.length > 0 && (
                        <div className="mt-4">
                          <p className="font-semibold mb-3">Evidencia Fotográfica:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {seg.urls.map((url, idx) => (
                              <div key={idx} className="pdf-image-container avoid-break">
                                <div className="border rounded-lg p-2 bg-white">
                                  {convertedImages[url] ? (
                                    <PDFImage
                                      src={convertedImages[url]}
                                      alt={`Evidencia ${idx + 1} - Seguimiento ${index + 1}`}
                                      className="w-full h-48 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                                      <div className="text-center text-gray-500">
                                        <div className="animate-pulse">
                                          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
                                          <p className="text-sm">Procesando imagen...</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2 text-center">
                                    Evidencia {idx + 1} - {formatDate(seg.fecha)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Lista de archivos para referencia */}
                          <div className="mt-3 text-xs text-gray-600">
                            <p className="font-semibold mb-1">Referencias de archivos:</p>
                            <ul className="list-disc list-inside ml-2">
                              {seg.urls.map((url, idx) => (
                                <li key={idx} className="break-all">
                                  {url.substring(url.lastIndexOf('/') + 1, url.indexOf('?') > -1 ? url.indexOf('?') : url.length)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Página 2: Familiares y Contactos */}
          {familiares.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-green-800">2. FAMILIARES Y CONTACTOS DE EMERGENCIA</h2>
              </div>
              <div className="pdf-section">
                {familiares.map((familiar, index) => (
                  <div key={familiar.id} className="pdf-item avoid-break border rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-700 mb-2">Contacto {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-semibold">Nombre:</span> {familiar.nombre}</p>
                        <p><span className="font-semibold">Parentesco:</span> {familiar.parentesco}</p>
                      </div>
                      <div>
                        <p><span className="font-semibold">Teléfono Principal:</span> {familiar.telefono1}</p>
                        {familiar.telefono2 && <p><span className="font-semibold">Teléfono Secundario:</span> {familiar.telefono2}</p>}
                        {familiar.email && <p><span className="font-semibold">Email:</span> {familiar.email}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Página 3: Historial de Ingresos */}
          {ingresos.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-teal-800">3. HISTORIAL DE INGRESOS</h2>
              </div>
              <div className="pdf-section">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Fecha Ingreso</th>
                      <th>Motivo Ingreso</th>
                      <th>Fecha Salida</th>
                      <th>Motivo Salida</th>
                      <th>Voluntario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.map((ingreso) => (
                      <tr key={ingreso.id} className="avoid-break">
                        <td>{formatDate(ingreso.fecha_ingreso)}</td>
                        <td>{ingreso.motivo_ingreso}</td>
                        <td>{ingreso.fecha_salida ? formatDate(ingreso.fecha_salida) : "Actualmente ingresado"}</td>
                        <td>{ingreso.motivo_salida || "N/A"}</td>
                        <td>{ingreso.voluntario ? "Sí" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Página 5: Recetas Médicas */}
          {recetas.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-purple-800">5. RECETAS MÉDICAS</h2>
              </div>
              <div className="pdf-section">
                {recetas.map((receta, index) => (
                  <div key={receta.id} className="pdf-item avoid-break border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-purple-700">Receta #{index + 1}</h4>
                      <span className="text-sm text-gray-600">Folio: {receta.folio}</span>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><span className="font-semibold">Fecha:</span> {formatDate(receta.fecha instanceof Date ? receta.fecha.toISOString() : String(receta.fecha))}</p>
                          <p><span className="font-semibold">Motivo:</span> {receta.motivo}</p>
                        </div>
                        <div>
                          <p><span className="font-semibold">Total:</span> ${receta.total?.toFixed(2)}</p>
                          {receta.riesgos && <p><span className="font-semibold">Riesgos:</span> {receta.riesgos}</p>}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Medicamentos Prescritos:</p>
                        <table className="pdf-table">
                          <thead>
                            <tr>
                              <th>Medicamento</th>
                              <th>Posología</th>
                              <th>Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {receta.medicamentos.map((med, idx) => (
                              <tr key={idx}>
                                <td>{med.nombre}</td>
                                <td>{med.posologia}</td>
                                <td>{med.cantidad} unidades</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Página 6: Registro de Visitas */}
          {visitas.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-orange-800">6. REGISTRO DE VISITAS</h2>
              </div>
              <div className="pdf-section">
                {visitas.map((visita, index) => (
                  <div key={visita.id} className="pdf-item avoid-break border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-orange-700">Visita #{index + 1}</h4>
                      <span className="text-sm text-gray-600">{formatDate(visita.fecha instanceof Date ? visita.fecha.toISOString() : String(visita.fecha))}</span>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><span className="font-semibold">Registrado por:</span> {visita.registradoPor}</p>
                      {visita.observaciones && (
                        <div>
                          <p className="font-semibold">Observaciones:</p>
                          <p className="bg-gray-50 p-3 rounded">{visita.observaciones}</p>
                        </div>
                      )}
                      <div className="mt-3">
                        <p className="font-semibold mb-2">Visitantes:</p>
                        <table className="pdf-table">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Parentesco</th>
                              <th>Teléfono</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visita.visitantes.map((visitante) => (
                              <tr key={visitante.id || `${visitante.nombre}-${visitante.parentesco}`}>
                                <td>{visitante.nombre}</td>
                                <td>{visitante.parentesco}</td>
                                <td>{visitante.telefono}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Página 7: Tests Psicológicos */}
          {testsRealizados.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-gray-800">7. EVALUACIONES PSICOLÓGICAS</h2>
              </div>
              <div className="pdf-section">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Título del Test</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testsRealizados.map((test) => (
                      <tr key={test.id} className="avoid-break">
                        <td>{formatDate(test.fecha.toString())}</td>
                        <td>{test.tituloTest}</td>
                        <td>{capitalize(test.estado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Página 8: Cuentas de Cobro */}
          {cuentas.length > 0 && (
            <div className="pdf-page page-break-before">
              <div className="pdf-header">
                <h2 className="text-xl font-bold text-red-800">8. HISTORIAL FINANCIERO</h2>
              </div>
              <div className="pdf-section">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th>Fecha Generación</th>
                      <th>Período Desde</th>
                      <th>Período Hasta</th>
                      <th>Estado</th>
                      <th>Monto Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentas.map((cuenta) => (
                      <tr key={cuenta.id} className="avoid-break">
                        <td>{formatDate(cuenta.fecha)}</td>
                        <td>{formatDate(cuenta.periodo?.desde)}</td>
                        <td>{formatDate(cuenta.periodo?.hasta)}</td>
                        <td>{capitalize(cuenta.estado)}</td>
                        <td>${(cuenta.total || cuenta.monto || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm">
                    <span className="font-semibold">Total General:</span>
                    ${cuentas.reduce((sum, cuenta) => sum + (cuenta.total || cuenta.monto || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Página Final: Resumen y Pie de Página */}
          <div className="pdf-page page-break-before">
            <div className="pdf-header">
              <h2 className="text-xl font-bold text-gray-800">RESUMEN DEL EXPEDIENTE</h2>
            </div>

            <div className="pdf-section">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 mb-2">Estadísticas del Expediente</h4>
                    <div className="space-y-1">
                      <p>• Total de Familiares: {familiares.length}</p>
                      <p>• Total de Seguimientos: {seguimientos.length}</p>
                      <p>• Total de Recetas: {recetas.length}</p>
                      <p>• Total de Visitas: {visitas.length}</p>
                      <p>• Total de Ingresos: {ingresos.length}</p>
                      <p>• Tests Psicológicos: {testsRealizados.length}</p>
                      <p>• Cuentas de Cobro: {cuentas.length}</p>
                      <p>• Imágenes de Evidencia: {allImageUrls.length}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-2">Estado Actual</h4>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Estado del Paciente:</span> {capitalize(paciente.estado)}</p>
                      <p><span className="font-semibold">Último Seguimiento:</span> {
                        seguimientos.length > 0
                          ? formatDate(seguimientos[seguimientos.length - 1].fecha)
                          : "Sin registros"
                      }</p>
                      <p><span className="font-semibold">Última Visita:</span> {
                        visitas.length > 0
                          ? formatDate(visitas[visitas.length - 1].fecha instanceof Date
                            ? visitas[visitas.length - 1].fecha.toISOString()
                            : String(visitas[visitas.length - 1].fecha))
                          : "Sin registros"
                      }</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-700 mb-2">Información de Contacto</h4>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Paciente:</span> {paciente.telefono}</p>
                      {familiares.length > 0 && (
                        <div>
                          <p className="font-semibold mt-2">Contactos de Emergencia:</p>
                          {familiares.slice(0, 3).map((familiar, idx) => (
                            <p key={idx} className="text-xs">
                              • {familiar.nombre} ({familiar.parentesco}): {familiar.telefono1}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-red-700 mb-2">Información Financiera</h4>
                    <div className="space-y-1">
                      <p><span className="font-semibold">Total Facturado:</span>
                        ${cuentas.reduce((sum, cuenta) => sum + (cuenta.total || cuenta.monto || 0), 0).toFixed(2)}
                      </p>
                      <p><span className="font-semibold">Cuentas Pendientes:</span>
                        {cuentas.filter(cuenta => cuenta.estado === 'pendiente').length}
                      </p>
                      <p><span className="font-semibold">Cuentas Pagadas:</span>
                        {cuentas.filter(cuenta => cuenta.estado === 'pagada').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie de página del documento */}
            <div className="mt-16 pt-6 border-t-2 border-gray-300">
              <div className="text-center text-xs text-gray-600 space-y-2">
                <p>Este documento fue generado automáticamente el {format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
                <p>Expediente Médico - {paciente.nombre_completo} - Documento: {paciente.documento}</p>
                <p>Este informe contiene información médica confidencial y está protegido por las leyes de privacidad médica</p>
                               {imagesLoading && (
                  <p className="text-yellow-600 font-medium">
                    ⚠️ Algunas imágenes aún se están procesando. Para mejores resultados, espere a que termine el procesamiento antes de generar el PDF.
                  </p>
                )}
                {!imagesLoading && allImageUrls.length > 0 && (
                  <p className="text-green-600 font-medium">
                    ✅ Todas las imágenes han sido procesadas correctamente para el PDF.
                  </p>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-semibold">Firma del Médico Tratante</p>
                      <div className="mt-8 border-b border-gray-400 w-48"></div>
                      <p className="mt-2">Dr. ________________________</p>
                      <p>Fecha: ___________________</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Sello Institucional</p>
                      <div className="mt-8 w-32 h-20 border border-gray-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperPdfPage;