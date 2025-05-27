// features/pacientes/types/paciente.d.ts
export interface Paciente {
  id?: string;
  nombre_completo: string;
  documento: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
  creado: string;
  fecha_ingreso: string;
  fecha_salida?: string;
}


