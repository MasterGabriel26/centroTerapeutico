import { useState } from 'react';
import { addFamiliar, getFamiliares } from '../services/familiarService';
import { Familiar } from '../types/familiar';

export const useFamiliares = (pacienteId: string) => {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarFamiliares = async () => {
    setLoading(true);
    const lista = await getFamiliares(pacienteId);
    setFamiliares(lista);
    setLoading(false);
  };

  const crearFamiliar = async (data: Familiar) => {
    await addFamiliar(pacienteId, data);
    await cargarFamiliares();
  };

  return {
    familiares,
    loading,
    cargarFamiliares,
    crearFamiliar,
  };
};
