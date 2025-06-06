import React, { useEffect, useState } from "react";
import { useIngresos } from "../../hooks/useIngresos";
import { Paciente } from "../../types/paciente";
import { Calendar, ClipboardList, Edit, PlusCircle } from "lucide-react";
import { PacienteIngreso } from "../../types/pacienteIngreso";
import EditarSalidaModal from "../../components/EditarSalidaModal";
import RegistrarReingresoModal from "../RegistrarReingresoModal";

interface Props {
  paciente: Paciente;
  onReingreso: () => void;
}

const IngresosTab: React.FC<Props> = ({ paciente, onReingreso }) => {
  const { ingresos, loading, cargarIngresos } = useIngresos();
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<PacienteIngreso | null>(null);
  const [mostrarModalReingreso, setMostrarModalReingreso] = useState(false);

  useEffect(() => {
    if (paciente.id) {
      cargarIngresos(paciente.id);
    }
  }, [paciente.id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No registrada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const pacienteEstaIngresado = ingresos.some(i => !i.fecha_salida);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 text-blue-700">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} />
          <h2 className="text-base font-semibold">Historial de Ingresos</h2>
        </div>

        {!pacienteEstaIngresado && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
            onClick={() => setMostrarModalReingreso(true)}
          >
            <PlusCircle size={16} />
            Registrar nuevo ingreso
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-4 text-sm text-gray-500">Cargando ingresos...</div>
      ) : ingresos.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">Este paciente aún no tiene ingresos registrados.</div>
      ) : (
        <div className="p-4">
          {ingresos.map((ingreso, index) => {
            const esEgreso = Boolean(ingreso.fecha_salida);
            const bgColor = esEgreso ? "bg-green-50" : "bg-blue-50";
            const borderColor = esEgreso ? "border-green-200" : "border-blue-200";

          return (
  <div
    key={ingreso.id || index}
    className={`${bgColor} ${borderColor} border rounded-md p-4 shadow-sm mb-4`}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Fecha de ingreso */}
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Fecha de ingreso</p>
          <p className="text-sm font-medium text-gray-800">
            {formatDate(ingreso.fecha_ingreso)}
          </p>
        </div>
      </div>

      {/* Fecha de salida + Voluntario */}
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-blue-500" />
        <div>
          <p className="text-xs text-gray-500">Fecha de salida</p>
          <p className="text-sm font-medium text-gray-800">
            {ingreso.fecha_salida ? formatDate(ingreso.fecha_salida) : "Aún permanece"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {ingreso.voluntario === true
              ? "Voluntario"
              : ingreso.voluntario === false
              ? "No voluntario"
              : "No especificado"}
          </p>
        </div>
      </div>

      {/* Botón editar salida */}
      {!ingreso.fecha_salida && (
        <div className="flex justify-end md:items-start">
          <button
            onClick={() => setIngresoSeleccionado(ingreso)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Edit size={14} /> Editar salida
          </button>
        </div>
      )}
    </div>

    {/* Motivos */}
    <div className="mt-4 pt-3 space-y-2 text-sm text-gray-700 border-t border-gray-100">
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Motivo de ingreso</p>
        <p className="font-medium whitespace-pre-wrap">
          {ingreso.motivo_ingreso || "No especificado"}
        </p>
      </div>

      {ingreso.fecha_salida && (
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Motivo de salida</p>
          <p className="font-medium whitespace-pre-wrap">
            {ingreso.motivo_salida || "No especificado"}
          </p>
        </div>
      )}
    </div>
  </div>
);

          })}
        </div>
      )}

      {ingresoSeleccionado && paciente.id && (
        <EditarSalidaModal
          ingreso={ingresoSeleccionado}
          pacienteId={paciente.id}
          onClose={() => setIngresoSeleccionado(null)}
          onUpdated={() => {
            setIngresoSeleccionado(null);
            cargarIngresos(paciente.id!);
          }}
        />
      )}

      {mostrarModalReingreso && paciente.id && (
        <RegistrarReingresoModal
          pacienteId={paciente.id}
          onClose={() => setMostrarModalReingreso(false)}
          onReingresado={() => {
            setMostrarModalReingreso(false);
            cargarIngresos(paciente.id!);
            onReingreso();
          }}
        />
      )}
    </div>
  );
};

export default IngresosTab;
