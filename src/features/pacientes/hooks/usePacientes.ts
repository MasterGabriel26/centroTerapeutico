// features/pacientes/hooks/usePacientes.ts
import { useState } from "react";
import { addPaciente } from "../services/pacienteService";
import { Paciente } from "../types/paciente";

export const usePacientes = () => {
  const [loading, setLoading] = useState(false);

  const createPaciente = async (paciente: Paciente) => {
    setLoading(true);
    await addPaciente(paciente);
    setLoading(false);
  };

  return { createPaciente, loading };
};
