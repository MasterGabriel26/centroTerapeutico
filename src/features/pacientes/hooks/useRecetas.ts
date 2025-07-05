// hooks/useRecetas.ts
import { useState, useCallback } from 'react';
import { addReceta, getRecetas } from '../services/recetaService';
import { Receta } from '../types/receta';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

interface RecetasOptions {
  activeOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export const useRecetas = (pacienteId: string) => {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalGastado, setTotalGastado] = useState<number>(0);

  const cargarRecetas = useCallback(async (options?: RecetasOptions) => {
    try {
      setLoading(true);
      setError(null);
      const lista = await getRecetas(pacienteId, options);
      
      setRecetas(lista);
      
      // Calcular el total gastado solo en recetas activas
      const gastoTotal = lista
        .filter(receta => receta.isActive) // Filtrar solo recetas activas
        .reduce((sum, receta) => sum + (receta.total || 0), 0);
      
      setTotalGastado(gastoTotal);
    } catch (err) {
      setError('Error al cargar recetas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  const actualizarReceta = useCallback(async (id: string, data: Partial<Receta>) => {
    try {
      setLoading(true);
      setError(null);
      
      const recetaRef = doc(db, `pacientes/${pacienteId}/recetas`, id);
      await updateDoc(recetaRef, data);
      
      // Recargar las recetas después de actualizar
      await cargarRecetas();
      return true;
    } catch (err) {
      setError('Error al actualizar receta');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pacienteId, cargarRecetas]);

  const crearReceta = useCallback(async (data: Omit<Receta, 'id' | 'fecha' | 'total' | 'isActive'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await addReceta(pacienteId, {
        ...data,
        fecha: new Date(),
        isActive: true
      });
      
      await cargarRecetas(); // Recargamos las recetas después de crear
    } catch (err) {
      setError('Error al crear receta');
      console.error(err);
      throw err; // Re-lanzamos el error para que pueda ser manejado por el componente
    } finally {
      setLoading(false);
    }
  }, [pacienteId, cargarRecetas]);

  const filtrarRecetasPorMedicamento = useCallback((nombreMedicamento: string) => {
    return recetas.filter(receta => 
      receta.medicamentos.some(med => 
        med.nombre?.toLowerCase().includes(nombreMedicamento.toLowerCase())
      )
    );
  }, [recetas]);

  const obtenerMedicamentosUnicos = useCallback(() => {
    const medicamentosIds = new Set<string>();
    recetas.forEach(receta => {
      receta.medicamentos.forEach(med => {
        if (med.medicamentoId) {
          medicamentosIds.add(med.medicamentoId);
        }
      });
    });
    return Array.from(medicamentosIds);
  }, [recetas]);

  return {
    recetas,
    loading,
    error,
    totalGastado,
    cargarRecetas,
    crearReceta,
    actualizarReceta,
    filtrarRecetasPorMedicamento,
    obtenerMedicamentosUnicos
  };
};