import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Dialog } from "../../../../src/components/ui/Dialog";
import { Button } from "../../../../src/components/ui/Button";
import { CuentaCobro } from "../../pagos/types/cuenta_cobro";
import { Select } from "../../../../src/components/ui/Select";
import { actualizarEstadoCuentaDeCobro } from "../../pagos/services/cuentaCobroService";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useAuditoriaCuentaCobro } from "../../auditoriaCuentaDeCobro/hooks/useAuditoriaCuentaCobro";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  CreditCard, 
  DollarSign,
  Download,
  History,
  X,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

interface Props {
  cuenta: CuentaCobro;
  onClose: () => void;
  onVerAuditoria: () => void;
  pacienteNombre: string;
  refetch?: () => void;
}

const DetalleCuentaCobroModal = ({
  cuenta,
  onClose,
  onVerAuditoria,
  pacienteNombre,
  refetch,
}: Props) => {
  const [estado, setEstado] = useState<CuentaCobro["estado"]>(cuenta.estado);
  const [loading, setLoading] = useState(false);

  const { refetch: refetchAuditoria } = useAuditoriaCuentaCobro(cuenta.paciente_id, cuenta.id);

  const getEstadoInfo = (estado: string) => {
    const estadoConfig: { [key: string]: { color: string, bgColor: string, icon: any, text: string } } = {
      pagada: { color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: CheckCircle, text: "Pagada" },
      enviada: { color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200", icon: Clock, text: "Enviada" },
      generado: { color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: FileText, text: "Generada" },
      rechazada: { color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: XCircle, text: "Rechazada" },
      anulado: { color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200", icon: AlertCircle, text: "Anulada" },
    };
    return estadoConfig[estado] || { color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200", icon: FileText, text: estado };
  };

  const handleCambioEstado = async (nuevoEstado: CuentaCobro["estado"]) => {
    try {
      setLoading(true);
      await actualizarEstadoCuentaDeCobro(
        cuenta.id,
        cuenta.paciente_id,
        nuevoEstado,
        `Cambio manual desde DetalleCuentaCobroModal`
      );
      setEstado(nuevoEstado);
      toast.success("Estado actualizado correctamente");
      refetch?.();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  const estadoInfo = getEstadoInfo(estado);
  const IconoEstado = estadoInfo.icon;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="modal-detalle"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
      >
        <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header responsivo */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Detalle Cuenta de Cobro
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  #{cuenta.id.substring(0, 8)}...
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Estado destacado */}
              <div className={`${estadoInfo.bgColor} border rounded-lg p-4 text-center`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IconoEstado className={`w-6 h-6 ${estadoInfo.color}`} />
                  <span className={`text-lg font-bold ${estadoInfo.color}`}>
                    {estadoInfo.text}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Estado actual de la cuenta</p>
              </div>

              {/* Información principal en grid responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Información del paciente */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Información del Paciente</h3>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                      {pacienteNombre || cuenta.paciente_id}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ID Paciente</p>
                    <p className="text-sm text-gray-700 break-all">
                      {cuenta.paciente_id}
                    </p>
                  </div>
                </div>

                {/* Información de fechas */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Fechas</h3>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fecha de Generación</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {new Date(cuenta.fecha).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Período</p>
                    <p className="text-sm text-gray-700">
                      {new Date(cuenta.periodo.desde).toLocaleDateString("es-ES")} 
                      <span className="mx-1">→</span>
                      {new Date(cuenta.periodo.hasta).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Concepto y detalles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Detalles del Servicio</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Concepto</p>
                    <p className="text-sm text-gray-900 whitespace-pre-line break-words">
                      {cuenta.concepto}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Método de Pago</p>
                    <p className="text-sm text-gray-700">
                      {cuenta.metodo_pago || "No especificado"}
                    </p>
                  </div>
                  
                  {cuenta.notas && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line break-words">
                        {cuenta.notas}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monto destacado */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Monto Total</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">
                  $ {cuenta.monto.toLocaleString("es-CO")}
                </p>
              </div>

              {/* Control de estado */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700 mb-3">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-semibold">Control de Estado</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar estado de la cuenta:
                    </label>
                    <Select
                      label="Estado de la cuenta"
                      value={estado}
                      disabled={loading}
                      onChange={(e) =>
                        handleCambioEstado(e.target.value as CuentaCobro["estado"])
                      }
                      options={[
                        { value: "generado", label: "Generado" },
                        { value: "enviada", label: "Enviada" },
                        { value: "pagada", label: "Pagada" },
                        { value: "anulado", label: "Anulado" },
                        { value: "rechazada", label: "Rechazada" },
                      ]}
                    />
                  </div>
                  
                  {loading && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      <span className="text-sm">Actualizando estado...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones responsivos */}
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                variant="outlinePrimary" 
                icon={<Download className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Generar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button 
                variant="secondary" 
                onClick={onVerAuditoria}
                icon={<History className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Ver historial</span>
                <span className="sm:hidden">Historial</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                disabled={loading}
                className="w-full sm:w-auto sm:ml-auto"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DetalleCuentaCobroModal;