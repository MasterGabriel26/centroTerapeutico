import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import { useRecetas } from '../hooks/useRecetas';
import { Receta } from '../types/receta';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download } from 'lucide-react';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../utils/firebase";

const RecetasPdfPage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const { recetas, cargarRecetas } = useRecetas(pacienteId || '');
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (pacienteId) {
        setLoading(true);
        try {
          const pacienteData = await getPacienteById(pacienteId);
          setPaciente(pacienteData);
          await cargarRecetas();
        } catch (error) {
          console.error("Error cargando datos:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [pacienteId, cargarRecetas]);

  useEffect(() => {
    const loadDoctorInfo = async () => {
      const uniqueDoctorIds = [...new Set(recetas.map(r => r.idDoctor))];
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
    
    if (recetas.length > 0) {
      loadDoctorInfo();
    }
  }, [recetas, doctoresInfo]);

  const generatePdf = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `recetas_${paciente?.nombre_completo || 'paciente'}.pdf`,
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
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Fecha no disponible';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando información del paciente...</div>
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
                  Recetas Médicas
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

            {/* Contenido de recetas */}
            {recetas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No hay recetas registradas para este paciente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Folio
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Fecha
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Doctor
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Medicamentos
                      </th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700 border border-gray-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recetas.map((receta) => (
                      <tr key={receta.id} className="hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-800 border border-gray-300">
                          {receta.folio || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-gray-800 border border-gray-300">
                          {formatDate(receta.fecha)}
                        </td>
                        <td className="p-3 text-sm text-gray-800 border border-gray-300">
                          {doctoresInfo[receta.idDoctor] || "No asignado"}
                        </td>
                        <td className="p-3 text-sm text-gray-800 border border-gray-300">
                          {receta.medicamentos?.length > 0 
                            ? receta.medicamentos.map(m => m.nombre).join(', ')
                            : 'Sin medicamentos'
                          }
                        </td>
                        <td className="p-3 text-sm text-gray-800 border border-gray-300 text-right font-medium">
                          ${(receta.total || 0).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Resumen total */}
                <div className="mt-6 flex justify-end">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between min-w-48">
                      <span className="text-sm font-semibold text-gray-700">Total General:</span>
                      <span className="text-lg font-bold text-gray-800">
                        ${recetas.reduce((sum, receta) => sum + (receta.total || 0), 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 px-8">
              <div className="text-center text-xs text-gray-500">
                <p className="font-medium mb-1">Centro Terapéutico - Reporte de Recetas Médicas</p>
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

export default RecetasPdfPage;