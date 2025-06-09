import { useState } from "react";
import {
  agregarIngreso,
  obtenerIngresosPorPaciente,
  editarSalida
} from "../services/ingresosService";
import { PacienteIngreso } from "../types/pacienteIngreso";

export const useIngresos = () => {
  const [ingresos, setIngresos] = useState<PacienteIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarIngresos = async (pacienteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerIngresosPorPaciente(pacienteId);
      setIngresos(data);
    } catch (err: any) {
      console.error("Error al cargar ingresos:", err);
      setError("No se pudieron cargar los ingresos.");
    } finally {
      setLoading(false);
    }
  };

  const crearIngreso = async (
    pacienteId: string,
    ingreso: Omit<PacienteIngreso, "id">
  ) => {
    try {
      const id = await agregarIngreso(pacienteId, ingreso);
      return id;
    } catch (err: any) {
      console.error("Error al agregar ingreso:", err);
      setError("No se pudo registrar el ingreso.");
      return null;
    }
  };

  const actualizarSalida = async (
    pacienteId: string,
    ingresoId: string,
    data: { fecha_salida: string; motivo_salida: string }
  ) => {
    try {
      await editarSalida(pacienteId, ingresoId, data);
    } catch (err: any) {
      console.error("Error al actualizar salida:", err);
      setError("No se pudo registrar la salida.");
    }
  };

  return {
    ingresos,
    loading,
    error,
    cargarIngresos,
    crearIngreso,
    actualizarSalida 
  };
};
