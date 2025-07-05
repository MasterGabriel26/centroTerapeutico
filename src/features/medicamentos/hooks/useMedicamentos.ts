import { useState, useEffect, useCallback } from 'react';
import { 
  crearMedicamento, 
  obtenerMedicamentos, 
  actualizarMedicamento
} from '../services/medicamentoService';
import { Medicamento } from '../types/medicamento';

export const useMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caducados, setCaducados] = useState<Medicamento[]>([]);

  const verificarCaducidad = useCallback((medicamentos: Medicamento[]) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const actualizados = medicamentos.map(med => {
      const fechaCad = new Date(med.fechaCaducidad);
      fechaCad.setHours(0, 0, 0, 0);
      console.log(hoy)
      
      return {
        ...med,
        estado: fechaCad < hoy ? 'caducado' : med.estado || 'activo'
      };
    });

    setCaducados(actualizados.filter(m => m.estado === 'caducado'));
    return actualizados;
  }, []);

  const cargarMedicamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const lista = await obtenerMedicamentos();
      setMedicamentos(verificarCaducidad(lista));
    } catch (err) {
      setError('Error al cargar medicamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [verificarCaducidad]);

  const agregarMedicamento = useCallback(async (medicamento: Omit<Medicamento, 'id' | 'fechaRegistro' | 'estado'>) => {
    try {
      setLoading(true);
      const nuevoMedicamento = await crearMedicamento({
        ...medicamento,
        fechaRegistro: new Date().toISOString(),
        estado: 'activo'
      });
      await cargarMedicamentos();
      return nuevoMedicamento;
    } catch (err) {
      setError('Error al crear medicamento');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarMedicamentos]);

  const editarMedicamento = useCallback(async (id: string, datos: Partial<Medicamento>) => {
    try {
      setLoading(true);
      await actualizarMedicamento(id, datos);
      await cargarMedicamentos();
    } catch (err) {
      setError('Error al actualizar medicamento');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarMedicamentos]);

  const buscarMedicamentos = useCallback((termino: string) => {
    if (!termino.trim()) return medicamentos;
    
    const terminoLower = termino.toLowerCase();
    return medicamentos.filter(med => {
      return Object.values(med).some(val => 
        val && val.toString().toLowerCase().includes(terminoLower)
      );
    });
  }, [medicamentos]);

  useEffect(() => {
    cargarMedicamentos();
  }, [cargarMedicamentos]);

  return {
    medicamentos,
    caducados,
    loading,
    error,
    cargarMedicamentos,
    buscarMedicamentos,
    agregarMedicamento,
    editarMedicamento
  };
};