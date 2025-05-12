import { createClient } from "@supabase/supabase-js";

// Los valores reales vendrán de las variables de entorno
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-supabase-url.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Usuario = {
  id: string;
  email: string;
  password?: string;
  nombre_completo: string;
  tipo: "admin" | "medico" | "familiar";
  telefono?: string;
  creado_por?: string;
  created_at: string;
  imagen_perfil?: string | null;
  imagenes_extra?: string[];
  descripcion?: string | null;
  paciente_id?: string | null;
};

export type Anexado = {
  id: string;
  nombre_completo: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  estado: "activo" | "inactivo";
  motivo_anexo: string;
  familiar_id: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
};

export type RegistroDiario = {
  id: string;
  paciente_id: string;
  fecha: string;
  imagen_evidencia: string;
  descripcion: string;
  medicamentos: string;
  comidas: string;
  peso?: number;
  comportamiento: string;
  observaciones?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
};

export type Medicamento = {
  id: string;
  paciente_id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  via: string;
  observaciones?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
};

export type Pago = {
  id: string;
  paciente_id: string;
  familiar_id: string;
  fecha: string;
  monto: number;
  metodo_pago: "efectivo" | "transferencia";
  comprobante_url?: string;
  estado: "pendiente" | "completado";
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
};

export type Gasto = {
  id: string;
  concepto: string;
  fecha: string;
  monto: number;
  categoria: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
};

export type Multimedia = {
  id: string;
  anexado_id: string;
  registro_id?: string;
  tipo: "foto" | "video" | "documento";
  url: string;
  descripcion?: string;
  fecha: string;
  created_at: string;
  created_by: string;
};

export type Contrato = {
  id: string;
  anexado_id: string;
  familiar_id: string;
  url: string;
  fecha: string;
  created_at: string;
  created_by: string;
};
