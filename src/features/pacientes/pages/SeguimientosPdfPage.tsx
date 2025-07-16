
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import { useSeguimientos } from '../hooks/useSeguimiento';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download,  VideoIcon } from 'lucide-react';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../utils/firebase";

const SeguimientosPdfPage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const { seguimientos, fetchSeguimientos, loading } = useSeguimientos(pacienteId || '');
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pacienteId) {
      getPacienteById(pacienteId).then(setPaciente);
      fetchSeguimientos();
    }
  }, [pacienteId, fetchSeguimientos]);

  useEffect(() => {
    const loadDoctorInfo = async () => {
      const uniqueDoctorIds = [...new Set(seguimientos.map(s => s.idDoctor))];
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
    
    if (seguimientos.length > 0) {
      loadDoctorInfo();
    }
  }, [seguimientos]);

  const generatePdf = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const opt = {
        html2canvas:  { 
          scale: 1.5, 
          useCORS: true,
          letterRendering: true,
          windowWidth: 794
        },
        jsPDF:        { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          // Ajustar márgenes: [top, left, bottom, right]
          // Aumentar el margen derecho para evitar el corte
          margin: [15, 10, 15, 15]
        },
        pagebreak:    { 
          mode: ['avoid-all', 'css', 'legacy']
        }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  if (!paciente || loading) {
    return <div>Cargando información del paciente y seguimientos...</div>;
  }

  if (seguimientos.length === 0) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No hay seguimientos registrados para este paciente.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={20} />
          Volver
        </button>
        <button onClick={generatePdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
          <Download size={20} />
          Descargar PDF
        </button>
      </div>

      <div ref={contentRef} className="mx-auto bg-white shadow-lg" style={{ width: '794px', minHeight: '297mm'}}>
        <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Seguimientos Clínicos de {paciente.nombre_completo}</h1>
            <p className="text-md text-gray-500">Expediente: {paciente.numero_expediente || "No asignado"}</p>
          </div>
          <img src="/logo_sin_fondo.png" alt="Logo" className="h-16" />
        </div>

        {/* Lista de Seguimientos */}
        <div className="space-y-6">
          {seguimientos.map((seguimiento) => (
            <div key={seguimiento.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fecha</p>
                  <p className="text-base text-gray-800">{formatDate(seguimiento.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Doctor</p>
                  <p className="text-base text-gray-800">{doctoresInfo[seguimiento.idDoctor] || "-"}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600">Comportamiento</p>
                <p className="text-base text-gray-800 whitespace-pre-wrap">{seguimiento.comportamiento}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Descripción</p>
                <p className="text-base text-gray-800 whitespace-pre-wrap">{seguimiento.descripcion}</p>
              </div>
              {seguimiento.urls && seguimiento.urls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-600">Archivos Adjuntos</p>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {seguimiento.urls.map((url, index) => {
                      const fileExtension = url.split('.').pop()?.toLowerCase() || '';
                      const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExtension);
                      return (
                        <div key={index} className="relative w-full h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                          {isVideo ? (
                            <VideoIcon className="w-10 h-10 text-gray-400" />
                          ) : (
                            <img src={url} alt={`Adjunto ${index + 1}`} className="w-full h-full object-cover" />
                          )}
                          <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {isVideo ? 'VIDEO' : 'IMAGEN'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-4 text-center text-xs text-gray-400 border-t-2 border-gray-200">
          <p>Centro Terapéutico - Reporte de Seguimientos Clínicos del Paciente</p>
          <p>Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SeguimientosPdfPage;
