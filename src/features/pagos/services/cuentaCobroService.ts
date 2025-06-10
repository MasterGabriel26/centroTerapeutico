import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { CuentaCobro } from "../types/cuenta_cobro";
import { registrarAuditoriaCuenta } from "../../auditoriaCuentaDeCobro/util/registrarAuditoriaCuenta";
import { getAuth } from "firebase/auth";
import { utils, writeFile } from "xlsx";
export const getCuentasDeCobro = async (): Promise<CuentaCobro[]> => {
  const snapshot = await getDocs(collection(db, "cuentasDeCobro"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CuentaCobro));
};

// pagos/services/cuentaCobroService.ts
export const getTodasLasCuentasConPaciente = async () => {
  const [cuentas, pacientes] = await Promise.all([
    getCuentasDeCobro(),
    getPacientesMap(),
  ]);

  return cuentas.map((cuenta) => ({
    ...cuenta,
    paciente_nombre: pacientes[cuenta.paciente_id] || "Desconocido",
  }));
};
export const exportarPagosFiltradosExcel = (cuentas: (CuentaCobro & { paciente_nombre?: string })[]) => {
  const data = cuentas.map((c) => ({
    Paciente: c.paciente_nombre || "",
    Fecha: c.fecha,
    Estado: c.estado,
    Monto: c.monto,
    Concepto: c.concepto,
    "Periodo Desde": c.periodo?.desde,
    "Periodo Hasta": c.periodo?.hasta,
  }));

  const wb = utils.book_new();
  const ws = utils.json_to_sheet(data);
  utils.book_append_sheet(wb, ws, "Pagos");

  writeFile(wb, "pagos_filtrados.xlsx");
};

export const getTotalesPorEstado = async () => {
  const snapshot = await getDocs(collection(db, "cuentasDeCobro"));
  const estadoTotales: Record<string, number> = {};
  let totalMonto = 0;

  snapshot.forEach((doc) => {
    const data = doc.data() as CuentaCobro;
    const estado = data.estado;
    const monto = data.monto || 0;

    totalMonto += monto;
    if (!estadoTotales[estado]) estadoTotales[estado] = 0;
    estadoTotales[estado] += monto;
  });

  return { totalMonto, estadoTotales };
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

/**
 * Crea una nueva cuenta de cobro y registra automáticamente su auditoría.
 */
export const addCuentaDeCobro = async (cuenta: Omit<CuentaCobro, "id">) => {
  const docRef = await addDoc(collection(db, "cuentasDeCobro"), cuenta);

  try {
    const auth = getAuth();
    const usuarioId = auth.currentUser?.uid;
    if (usuarioId) {
      await registrarAuditoriaCuenta({
        //pacienteId: cuenta.paciente_id,
        cuentaId: docRef.id,
        usuarioId,
        accion: "creado",
        observaciones: "Cuenta creada desde addCuentaDeCobro",
      });
    } else {
      console.warn("Usuario no autenticado, no se registró auditoría.");
    }
  } catch (error) {
    console.error("Error registrando auditoría al crear cuenta:", error);
  }

  return docRef.id;
};

/**
 * Cambia el estado de una cuenta de cobro y registra la auditoría correspondiente.
 */
export const actualizarEstadoCuentaDeCobro = async (
  cuentaId: string,
  pacienteId: string,
  nuevoEstado: CuentaCobro["estado"],
  observaciones = "",
  comprobanteUrl?: string
) => {
  const auth = getAuth();
  const usuarioId = auth.currentUser?.uid;
  if (!usuarioId) throw new Error("Usuario no autenticado");

  const cuentaRef = doc(db, "cuentasDeCobro", cuentaId);
  await updateDoc(cuentaRef, { estado: nuevoEstado });

  await registrarAuditoriaCuenta({
    //pacienteId,
    cuentaId,
    usuarioId,
    accion: nuevoEstado as any,
    observaciones,
    comprobanteUrl,
  });
};

/**
 * ⚠️ IMPORTANTE PARA DESARROLLADORES:
 * `addCuentaDeCobro` y `actualizarEstadoCuentaDeCobro` registran auditoría automáticamente.
 * Si creas o actualizas manualmente desde otro lugar, asegúrate de llamar `registrarAuditoriaCuenta`.
 */
