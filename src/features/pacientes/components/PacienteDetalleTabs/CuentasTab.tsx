import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useCuentaDeCobro } from "../../../pagos/hooks/useCuentaDeCobro";
import { Button } from "../../../../components/ui/Button";
import DataTable, { Column } from "../../../../components/ui/DataTable";
import { CuentaCobro } from "../../../pagos/types/cuenta_cobro";
import CrearCuentaCobroModal from "../../../pagos/components/CrearCuentaCobroModal";
import DetalleCuentaCobroModal from "../../../pagos/components/DetalleCuentaCobroModal";
import AuditoriaCuentaCobroModal from "../../../auditoriaCuentaDeCobro/components/AuditoriaCuentaCobroModal";
import { useAuditoriaCuentaCobro } from "../../../auditoriaCuentaDeCobro/hooks/useAuditoriaCuentaCobro";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileDown
} from "lucide-react";

const CuentasTab = ({ pacienteId }: { pacienteId: string }) => {
  const navigate = useNavigate();
  const { cuentas, loading, refetch, pacientes, usuarios } = useCuentaDeCobro();
  const [showModal, setShowModal] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaCobro | null>(null);
  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);
  const [cuentaParaAuditoria, setCuentaParaAuditoria] = useState<CuentaCobro | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { auditorias, usuarios: usuariosAuditoria, refetch: refetchAuditorias } = useAuditoriaCuentaCobro(
    cuentaSeleccionada?.paciente_id || "",
    cuentaSeleccionada?.id || ""
  );

  const cuentasPaciente = cuentas.filter(
    (cuenta) => cuenta.paciente_id === pacienteId
  );

  // Filtrar cuentas
  const filteredCuentas = cuentasPaciente.filter(cuenta => {
    const matchesSearch = searchTerm === '' || 
      cuenta.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cuenta.periodo && (
        new Date(cuenta.periodo.desde).toLocaleDateString('es-ES').includes(searchTerm) ||
        new Date(cuenta.periodo.hasta).toLocaleDateString('es-ES').includes(searchTerm)
      ));
    
    const matchesFilter = filterEstado === 'all' || cuenta.estado === filterEstado;
    
    return matchesSearch && matchesFilter;
  });

  const getEstadoInfo = (estado: string) => {
    const estadoConfig: { [key: string]: { color: string, icon: any, text: string } } = {
      pagada: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, text: "Pagada" },
      enviada: { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Clock, text: "Enviada" },
      generado: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: FileText, text: "Generada" },
      rechazada: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, text: "Rechazada" },
      anulado: { color: "bg-gray-200 text-gray-700 border-gray-300", icon: AlertCircle, text: "Anulada" },
    };
    return estadoConfig[estado] || { color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText, text: estado };
  };

  const formatPeriodo = (periodo: any) => {
    if (!periodo) return "-";
    const desde = new Date(periodo.desde).toLocaleDateString("es-ES");
    const hasta = new Date(periodo.hasta).toLocaleDateString("es-ES");
    return `${desde} → ${hasta}`;
  };

  const columns: Column<CuentaCobro>[] = [
    {
      header: "Generación",
      accessorKey: "fecha",
      cell: ({ cell }) =>
        new Date(cell.getValue() as string).toLocaleDateString("es-ES"),
    },
    {
      header: "Periodo",
      id: "periodo",
      cell: ({ row }) => formatPeriodo(row.original.periodo),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ cell }) => {
        const estado = cell.getValue() as string;
        const estadoInfo = getEstadoInfo(estado);
        return (
          <span className={`px-2 py-1 rounded-full text-xs border ${estadoInfo.color}`}>
            {estadoInfo.text}
          </span>
        );
      },
    },
    {
      header: "Opciones",
      id: "acciones",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outlinePrimary"
            size="sm"
            onClick={() => setCuentaSeleccionada(row.original)}
          >
            Detalle
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 space-y-4">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <span className="truncate">Cuentas de Cobro</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Listado de cuentas generadas para este paciente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(`/pacientes/${pacienteId}/cuentas/pdf`)}
            icon={<FileDown className="w-4 h-4" />}
            className="w-full sm:w-auto text-sm"
          >
            <span className="hidden sm:inline">Generar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto text-sm"
          >
            <span className="hidden sm:inline">Nueva cuenta de cobro</span>
            <span className="sm:hidden">Nueva cuenta</span>
          </Button>
        </div>
      </div>

      {/* Filtros responsivos */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar cuentas..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
            className="text-sm"
          >
            Filtros
          </Button>
          <span className="text-xs text-gray-500">
            {filteredCuentas.length} resultado(s)
          </span>
        </div>

        <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-500 w-4 h-4 hidden sm:block" />
              <select
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="generado">Generadas</option>
                <option value="enviada">Enviadas</option>
                <option value="pagada">Pagadas</option>
                <option value="rechazada">Rechazadas</option>
                <option value="anulado">Anuladas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vista móvil - Cards */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCuentas.length > 0 ? (
          <div className="space-y-3">
            {filteredCuentas.map((cuenta) => {
              const estadoInfo = getEstadoInfo(cuenta.estado);
              const IconoEstado = estadoInfo.icon;
              
              return (
                <div key={cuenta.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(cuenta.fecha).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${estadoInfo.color}`}>
                      <IconoEstado className="w-3 h-3 mr-1" />
                      {estadoInfo.text}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Período</p>
                    <p className="text-sm text-gray-900">{formatPeriodo(cuenta.periodo)}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCuentaSeleccionada(cuenta)}
                      icon={<Eye className="w-4 h-4" />}
                      className="text-sm"
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="mx-auto w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm">No hay cuentas de cobro registradas</p>
            <p className="text-xs text-gray-400 mt-1">
              Las cuentas aparecerán aquí cuando se generen
            </p>
          </div>
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={filteredCuentas}
          loading={loading}
          emptyText={
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="mx-auto w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No hay cuentas de cobro registradas</p>
              <p className="text-xs text-gray-400 mt-1">
                Las cuentas aparecerán aquí cuando se generen
              </p>
            </div>
          }
        />
      </div>

      {/* Modales */}
      {showModal && (
        <CrearCuentaCobroModal
          pacienteId={pacienteId}
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={refetch}
        />
      )}

      {cuentaSeleccionada && (
        <DetalleCuentaCobroModal
          cuenta={cuentaSeleccionada}
          onClose={() => setCuentaSeleccionada(null)}
          onVerAuditoria={() => {
            setCuentaParaAuditoria(cuentaSeleccionada);
            setCuentaSeleccionada(null);
            setTimeout(() => setMostrarAuditoria(true), 100);
          }}
          pacienteNombre={pacientes[cuentaSeleccionada.paciente_id] || "-"}
        />
      )}

      <AuditoriaCuentaCobroModal
        open={mostrarAuditoria}
        onClose={() => {
          setMostrarAuditoria(false);
          setTimeout(() => {
            if (cuentaParaAuditoria) {
              setCuentaSeleccionada(cuentaParaAuditoria);
              setCuentaParaAuditoria(null);
            }
          }, 100);
        }}
        auditorias={auditorias}
        usuarios={usuariosAuditoria}
      />
    </div>
  );
};

export default CuentasTab;