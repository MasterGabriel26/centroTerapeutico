import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestRealizadoById, getPlantillaTestById } from '../services/testPsicologicoService';
import { TestRealizado, PlantillaTestPsicologico, PreguntaInventarioDepresion } from '../types/test_psicologico';
import { getPacienteById } from '../../pacientes/services/pacienteService';
import { Paciente } from '../../pacientes/types/paciente';
import html2pdf from 'html2pdf.js';
import { ArrowLeft } from 'lucide-react';

const TestResultPdfPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<TestRealizado | null>(null);
  const [plantilla, setPlantilla] = useState<PlantillaTestPsicologico | null>(null);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (testId) {
      getTestRealizadoById(testId).then(fetchedTest => {
        setTest(fetchedTest);
        if (fetchedTest) {
          getPlantillaTestById(fetchedTest.plantillaTestId).then(setPlantilla);
          getPacienteById(fetchedTest.pacienteId).then(setPaciente);
        }
      });
    }
  }, [testId]);

  const generatePdf = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const opt = {
        margin:       [15, 10, 15, 10],
        filename:     `test_resultado_${test?.tituloTest}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          windowWidth: 794
        },
        jsPDF:        { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak:    { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break',
          avoid: '.avoid-break'
        }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  if (!test || !plantilla || !paciente) {
    return <div>Cargando resultados del test...</div>;
  }

  const isInventarioDepresion = (preguntas: string[] | PreguntaInventarioDepresion): preguntas is PreguntaInventarioDepresion => {
    return typeof preguntas === 'object' && !Array.isArray(preguntas);
  };

  const allOptions = plantilla.respuestas;

  // Dividir las preguntas en grupos para cada página
  const QUESTIONS_PER_PAGE = 21; // Ajusta según el tamaño de las opciones
  const questionGroups = [];
  for (let i = 0; i < test.respuestas.length; i += QUESTIONS_PER_PAGE) {
    questionGroups.push(test.respuestas.slice(i, i + QUESTIONS_PER_PAGE));
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft size={24} />
        </button>
        <button onClick={generatePdf} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Descargar PDF
        </button>
      </div>

      <div ref={contentRef} style={{ width: '794px', backgroundColor: 'white' }}>
        {questionGroups.map((group, pageIndex) => (
          <div key={pageIndex} className={pageIndex > 0 ? 'page-break' : ''} style={{ padding: '20px' }}>
            {/* Header - Solo en la primera página */}
            {pageIndex === 0 && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src="/logo_sin_fondo.png" alt="Logo" style={{ height: '50px', margin: '0 auto 10px' }} />
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {test.tituloTest}
                </h1>
                <p style={{ fontSize: '14px', margin: '2px 0' }}>Paciente: {paciente.nombre_completo}</p>
                <p style={{ fontSize: '14px', margin: '2px 0' }}>
                  Fecha: {new Date(test.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}

            {/* Table for this page */}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '11px',
              marginBottom: '20px',
              tableLayout: 'fixed'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ 
                    border: '1px solid #666',
                    padding: '8px',
                    width: '40px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    No.
                  </th>
                  <th style={{ 
                    border: '1px solid #666',
                    padding: '8px',
                    textAlign: 'left',
                    fontWeight: 'bold'
                  }}>
                    Pregunta
                  </th>
                  {allOptions.map((option, idx) => (
                    <th key={idx} style={{ 
                      border: '1px solid #666',
                      padding: '6px 4px',
                      width: `${Math.floor(200/allOptions.length)}px`,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: '10px',
                      wordWrap: 'break-word'
                    }}>
                      {option}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.map((res, groupIndex) => {
                  const actualIndex = pageIndex * QUESTIONS_PER_PAGE + groupIndex;
                  
                  return (
                    <tr key={actualIndex} className="avoid-break">
                      <td style={{ 
                        border: '1px solid #666',
                        padding: '6px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}>
                        {actualIndex + 1}
                      </td>
                      <td style={{ 
                        border: '1px solid #666',
                        padding: '6px 8px',
                        textAlign: 'left',
                        fontSize: '10px',
                        lineHeight: '1.3'
                      }}>
                        {res.pregunta}
                      </td>
                      {allOptions.map((option, idx) => (
                        <td key={idx} style={{ 
                          border: '1px solid #666',
                          padding: '4px',
                          textAlign: 'center',
                          backgroundColor: res.respuesta === option ? '#E3F2FD' : 'white'
                        }}>
                          {res.respuesta === option && (
                            <span style={{ 
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: '#1976D2'
                            }}>
                              X
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Puntuación total - Solo en la última página */}
            {pageIndex === questionGroups.length - 1 && test.puntuacionTotal !== undefined && (
              <div style={{ 
                marginTop: '30px', 
                paddingTop: '20px', 
                borderTop: '2px solid #333',
                textAlign: 'center',
                pageBreakInside: 'avoid'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                  Puntuación Total: {test.puntuacionTotal}
                </h2>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agregar estilos CSS para page-break */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .page-break {
              page-break-before: always;
            }
            .avoid-break {
              page-break-inside: avoid;
            }
          }
          .page-break {
            margin-top: 0;
          }
        `
      }} />
    </div>
  );
};

export default TestResultPdfPage;