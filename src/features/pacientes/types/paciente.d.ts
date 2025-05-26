// features/pacientes/types/paciente.d.ts
export interface Paciente {
  id?: string;
  nombre_completo: string;
  documento: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
  creado: string;
  fechaIngreso: string;
  fechaSalida?: string;
}

// features/pacientes/types/familiar.d.ts
export interface Familiar {
  id?: string;
  nombre: string;
  parentesco: string;
  telefono: string;
  email: string;
}

// features/pacientes/types/imagen.d.ts
export interface Imagen {
  id?: string;
  url: string;
  descripcion: string;
  fecha: string;
}
