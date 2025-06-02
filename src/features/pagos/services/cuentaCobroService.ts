import { collection, getDocs,addDoc } from "firebase/firestore";

import { db } from "../../../utils/firebase";
import { CuentaCobro } from "../types/cuenta_cobro";

export const getCuentasDeCobro = async (): Promise<CuentaCobro[]> => {
  const snapshot = await getDocs(collection(db, "cuentasDeCobro"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CuentaCobro));
};

export const getPacientesMap = async (): Promise<{ [id: string]: string }> => {
  const snap = await getDocs(collection(db, "pacientes"));
  const map: { [key: string]: string } = {};
  snap.forEach((doc) => {
    map[doc.id] = doc.data().nombre_completo;
  });
  return map;
};

export const getUsuariosMap = async (): Promise<{ [id: string]: string }> => {
  const snap = await getDocs(collection(db, "users"));
  const map: { [key: string]: string } = {};
  snap.forEach((doc) => {
    map[doc.id] = doc.data().nombre_completo;
  });
  return map;
};

export const addCuentaDeCobro = async (cuenta: Omit<CuentaCobro, "id">) => {
  const docRef = await addDoc(collection(db, "cuentasDeCobro"), cuenta);
  return docRef.id;
};
