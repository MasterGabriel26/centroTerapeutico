// services/recetas.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Receta } from '../types/receta';

export const addReceta = async (pacienteId: string, data: Receta) => {
  const recetasRef = collection(db, `pacientes/${pacienteId}/recetas`);
  const docRef = await addDoc(recetasRef, {
    ...data,
    fecha: new Date()  // Agregamos fecha automáticamente
  });
  return docRef.id;
};

export const getRecetas = async (pacienteId: string): Promise<Receta[]> => {
  const snapshot = await getDocs(collection(db, `pacientes/${pacienteId}/recetas`));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Receta, 'id'>),
    // Convertimos Firestore Timestamp a Date si existe
    fecha: doc.data().fecha?.toDate() || null
  }));
};