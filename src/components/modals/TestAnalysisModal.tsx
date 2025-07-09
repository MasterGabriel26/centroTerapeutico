import React, { useState, useEffect } from 'react';
import { getTestRealizadoById } from '../../features/tests_psicologicos/services/testPsicologicoService';
import { TestRealizado } from '../../features/tests_psicologicos/types/test_psicologico';
import { Dialog } from '../ui/Dialog';
import { Card } from '../ui/Card';

interface TestAnalysisModalProps {
  testId: string | null;
  onClose: () => void;
}

const TestAnalysisModal: React.FC<TestAnalysisModalProps> = ({ testId, onClose }) => {
  const [testRealizado, setTestRealizado] = useState<TestRealizado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) {
      setTestRealizado(null);
      setLoading(false);
      return;
    }

    const fetchTest = async () => {
      setLoading(true);
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

  if (!testId) return null; // No renderizar si no hay testId

  return (
    <Dialog isOpen={!!testId} onClose={onClose} title="Análisis del Test">
      {loading ? (
        <p>Cargando análisis...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : testRealizado && testRealizado.analisis ? (
        <Card className="p-4 bg-gray-50 border border-gray-200">
          <p className="whitespace-pre-wrap">{testRealizado.analisis}</p>
        </Card>
      ) : (
        <p>No hay análisis disponible para este test.</p>
      )}
    </Dialog>
  );
};

export default TestAnalysisModal;
