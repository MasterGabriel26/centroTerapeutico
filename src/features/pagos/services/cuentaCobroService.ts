import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebase";

export async function fetchCuentaCobro() {
  const snapshot = await getDocs(collection(db, "pagos"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function fetchPacientes(): Promise<{ [key: string]: string }> {
  const snapshot = await getDocs(collection(db, "pacientes"));
  const map: { [key: string]: string } = {};
  snapshot.forEach((doc) => {
    map[doc.id] = doc.data().nombre_completo;
  });
  return map;
}

export async function fetchUsuarios(): Promise<{ [key: string]: string }> {
  const snapshot = await getDocs(collection(db, "users"));
  const map: { [key: string]: string } = {};
  snapshot.forEach((doc) => {
    map[doc.id] = doc.data().nombre_completo;
  });
  return map;
}
