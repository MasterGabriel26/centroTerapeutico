// services/visitas.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Visita } from '../types/visitas';

export const addVisita = async (pacienteId: string, data: Omit<Visita, 'id' | 'fecha'>) => {
  const visitasRef = collection(db, `pacientes/${pacienteId}/visitas`);
  const docRef = await addDoc(visitasRef, {
    ...data,
    fecha: new Date()  // Agregamos fecha automáticamente al crear
  });
  return docRef.id;
};

export const getVisitas = async (pacienteId: string): Promise<Visita[]> => {
  const visitasRef = collection(db, `pacientes/${pacienteId}/visitas`);
  const q = query(
    visitasRef, 
    orderBy('fecha', 'desc')  // Ordenamos por fecha descendente
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Visita, 'id'>),
    // Convertimos Firestore Timestamp a Date
    fecha: doc.data().fecha?.toDate() || null
  }));
};

// Opcional: Filtrar visitas por rango de fechas
export const getVisitasByDateRange = async (
  pacienteId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Visita[]> => {
  const visitasRef = collection(db, `pacientes/${pacienteId}/visitas`);
  const q = query(
    visitasRef,
    where('fecha', '>=', startDate),
    where('fecha', '<=', endDate),
    orderBy('fecha', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Visita, 'id'>),
    fecha: doc.data().fecha?.toDate() || null
  }));
};