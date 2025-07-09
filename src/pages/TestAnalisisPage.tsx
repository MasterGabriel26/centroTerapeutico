import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTestRealizadoById, guardarTestRealizado } from '../features/tests_psicologicos/services/testPsicologicoService';
import { TestRealizado } from '../features/tests_psicologicos/types/test_psicologico';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/TextArea';

const TestAnalisisPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [testRealizado, setTestRealizado] = useState<TestRealizado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analisis, setAnalisis] = useState<string>('');
  const [saving, setSaving] = useState(false);

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
          setAnalisis(test.analisis || '');
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

  const handleGuardarAnalisis = async () => {
    if (testRealizado) {
      setSaving(true);
      try {
        await guardarTestRealizado({
          ...testRealizado,
          analisis,
          estado: 'analizado con humano',
        });
        alert('Análisis guardado y estado actualizado.');
      } catch (err) {
        console.error('Error al guardar el análisis:', err);
        alert('Error al guardar el análisis.');
      } finally {
        setSaving(false);
      }
    }
  };

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
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col lg:flex-row gap-6">
        {/* Columna Izquierda: Respuestas del Test */}
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Test: {testRealizado.tituloTest}</h1>
          <p className="text-sm text-gray-600 mb-4">Fecha: {new Date(testRealizado.fecha).toLocaleDateString()}</p>

          <h2 className="text-xl font-semibold text-gray-700 mb-3">Respuestas:</h2>
          <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
            {testRealizado.respuestas.map((res, index) => (
              <Card key={index} className="p-3 bg-gray-50 border border-gray-200">
                <p className="font-medium">{res.pregunta}</p>
                <p className="text-gray-700">Respuesta: {res.respuesta}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Análisis */}
        <div className="lg:w-1/2 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Análisis:</h2>
          <TextArea
            value={analisis}
            onChange={(e) => setAnalisis(e.target.value)}
            placeholder="Escribe aquí tu análisis del test..."
            rows={12}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
          />
          <Button 
            onClick={handleGuardarAnalisis} 
            disabled={saving} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Análisis'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestAnalisisPage;
