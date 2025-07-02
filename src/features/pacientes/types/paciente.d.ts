// features/pacientes/types/paciente.d.ts
export interface Paciente {
  id?: string;
  // Datos básicos existentes
  nombre_completo: string;
  documento: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
  creado: string;
  voluntario: boolean;
  
  // Nuevos campos de entrevista inicial (sin fecha_ingreso aquí)
  fecha_entrevista: string;
  numero_expediente: string;
  edad: number;
  sexo: 'masculino' | 'femenino' | 'otro';
  estado_civil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
  escolaridad: string;
  desempleado: boolean;
  tiempo_desempleo?: string;
  depende_economicamente: boolean;
  de_quien_depende?: string;
  alguien_depende_de_usted: boolean;
  quien_depende?: string;
  personas_con_vive: string;
  tiene_pareja: boolean;
  tiempo_relacion?: string;
}

// Interfaz para los datos que recibe el formulario
export interface CrearPacienteData extends Omit<Paciente, 'id' | 'estado' | 'creado'> {
  fecha_ingreso: string;
  motivo_ingreso: string;
}