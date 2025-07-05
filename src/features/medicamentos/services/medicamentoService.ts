import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { Medicamento } from '../types/medicamento';

export const crearMedicamento = async (medicamento: Omit<Medicamento, 'id'>): Promise<Medicamento> => {
  try {
    const docRef = await addDoc(collection(db, "medicamentos"), medicamento);
    return { id: docRef.id, ...medicamento };
  } catch (error) {
    console.error("Error al crear medicamento:", error);
    throw error;
  }
};

export const obtenerMedicamentos = async (): Promise<Medicamento[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "medicamentos"), orderBy("nombre"))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Medicamento, 'id'>
    }));
  } catch (error) {
    console.error("Error al obtener medicamentos:", error);
    throw error;
  }
};

export const actualizarMedicamento = async (id: string, datosActualizados: Partial<Medicamento>): Promise<void> => {
  try {
    await updateDoc(doc(db, "medicamentos", id), datosActualizados);
  } catch (error) {
    console.error("Error al actualizar medicamento:", error);
    throw error;
  }
};