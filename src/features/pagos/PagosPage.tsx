import React, { useState } from "react";
import { Search, CreditCard, Check, Calendar, FileDown } from "lucide-react";
import { useTodasLasCuentas, useResumenPagos } from "../../features/pagos/hooks/useCuentaDeCobro";
import { CuentaCobro } from "../../features/pagos/types/cuenta_cobro";
import { exportarPagosFiltradosExcel } from "../../features/pagos/services/cuentaCobroService";
import ExportarPagosModal from "../../features/pagos/components/ExportarPagosModal";
import DataTable, { Column } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const PagosPage = () => {
  const { cuentas, loading } = useTodasLasCuentas();
  const { totalMonto, estadoTotales } = useResumenPagos();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | CuentaCobro["estado"]>("todos");
  const [showExportModal, setShowExportModal] = useState(false);

  const estadosDisponibles = ["todos", "generado", "aprobada", "enviada", "pagada", "rechazada", "anulado"];

  const cuentasFiltradas = cuentas.filter((cuenta) => {
    const nombrePaciente = cuenta.paciente_nombre?.toLowerCase() || "";
    const matchesSearch = nombrePaciente.includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === "todos" || cuenta.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const handleExportarExcel = async ({ estado, desde, hasta }: { estado: string; desde: string; hasta: string }) => {
    const cuentasFiltradas = cuentas.filter((c) => {
      const fechaValida = c.fecha >= desde && c.fecha <= hasta;
      const estadoValido = estado === "todos" || c.estado === estado;
      return fechaValida && estadoValido;
    });
    await exportarPagosFiltradosExcel(cuentasFiltradas);
  };

  const columns: Column<(CuentaCobro & { paciente_nombre: string })>[] = [
    {
      header: "Paciente",
      accessorKey: "paciente_nombre",
    },
    {
      header: "Fecha",
      accessorKey: "fecha",
      cell: ({ cell }) => new Date(cell.getValue() as string).toLocaleDateString("es-ES"),
    },
    {
      header: "Periodo",
      id: "periodo",
      cell: ({ row }) => {
        const { desde, hasta } = row.original.periodo || {};
        if (!desde || !hasta) return "—";
        return `${new Date(desde).toLocaleDateString("es-ES")} → ${new Date(hasta).toLocaleDateString("es-ES")}`;
      },
    },
    {
      header: "Monto",
      accessorKey: "monto",
      cell: ({ cell }) => `$${cell.getValue()}`,
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ cell }) => {
        const estado = cell.getValue() as string;
        const style: { [key: string]: string } = {
          pagada: "bg-green-100 text-green-700",
          enviada: "bg-indigo-100 text-indigo-700",
          generado: "bg-blue-100 text-blue-700",
          rechazada: "bg-red-100 text-red-700",
          anulado: "bg-gray-200 text-gray-700",
          aprobada: "bg-yellow-100 text-yellow-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${style[estado] || "bg-gray-100 text-gray-700"}`}>
            {estado}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TARJETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="w-full">
            <div className="flex items-start">
              <div className="p-2 sm:p-3 rounded-full bg-primary-50 text-primary-600 mr-3 sm:mr-4 flex-shrink-0">
                <CreditCard size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Pagos</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                  ${totalMonto.toLocaleString("es-MX")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{cuentas.length} registros</p>
              </div>
            </div>
          </Card>

          <Card className="w-full">
            <div className="flex items-start">
              <div className="p-2 sm:p-3 rounded-full bg-success-50 text-success-600 mr-3 sm:mr-4 flex-shrink-0">
                <Check size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pagos Completados</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                  ${estadoTotales["pagada"]?.toLocaleString("es-MX") || 0}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {cuentas.filter((c) => c.estado === "pagada").length} completados
                </p>
              </div>
            </div>
          </Card>

          <Card className="w-full sm:col-span-2 lg:col-span-1">
            <div className="flex items-start">
              <div className="p-2 sm:p-3 rounded-full bg-warning-50 text-warning-600 mr-3 sm:mr-4 flex-shrink-0">
                <Calendar size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pagos Pendientes</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                  ${((estadoTotales["generado"] || 0) + (estadoTotales["enviada"] || 0)).toLocaleString("es-MX")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {cuentas.filter((c) => ["generado", "enviada"].includes(c.estado)).length} pendientes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* TÍTULO */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-sm sm:text-base text-gray-500">Historial de cuentas de cobro de todos los pacientes</p>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <Input
                placeholder="Buscar por nombre del paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {estadosDisponibles.map((estado) => (
                  <Button
                    key={estado}
                    variant={filterEstado === estado ? "primary" : "outline"}
                    onClick={() => setFilterEstado(estado as any)}
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    {estado[0].toUpperCase() + estado.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TABLA CON SCROLL */}
        <div className="w-full">
          <DataTable
            columns={columns}
            data={cuentasFiltradas}
            loading={loading}
            emptyText="No hay pagos registrados"
          />
        </div>

        {/* MODAL EXPORTACIÓN */}
        <ExportarPagosModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExportar={handleExportarExcel}
        />

        {/* BOTÓN FLOTANTE */}
        <button
          className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all"
          onClick={() => setShowExportModal(true)}
          title="Exportar pagos"
        >
          <FileDown size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};

export default PagosPage;