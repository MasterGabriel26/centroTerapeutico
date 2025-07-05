import { db } from '../../../utils/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  getDoc 
} from 'firebase/firestore';
import { Medicamento } from '../types/medicamento';

export const crearMedicamento = async (medicamento: Omit<Medicamento, 'id'>): Promise<Medicamento> => {
  try {
    // Validar campos requeridos
    if (!medicamento.nombre || !medicamento.presentacion || !medicamento.precioVenta) {
      throw new Error('Nombre, presentación y precio de venta son campos requeridos');
    }

    const docRef = await addDoc(collection(db, "medicamentos"), {
      ...medicamento,
      fechaRegistro: new Date().toISOString(),
      estado: 'activo' // Estado por defecto
    });
    
    return { id: docRef.id, ...medicamento };
  } catch (error) {
    console.error("Error al crear medicamento:", error);
    throw error;
  }
};

export const obtenerMedicamentos = async (filtros: {
  activos?: boolean;
  caducados?: boolean;
  busqueda?: string;
} = {}): Promise<Medicamento[]> => {
  try {
    let q = query(collection(db, "medicamentos"), orderBy("nombre"));

    // Aplicar filtros
    if (filtros.activos) {
      q = query(q, where("estado", "==", "activo"));
    }
    
    if (filtros.caducados) {
      const hoy = new Date().toISOString().split('T')[0];
      q = query(q, where("fechaCaducidad", "<", hoy));
    }

    const querySnapshot = await getDocs(q);
    let medicamentos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Medicamento, 'id'>
    }));

    // Filtrar por búsqueda si es necesario
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase();
      medicamentos = medicamentos.filter(med => 
        Object.entries(med).some(([key, value]) => 
          key !== 'id' && 
          value && 
          value.toString().toLowerCase().includes(termino)
        )
      );
    }

    return medicamentos;
  } catch (error) {
    console.error("Error al obtener medicamentos:", error);
    throw error;
  }
};

export const obtenerMedicamentoPorId = async (id: string): Promise<Medicamento | null> => {
  try {
    const docSnap = await getDoc(doc(db, "medicamentos", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() as Omit<Medicamento, 'id'> };
    }
    return null;
  } catch (error) {
    console.error("Error al obtener medicamento por ID:", error);
    throw error;
  }
};

export const actualizarMedicamento = async (
  id: string, 
  datosActualizados: Partial<Medicamento>
): Promise<void> => {
  try {
    // Validar que el medicamento exista
    const medicamento = await obtenerMedicamentoPorId(id);
    if (!medicamento) {
      throw new Error('Medicamento no encontrado');
    }

    await updateDoc(doc(db, "medicamentos", id), datosActualizados);
  } catch (error) {
    console.error("Error al actualizar medicamento:", error);
    throw error;
  }
};

export const obtenerMedicamentosPorIds = async (ids: string[]): Promise<Medicamento[]> => {
  try {
    if (ids.length === 0) return [];
    
    // Obtenemos medicamentos en lotes de 10 (límite de Firestore para consultas con 'in')
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      batches.push(batch);
    }

    const medicamentos: Medicamento[] = [];
    
    for (const batch of batches) {
      const q = query(
        collection(db, "medicamentos"),
        where("__name__", "in", batch)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        medicamentos.push({ id: doc.id, ...doc.data() as Omit<Medicamento, 'id'> });
      });
    }

    return medicamentos;
  } catch (error) {
    console.error("Error al obtener medicamentos por IDs:", error);
    throw error;
  }
};