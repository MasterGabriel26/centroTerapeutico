export interface AuditoriaCuentaCobro {
  id: string;
  cuenta_cobro_id: string;
  paciente_id: string;
  accion: "creado" | "aprobado" | "enviado" | "pagado" | "editado" | "anulado" | "rechazado";
  usuario_id: string;
  fecha: string; // ISO string
  observaciones?: string;
  comprobante_url?: string; // En caso de "pagado"
}
