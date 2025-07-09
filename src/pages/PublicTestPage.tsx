import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTestRealizadoById, getPlantillaTestById, guardarTestRealizado } from '../features/tests_psicologicos/services/testPsicologicoService';
import { getPacienteById } from '../features/pacientes/services/pacienteService';
import { PlantillaTestPsicologico, TestRealizado, RespuestaTest } from '../features/tests_psicologicos/types/test_psicologico';
import RealizarTest from '../features/tests_psicologicos/components/RealizarTest';

const PublicTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [testRealizado, setTestRealizado] = useState<TestRealizado | null>(null);
  const [plantilla, setPlantilla] = useState<PlantillaTestPsicologico | null>(null);
  const [pacienteNombre, setPacienteNombre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setError('ID de test no proporcionado.');
        setLoading(false);
        return;
      }

      try {
        const realizado = await getTestRealizadoById(testId);
        if (!realizado) {
          setError('Test no encontrado.');
          setLoading(false);
          return;
        }
        setTestRealizado(realizado as TestRealizado);

        // Si el test está en estado 'creado', actualizar a 'leido por paciente'
        if (realizado.estado === 'creado') {
          await guardarTestRealizado({ ...realizado, estado: 'leido por paciente' });
          setTestRealizado(prev => prev ? { ...prev, estado: 'leido por paciente' } : null); // Actualizar estado localmente
        }

        // Obtener nombre del paciente
        const paciente = await getPacienteById(realizado.pacienteId);
        if (paciente) {
          setPacienteNombre(paciente.nombre_completo);
        }

        const plantillaData = await getPlantillaTestById(realizado.plantillaTestId);
        if (!plantillaData) {
          setError('Plantilla de test no encontrada.');
          setLoading(false);
          return;
        }
        setPlantilla(plantillaData as PlantillaTestPsicologico);
      } catch (err) {
        console.error('Error al cargar el test:', err);
        setError('Error al cargar el test. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  const handleTerminarTest = async (respuestas: RespuestaTest[]) => {
    if (testRealizado) {
      try {
        // Actualizar el test realizado con las respuestas
        await guardarTestRealizado({ ...testRealizado, respuestas, fecha: Date.now(), estado: 'diligenciado' });
        setTestCompleted(true); // Marcar el test como completado
      } catch (err) {
        console.error('Error al guardar las respuestas:', err);
        setError('Error al guardar las respuestas. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const handleUpdateRespuestas = async (respuestas: RespuestaTest[]) => {
    if (testRealizado) {
      try {
        await guardarTestRealizado({ ...testRealizado, respuestas, estado: 'leido por paciente' });
      } catch (err) {
        console.error('Error al actualizar respuestas en tiempo real:', err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando test...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!plantilla) {
    return <div className="flex justify-center items-center min-h-screen">No se pudo cargar la plantilla del test.</div>;
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
        <img src="/logo.svg" alt="Logo de la Empresa" className="h-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Muchas Gracias!</h1>
        <p className="text-lg text-gray-600">Hemos recibido tus respuestas.</p>
        <p className="text-md text-gray-500 mt-2">Puedes cerrar esta ventana.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 mb-6 text-center">
        <img src="/logo.svg" alt="Logo de la Empresa" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Test Psicológico</h1>
        {pacienteNombre && <p className="text-lg text-gray-600 mt-2">Para: {pacienteNombre}</p>}
      </div>
      {testRealizado && (
        <RealizarTest 
          plantilla={plantilla} 
          testRealizadoId={testRealizado.id} 
          onTerminarTest={handleTerminarTest} 
          onUpdateRespuestas={handleUpdateRespuestas} 
        />
      )}
    </div>
  );
};

export default PublicTestPage;
