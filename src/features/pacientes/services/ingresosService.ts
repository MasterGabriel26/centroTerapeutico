import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, orderBy, query, where, } from "firebase/firestore";
import { PacienteIngreso } from "../types/pacienteIngreso";

// Crear un ingreso
export const agregarIngreso = async (pacienteId: string, ingreso: Omit<PacienteIngreso, "id" | "creado">) => {
  const ref = collection(db, "pacientes", pacienteId, "ingresos");
  const payload = {
    ...ingreso,
    creado: new Date().toISOString(), // ⬅️ agregar marca de tiempo
  };
  const docRef = await addDoc(ref, payload);
  return docRef.id;
};

export const obtenerUltimoIngresoActivo = async (pacienteId: string): Promise<PacienteIngreso | null> => {
  const ref = collection(db, "pacientes", pacienteId, "ingresos");
  const q = query(ref, where("fecha_salida", "==", ""), orderBy("fecha_ingreso", "desc"));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as PacienteIngreso;
};

// Obtener todos los ingresos de un paciente, ordenados del más reciente al más antiguo
export const obtenerIngresosPorPaciente = async (pacienteId: string): Promise<PacienteIngreso[]> => {
  const snapshot = await getDocs(collection(db, "pacientes", pacienteId, "ingresos"));
  const ingresos = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PacienteIngreso[];

  // Ordenamos por fecha de creación descendente
  return ingresos.sort((a, b) =>
    new Date(b.creado).getTime() - new Date(a.creado).getTime()
  );
};


// Editar solo la salida
export const editarSalida = async (
  pacienteId: string,
  ingresoId: string,
  data: { fecha_salida: string; motivo_salida: string }
) => {
  const ingresoRef = doc(db, "pacientes", pacienteId, "ingresos", ingresoId);
  await updateDoc(ingresoRef, data);
};
