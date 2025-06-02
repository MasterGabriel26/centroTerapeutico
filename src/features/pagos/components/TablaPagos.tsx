import React from "react";
import { Button } from "../../../components/ui/Button";

interface Pago {
  id: string;
  paciente_id: string;
  familiar_id: string;
  fecha: string;
  monto: number;
  metodo_pago: string;
  estado: string;
  comprobante_url?: string;
  historial?: any[];
}

interface TablaPagosProps {
  pagos: Pago[];
  pacientes: { [key: string]: string };
  familiares: { [key: string]: string };
  paginaActual: number;
  totalPaginas: number;
  cambiarPagina: (nueva: number) => void;
  onZoomComprobante: (url: string) => void;
}

export const TablaPagos: React.FC<TablaPagosProps> = ({
  pagos,
  pacientes,
  familiares,
  paginaActual,
  totalPaginas,
  cambiarPagina,
  onZoomComprobante,
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Anexado / Familiar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Método
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comprobante
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {pagos.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {pacientes[p.paciente_id] || "Sin nombre"}
                </div>
                <div className="text-sm text-gray-500">
                  {familiares[p.familiar_id] || "Familiar no asignado"}
                </div>
              </td>
              <td className="px-4 py-2">{p.fecha}</td>
              <td className="px-4 py-2">${p.monto}</td>
              <td className="px-4 py-2 capitalize">{p.metodo_pago}</td>
              <td className="px-4 py-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    p.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : p.estado === "borrado"
                      ? "bg-red-100 text-red-700"
                      : p.estado === "pendiente"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {p.estado}
                </span>
              </td>
              <td className="px-4 py-2">
                {p.comprobante_url ? (
                  <img
                    src={p.comprobante_url}
                    alt="Comprobante"
                    className="h-12 w-12 object-cover rounded-md cursor-pointer hover:ring-2 hover:ring-primary-500"
                    onClick={() => onZoomComprobante(p.comprobante_url!)}
                  />
                ) : (
                  "-"
                )}
              </td>
                
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center py-4 gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <Button
              key={num}
              size="sm"
              variant={paginaActual === num ? "primary" : "outline"}
              onClick={() => cambiarPagina(num)}
            >
              {num}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
