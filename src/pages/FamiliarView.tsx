import React, { useState } from 'react';
import { Calendar, Clock, Activity, Camera, FileText, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Datos simulados para la vista del familiar
const anexado = {
  id: '1',
  nombre_completo: 'Juan Pérez López',
  fecha_ingreso: '2023-06-15',
  estado: 'activo',
  motivo_anexo: 'Adicción a alcohol',
  familiar: 'María Pérez (Esposa)',
};

const registrosTimeline = [
  {
    id: '1',
    fecha: '2023-10-05',
    descripcion: 'El paciente ha mostrado mejoras significativas en su autocontrol',
    medicamentos: 'Sertralina 50mg, Clonazepam 0.5mg',
    comidas: 'Desayuno: Huevos con jamón, Comida: Pollo con verduras, Cena: Sopa de verduras',
    peso: 75.5,
    comportamiento: 'Cooperativo, participativo en terapias grupales',
    fotos: [
      'https://images.pexels.com/photos/6551890/pexels-photo-6551890.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/6551803/pexels-photo-6551803.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
  },
  {
    id: '2',
    fecha: '2023-10-04',
    descripcion: 'Se muestra ansioso durante la mañana, pero más tranquilo por la tarde',
    medicamentos: 'Sertralina 50mg, Clonazepam 0.5mg',
    comidas: 'Desayuno: Cereal con frutas, Comida: Pescado, Cena: Sandwich',
    peso: 75.8,
    comportamiento: 'Ansioso por la mañana, cooperativo por la tarde',
    fotos: [
      'https://images.pexels.com/photos/6551891/pexels-photo-6551891.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
  },
  {
    id: '3',
    fecha: '2023-10-03',
    descripcion: 'Avance notable en terapia individual. Expresó sentimientos de arrepentimiento',
    medicamentos: 'Sertralina 50mg, Clonazepam 0.5mg',
    comidas: 'Desayuno: Pan tostado, Comida: Tacos de pollo, Cena: Ensalada',
    peso: 76.0,
    comportamiento: 'Reflexivo, introspectivo',
    fotos: [
      'https://images.pexels.com/photos/6551763/pexels-photo-6551763.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/6551781/pexels-photo-6551781.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
  },
];

const pagos = [
  {
    id: '1',
    fecha: '2023-09-30',
    monto: 3600,
    metodo_pago: 'transferencia',
    estado: 'completado',
  },
  {
    id: '2',
    fecha: '2023-09-23',
    monto: 3600,
    metodo_pago: 'efectivo',
    estado: 'completado',
  },
  {
    id: '3',
    fecha: '2023-09-16',
    monto: 3600,
    metodo_pago: 'transferencia',
    estado: 'completado',
  },
  {
    id: '4',
    fecha: '2023-10-07',
    monto: 3600,
    metodo_pago: 'efectivo',
    estado: 'pendiente',
  },
];

const FamiliarView = () => {
  const [expandedRegistros, setExpandedRegistros] = useState<string[]>([registrosTimeline[0].id]);

  const toggleExpand = (id: string) => {
    setExpandedRegistros(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Calcular el progreso en días
  const calcularDiasInternado = () => {
    const fechaInicio = new Date(anexado.fecha_ingreso);
    const hoy = new Date();
    const diferencia = hoy.getTime() - fechaInicio.getTime();
    return Math.floor(diferencia / (1000 * 3600 * 24));
  };

  // Función para formatear fecha en español
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seguimiento de mi familiar</h1>
        <p className="text-gray-500">Visualiza el progreso diario y estado de pagos</p>
      </div>

      {/* Tarjeta de información del anexado */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{anexado.nombre_completo}</h2>
                <p className="text-primary-100 mb-4">{anexado.motivo_anexo}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-200" />
                    <div>
                      <p className="text-xs text-primary-200">Fecha de ingreso</p>
                      <p className="text-sm font-medium">{new Date(anexado.fecha_ingreso).toLocaleDateString('es-MX')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-200" />
                    <div>
                      <p className="text-xs text-primary-200">Tiempo internado</p>
                      <p className="text-sm font-medium">{calcularDiasInternado()} días</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  Estado: Activo
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progreso de recuperación</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs para Timeline y Pagos */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <ul className="flex -mb-px">
            <li className="mr-2">
              <a href="#timeline" className="inline-block p-4 text-primary-600 border-b-2 border-primary-600 rounded-t-lg font-medium">
                Línea de tiempo
              </a>
            </li>
            <li className="mr-2">
              <a href="#pagos" className="inline-block p-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent rounded-t-lg">
                Historial de pagos
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Timeline de registros */}
      <div id="timeline" className="mb-10">
        <h2 className="text-xl font-semibold mb-6">Línea de tiempo</h2>
        
        <div className="space-y-8">
          {registrosTimeline.map((registro) => (
            <div key={registro.id} className="timeline-item fade-in">
              <div 
                className={`timeline-dot ${expandedRegistros.includes(registro.id) ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}
              >
                <Activity size={18} />
              </div>
              
              <Card hoverable className="ml-4">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">{formatFecha(registro.fecha)}</h3>
                      <p className="text-gray-500 text-sm">Día {calcularDiasInternado() - registrosTimeline.indexOf(registro)}</p>
                    </div>
                    <button 
                      onClick={() => toggleExpand(registro.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <ChevronDown 
                        size={20} 
                        className={`text-gray-500 transition-transform ${expandedRegistros.includes(registro.id) ? 'rotate-180' : ''}`} 
                      />
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Descripción general</h4>
                    <p className="text-gray-900 mt-1">{registro.descripcion}</p>
                  </div>
                  
                  {/* Galería de fotos */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Camera size={16} className="mr-1" /> Fotografías del día
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {registro.fotos.map((foto, index) => (
                        <div key={index} className="rounded-lg overflow-hidden aspect-square">
                          <img 
                            src={foto} 
                            alt={`Foto ${index + 1} del día`} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Contenido expandible */}
                  {expandedRegistros.includes(registro.id) && (
                    <div className="mt-6 pt-4 border-t border-gray-100 animate-pulse-slow">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Medicamentos</h4>
                          <p className="text-gray-900 mt-1">{registro.medicamentos}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Comportamiento</h4>
                          <p className="text-gray-900 mt-1">{registro.comportamiento}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Peso registrado</h4>
                          <p className="text-gray-900 mt-1">{registro.peso} kg</p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-700">Alimentación</h4>
                          <p className="text-gray-900 mt-1">{registro.comidas}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<FileText size={16} />}
                      onClick={() => toggleExpand(registro.id)}
                    >
                      {expandedRegistros.includes(registro.id) ? 'Ver menos' : 'Ver más detalles'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Ver registros anteriores
            </Button>
          </div>
        </div>
      </div>
      
      {/* Historial de pagos */}
      <div id="pagos" className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Historial de pagos</h2>
        
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(pago.fecha).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${pago.monto.toLocaleString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {pago.metodo_pago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.estado === 'completado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pago.estado === 'completado' ? 'Completado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Próximo pago */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Próximo pago</h3>
                <p className="text-gray-900">Sábado, 14 de octubre, 2023</p>
              </div>
              <div className="mt-2 md:mt-0">
                <Button variant="primary" size="sm">
                  Ver detalles de pago
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FamiliarView;