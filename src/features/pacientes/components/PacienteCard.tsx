// src/features/pacientes/components/PacienteCard.tsx
import React from "react";
import { Calendar, User, Activity, Eye } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Link } from "react-router-dom";
import { Paciente } from "../types/paciente";

interface PacienteCardProps {
  paciente: Paciente & { 
    ultimo_ingreso_activo?: string | null; 
    ingreso_voluntario?: boolean | null | undefined; // Cambiado aquí
  };
}

const PacienteCard: React.FC<PacienteCardProps> = ({ paciente }) => {
  const getEstadoColor = (estado: string) => {
    return estado === "activo" 
      ? "bg-green-100 text-green-700 border-green-200" 
      : "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getVoluntarioColor = (voluntario: boolean | null | undefined) => { // Cambiado aquí
    if (voluntario === null || voluntario === undefined) return "bg-gray-100 text-gray-600";
    return voluntario 
      ? "bg-blue-100 text-blue-700" 
      : "bg-orange-100 text-orange-700";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header con nombre y estado - ID removido */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">
            {paciente.nombre_completo}
          </h3>
          {/* Removido el ID */}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(paciente.estado)}`}>
          {paciente.estado}
        </span>
      </div>

      {/* Información del ingreso */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-gray-600">Último ingreso:</span>
          <span className="font-medium text-gray-900">
            {paciente.ultimo_ingreso_activo || "Sin registro"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Activity size={14} className="text-gray-400" />
          <span className="text-gray-600">Tipo de ingreso:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVoluntarioColor(paciente.ingreso_voluntario)}`}>
            {paciente.ingreso_voluntario === true ? "Voluntario" : 
                          paciente.ingreso_voluntario === false ? "No voluntario" : "Sin definir"}
          </span>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="pt-2 border-t border-gray-100">
        <Link to={`/pacientes/${paciente.id}`} className="w-full">
          <Button 
            variant="outlinePrimary" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            Ver detalles
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PacienteCard;