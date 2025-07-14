// features/pacientes/services/pacienteService.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, getDoc,setDoc } from "firebase/firestore";
import { Paciente, CrearPacienteData } from '../types/paciente';

const pacientesRef = collection(db, "pacientes");

export const addPaciente = async (data: CrearPacienteData) => {
  try {
    // Separar los datos del paciente de los datos del ingreso
    const { fecha_ingreso, motivo_ingreso, evaluador, quien_lo_trajo, ...pacienteData } = data;

    // 1. Crear paciente
    const pacienteDocRef = await addDoc(pacientesRef, {
      ...pacienteData,
      estado: "activo",
      creado: new Date().toISOString(),
    });

    // 2. Crear subcolección de ingresos con ingreso inicial
    const ingresosRef = collection(db, `pacientes/${pacienteDocRef.id}/ingresos`);
    await addDoc(ingresosRef, {
      fecha_ingreso,
      fecha_salida: "",
      motivo_ingreso,
      voluntario: data.voluntario,
      evaluador,
      creado: new Date().toISOString(),
    });

    // 3. Crear familiar en subcolección familiares si hay información
    if (quien_lo_trajo && quien_lo_trajo.nombre && quien_lo_trajo.parentesco && quien_lo_trajo.telefono) {
      const familiaresRef = collection(db, `pacientes/${pacienteDocRef.id}/familiares`);
      
      // Creamos un ID simple basado en el nombre (puedes ajustar esto)
      const familiarId = quien_lo_trajo.nombre.toLowerCase().replace(/\s+/g, '_');
      
      await setDoc(doc(familiaresRef, familiarId), {
        nombre: quien_lo_trajo.nombre,
        parentesco: quien_lo_trajo.parentesco,
        telefono1: quien_lo_trajo.telefono,
        telefono2: "",
        email: quien_lo_trajo.direccion.includes('@') ? quien_lo_trajo.direccion : "", // Asumimos que si tiene @ es email
        direccion: quien_lo_trajo.direccion.includes('@') ? "" : quien_lo_trajo.direccion,
        principal: true, // Marcamos como familiar principal
        creado: new Date().toISOString()
      });
    }

    return pacienteDocRef.id;
  } catch (error) {
    console.error("Error al crear paciente y familiar:", error);
    throw error;
  }
};


export const getPacienteById = async (id: string): Promise<Paciente | null> => {
  console.log("🔍 Buscando paciente con ID:", id); // DEBUG
  
  try {
    const docRef = doc(db, "pacientes", id);
    console.log("📄 Referencia del documento:", docRef.path); // DEBUG
    
    const docSnap = await getDoc(docRef);
    console.log("📋 Documento existe:", docSnap.exists()); // DEBUG
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("📊 Datos del documento:", data); // DEBUG
      
      return { id: docSnap.id, ...data } as Paciente;
    }
    
    console.log("❌ Documento no encontrado"); // DEBUG
    return null;
  } catch (error) {
    console.error("🚨 Error al obtener paciente:", error); // DEBUG
    return null;
  }
};

export const updatePaciente = async (id: string, data: CrearPacienteData) => {
  try {
    // Separar los datos del paciente de los datos del ingreso
    const { fecha_ingreso, motivo_ingreso, ...pacienteData } = data;

    // Actualizar datos del paciente (sin incluir fecha_ingreso ni motivo_ingreso)
    const pacienteRef = doc(db, "pacientes", id);
    await updateDoc(pacienteRef, {
      ...pacienteData,
      // Agregar timestamp de última actualización
      actualizado: new Date().toISOString()
    });

    return id;
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    throw new Error("No se pudo actualizar el paciente");
  }
};

export const getPacientes = async () => {
  const snapshot = await getDocs(pacientesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Paciente[];
};