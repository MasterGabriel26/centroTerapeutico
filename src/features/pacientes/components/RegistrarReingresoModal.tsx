import React, { useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { TextArea } from "../../../components/ui/TextArea";
import { Button } from "../../../components/ui/Button";
import { format } from "date-fns";
import { agregarIngreso } from "../services/ingresosService";

interface Props {
  pacienteId: string;
  onClose: () => void;
  onReingresado: () => void; // 👈 esta es obligatoria
}


const RegistrarReingresoModal: React.FC<Props> = ({ pacienteId, onClose, onReingresado }) => {
  const [fechaIngreso, setFechaIngreso] = useState(format(new Date(), "yyyy-MM-dd"));
  const [motivoIngreso, setMotivoIngreso] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!fechaIngreso || !motivoIngreso.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await agregarIngreso(pacienteId, {
        fecha_ingreso: fechaIngreso,
        motivo_ingreso: motivoIngreso.trim(),
        fecha_salida: "",
      });
      onReingresado();
      onClose();
    } catch (err) {
      console.error("Error al registrar reingreso:", err);
      setError("No se pudo registrar el reingreso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={true} onClose={onClose} title="Registrar reingreso" size="md">
      <div className="space-y-4">
        <Input
          label="Fecha de reingreso"
          type="date"
          value={fechaIngreso}
          onChange={(e) => setFechaIngreso(e.target.value)}
          max={format(new Date(), "yyyy-MM-dd")}
          required
        />

        <TextArea
          label="Motivo del reingreso"
          value={motivoIngreso}
          onChange={(e) => setMotivoIngreso(e.target.value)}
          rows={4}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} disabled={loading} isLoading={loading}>
          Registrar
        </Button>
      </div>
    </Dialog>
  );
};

export default RegistrarReingresoModal;
