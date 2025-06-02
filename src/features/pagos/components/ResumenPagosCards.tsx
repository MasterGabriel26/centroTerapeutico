import React from "react";
import { Card } from "../../../components/ui/Card"; 
import { CreditCard, Check, Calendar } from "lucide-react";

interface ResumenPagosCardsProps {
  totalPagos: number;
  totalPagosCompletados: number;
  totalPagosPendientes: number;
  totalRegistros: number;
  totalPendientesCount: number;
}

export const ResumenPagosCards: React.FC<ResumenPagosCardsProps> = ({
  totalPagos,
  totalPagosCompletados,
  totalPagosPendientes,
  totalRegistros,
  totalPendientesCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
      <Card className="p-2">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-primary-50 text-primary-600 mr-4">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pagos</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ${totalPagos.toLocaleString("es-MX")}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{totalRegistros} registros</p>
          </div>
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-success-50 text-success-600 mr-4">
            <Check size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pagos Completados</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ${totalPagosCompletados.toLocaleString("es-MX")}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {totalRegistros - totalPendientesCount} completados
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-warning-50 text-warning-600 mr-4">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ${totalPagosPendientes.toLocaleString("es-MX")}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{totalPendientesCount} pendientes</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
