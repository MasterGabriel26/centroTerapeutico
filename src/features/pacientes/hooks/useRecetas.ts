// hooks/useRecetas.ts
import { useState } from 'react';
import { addReceta, getRecetas } from '../services/recetaService';
import { Receta } from '../types/receta';

export const useRecetas = (pacienteId: string) => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarRecetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const lista = await getRecetas(pacienteId);
      setRecetas(lista);
    } catch (err) {
      setError('Error al cargar recetas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const crearReceta = async (data: Omit<Receta, 'id' | 'fecha'>) => {
    try {
      setLoading(true);
      setError(null);
      await addReceta(pacienteId, {
        ...data,
        fecha: new Date() // Agregamos fecha automáticamente
      });
      await cargarRecetas(); // Recargamos las recetas después de crear
    } catch (err) {
      setError('Error al crear receta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    recetas,
    loading,
    error,
    cargarRecetas,
    crearReceta
  };
};