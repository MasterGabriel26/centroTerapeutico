import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTestRealizadoById } from '../features/tests_psicologicos/services/testPsicologicoService';
import { TestRealizado } from '../features/tests_psicologicos/types/test_psicologico';
import { Card } from '../components/ui/Card';

const TestViewPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [testRealizado, setTestRealizado] = useState<TestRealizado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) {
        setError('ID de test no proporcionado.');
        setLoading(false);
        return;
      }
      try {
        const test = await getTestRealizadoById(testId);
        if (test) {
          setTestRealizado(test);
        } else {
          setError('Test no encontrado.');
        }
      } catch (err) {
        console.error('Error al cargar el test:', err);
        setError('Error al cargar el test.');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando test...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!testRealizado) {
    return <div className="flex justify-center items-center min-h-screen">No se pudo cargar el test.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test: {testRealizado.tituloTest}</h1>
        <p className="text-sm text-gray-600 mb-4">Fecha: {new Date(testRealizado.fecha).toLocaleDateString()}</p>

        <h2 className="text-xl font-semibold text-gray-700 mb-3">Respuestas:</h2>
        <div className="space-y-3 mb-6">
          {testRealizado.respuestas.map((res, index) => (
            <Card key={index} className="p-3 bg-gray-50 border border-gray-200">
              <p className="font-medium">{res.pregunta}</p>
              <p className="text-gray-700">Respuesta: {res.respuesta}</p>
            </Card>
          ))}
        </div>

        {testRealizado.analisis && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Análisis:</h2>
            <Card className="p-3 bg-gray-50 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{testRealizado.analisis}</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TestViewPage;
