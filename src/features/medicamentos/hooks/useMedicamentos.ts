import { useState, useEffect, useCallback } from 'react';
import { 
  crearMedicamento, 
  obtenerMedicamentos,
  obtenerMedicamentoPorId,
  obtenerMedicamentosPorIds,
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
      
      return {
        ...med,
        estado: fechaCad < hoy ? 'caducado' : med.estado || 'activo'
      };
    });

    const medicamentosCaducados = actualizados.filter(m => m.estado === 'caducado');
    setCaducados(medicamentosCaducados);
    
    // Actualizar estado en base de datos si es necesario
    medicamentosCaducados.forEach(async med => {
      if (med.estado !== 'caducado') {
        try {
          await actualizarMedicamento(med.id, { estado: 'caducado' });
        } catch (err) {
          console.error(`Error al actualizar estado del medicamento ${med.id}:`, err);
        }
      }
    });

    return actualizados;
  }, []);

  const cargarMedicamentos = useCallback(async (filtros: {
    activos?: boolean;
    caducados?: boolean;
    busqueda?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const lista = await obtenerMedicamentos(filtros);
      setMedicamentos(verificarCaducidad(lista));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar medicamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [verificarCaducidad]);

// En useMedicamentos.ts
const getMedicamentoById = useCallback((id: string): Medicamento | null => {
  try {
    // Buscar en los medicamentos ya cargados
    const encontrado = medicamentos.find(med => med.id === id);
    return encontrado || null;
  } catch (err) {
    console.error(`Error al obtener medicamento con ID ${id}:`, err);
    return null;
  }
}, [medicamentos]);

  const getMedicamentosByIds = useCallback(async (ids: string[]): Promise<Medicamento[]> => {
    try {
      if (ids.length === 0) return [];
      return await obtenerMedicamentosPorIds(ids);
    } catch (err) {
      console.error('Error al obtener medicamentos por IDs:', err);
      return [];
    }
  }, []);

  const agregarMedicamento = useCallback(async (medicamento: Omit<Medicamento, 'id' | 'fechaRegistro' | 'estado'>) => {
    try {
      setLoading(true);
      const nuevoMedicamento = await crearMedicamento(medicamento);
      await cargarMedicamentos();
      return nuevoMedicamento;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear medicamento');
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
      setError(err instanceof Error ? err.message : 'Error al actualizar medicamento');
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

  // Función para calcular el consumo de medicamentos
const calcularConsumo = useCallback((medicamento: Medicamento): number => {
  return (medicamento.stockInicial || 0) - (medicamento.stock || 0);
}, []);

// Función para obtener medicamentos con bajo stock
const obtenerMedicamentosBajoStock = useCallback((umbral: number = 0.2): Medicamento[] => {
  return medicamentos.filter(med => {
    const consumo = calcularConsumo(med);
    const porcentajeConsumido = consumo / (med.stockInicial || 1);
    return porcentajeConsumido > umbral;
  });
}, [medicamentos, calcularConsumo]);

// Retornar las nuevas funciones en el hook
return {
  medicamentos,
  caducados,
  loading,
  error,
  cargarMedicamentos,
  buscarMedicamentos,
  agregarMedicamento,
  editarMedicamento,
  getMedicamentoById,
  getMedicamentosByIds,
  calcularConsumo, // Nueva función exportada
  obtenerMedicamentosBajoStock // Nueva función exportada
};
};