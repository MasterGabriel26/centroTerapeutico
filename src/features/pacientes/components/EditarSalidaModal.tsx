import React, { useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { TextArea } from "../../../components/ui/TextArea";
import { Button } from "../../../components/ui/Button";
import { PacienteIngreso } from "../types/pacienteIngreso";
import { useIngresos } from "../hooks/useIngresos";

interface Props {
  ingreso: PacienteIngreso;
  pacienteId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const EditarSalidaModal: React.FC<Props> = ({
  ingreso,
  pacienteId,
  onClose,
  onUpdated,
}) => {
  const [fechaSalida, setFechaSalida] = useState(ingreso.fecha_salida || "");
  const [motivoSalida, setMotivoSalida] = useState(ingreso.motivo_salida || "");
  const [error, setError] = useState("");

  const { actualizarSalida } = useIngresos();

  const handleGuardar = async () => {
    if (!fechaSalida || !motivoSalida.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await actualizarSalida(pacienteId, ingreso.id!, {
        fecha_salida: fechaSalida,
        motivo_salida: motivoSalida,
      });
      onUpdated();
    } catch (err) {
      setError("No se pudo actualizar la salida.");
    }
  };

  return (
    <Dialog isOpen={true} onClose={onClose} title="Editar salida del paciente" size="md">
      <div className="space-y-4">
        <Input
          label="Fecha de salida"
          type="date"
          value={fechaSalida}
          onChange={(e) => setFechaSalida(e.target.value)}
          required
        />
        <TextArea
          label="Motivo de salida"
          value={motivoSalida}
          onChange={(e) => setMotivoSalida(e.target.value)}
          rows={4}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} className="bg-blue-600 text-white hover:bg-blue-700">
          Guardar
        </Button>
      </div>
    </Dialog>
  );
};

export default EditarSalidaModal;
