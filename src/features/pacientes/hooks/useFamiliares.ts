// features/pacientes/hooks/usePacientes.ts
import { useState, useEffect } from "react";
import { getPacientes, addPaciente } from "../services/pacienteService";
import { Paciente } from "../types/paciente";

export const usePacientes = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPacientes = async () => {
    setLoading(true);
    const data = await getPacientes();
    setPacientes(data);
    setLoading(false);
  };

  const createPaciente = async (paciente: Paciente) => {
    setLoading(true);
    await addPaciente(paciente);
    await fetchPacientes();
    setLoading(false);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  return { pacientes, loading, fetchPacientes, createPaciente };
};
