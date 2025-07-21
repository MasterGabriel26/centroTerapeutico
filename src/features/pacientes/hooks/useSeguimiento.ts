// features/pacientes/hooks/useSeguimientos.ts
import { useState, useCallback } from "react";
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

  const fetchSeguimientos = useCallback(async () => {
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
  }, [pacienteId]);

  const agregarSeguimiento = useCallback(async (seguimiento: Omit<Seguimiento, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      // Asegurar que urls es un array
      const seguimientoConUrls = {
        ...seguimiento,
        urls: Array.isArray(seguimiento.urls) ? seguimiento.urls : [seguimiento.urls].filter(Boolean)
      };
      await createSeguimiento(pacienteId, seguimientoConUrls);
      await fetchSeguimientos();
    } catch (err) {
      setError("Error al agregar el seguimiento");
    } finally {
      setLoading(false);
    }
  }, [pacienteId, fetchSeguimientos]);

  // El resto del hook permanece igual
  const toggleStatus = useCallback(async (seguimientoId: string) => {
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
  }, [pacienteId, fetchSeguimientos]);

  return {
    seguimientos,
    loading,
    error,
    fetchSeguimientos,
    agregarSeguimiento,
    toggleSeguimientoStatus: toggleStatus
  };
};