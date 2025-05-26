// features/pacientes/services/pacienteService.ts
import { db } from '../../../utils/firebase';

import { collection, doc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { Paciente } from '../types/paciente';

const pacientesRef = collection(db, "pacientes");

// Crear paciente
export const addPaciente = async (data: Paciente) => {
  const docRef = await addDoc(pacientesRef, {
    ...data,
    creado: new Date().toISOString(),
  });
  return docRef.id;
};

// Listar pacientes
export const getPacientes = async () => {
  const snapshot = await getDocs(pacientesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Paciente[];
};
