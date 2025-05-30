// features/pacientes/hooks/usePacientes.ts
import { useState } from "react";
import { addPaciente } from "../services/pacienteService";
import { Paciente } from "../types/paciente";

export const usePacientes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaciente = async (paciente: Omit<Paciente, "id" | "estado" | "creado">) => {
    setLoading(true);
    setError(null);
    try {
      const id = await addPaciente(paciente);
      return id;
    } catch (err: any) {
      console.error("Error al crear paciente:", err);
      setError("No se pudo crear el paciente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPaciente, loading, error };
};
