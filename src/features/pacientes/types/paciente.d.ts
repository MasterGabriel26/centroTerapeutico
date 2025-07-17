// features/pacientes/types/paciente.d.ts

// Estructura para las preguntas de la entrevista inicial
export interface EntrevistaInicial {
  relacion_sexual_despues_de_drogas:boolean;
  // Situación Socio-Familiar
  integrantes_familia?: string;
  genograma_papa?: string;
  genograma_mama?: string;
  relacion_familiar_saben_padres_donde_estas?: boolean;
  relacion_familiar_saben_padres_como_te_sientes?: boolean;
  relacion_familiar_discutes_frecuentemente?: boolean;
  relacion_familiar_acuerdo_en_direccion?: boolean;
  como_es_relacion_familiar?: string;
  conflicto_familiar_grave_ultimos_12_meses?: boolean;
  conflicto_familiar_grave_cual?: string;
  involucrado_abuso_fisico_sexual_por_consumo?: boolean;
  involucrado_abuso_fisico_sexual_tipo?: 'fisico' | 'sexual' | 'ambos';

  // Normas familiares con relación al consumo
  normas_familiares_saben_consumo?: boolean;
  normas_familiares_reglas_claras?: boolean;
  normas_familiares_importante_cumplir_normas?: boolean;

  // Tiempo libre
  tiempo_dedicado_consumo_actividades_dejadas?: string;
  actividades_diversion_relacionadas_consumo?: string;

  // Situación laboral
  dias_no_trabajo_por_consumo_ultimos_12_meses?: number;
  veces_perdio_empleo_por_consumo_ultimos_12_meses?: number;

  // Salud mental y física
  pensado_estar_mejor_muerto_ultimo_mes?: boolean;
  intentado_suicidarse_ultimo_mes?: boolean;
  intentado_suicidarse_alguna_vez?: boolean;
  enfermedad_o_padecimiento_fisico_mental?: boolean;
  enfermedad_derivada_consumo?: boolean;
  atendido_problema_salud?: boolean;
  atendido_problema_salud_cual?: string;
  tomando_medicamento?: boolean;
  tomando_medicamento_cual?: string;
  internado_hospital_ultimos_12_meses?: boolean;
  internado_hospital_por_consumo?: boolean;

  // Consumo de sustancias (Tabla) - Esto se puede manejar por separado o aquí
  // Esta sección parece estar cubierta por `sustancias_consumidas`, pero se pueden añadir detalles
  principal_sustancia_consumo?: string;
  tipo_bebida_alcoholica?: string;
  frecuencia_consumo_excesivo?: string;
  consume_solo_o_acompanado?: 'solo' | 'acompanado';
  lugar_consumo_normalmente?: 'publico' | 'privado';
  lugar_consumo_frecuente?: string;
  puede_detener_consumo?: boolean;
  situaciones_llevan_a_consumir?: string;

  // Sentimientos de Soledad
  problema_consumo_alcohol?: 'sin_problema' | 'pequeno_problema' | 'problema' | 'gran_problema';
  problema_consumo_drogas?: 'sin_problema' | 'pequeno_problema' | 'problema' | 'gran_problema';

  // Disposición al cambio
  mayor_tiempo_sin_consumir?: string;
  cuando_ocurrio_abstinencia?: string;
  porque_se_abstuvo?: string;
  importancia_dejar_consumir?: 'nada' | 'poco' | 'algo' | 'bastante' | 'muy';
  seguridad_no_consumir_escala_1_10?: number;
  estado_actual_dejar_consumir?: 'no_pienso' | 'pienso_dejar' | 'me_preparo' | 'haciendo_algo';
  disposicion_recibir_tratamiento?: 'nada' | 'poco' | 'algo' | 'bastante' | 'muy';
  razones_importantes_dejar_consumir?: string;

  // Tratamiento
  recibido_tratamiento_previo?: boolean;
  detalles_tratamiento_previo?: string; // Para describir los 5 tratamientos
  // La tabla de tratamiento es compleja, se puede simplificar a un textarea
  satisfaccion_estilo_de_vida?: 'muy_satisfecho' | 'satisfecho' | 'insatisfecho' | 'muy_insatisfecho';
  
  // Metas para el futuro
  metas_consumo_drogas?: string;
  metas_salud_fisica?: string;
  metas_trabajo_escuela?: string;
  metas_manejo_dinero?: string;
  metas_relaciones_pareja?: string;
  metas_situacion_legal?: string;
  metas_vida_emocional?: string;
  metas_comunicacion?: string;
  metas_social_recreativas?: string;
  metas_general?: string;

  // Observaciones de la sesión
  problemas_sesion?: string;
  observaciones_generales?: string;
  nombre_quien_aplico_entrevista?: string;
  cargo_quien_aplico_entrevista?: string;
}

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

  // Entrevista Inicial
  entrevista_inicial?: EntrevistaInicial;
}

export interface CrearPacienteData extends Omit<Paciente, 'id' | 'estado' | 'creado'> {
  fecha_ingreso: string;
  motivo_ingreso: string;
  evaluador: string;
}

export interface PacienteIngreso {
  id?: string;
  paciente_id: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  motivo_ingreso: string;
  voluntario: boolean;
  evaluador: string;
  creado: string;
}
