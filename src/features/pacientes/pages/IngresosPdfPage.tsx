
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import { useIngresos } from '../hooks/useIngresos';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download } from 'lucide-react';

const IngresosPdfPage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const { ingresos, cargarIngresos, loading } = useIngresos();
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pacienteId) {
      getPacienteById(pacienteId).then(setPaciente);
      cargarIngresos(pacienteId);
    }
  }, [pacienteId, cargarIngresos]);

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
    return <div>Cargando información del paciente y ingresos...</div>;
  }

  if (ingresos.length === 0) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No hay ingresos registrados para este paciente.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No registrada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
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
            <h1 className="text-3xl font-bold text-gray-800">Historial de Internamientos de {paciente.nombre_completo}</h1>
            <p className="text-md text-gray-500">Expediente: {paciente.numero_expediente || "No asignado"}</p>
          </div>
          <img src="/logo_sin_fondo.png" alt="Logo" className="h-16" />
        </div>

        {/* Lista de Ingresos */}
        <div className="space-y-6">
          {ingresos.map((ingreso) => (
            <div key={ingreso.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fecha de Ingreso</p>
                  <p className="text-lg text-gray-800">{formatDate(ingreso.fecha_ingreso)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fecha de Salida</p>
                  <p className="text-lg text-gray-800">{ingreso.fecha_salida ? formatDate(ingreso.fecha_salida) : "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Motivo de Ingreso</p>
                <p className="text-base text-gray-800 whitespace-pre-wrap">{ingreso.motivo_ingreso}</p>
              </div>
              {ingreso.motivo_salida && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-600">Motivo de Salida</p>
                  <p className="text-base text-gray-800 whitespace-pre-wrap">{ingreso.motivo_salida}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-4 text-center text-xs text-gray-400 border-t-2 border-gray-200">
          <p>Centro Terapéutico - Reporte de Historial de Internamientos del Paciente</p>
          <p>Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default IngresosPdfPage;
