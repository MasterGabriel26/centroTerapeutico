import { useState, useEffect } from 'react';
import { addVisita, getVisitas, getVisitasByDateRange } from '../services/visitaService';
import { Visita } from '../types/visitas';

export const useVisitas = (pacienteId: string) => {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroFecha, setFiltroFecha] = useState<{ inicio?: Date; fin?: Date }>({});

  const cargarVisitas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let lista: Visita[];
      if (filtroFecha.inicio && filtroFecha.fin) {
        lista = await getVisitasByDateRange(pacienteId, filtroFecha.inicio, filtroFecha.fin);
      } else {
        lista = await getVisitas(pacienteId);
      }
      
      setVisitas(lista);
    } catch (err) {
      setError('Error al cargar visitas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const crearVisita = async (data: Omit<Visita, 'id' | 'fecha'>) => {
    try {
      setLoading(true);
      setError(null);
      await addVisita(pacienteId, data);
      await cargarVisitas();
    } catch (err) {
      setError('Error al registrar visita');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltroFecha = (inicio?: Date, fin?: Date) => {
    setFiltroFecha({ inicio, fin });
  };

  useEffect(() => {
    if (pacienteId) {
      cargarVisitas();
    }
  }, [pacienteId, filtroFecha]);

  return {
    visitas,
    loading,
    error,
    filtroFecha,
    cargarVisitas,
    crearVisita,
    aplicarFiltroFecha
  };
};