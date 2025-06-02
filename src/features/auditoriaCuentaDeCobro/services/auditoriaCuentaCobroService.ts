    // src/domains/auditoria/services/auditoriaCuentaCobroService.ts

import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { AuditoriaCuentaCobro } from "../type/auditoria_cuenta_cobro";

// Obtener todas las auditorías de una cuenta de cobro específica de un paciente
export const getAuditoriasCuentaCobro = async (
  pacienteId: string,
  cuentaCobroId: string
): Promise<AuditoriaCuentaCobro[]> => {
  const auditoriaRef = collection(db, "auditoria_cuentas_cobro", pacienteId, cuentaCobroId);
  const q = query(auditoriaRef, orderBy("fecha", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as AuditoriaCuentaCobro));
};

export const addAuditoriaCuentaCobro = async (
  cuentaCobroId: string,
  auditoria: Omit<AuditoriaCuentaCobro, "id" | "cuenta_cobro_id" | "paciente_id">
): Promise<string> => {
  const cambiosRef = collection(db, "auditoria_cuentas_cobro", cuentaCobroId, "cambios");

  const auditoriaLimpia = Object.fromEntries(
    Object.entries(auditoria).filter(([, value]) => value !== undefined)
  ) as Omit<AuditoriaCuentaCobro, "id" | "cuenta_cobro_id" | "paciente_id">;

  const docRef = await addDoc(cambiosRef, auditoriaLimpia);
  return docRef.id;
};
