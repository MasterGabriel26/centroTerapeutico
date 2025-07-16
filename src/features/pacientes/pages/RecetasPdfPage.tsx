
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import { useRecetas } from '../hooks/useRecetas';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download } from 'lucide-react';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../utils/firebase";

const RecetasPdfPage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const { recetas, cargarRecetas, loading } = useRecetas(pacienteId || '');
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pacienteId) {
      getPacienteById(pacienteId).then(setPaciente);
      cargarRecetas();
    }
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
    return <div>Cargando información del paciente y recetas...</div>;
  }

  if (recetas.length === 0) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No hay recetas registradas para este paciente.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Fecha no disponible';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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
            <h1 className="text-3xl font-bold text-gray-800">Recetas de {paciente.nombre_completo}</h1>
            <p className="text-md text-gray-500">Expediente: {paciente.numero_expediente || "No asignado"}</p>
          </div>
          <img src="/logo_sin_fondo.png" alt="Logo" className="h-16" />
        </div>

        {/* Tabla de Recetas */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border">Folio</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border">Fecha</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border">Doctor</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border">Medicamentos</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-600 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {recetas.map((receta) => (
              <tr key={receta.id} className="border-b">
                <td className="p-3 text-sm text-gray-800 border">{receta.folio}</td>
                <td className="p-3 text-sm text-gray-800 border">{formatDate(receta.fecha)}</td>
                <td className="p-3 text-sm text-gray-800 border">{doctoresInfo[receta.idDoctor] || "-"}</td>
                <td className="p-3 text-sm text-gray-800 border">{receta.medicamentos.map(m => m.nombre).join(', ')}</td>
                <td className="p-3 text-sm text-gray-800 border text-right">${(receta.total || 0).toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footer */}
        <div className="mt-12 pt-4 text-center text-xs text-gray-400 border-t-2 border-gray-200">
          <p>Centro Terapéutico - Reporte de Recetas del Paciente</p>
          <p>Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RecetasPdfPage;
