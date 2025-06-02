import React, { useState } from "react";
import { Dialog } from "../../../../src/components/ui/Dialog";
import { Input } from "../../../../src/components/ui/Input";
import { TextArea } from "../../../../src/components/ui/TextArea";
import { Button } from "../../../../src/components/ui/Button";
import { CuentaCobro } from "../../pagos/types/cuenta_cobro";
import { addCuentaDeCobro } from "../../pagos/services/cuentaCobroService";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
  pacienteId: string;
  onCreated?: () => void;
}

const CrearCuentaCobroModal = ({ open, onClose, pacienteId, onCreated }: Props) => {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    setLoading(true);
    const nuevaCuenta: Omit<CuentaCobro, "id"> = {
      paciente_id: pacienteId,
      fecha: format(new Date(), "yyyy-MM-dd"),
      monto: parseFloat(monto),
      metodo_pago: metodoPago || undefined,
      estado: "generado",
      periodo: { desde, hasta },
      concepto,
      notas: notas || undefined,
    };

    await addCuentaDeCobro(nuevaCuenta);
    setLoading(false);
    onCreated?.();
    onClose();
  };

 return (
  <Dialog isOpen={open} onClose={onClose} title="Nueva Cuenta de Cobro">
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Desde</label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Hasta</label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Monto</label>
        <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Concepto</label>
        <TextArea value={concepto} onChange={(e) => setConcepto(e.target.value)} rows={2} />
      </div>

      {/* <div>
        <label className="block text-sm text-gray-600 mb-1">Método de Pago (opcional)</label>
        <Input value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} placeholder="Efectivo, transferencia, etc." />
      </div> */}

      <div>
        <label className="block text-sm text-gray-600 mb-1">Notas (opcional)</label>
        <TextArea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleCrear} disabled={loading || !desde || !hasta || !monto || !concepto}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  </Dialog>
);

};

export default CrearCuentaCobroModal;
