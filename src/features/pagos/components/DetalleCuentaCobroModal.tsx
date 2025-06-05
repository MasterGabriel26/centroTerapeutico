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

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="modal-detalle"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      >
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
          <Dialog isOpen={true} onClose={onClose} title="Detalle Cuenta de Cobro">
            <div className="space-y-4 text-sm text-gray-700 px-6 py-4">
              <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Paciente:</p>
                    <p>{pacienteNombre || cuenta.paciente_id}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Generado por:</p>
                    <p>"-"</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Fecha de Generación:</p>
                    <p>{new Date(cuenta.fecha).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Periodo:</p>
                    <p>
                      {new Date(cuenta.periodo.desde).toLocaleDateString("es-ES")} →{" "}
                      {new Date(cuenta.periodo.hasta).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold">Concepto:</p>
                  <p className="whitespace-pre-line">{cuenta.concepto}</p>
                </div>

                <div>
                  <p className="font-semibold">Método de Pago:</p>
                  <p>{cuenta.metodo_pago || "-"}</p>
                </div>

                {cuenta.notas && (
                  <div>
                    <p className="font-semibold">Notas:</p>
                    <p className="whitespace-pre-line">{cuenta.notas}</p>
                  </div>
                )}

                <div>
                  <p className="font-semibold">Monto Total:</p>
                  <p className="text-lg font-bold text-primary-600">
                    $ {cuenta.monto.toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <label htmlFor="estado" className="text-sm font-medium text-gray-700">
                    Estado:
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
              </div>

              <div className="flex justify-end pt-4 gap-3 border-t border-gray-100">
                <Button variant="outlinePrimary">Generar PDF</Button>
                <Button variant="secondary" onClick={onVerAuditoria}>
                  Ver historial
                </Button>
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                  Cerrar
                </Button>
              </div>
            </div>
          </Dialog>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DetalleCuentaCobroModal;
