// features/pacientes/services/pacienteService.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Paciente } from '../types/paciente';

const pacientesRef = collection(db, "pacientes");

// Crear paciente con campos generados automáticamente
export const addPaciente = async (data: Omit<Paciente, "id" | "estado" | "creado">) => {
  const payload: Omit<Paciente, "id"> = {
    ...data,
    estado: "activo",
    creado: new Date().toISOString(),
  };
  const docRef = await addDoc(pacientesRef, payload);
  return docRef.id;
};

// Obtener pacientes
export const getPacientes = async () => {
  const snapshot = await getDocs(pacientesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Paciente[];
};
