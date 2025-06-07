// src/features/pagos/components/ExportarPagosModal.tsx
import React, { useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Calendar, FileDown } from "lucide-react";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
  onExportar: (filtros: {
    estado: string;
    desde: string;
    hasta: string;
  }) => void;
}

const estados = ["todos", "generado", "aprobada", "enviada", "pagada", "rechazada", "anulado"];

const ExportarPagosModal: React.FC<Props> = ({ open, onClose, onExportar }) => {
  const [estado, setEstado] = useState("todos");
  const [desde, setDesde] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hasta, setHasta] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleExportar = () => {
    onExportar({ estado, desde, hasta });
    onClose();
  };

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileDown size={20} className="text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">Exportar pagos a Excel</span>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="border rounded p-2 text-sm"
          >
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado[0].toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Desde"
            name="desde"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            leftIcon={<Calendar size={16} />}
          />
          <Input
            type="date"
            label="Hasta"
            name="hasta"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            leftIcon={<Calendar size={16} />}
          />
        </div>
      </div>

      <div className="flex justify-end p-4 border-t border-gray-100">
        <Button onClick={handleExportar} className="bg-blue-600 hover:bg-blue-700 text-white">
          Exportar
        </Button>
      </div>
    </Dialog>
  );
};

export default ExportarPagosModal;
