
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download } from 'lucide-react';

const InfoGeneralPdf: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pacienteId) {
      getPacienteById(pacienteId).then(setPaciente);
    }
  }, [pacienteId]);

  const generatePdf = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const opt = {
        margin:       [15, 10, 15, 10],
        filename:     `informacion_paciente_${paciente?.nombre_completo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
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

  if (!paciente) {
    return <div>Cargando información del paciente...</div>;
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const capitalize = (text: string | undefined) => {
    if (!text) return "No especificado";
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ');
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
            <h1 className="text-3xl font-bold text-gray-800">{paciente.nombre_completo}</h1>
            <p className="text-md text-gray-500">Expediente: {paciente.numero_expediente || "No asignado"}</p>
          </div>
          <img src="/logo_sin_fondo.png" alt="Logo" className="h-16" />
        </div>

        {/* Grid de Información */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Datos Personales */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-2">Datos Personales</h2>
            <InfoItem label="Documento" value={paciente.documento} />
            <InfoItem label="Fecha de Nacimiento" value={formatDate(paciente.fecha_nacimiento)} />
            <InfoItem label="Edad" value={`${paciente.edad || 0} años`} />
            <InfoItem label="Sexo" value={capitalize(paciente.sexo)} />
            <InfoItem label="Estado Civil" value={capitalize(paciente.estado_civil)} />
          </div>

          {/* Contacto y Ubicación */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-700 border-b-2 border-green-200 pb-2">Contacto y Ubicación</h2>
            <InfoItem label="Teléfono" value={paciente.telefono} />
            <InfoItem label="Correo Electrónico" value={paciente.email} />
            <InfoItem label="Dirección" value={paciente.direccion} />
          </div>

          {/* Educación y Empleo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-700 border-b-2 border-purple-200 pb-2">Educación y Empleo</h2>
            <InfoItem label="Escolaridad" value={paciente.escolaridad} />
            <InfoItem label="Situación Laboral" value={paciente.desempleado ? "Desempleado" : "Empleado"} />
            {paciente.desempleado && <InfoItem label="Tiempo Desempleado" value={paciente.tiempo_desempleo} />}
          </div>

          {/* Situación Económica */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-700 border-b-2 border-amber-200 pb-2">Situación Económica</h2>
            <InfoItem label="Dependencia Económica" value={paciente.depende_economicamente ? `Sí (${paciente.de_quien_depende})` : "No"} />
            <InfoItem label="Personas a Cargo" value={paciente.alguien_depende_de_usted ? `Sí (${paciente.quien_depende})` : "No"} />
          </div>

          {/* Información Familiar */}
          <div className="space-y-4 col-span-2">
            <h2 className="text-xl font-semibold text-rose-700 border-b-2 border-rose-200 pb-2">Información Familiar y Social</h2>
            <InfoItem label="Personas con las que vive" value={paciente.personas_con_vive} />
            <InfoItem label="Relación Sentimental" value={paciente.tiene_pareja ? `En pareja (${paciente.tiempo_relacion})` : "Sin pareja"} />
          </div>

          {/* Registro en Sistema */}
          <div className="space-y-4 col-span-2">
            <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-2">Registro en Sistema</h2>
            <InfoItem label="Fecha de Entrevista" value={formatDate(paciente.fecha_entrevista)} />
            <InfoItem label="Fecha de Registro" value={formatDate(paciente.creado)} />
            <InfoItem label="Estado Actual" value={capitalize(paciente.estado)} />
          </div>

        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-4 text-center text-xs text-gray-400 border-t-2 border-gray-200">
          <p>Centro Terapéutico - Reporte de Información General del Paciente</p>
          <p>Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string, value: string | undefined | null }) => (
  <div className="flex items-start gap-3">
    <div>
      <p className="text-sm font-medium text-gray-500">{label}:</p>
      <p className="text-sm text-gray-800 col-span-2">{value || "No registrado"}</p>
    </div>
  </div>
);

export default InfoGeneralPdf;
