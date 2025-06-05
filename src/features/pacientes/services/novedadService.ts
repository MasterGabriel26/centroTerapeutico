// services/novedades.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Novedad } from '../types/novedad';

export const addNovedad = async (pacienteId: string, data: Omit<Novedad, 'id' | 'fecha'>) => {
  const novedadesRef = collection(db, `pacientes/${pacienteId}/novedades`);
  const docRef = await addDoc(novedadesRef, {
    ...data,
    fecha: new Date(),  // Fecha automática
    isActive: true      // Valor por defecto
  });
  return docRef.id;
};

export const getNovedades = async (pacienteId: string): Promise<Novedad[]> => {
  const snapshot = await getDocs(collection(db, `pacientes/${pacienteId}/novedades`));
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      idDoctor: data.idDoctor,
      descripcion: data.descripcion,
      evidencia: data.evidencia || [],
      gravedad: data.gravedad,
      isActive: data.isActive !== undefined ? data.isActive : true,  // Fallback seguro
      fecha: data.fecha?.toDate() || null  // Conversión de fecha
    };
  });
};