import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import { useVisitas } from '../hooks/useVisitas';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download, User, Phone } from 'lucide-react';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../utils/firebase";

const VisitasPdfPage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  const [registradoresInfo, setRegistradoresInfo] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Usar el hook de visitas sin llamar cargarVisitas en useEffect
  const { visitas, cargarVisitas, loading: loadingVisitas } = useVisitas(pacienteId || '');

  // Cargar información del paciente solo una vez
  useEffect(() => {
    const loadPaciente = async () => {
      if (pacienteId) {
        setLoadingPaciente(true);
        try {
          const pacienteData = await getPacienteById(pacienteId);
          setPaciente(pacienteData);
        } catch (error) {
          console.error("Error cargando paciente:", error);
        } finally {
          setLoadingPaciente(false);
        }
      }
    };

    loadPaciente();
  }, [pacienteId]); // Solo depende de pacienteId

  // Cargar visitas solo una vez cuando el componente se monta
  useEffect(() => {
    if (pacienteId && cargarVisitas) {
      cargarVisitas();
    }
  }, [pacienteId]); // Removí cargarVisitas de las dependencias

  // Cargar información de registradores cuando cambien las visitas
  useEffect(() => {
    const loadRegistradorInfo = async () => {
      if (visitas.length === 0) return;

      const uniqueRegistradorIds = [...new Set(visitas.map(v => v.registradoPor))];
      const newInfo: Record<string, string> = {};
      
      // Solo cargar los que no tenemos en cache
      const idsToLoad = uniqueRegistradorIds.filter(id => !registradoresInfo[id]);
      
      if (idsToLoad.length === 0) return;

      for (const id of idsToLoad) {
        try {
          const docRef = doc(db, "users", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            newInfo[id] = docSnap.data().nombre_completo || "Usuario";
          }
        } catch (error) {
          console.error("Error cargando información del registrador:", error);
        }
      }
      
      // Solo actualizar si hay nueva información
      if (Object.keys(newInfo).length > 0) {
        setRegistradoresInfo(prev => ({ ...prev, ...newInfo }));
      }
    };
    
    loadRegistradorInfo();
  }, [visitas]); // Solo depende de visitas, removí registradoresInfo

  // Memoizar la función generatePdf para evitar recrearla
  const generatePdf = useCallback(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `visitas_${paciente?.nombre_completo || 'paciente'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy']
        }
      };
      html2pdf().set(opt).from(element).save();
    }
  }, [paciente?.nombre_completo]);

  // Memoizar la función formatDate
  const formatDate = useCallback((date?: Date | string) => {
    if (!date) return 'Fecha no disponible';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const loading = loadingPaciente || loadingVisitas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando información del paciente y visitas...</div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: No se pudo cargar la información del paciente</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Controles superiores - Solo visibles en pantalla */}
      <div className="print:hidden bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <button 
            onClick={generatePdf} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Download size={20} />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Contenido del PDF */}
      <div className="py-8 px-6">
        <div 
          ref={contentRef} 
          className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Registro de Visitas
                </h1>
                <h2 className="text-xl text-gray-700 mb-2">
                  {paciente.nombre_completo}
                </h2>
                <p className="text-sm text-gray-500">
                  Expediente: {paciente.numero_expediente || "No asignado"}
                </p>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src="/logo_sin_fondo.png" 
                  alt="Logo" 
                  className="h-14 w-auto"
                />
              </div>
            </div>

            {/* Contenido de visitas */}
            {visitas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No hay visitas registradas para este paciente.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {visitas.map((visita) => (
                  <div key={visita.id} className="border border-gray-200 rounded-lg p-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Fecha y Hora</p>
                        <p className="text-base text-gray-800">{formatDate(visita.fecha)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Registrado por</p>
                        <p className="text-base text-gray-800">
                          {registradoresInfo[visita.registradoPor] || "Cargando..."}
                        </p>
                      </div>
                    </div>

                    {/* Visitantes */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Visitantes</p>
                      <div className="space-y-3">
                        {visita.visitantes?.map((visitante, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <User size={20} className="text-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-base font-medium text-gray-800">
                                {visitante.nombre}
                              </p>
                              <p className="text-sm text-gray-600">
                                {visitante.parentesco}
                              </p>
                            </div>
                            {visitante.telefono && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone size={14} />
                                <span>{visitante.telefono}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observaciones */}
                    {visita.observaciones && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Observaciones</p>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {visita.observaciones}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 px-8">
              <div className="text-center text-xs text-gray-500">
                <p className="font-medium mb-1">Centro Terapéutico - Reporte de Visitas</p>
                <p>
                  Generado el {new Date().toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitasPdfPage;