import React from "react";
import { Dialog } from "@mui/material";
import { Button } from "../../../components/ui/Button";

interface DialogHistorialPagoProps {
  open: boolean;
  onClose: () => void;
  historial: { tipo: string; fecha: string; usuario: string }[] | null;
  usuarios: { [id: string]: string };
}

export const DialogHistorialPago: React.FC<DialogHistorialPagoProps> = ({
  open,
  onClose,
  historial,
  usuarios,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-6 w-full max-w-md bg-white rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Historial del Pago</h2>
        {historial && historial.length > 0 ? (
          <ul className="text-sm text-gray-700 space-y-2">
            {historial.map((item, i) => (
              <li key={i} className="border-b pb-1">
                <strong>{item.tipo.toUpperCase()}</strong> – {item.fecha} por{" "}
                <code>{usuarios[item.usuario] || item.usuario}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No hay historial registrado para este pago.
          </p>
        )}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Dialog>
  );
};
