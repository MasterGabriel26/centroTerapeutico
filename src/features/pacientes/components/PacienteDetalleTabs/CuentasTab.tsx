import React, { useState } from "react";
import { useCuentaDeCobro } from "../../../pagos/hooks/useCuentaDeCobro";
import { Button } from "../../../../components/ui/Button";
import DataTable, { Column } from "../../../../components/ui/DataTable";
import { CuentaCobro } from "../../../pagos/types/cuenta_cobro";
import CrearCuentaCobroModal from "../../../pagos/components/CrearCuentaCobroModal";
import DetalleCuentaCobroModal from "../../../pagos/components/DetalleCuentaCobroModal";
import AuditoriaCuentaCobroModal from "../../../auditoriaCuentaDeCobro/components/AuditoriaCuentaCobroModal";
import { useAuditoriaCuentaCobro } from "../../../auditoriaCuentaDeCobro/hooks/useAuditoriaCuentaCobro";


// const columns: Column<CuentaCobro>[] = [
//   {
//     header: "Generación",
//     accessorKey: "fecha",
//     cell: ({ cell }) =>
//       new Date(cell.getValue() as string).toLocaleDateString("es-ES"),
//   },
//   {
//     header: "Periodo",
//     id: "periodo",
//     cell: ({ row }) => {
//       const periodo = row.original.periodo;
//       if (!periodo) return "-";
//       const desde = new Date(periodo.desde).toLocaleDateString("es-ES");
//       const hasta = new Date(periodo.hasta).toLocaleDateString("es-ES");
//       return `${desde} → ${hasta}`;
//     },
//   },
//   {
//     header: "Estado",
//     accessorKey: "estado",
//     cell: ({ cell }) => {
//       const estado = cell.getValue() as string;
//       const style: { [key: string]: string } = {
//         pagada: "bg-green-100 text-green-700",
//         enviada: "bg-indigo-100 text-indigo-700",
//         generado: "bg-blue-100 text-blue-700",
//         rechazada: "bg-red-100 text-red-700",
//         anulado: "bg-gray-200 text-gray-700",
//       };
//       return (
//         <span
//           className={`px-2 py-1 rounded-full text-xs ${style[estado] || "bg-gray-100 text-gray-700"
//             }`}
//         >
//           {estado}
//         </span>
//       );
//     },
//   },
//   {
//     header: "Opciones",
//     id: "acciones",
//     cell: ({ row }) => (
//       <div className="flex justify-center">
//         <Button
//           variant="outlinePrimary"
//           size="sm"
//           onClick={() => setCuentaSeleccionada(row.original)}
//         >
//           Detalle
//         </Button>
//       </div>
//     ),
//   }

// ]; 


const CuentasTab = ({ pacienteId }: { pacienteId: string }) => {
  const { cuentas, loading, refetch, pacientes, usuarios } = useCuentaDeCobro();
  const [showModal, setShowModal] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaCobro | null>(null);
const [mostrarAuditoria, setMostrarAuditoria] = useState(false);
const [cuentaParaAuditoria, setCuentaParaAuditoria] = useState<CuentaCobro | null>(null);




const { auditorias, usuarios: usuariosAuditoria, refetch: refetchAuditorias } = useAuditoriaCuentaCobro(
  cuentaSeleccionada?.paciente_id || "",
  cuentaSeleccionada?.id || ""
);



  const cuentasPaciente = cuentas.filter(
    (cuenta) => cuenta.paciente_id === pacienteId
  );

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
      cell: ({ row }) => {
        const periodo = row.original.periodo;
        if (!periodo) return "-";
        const desde = new Date(periodo.desde).toLocaleDateString("es-ES");
        const hasta = new Date(periodo.hasta).toLocaleDateString("es-ES");
        return `${desde} → ${hasta}`;
      },
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
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              style[estado] || "bg-gray-100 text-gray-700"
            }`}
          >
            {estado}
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cuentas de Cobro</h2>
          <p className="text-sm text-gray-500">
            Listado de cuentas generadas para este paciente.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          Nueva cuenta de cobro
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={cuentasPaciente}
        loading={loading}
        emptyText="No hay cuentas de cobro registradas"
      />

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
  setCuentaParaAuditoria(cuentaSeleccionada); // 👉 guarda la cuenta para el historial
  setCuentaSeleccionada(null); // cierra el modal detalle
  setTimeout(() => setMostrarAuditoria(true), 100); // abre el modal de auditoría
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
    }, 100); // pequeño delay para evitar conflicto de render
  }}
  auditorias={auditorias}
  usuarios={usuariosAuditoria}
/>

    </div>
  );
};

export default CuentasTab;
