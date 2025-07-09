import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { getPlantillasTests, guardarTestRealizado, subscribeToTestsRealizados, getTestRealizadoById, getPlantillaTestById } from '../services/testPsicologicoService';
import { TestRealizado, PlantillaTestPsicologico, RespuestaTest } from '../types/test_psicologico';
import CrearTestModal from './CrearTestModal';
import RealizarTest from './RealizarTest';
import TestAnalysisModal from '../../../components/modals/TestAnalysisModal';
import ContinueTestOptionsModal from '../../../components/modals/ContinueTestOptionsModal';
import QrCodeModal from '../../../components/modals/QrCodeModal';

interface TestsPsicologicosTabProps {
  pacienteId: string;
}

const TestsPsicologicosTab: React.FC<TestsPsicologicosTabProps> = ({ pacienteId }) => {
  const [tests, setTests] = useState<TestRealizado[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaTestPsicologico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testActivo, setTestActivo] = useState<PlantillaTestPsicologico | null>(null);
  const [currentTestRealizadoId, setCurrentTestRealizadoId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisModalTestId, setAnalysisModalTestId] = useState<string | null>(null);
  const [showContinueOptionsModal, setShowContinueOptionsModal] = useState(false);
  const [continueTestId, setContinueTestId] = useState<string | null>(null);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [qrCodeTestId, setQrCodeTestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPlantillas = async () => {
      const fetchedPlantillas = await getPlantillasTests();
      setPlantillas(fetchedPlantillas);
    };
    fetchPlantillas();

    setLoading(true);
    const unsubscribe = subscribeToTestsRealizados(pacienteId, (testsRealizados) => {
      setTests(testsRealizados as TestRealizado[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pacienteId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedTestId(null);
        setMenuPosition(null);
      }
    };

    if (selectedTestId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedTestId]);

  const handleTestInstanceCreated = (testId: string, testUrl: string, plantillaId: string) => {
    console.log("Instancia de test creada:", { testId, testUrl, plantillaId });
    // La lista de tests se actualizará automáticamente gracias a onSnapshot
  };

  const handleStartDirectly = async (plantillaId: string) => {
    const selected = plantillas.find(p => p.id === plantillaId);
    if (selected) {
      // Crear una instancia inicial del test en Firestore
      const nuevoTestRealizado: TestRealizado = {
        id: '', // Firestore generará el ID
        pacienteId,
        plantillaTestId: selected.id,
        tituloTest: selected.titulo,
        fecha: Date.now(),
        respuestas: [],
        estado: 'creado',
      };
      const newTestId = await guardarTestRealizado(nuevoTestRealizado);
      setCurrentTestRealizadoId(newTestId);
      setTestActivo(selected);
      setShowModal(false);
    }
  };

  const handleUpdateRespuestas = async (respuestas: RespuestaTest[]) => {
    if (currentTestRealizadoId) {
      const testToUpdate: Partial<TestRealizado> = {
        id: currentTestRealizadoId,
        respuestas,
        estado: 'leido por paciente', // O 'en progreso' si se prefiere
      };
      await guardarTestRealizado(testToUpdate as TestRealizado);
    }
  };

  const handleTerminarTest = async (respuestas: RespuestaTest[]) => {
    if (currentTestRealizadoId && testActivo) {
      const testToUpdate: Partial<TestRealizado> = {
        id: currentTestRealizadoId,
        respuestas,
        estado: 'diligenciado',
      };
      await guardarTestRealizado(testToUpdate as TestRealizado);
      setTestActivo(null);
      setCurrentTestRealizadoId(null);
      setShowModal(false);
      // La lista de tests se actualizará automáticamente gracias a onSnapshot
    }
  };

  const handleContinueTest = (testId: string) => {
    setContinueTestId(testId);
    setShowContinueOptionsModal(true);
    setSelectedTestId(null); // Close the main menu
    setMenuPosition(null);
  };

  const handleContinueOnDevice = async () => {
    if (!continueTestId) return;
    const testToContinue = await getTestRealizadoById(continueTestId);
    if (testToContinue) {
      const plantilla = await getPlantillaTestById(testToContinue.plantillaTestId);
      if (plantilla) {
        setTestActivo(plantilla);
        setCurrentTestRealizadoId(testToContinue.id);
      }
    }
    setShowContinueOptionsModal(false);
    setContinueTestId(null);
  };

  const handleScan = () => {
    if (!continueTestId) return;
    setQrCodeTestId(continueTestId);
    setShowQrCodeModal(true);
    setShowContinueOptionsModal(false);
    setContinueTestId(null);
  };

  const handleViewTest = (testId: string) => {
    navigate(`/test-evaluation/${testId}`); // Navigate to the new evaluation page
    setSelectedTestId(null); // Close the menu
    setMenuPosition(null);
  };

  const handleAnalyzeTest = (testId: string) => {
    setAnalysisModalTestId(testId); // Set the test ID for the modal
    setShowAnalysisModal(true); // Open the analysis modal
    setSelectedTestId(null); // Close the main menu
    setMenuPosition(null);
  };

  const calculateProgress = (test: TestRealizado) => {
    const plantilla = plantillas.find(p => p.id === test.plantillaTestId);
    if (!plantilla) return 0;

    const totalPreguntas = Array.isArray(plantilla.preguntas) 
      ? plantilla.preguntas.length 
      : Object.keys(plantilla.preguntas).length;

    const preguntasRespondidas = test.respuestas ? test.respuestas.length : 0;

    return totalPreguntas > 0 ? (preguntasRespondidas / totalPreguntas) * 100 : 0;
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>, testId: string) => {
    console.log("Card clicked for testId:", testId);
    const rect = event.currentTarget.getBoundingClientRect();
    const newMenuPosition = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY + rect.height,
    };
    setMenuPosition(newMenuPosition);
    setSelectedTestId(testId);
    console.log("Menu position set to:", newMenuPosition);
    console.log("Selected test ID set to:", testId);
  };

  if (testActivo && currentTestRealizadoId) {
    const testRealizadoParaContinuar = tests.find(t => t.id === currentTestRealizadoId);
    return <RealizarTest 
      plantilla={testActivo} 
      testRealizadoId={currentTestRealizadoId} 
      onTerminarTest={handleTerminarTest} 
      onUpdateRespuestas={handleUpdateRespuestas} 
      initialResponses={testRealizadoParaContinuar?.respuestas || []}
    />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowModal(true)}>Iniciar Nuevo Test</Button>
      </div>
      {loading ? (
        <p>Cargando tests...</p>
      ) : tests.length === 0 ? (
        <p>No se han realizado tests a este paciente.</p>
      ) : ( 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(test => {
            const progress = calculateProgress(test);
            return (
              <Card
                key={test.id}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 relative cursor-pointer"
                onClick={(e) => handleCardClick(e, test.id)}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{test.tituloTest}</h3>
                <p className="text-sm text-gray-600">Fecha: {new Date(test.fecha).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Estado: <span className="font-medium capitalize">{test.estado}</span></p>
                {test.estado !== 'diligenciado' && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
                {test.estado !== 'diligenciado' && (
                  <p className="text-right text-xs text-gray-500 mt-1">{progress.toFixed(0)}% completado</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {selectedTestId && menuPosition && (
        <div
          ref={menuRef}
          className="absolute bg-white rounded-md shadow-lg z-50 py-1"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          {(() => {
            const test = tests.find(t => t.id === selectedTestId);
            if (!test) return null;

            return (
              <>
                {test.estado !== 'diligenciado' && calculateProgress(test) < 100 && (
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => handleContinueTest(test.id)}
                  >
                    Continuar Test
                  </button>
                )}
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => handleViewTest(test.id)}
                >
                  Consultar Test
                </button>
                {test.estado === 'diligenciado' && (
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => handleAnalyzeTest(test.id)}
                  >
                    Ver Análisis
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      {showModal && (
        <CrearTestModal 
          onClose={() => setShowModal(false)} 
          pacienteId={pacienteId}
          onTestInstanceCreated={handleTestInstanceCreated}
          onStartDirectly={handleStartDirectly}
        />
      )}

      {showAnalysisModal && (
        <TestAnalysisModal 
          testId={analysisModalTestId} 
          onClose={() => {
            setShowAnalysisModal(false);
            setAnalysisModalTestId(null);
          }}
        />
      )}

      {showContinueOptionsModal && (
        <ContinueTestOptionsModal
          isOpen={showContinueOptionsModal}
          onClose={() => setShowContinueOptionsModal(false)}
          onContinueOnDevice={handleContinueOnDevice}
          onScan={handleScan}
        />
      )}

      {showQrCodeModal && (
        <QrCodeModal
          isOpen={showQrCodeModal}
          onClose={() => {
            setShowQrCodeModal(false);
            setQrCodeTestId(null);
          }}
          testId={qrCodeTestId}
        />
      )}
    </div>
  );
};

export default TestsPsicologicosTab;
