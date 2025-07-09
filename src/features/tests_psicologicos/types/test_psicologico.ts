export interface PreguntaInventarioDepresion {
  [key: string]: string[];
}

export interface PlantillaTestPsicologico {
  id: string;
  titulo: string;
  respuestas: string[];
  preguntas: string[] | PreguntaInventarioDepresion;
}

export interface RespuestaTest {
  pregunta: string;
  respuesta: string;
  puntuacion?: number;
}

export interface TestRealizado {
  id: string;
  pacienteId: string;
  plantillaTestId: string;
  tituloTest: string;
  fecha: number; // timestamp
  respuestas: RespuestaTest[];
  puntuacionTotal?: number;
  estado: 'creado' | 'leido por paciente' | 'diligenciado' | 'analizado con IA' | 'analizado con humano';
  analisis?: string; // Nuevo campo para el análisis
}
