// src/features/pacientes/components/PacientesGrid.tsx
import React from "react";
import { Loader2 } from "lucide-react";
import PacienteCard from "./PacienteCard";
import { Paciente } from "../types/paciente";

interface PacientesGridProps {
  pacientes: (Paciente & { 
    ultimo_ingreso_activo?: string | null; 
    ingreso_voluntario?: boolean | null | undefined; // Cambiado aquí también
  })[];
  loading?: boolean;
  emptyText?: string;
}

const PacientesGrid: React.FC<PacientesGridProps> = ({ 
  pacientes, 
  loading, 
  emptyText = "No hay pacientes registrados" 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando pacientes...</span>
        </div>
      </div>
    );
  }

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">
          <p>{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {pacientes.map((paciente) => (
        <PacienteCard key={paciente.id} paciente={paciente} />
      ))}
    </div>
  );
};

export default PacientesGrid;