import { addAuditoriaCuentaCobro } from "../services/auditoriaCuentaCobroService";
import { format } from "date-fns";
import { AuditoriaCuentaCobro } from "../type/auditoria_cuenta_cobro";

export const registrarAuditoriaCuenta = async ({
  cuentaId,
  usuarioId,
  accion,
  observaciones = "",
  comprobanteUrl,
}: {
  cuentaId: string;
  usuarioId: string;
  accion: "creado" | "aprobado" | "editado" | "enviado" | "pagado" | "anulado" | "rechazado";
  observaciones?: string;
  comprobanteUrl?: string;
}) => {
  const auditoria = {
    accion,
    fecha: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    usuario_id: usuarioId,
    observaciones,
    comprobante_url: comprobanteUrl,
  };

 const auditoriaLimpia = Object.fromEntries(
  Object.entries(auditoria).filter(([, value]) => value !== undefined)
) as Omit<AuditoriaCuentaCobro, "id" | "cuenta_cobro_id" | "paciente_id">;


  await addAuditoriaCuentaCobro(cuentaId, auditoriaLimpia);
};
