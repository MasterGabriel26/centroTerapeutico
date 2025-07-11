// features/pacientes/hooks/usePacientes.ts
import { useState, useCallback } from "react";
import { addPaciente, updatePaciente, getPacienteById } from "../services/pacienteService";
import { CrearPacienteData, Paciente } from "../types/paciente";

export const usePacientes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaciente = useCallback(async (paciente: CrearPacienteData) => {
    setLoading(true);
    setError(null);
    try {
      // Validación de datos requeridos
      if (!paciente.sustancias_consumidas || paciente.sustancias_consumidas.length === 0) {
        throw new Error("Debe registrar al menos una sustancia consumida");
      }
      
      if (!paciente.quien_lo_trajo?.nombre || !paciente.quien_lo_trajo?.parentesco) {
        throw new Error("Debe especificar quién trajo al paciente");
      }
      
      const id = await addPaciente(paciente);
      return id;
    } catch (err: any) {
      console.error("Error al crear paciente:", err);
      setError(err.message || "No se pudo crear el paciente.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const editPaciente = useCallback(async (id: string, paciente: CrearPacienteData) => {
    setLoading(true);
    setError(null);
    try {
      await updatePaciente(id, paciente);
      return id;
    } catch (err: any) {
      console.error("Error al actualizar paciente:", err);
      setError("No se pudo actualizar el paciente.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaciente = useCallback(async (id: string): Promise<Paciente | null> => {
    setLoading(true);
    setError(null);
    try {
      const paciente = await getPacienteById(id);
      return paciente;
    } catch (err: any) {
      console.error("Error al obtener paciente:", err);
      setError("No se pudo obtener el paciente.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    createPaciente, 
    editPaciente, 
    getPaciente, 
    loading, 
    error 
  };
};