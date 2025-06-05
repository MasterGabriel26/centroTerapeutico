// hooks/useNovedades.ts
import { useState, useEffect, useCallback } from 'react';
import { addNovedad, getNovedades } from '../services/novedadService';
import { Novedad } from '../types/novedad';

export const useNovedades = (pacienteId: string) => {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar novedades automáticamente al montar o cambiar pacienteId
  useEffect(() => {
    cargarNovedades();
  }, [pacienteId]);

  const cargarNovedades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const lista = await getNovedades(pacienteId);
      // Ordenar por fecha descendente (más reciente primero)
      const ordenadas = lista.sort((a, b) => 
        (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0)
      );
      setNovedades(ordenadas);
    } catch (err) {
      setError('Error al cargar novedades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  const crearNovedad = async (data: Omit<Novedad, 'id' | 'fecha' | 'isActive'>) => {
    try {
      setLoading(true);
      setError(null);
      await addNovedad(pacienteId, {
        ...data,
        isActive: true  // Valor por defecto
      });
      await cargarNovedades(); // Recargar después de crear
    } catch (err) {
      setError('Error al registrar novedad');
      console.error(err);
      throw err; // Re-lanzar para manejo en UI
    } finally {
      setLoading(false);
    }
  };

  return {
    novedades,
    loading,
    error,
    cargarNovedades,
    crearNovedad
  };
};