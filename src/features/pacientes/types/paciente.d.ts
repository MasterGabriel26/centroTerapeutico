// features/pacientes/types/paciente.d.ts
export interface Paciente {
  id?: string;
  
  // Datos básicos
  nombre_completo: string;
  documento: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
  creado: string;
  voluntario: boolean;
  
  // Datos demográficos
  fecha_entrevista: string;
  numero_expediente: string;
  edad: number;
  sexo: 'masculino' | 'femenino' | 'otro' | 'no_especifica';
  estado_civil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
  escolaridad: string;
  
  // Situación económica
  desempleado: boolean;
  tiempo_desempleo?: string;
  depende_economicamente: boolean;
  de_quien_depende?: string;
  alguien_depende_de_usted: boolean;
  quien_depende?: string;
  personas_con_vive: string;
  tiene_pareja: boolean;
  tiempo_relacion?: string;
  
  // Información de ingreso
  quien_lo_trajo: {
    nombre: string;
    parentesco: string;
    telefono: string;
    direccion?: string;
  };
  
  // Historial de consumo
  sustancias_consumidas: {
    sustancia: string;
    frecuencia: 'diario' | 'semanal' | 'ocasional' | 'ex-consumidor';
    edad_inicio: number;
    via_administracion: 'fumada' | 'inyectada' | 'oral' | 'inhalada' | 'otra';
    cantidad_aproximada?: string;
    ultimo_consumo?: string;
  }[];
  
  // Estado físico
  estado_nutricional: {
    ultima_comida?: string;
    apetito: 'normal' | 'aumentado' | 'disminuido' | 'ausente';
    alergias_alimenticias?: string;
    problemas_digestivos?: string;
    peso_actual?: number;
    talla?: number;
    imc?: number;
  };
  
  // Historial médico
  historial_medico: {
    enfermedades_previas?: string;
    medicamentos_actuales?: string;
    alergias_medicamentos?: string;
    hospitalizaciones_previas?: string;
    cirugias_previas?: string;
  };
  
  // Estado psicológico
  estado_psicologico: {
    intentos_suicidas?: number;
    tratamientos_psiquiatricos_previos?: string;
    diagnostico_psiquiatrico?: string;
    medicacion_psiquiatrica?: string;
  };
  
  // Motivos y expectativas
  motivo_consulta: string;
  expectativas_tratamiento: string;
  apoyo_familiar: 'alto' | 'medio' | 'bajo' | 'ninguno';
}