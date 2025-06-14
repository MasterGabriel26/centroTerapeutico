// features/pacientes/hooks/useSeguimientos.ts
import { useState } from "react";
import { 
  createSeguimiento, 
  getSeguimientos, 
  toggleSeguimientoStatus 
} from "../services/seguimientoService";
import { Seguimiento } from "../types/seguimiento";

export const useSeguimientos = (pacienteId: string) => {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeguimientos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSeguimientos(pacienteId);
      setSeguimientos(data);
    } catch (err) {
      setError("Error al obtener seguimientos");
    } finally {
      setLoading(false);
    }
  };

  const agregarSeguimiento = async (seguimiento: Omit<Seguimiento, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await createSeguimiento(pacienteId, seguimiento);
      await fetchSeguimientos();
    } catch (err) {
      setError("Error al agregar el seguimiento");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (seguimientoId: string) => {
    setLoading(true);
    setError(null);
    try {
      await toggleSeguimientoStatus(pacienteId, seguimientoId);
      await fetchSeguimientos();
    } catch (err) {
      setError("Error al cambiar estado del seguimiento");
    } finally {
      setLoading(false);
    }
  };

  return {
    seguimientos,
    loading,
    error,
    fetchSeguimientos,
    agregarSeguimiento,
    toggleSeguimientoStatus: toggleStatus
  };
};