import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestRealizadoById, getPlantillaTestById } from '../services/testPsicologicoService';
import { TestRealizado, PlantillaTestPsicologico, PreguntaInventarioDepresion } from '../types/test_psicologico';
import { getPacienteById } from '../../pacientes/services/pacienteService';
import { Paciente } from '../../pacientes/types/paciente';
import html2pdf from 'html2pdf.js';
import { ArrowLeft } from 'lucide-react';

const InventarioDepresionPdfPage: React.FC = () => {
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
        filename:     `test_depresion_resultado_${test?.tituloTest}.pdf`,
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

  // Función mejorada para obtener todas las opciones de una pregunta
  const getQuestionOptions = (questionText: string): string[] => {
    if (isInventarioDepresion(plantilla.preguntas)) {
      for (const key in plantilla.preguntas) {
        const options = plantilla.preguntas[key];
        if (options && options[0] === questionText) {
          const fullOptions = options.slice(1);
          const result: string[] = [];
          
          for (let i = 0; i < 4; i++) {
            if (fullOptions[i]) {
              result.push(fullOptions[i]);
            } else {
              result.push(`${i} - Sin descripción`);
            }
          }
          
          return result;
        }
      }
    }
    return [
      '0 - Sin descripción',
      '1 - Sin descripción',
      '2 - Sin descripción',
      '3 - Sin descripción'
    ];
  };

  // Función mejorada para extraer el texto de la opción
  const getOptionText = (option: string | undefined): string => {
    if (!option) return 'Sin descripción';
    
    const parts = option.split(' - ');
    return parts.length > 1 ? parts.slice(1).join(' - ') : option;
  };

  // Función para determinar si esta opción es la seleccionada
  const isOptionSelected = (optionText: string, selectedResponse: string): boolean => {
    return getOptionText(optionText) === selectedResponse;
  };

  // Dividir las preguntas en grupos para cada página
  const QUESTIONS_PER_PAGE = 6; // Ajusta este número según necesites
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
              border: '2px solid #000'
            }}>
              <tbody>
                {group.map((res, groupIndex) => {
                  const actualIndex = pageIndex * QUESTIONS_PER_PAGE + groupIndex;
                  const allOptions = getQuestionOptions(res.pregunta);
                  const selectedResponse = res.respuesta;

                  return (
                    <React.Fragment key={actualIndex}>
                      <tbody className="avoid-break">
                        {/* Primera fila con valores 0 y su opción */}
                        <tr>
                          <td 
                            rowSpan={4} 
                            style={{ 
                              border: '1px solid #000',
                              borderRight: '2px solid #000',
                              padding: '8px',
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              width: '6%'
                            }}
                          >
                            {actualIndex + 1}
                          </td>
                          <td 
                            rowSpan={4} 
                            style={{ 
                              border: '1px solid #000',
                              borderRight: '2px solid #000',
                              padding: '8px',
                              textAlign: 'left',
                              verticalAlign: 'middle',
                              lineHeight: '1.3',
                              width: '42%',
                              fontSize: '11px'
                            }}
                          >
                            {res.pregunta}
                          </td>
                          <td style={{ 
                            border: isOptionSelected(allOptions[0], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            borderRight: '2px solid #000',
                            padding: '6px',
                            textAlign: 'center',
                            fontWeight: isOptionSelected(allOptions[0], selectedResponse) ? 'bold' : 'normal',
                            width: '6%',
                            backgroundColor: isOptionSelected(allOptions[0], selectedResponse) ? '#E3F2FD' : 'white',
                            color: isOptionSelected(allOptions[0], selectedResponse) ? '#1976D2' : 'black',
                            position: 'relative'
                          }}>
                            {isOptionSelected(allOptions[0], selectedResponse) && (
                              <span style={{ 
                                position: 'absolute', 
                                left: '2px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                fontSize: '14px',
                                color: '#1976D2'
                              }}>
                                ▶
                              </span>
                            )}
                            0
                          </td>
                          <td style={{ 
                            border: isOptionSelected(allOptions[0], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            padding: '6px',
                            textAlign: 'left',
                            backgroundColor: isOptionSelected(allOptions[0], selectedResponse) ? '#E3F2FD' : 'white',
                            fontWeight: isOptionSelected(allOptions[0], selectedResponse) ? 'bold' : 'normal',
                            fontSize: '10px',
                            lineHeight: '1.2'
                          }}>
                            {getOptionText(allOptions[0])}
                          </td>
                        </tr>
                        
                        {/* Segunda fila con valor 1 y su opción */}
                        <tr>
                          <td style={{ 
                            border: isOptionSelected(allOptions[1], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            borderRight: '2px solid #000',
                            padding: '6px',
                            textAlign: 'center',
                            fontWeight: isOptionSelected(allOptions[1], selectedResponse) ? 'bold' : 'normal',
                            backgroundColor: isOptionSelected(allOptions[1], selectedResponse) ? '#E3F2FD' : 'white',
                            color: isOptionSelected(allOptions[1], selectedResponse) ? '#1976D2' : 'black',
                            position: 'relative'
                          }}>
                            {isOptionSelected(allOptions[1], selectedResponse) && (
                              <span style={{ 
                                position: 'absolute', 
                                left: '2px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                fontSize: '14px',
                                color: '#1976D2'
                              }}>
                                ▶
                              </span>
                            )}
                            1
                          </td>
                          <td style={{ 
                            border: isOptionSelected(allOptions[1], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            padding: '6px',
                            textAlign: 'left',
                            backgroundColor: isOptionSelected(allOptions[1], selectedResponse) ? '#E3F2FD' : 'white',
                            fontWeight: isOptionSelected(allOptions[1], selectedResponse) ? 'bold' : 'normal',
                            fontSize: '10px',
                            lineHeight: '1.2'
                          }}>
                            {getOptionText(allOptions[1])}
                          </td>
                        </tr>
                        
                        {/* Tercera fila con valor 2 y su opción */}
                        <tr>
                          <td style={{ 
                            border: isOptionSelected(allOptions[2], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            borderRight: '2px solid #000',
                            padding: '6px',
                            textAlign: 'center',
                            fontWeight: isOptionSelected(allOptions[2], selectedResponse) ? 'bold' : 'normal',
                            backgroundColor: isOptionSelected(allOptions[2], selectedResponse) ? '#E3F2FD' : 'white',
                            color: isOptionSelected(allOptions[2], selectedResponse) ? '#1976D2' : 'black',
                            position: 'relative'
                          }}>
                            {isOptionSelected(allOptions[2], selectedResponse) && (
                              <span style={{ 
                                position: 'absolute', 
                                left: '2px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                fontSize: '14px',
                                color: '#1976D2'
                              }}>
                                ▶
                              </span>
                            )}
                            2
                          </td>
                          <td style={{ 
                                                     border: isOptionSelected(allOptions[2], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            padding: '6px',
                            textAlign: 'left',
                            backgroundColor: isOptionSelected(allOptions[2], selectedResponse) ? '#E3F2FD' : 'white',
                            fontWeight: isOptionSelected(allOptions[2], selectedResponse) ? 'bold' : 'normal',
                            fontSize: '10px',
                            lineHeight: '1.2'
                          }}>
                            {getOptionText(allOptions[2])}
                          </td>
                        </tr>
                        
                        {/* Cuarta fila con valor 3 y su opción */}
                        <tr>
                          <td style={{ 
                            border: isOptionSelected(allOptions[3], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            borderRight: '2px solid #000',
                            padding: '6px',
                            textAlign: 'center',
                            fontWeight: isOptionSelected(allOptions[3], selectedResponse) ? 'bold' : 'normal',
                            backgroundColor: isOptionSelected(allOptions[3], selectedResponse) ? '#E3F2FD' : 'white',
                            color: isOptionSelected(allOptions[3], selectedResponse) ? '#1976D2' : 'black',
                            position: 'relative'
                          }}>
                            {isOptionSelected(allOptions[3], selectedResponse) && (
                              <span style={{ 
                                position: 'absolute', 
                                left: '2px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                fontSize: '14px',
                                color: '#1976D2'
                              }}>
                                ▶
                              </span>
                            )}
                            3
                          </td>
                          <td style={{ 
                            border: isOptionSelected(allOptions[3], selectedResponse) ? '2px solid #2196F3' : '1px solid #000',
                            padding: '6px',
                            textAlign: 'left',
                            backgroundColor: isOptionSelected(allOptions[3], selectedResponse) ? '#E3F2FD' : 'white',
                            fontWeight: isOptionSelected(allOptions[3], selectedResponse) ? 'bold' : 'normal',
                            fontSize: '10px',
                            lineHeight: '1.2'
                          }}>
                            {getOptionText(allOptions[3])}
                          </td>
                        </tr>
                      </tbody>
                      
                      {/* Separador entre preguntas dentro de la misma página */}
                      {groupIndex < group.length - 1 && (
                        <tbody>
                          <tr>
                            <td colSpan={4} style={{ borderTop: '2px solid #000', padding: 0, height: '2px' }}></td>
                          </tr>
                        </tbody>
                      )}
                    </React.Fragment>
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
                
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {test.puntuacionTotal <= 9 && (
                    <span style={{ color: '#2E7D32' }}>Depresión mínima</span>
                  )}
                  {test.puntuacionTotal >= 10 && test.puntuacionTotal <= 18 && (
                    <span style={{ color: '#F57C00' }}>Depresión leve</span>
                  )}
                  {test.puntuacionTotal >= 19 && test.puntuacionTotal <= 29 && (
                    <span style={{ color: '#D84315' }}>Depresión moderada</span>
                  )}
                  {test.puntuacionTotal >= 30 && (
                    <span style={{ color: '#B71C1C' }}>Depresión grave</span>
                  )}
                </div>
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

export default InventarioDepresionPdfPage;