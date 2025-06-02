import React from "react";
import { Dialog } from "@mui/material";
import { Button } from "../../../components/ui/Button";

interface DialogComprobanteProps {
  url: string | null;
  onClose: () => void;
}

export const DialogComprobante: React.FC<DialogComprobanteProps> = ({ url, onClose }) => {
  return (
    <Dialog open={!!url} onClose={onClose}>
      <div className="p-6 w-full max-w-md bg-white rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Comprobante de Pago</h2>
        {url && (
          <img
            src={url}
            alt="Comprobante"
            className="w-full max-h-[500px] object-contain rounded"
          />
        )}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Dialog>
  );
};
