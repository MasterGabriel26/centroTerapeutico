export interface CuentaCobro {
  id: string;
  paciente_id: string;
  fecha: string; // fecha de creación o emisión
  monto: number;
  metodo_pago?: string;
  estado: "generado" | "pendiente" | "completado" | "anulado";
  periodo: {
    desde: string; // ej. "2025-05-10"
    hasta: string; // ej. "2025-05-17"
  };
  concepto: string;
  comprobante_url?: string;
  notas?: string;
}
