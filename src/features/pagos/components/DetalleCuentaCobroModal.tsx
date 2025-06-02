import React, { useState } from "react";
import { Dialog } from "../../../../src/components/ui/Dialog";
import { Button } from "../../../../src/components/ui/Button";
import { CuentaCobro } from "../../pagos/types/cuenta_cobro";
import { Select } from "../../../../src/components/ui/Select";

interface Props {
  cuenta: CuentaCobro;
  onClose: () => void;
  pacienteNombre: string;
  usuarioNombre: string;
}

const DetalleCuentaCobroModal = ({ cuenta, onClose, pacienteNombre, usuarioNombre }: Props) => {
  const [estado, setEstado] = useState<CuentaCobro["estado"]>(cuenta.estado);

  return (
    <Dialog isOpen={true} onClose={onClose} title="Detalle Cuenta de Cobro">
      <div className="space-y-4 text-sm text-gray-700">
        <div className="border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold text-gray-900">Paciente:</p>
              <p>{pacienteNombre || cuenta.paciente_id}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Generado por:</p>
              <p>{usuarioNombre || "-"}</p>
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
              onChange={(e) => setEstado(e.target.value as CuentaCobro["estado"])}
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
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DetalleCuentaCobroModal;
