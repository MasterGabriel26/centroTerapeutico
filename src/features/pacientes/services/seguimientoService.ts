// features/pacientes/services/seguimientoService.ts
import { db } from '../../../utils/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc 
} from "firebase/firestore";
import { Seguimiento } from '../types/seguimiento';

export const createSeguimiento = async (pacienteId: string, seguimiento: Omit<Seguimiento, 'id'>) => {
  const seguimientosRef = collection(db, "pacientes", pacienteId, "seguimientos");
  const seguimientoDoc = await addDoc(seguimientosRef, {
    ...seguimiento,
    isActive: true // Asegurar que siempre se cree como activo
  });
  return seguimientoDoc.id;
};

export const getSeguimientos = async (pacienteId: string): Promise<Seguimiento[]> => {
  const seguimientosRef = collection(db, "pacientes", pacienteId, "seguimientos");
  const snapshot = await getDocs(seguimientosRef);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Seguimiento[];
};

export const toggleSeguimientoStatus = async (pacienteId: string, seguimientoId: string) => {
  const seguimientoRef = doc(db, "pacientes", pacienteId, "seguimientos", seguimientoId);
  const seguimientoDoc = await getDoc(seguimientoRef);
  
  if (!seguimientoDoc.exists()) {
    throw new Error("Seguimiento no encontrado");
  }
  
  const currentStatus = seguimientoDoc.data()?.isActive ?? true;
  await updateDoc(seguimientoRef, {
    isActive: !currentStatus
  });
  
  return !currentStatus;
};