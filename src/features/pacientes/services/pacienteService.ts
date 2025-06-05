import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Paciente } from '../types/paciente';

const pacientesRef = collection(db, "pacientes");

// Crear paciente con campos generados automáticamente y registrar ingreso
export const addPaciente = async (
  data: Omit<Paciente, "id" | "estado" | "creado"> & { voluntario: boolean; motivo_ingreso: string }
) => {
  const { fecha_ingreso, voluntario, motivo_ingreso, ...pacienteBase } = data;

  const payload: Omit<Paciente, "id" | "fecha_ingreso" | "fecha_salida"> = {
    ...pacienteBase,
    estado: "activo",
    creado: new Date().toISOString(),
    voluntario,
  };

  // 1. Crear paciente
  const pacienteDocRef = await addDoc(pacientesRef, payload);

  // 2. Crear subcolección de ingresos con ingreso inicial
const ingresoPayload = {
  fecha_ingreso,
  fecha_salida: "",
  motivo_ingreso,   // ✅ Debe llamarse así
  voluntario,
};

  const ingresosRef = collection(db, `pacientes/${pacienteDocRef.id}/ingresos`);
  await addDoc(ingresosRef, ingresoPayload);

  return pacienteDocRef.id;
};

// Obtener pacientes
export const getPacientes = async () => {
  const snapshot = await getDocs(pacientesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Paciente[];
};
