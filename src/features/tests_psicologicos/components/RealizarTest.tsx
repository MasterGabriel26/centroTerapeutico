import React, { useState, useEffect } from 'react';
import { PlantillaTestPsicologico, RespuestaTest } from '../types/test_psicologico';
import { Button } from '../../../components/ui/Button';

interface RealizarTestProps {
  plantilla: PlantillaTestPsicologico;
  testRealizadoId: string; // ID del test ya creado en Firestore
  onTerminarTest: (respuestas: RespuestaTest[]) => void;
  onUpdateRespuestas: (respuestas: RespuestaTest[]) => void; // Callback para actualizar respuestas en tiempo real
  initialResponses?: RespuestaTest[]; // Nuevas prop para respuestas iniciales
}

const RealizarTest: React.FC<RealizarTestProps> = ({ plantilla, testRealizadoId, onTerminarTest, onUpdateRespuestas, initialResponses }) => {
  const [respuestas, setRespuestas] = useState<RespuestaTest[]>(initialResponses || []);
  const [progreso, setProgreso] = useState(0);

  const totalPreguntas = Array.isArray(plantilla.preguntas) 
    ? plantilla.preguntas.length 
    : Object.keys(plantilla.preguntas).length;

  useEffect(() => {
    const preguntasRespondidas = respuestas.length;
    const nuevoProgreso = totalPreguntas > 0 ? (preguntasRespondidas / totalPreguntas) * 100 : 0;
    setProgreso(nuevoProgreso);
    onUpdateRespuestas(respuestas); // Enviar respuestas actualizadas al padre
  }, [respuestas, totalPreguntas, onUpdateRespuestas]);

  const handleRespuestaChange = (pregunta: string, respuesta: string) => {
    setRespuestas(prev => {
      const otrasRespuestas = prev.filter(r => r.pregunta !== pregunta);
      return [...otrasRespuestas, { pregunta, respuesta }];
    });
  };

  const renderPreguntas = () => {
    if (Array.isArray(plantilla.preguntas)) {
      return plantilla.preguntas.map((pregunta, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <p className="font-semibold text-gray-800 mb-3">{index + 1}. {pregunta}</p>
          <div className="flex flex-col space-y-2">
            {plantilla.respuestas.map((opcion, opIndex) => (
              <label key={opIndex} className="inline-flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors duration-200">
                <input 
                  type="radio" 
                  name={`pregunta-${index}`} 
                  value={opcion} 
                  onChange={() => handleRespuestaChange(pregunta, opcion)} 
                  className="form-radio h-4 w-4 text-blue-600 transition-colors duration-200 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 text-sm">{opcion}</span>
              </label>
            ))}
          </div>
        </div>
      ));
    } else {
      return Object.entries(plantilla.preguntas).map(([key, opciones], index) => (
        <div key={key} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <p className="font-semibold text-gray-800 mb-3">{index + 1}. {opciones[0]}</p>
          <div className="flex flex-col space-y-2">
            {opciones.slice(1).map((opcion, opIndex) => (
              <label key={opIndex} className="inline-flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors duration-200">
                <input 
                  type="radio" 
                  name={`pregunta-${key}`} 
                  value={opcion} 
                  onChange={() => handleRespuestaChange(opciones[0], opcion)} 
                  className="form-radio h-4 w-4 text-blue-600 transition-colors duration-200 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 text-sm">{opcion}</span>
              </label>
            ))}
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{plantilla.titulo}</h2>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progreso}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600 mb-4">{progreso.toFixed(0)}% completado</p>
      <div className="space-y-6">{renderPreguntas()}</div>
      <div className="mt-8 flex justify-end">
        <Button onClick={() => onTerminarTest(respuestas)} className="px-6 py-3 text-lg">Terminar Test</Button>
      </div>
    </div>
  );
};

export default RealizarTest;
