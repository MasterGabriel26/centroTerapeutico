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
      
      // Calcular el total gastado en todas las recetas
      const gastoTotal = lista.reduce((sum, receta) => sum + (receta.total || 0), 0);
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

  const crearReceta = useCallback(async (data: Omit<Receta, 'id' | 'fecha' | 'total'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calcular el total antes de enviar
      const total = data.medicamentos.reduce((sum, med) => sum + (med.subtotal || 0), 0);
      
      await addReceta(pacienteId, {
        ...data,
        total,
        fecha: new Date(),
        isActive: true
      });
      
      await cargarRecetas(); // Recargamos las recetas después de crear
    } catch (err) {
      setError('Error al crear receta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId, cargarRecetas]);

  const filtrarRecetasPorMedicamento = useCallback((nombreMedicamento: string) => {
    return recetas.filter(receta => 
      receta.medicamentos.some(med => 
        med.nombre.toLowerCase().includes(nombreMedicamento.toLowerCase())
      )
    );
  }, [recetas]);

  return {
    recetas,
    loading,
    error,
    totalGastado,
    cargarRecetas,
    crearReceta,
    actualizarReceta,
    filtrarRecetasPorMedicamento
  };
};