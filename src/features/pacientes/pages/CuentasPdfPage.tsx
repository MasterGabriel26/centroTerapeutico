import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPacienteById } from '../services/pacienteService';
import { Paciente } from '../types/paciente.d';
import { useCuentaDeCobro } from '../../pagos/hooks/useCuentaDeCobro';
import { CuentaCobro } from '../../pagos/types/cuenta_cobro';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download } from 'lucide-react';

const CuentasPdfPage: React.FC = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  const { cuentas, loading: loadingCuentas } = useCuentaDeCobro();
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
  }, [pacienteId]);

  const generatePdf = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `cuentas_cobro_${paciente?.nombre_completo || 'paciente'}.pdf`,
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

  const formatPeriodo = (periodo: any) => {
    if (!periodo) return "No especificado";
    
    try {
      const desde = new Date(periodo.desde);
      const hasta = new Date(periodo.hasta);
      
      if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
        return "Periodo inválido";
      }
      
      const desdeStr = desde.toLocaleDateString("es-ES");
      const hastaStr = hasta.toLocaleDateString("es-ES");
      return `${desdeStr} - ${hastaStr}`;
    } catch (error) {
      return "Periodo inválido";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Fecha no disponible";
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Fecha inválida";
      }
      return dateObj.toLocaleDateString("es-ES");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (estado?.toLowerCase()) {
      case 'pagado':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pendiente':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'vencido':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Filtrar cuentas del paciente
  const cuentasPaciente = cuentas.filter(
    (cuenta) => cuenta.paciente_id === pacienteId
  );

  const loading = loadingPaciente || loadingCuentas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando información del paciente y cuentas...</div>
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
                  Cuentas de Cobro
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

            {/* Contenido de cuentas */}
            {cuentasPaciente.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No hay cuentas de cobro registradas para este paciente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Fecha
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Periodo
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                        Estado
                      </th>
                      <th className="p-3 text-right text-sm font-semibold text-gray-700 border border-gray-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentasPaciente.map((cuenta) => (
                      <tr key={cuenta.id} className="hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-800 border border-gray-300">
                          {formatDate(cuenta.fecha)}
                        </td>
                        <td className="p-3 text-sm text-gray-800 border border-gray-300">
                          {formatPeriodo(cuenta.periodo)}
                        </td>
                        <td className="p-3 text-sm border border-gray-300">
                          <span className={getEstadoBadge(cuenta.estado)}>
                            {cuenta.estado || 'Sin estado'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-800 border border-gray-300 text-right font-medium">
                          ${(cuenta.monto || 0).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Resumen por estados */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">Pagadas</h3>
                    <p className="text-lg font-bold text-green-900">
                      {cuentasPaciente.filter(c => c.estado?.toLowerCase() === 'pagado').length}
                    </p>
                    <p className="text-sm text-green-700">
                      ${cuentasPaciente
                        .filter(c => c.estado?.toLowerCase() === 'pagado')
                        .reduce((sum, c) => sum + (c.monto || 0), 0)
                        .toLocaleString('es-CO')}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">Pendientes</h3>
                    <p className="text-lg font-bold text-yellow-900">
                      {cuentasPaciente.filter(c => c.estado?.toLowerCase() === 'pendiente').length}
                    </p>
                    <p className="text-sm text-yellow-700">
                      ${cuentasPaciente
                        .filter(c => c.estado?.toLowerCase() === 'pendiente')
                        .reduce((sum, c) => sum + (c.monto || 0), 0)
                        .toLocaleString('es-CO')}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Total General</h3>
                    <p className="text-lg font-bold text-gray-900">
                      {cuentasPaciente.length}
                    </p>
                    <p className="text-sm text-gray-700">
                      ${cuentasPaciente
                        .reduce((sum, cuenta) => sum + (cuenta.monto || 0), 0)
                        .toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 px-8">
              <div className="text-center text-xs text-gray-500">
                <p className="font-medium mb-1">Centro Terapéutico - Reporte de Cuentas de Cobro</p>
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

export default CuentasPdfPage;