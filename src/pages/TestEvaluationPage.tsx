import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestRealizadoById, guardarTestRealizado } from '../features/tests_psicologicos/services/testPsicologicoService';
import { TestRealizado } from '../features/tests_psicologicos/types/test_psicologico';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/TextArea';
import { ArrowLeft } from 'lucide-react'; // Import for back icon
import { getOpenAIApiKey } from '../utils/apiService'; // Import API key service
import OpenAI from 'openai'; // Import OpenAI library

const TestEvaluationPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate(); // Initialize useNavigate
  const [testRealizado, setTestRealizado] = useState<TestRealizado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analisis, setAnalisis] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false); // New state for AI analysis loading
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // State for success message
  const textAreaRef = useRef<HTMLTextAreaElement>(null); // Ref for the TextArea

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

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'; // Reset height to recalculate
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [analisis]);

  const handleGuardarAnalisis = async () => {
    if (testRealizado) {
      setSaving(true);
      try {
        await guardarTestRealizado({
          ...testRealizado,
          analisis,
          estado: 'analizado con humano',
        });
        setShowSuccessMessage(true); // Show success message
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate(-1); // Navigate back after success message
        }, 2000); // Show for 2 seconds before navigating back
      } catch (err) {
        console.error('Error al guardar el análisis:', err);
        alert('Error al guardar el análisis.'); // Keep alert for error
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!testRealizado) return;

    setAiAnalyzing(true);
    try {
      const apiKey = await getOpenAIApiKey();
      if (!apiKey) {
        alert('API Key de OpenAI no encontrada.');
        setAiAnalyzing(false);
        return;
      }

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = `Basado en las respuestas proporcionadas para el "${testRealizado.tituloTest}", realiza una evaluación psicológica detallada y profesional. A continuación se presentan las preguntas y las respuestas correspondientes:

${testRealizado.respuestas.map(res => `Pregunta: ${res.pregunta}
Respuesta: ${res.respuesta}`).join('\n\n')}

Por favor, elabora un análisis exhaustivo que incluya observaciones clave, posibles interpretaciones y cualquier recomendación relevante.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // You can choose a different model like "gpt-4"
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      });

      if (response.choices && response.choices.length > 0) {
        setAnalisis(response.choices[0].message?.content || '');
      } else {
        alert('No se pudo obtener una respuesta de la IA.');
      }
    } catch (err) {
      console.error('Error al generar análisis con IA:', err);
      alert('Error al generar análisis con IA. Por favor, inténtelo de nuevo.');
    } finally {
      setAiAnalyzing(false);
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
      {/* Header con botón de retroceso */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="md" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Evaluación de Test</h1>
      </div>

      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Éxito!</strong>
          <span className="block sm:inline"> El análisis ha sido guardado y el estado actualizado.</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col lg:flex-row gap-6">
        {/* Columna Izquierda: Respuestas del Test */}
        <div className="lg:w-1/2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Test: {testRealizado.tituloTest}</h2>
          <p className="text-sm text-gray-600 mb-4">Fecha: {new Date(testRealizado.fecha).toLocaleDateString()}</p>

          <h3 className="text-lg font-semibold text-gray-700 mb-3">Respuestas:</h3>
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
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Análisis:</h3>
          <TextArea
            ref={textAreaRef}
            value={analisis}
            onChange={(e) => setAnalisis(e.target.value)}
            placeholder="Escribe aquí tu análisis del test..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow overflow-hidden resize-none min-h-[240px]" // Added min-h-[240px] for initial 10 lines
          />
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleAnalyzeWithAI} 
              disabled={aiAnalyzing} 
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {aiAnalyzing ? 'Analizando...' : 'Análisis con IA'}
            </Button>
            <Button 
              onClick={handleGuardarAnalisis} 
              disabled={saving} 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Análisis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEvaluationPage;

