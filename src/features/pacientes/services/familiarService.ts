import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Familiar } from '../types/familiar';

export const addFamiliar = async (pacienteId: string, data: Familiar) => {
  const familiaresRef = collection(db, `pacientes/${pacienteId}/familiares`);
  const docRef = await addDoc(familiaresRef, data);
  return docRef.id;
};



export const getFamiliares = async (pacienteId: string): Promise<Familiar[]> => {
  const snapshot = await getDocs(collection(db, `pacientes/${pacienteId}/familiares`));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Familiar, 'id'>),
  }));
};
