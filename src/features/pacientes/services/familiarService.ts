// features/pacientes/services/familiarService.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Familiar } from '../types/familiar';

export const addFamiliar = async (pacienteId: string, data: Familiar) => {
  const familiaresRef = collection(db, "pacientes", pacienteId, "familiares");
  const docRef = await addDoc(familiaresRef, data);
  return docRef.id;
};

export const getFamiliares = async (pacienteId: string) => {
  const familiaresRef = collection(db, "pacientes", pacienteId, "familiares");
  const snapshot = await getDocs(familiaresRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Familiar[];
};
