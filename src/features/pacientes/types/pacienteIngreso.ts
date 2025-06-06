export interface PacienteIngreso {
  id?: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  motivo_ingreso?: string;
  motivo_salida?: string;
  voluntario?: boolean;
  creado: string; // ⬅️ nueva propiedad
}
