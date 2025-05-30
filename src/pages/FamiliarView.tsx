import React, { useState } from 'react';
import { Calendar, Clock, Activity, Camera, FileText, ArrowRight, ChevronDown,AlertCircle,User,CalendarCheck,ClipboardList,TrendingUp,Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const paciente = {
  id: 'PT-8246',
  nombre_completo: 'Carlos Alberto Méndez Rodríguez',
  foto: null, // Puedes reemplazar con una URL de imagen si deseas
  edad: 35,
  genero: 'Masculino',
  fecha_ingreso: '2023-06-15',
  estado: 'Activo',
  motivo_anexo: 'Tratamiento por dependencia al alcohol con cuadro de ansiedad asociado',
  tipo_terapia: 'Cognitivo-Conductual + Grupo de Apoyo',
  gravedad: 'Moderado',
  terapeuta: 'Dra. Laura Vanessa Gutiérrez',
  progreso: 65,
  fase: 2,
  proxima_cita: '2023-11-25',
  familiar: 'Ana Lucía Méndez (Hermana)',
  
  // Nueva información ampliada
  contacto_emergencia: {
    nombre: 'Ana Lucía Méndez',
    parentesco: 'Hermana',
    telefono: '55-1234-5678',
    email: 'ana.mendez@example.com',
    direccion: 'Calle Flores #123, Col. Jardines, CDMX'
  },
  
  notas_importantes: [
    'Buena respuesta a terapia grupal',
    'Asiste regularmente a sesiones',
    'Requiere seguimiento nutricional',
    'Permiso de visita los fines de semana'
  ],
  
  horario_visitas: {
    dias: ['Sábado', 'Domingo'],
    horario: '10:00 AM - 6:00 PM'
  },
  
  medicacion: [
    {
      nombre: 'Naltrexona',
      dosis: '50mg/día',
      proposito: 'Reducción de craving'
    },
    {
      nombre: 'Sertralina',
      dosis: '100mg/día',
      proposito: 'Manejo de ansiedad'
    }
  ],
  
  proximos_eventos: [
    {
      fecha: '2023-11-15',
      evento: 'Sesión familiar',
      hora: '4:00 PM'
    },
    {
      fecha: '2023-11-20',
      evento: 'Evaluación médica',
      hora: '11:00 AM'
    }
  ],
  
  normas_centro: [
    'No traer alimentos o bebidas del exterior',
    'Prohibido llevar objetos punzocortantes',
    'Uso de cubrebocas obligatorio',
    'Respetar horarios de visita'
  ]
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
    const fechaInicio = new Date(paciente.fecha_ingreso);
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
  <div className="bg-gradient-to-br from-blue-50 to-blue-50 text-gray-800 overflow-hidden shadow-lg rounded-2xl border border-blue-100 relative">
    {/* Ribbon de estado - Versión mejorada */}
    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-sm z-10 ${
      paciente.estado === 'Activo' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : paciente.estado === 'Alta'
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : 'bg-amber-100 text-amber-800 border border-amber-200'
    }`}>
      <span className="relative flex items-center">
        <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${
          paciente.estado === 'Activo' ? 'bg-green-400' : 
          paciente.estado === 'Alta' ? 'bg-blue-400' : 'bg-amber-400'
        } opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 mr-2 ${
          paciente.estado === 'Activo' ? 'bg-green-500' : 
          paciente.estado === 'Alta' ? 'bg-blue-500' : 'bg-amber-500'
        }`}></span>
        {paciente.estado}
      </span>
    </div>

    {/* Contenido principal */}
    <div className="p-6 md:p-8 pt-10"> {/* Aumentado el padding-top */}
      {/* Sección superior con foto y datos básicos */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Foto del paciente - posición ajustada */}
        <div className="w-full md:w-40 lg:w-48 flex-shrink-0 -mt-8 md:-mt-12 relative mx-auto md:mx-0"> {/* Reducido el margen negativo */}
          <div className="relative pb-[125%] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-br from-blue-100 to-blue-200 mt-10">
            {paciente.foto ? (
              <img 
                src={paciente.foto} 
                alt={paciente.nombre_completo}
                className="absolute h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-16 w-16 text-blue-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
          </div>
        </div>

        {/* Información principal */}
        <div className="flex-1 space-y-3 w-full min-w-0">
          <div className="min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-1 truncate">
              {paciente.nombre_completo}
            </h2>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                #{paciente.id}
              </span>
              <span className="text-sm text-blue-700 whitespace-nowrap">
                {paciente.edad} años
              </span>
              <span className="text-sm bg-blue-200/50 text-blue-800 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {paciente.genero}
              </span>
            </div>
          </div>

          {/* Tarjeta de motivo - diseño más suave */}
          <div className="bg-white/90 p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-0.5">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-blue-900 font-medium italic mb-2 break-words">
                  "{paciente.motivo_anexo}"
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 whitespace-nowrap">
                    {paciente.tipo_terapia}
                  </span>
                  <span className="text-xs bg-blue-200/50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200/50 whitespace-nowrap">
                    {paciente.gravedad}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de información clínica - tarjetas más suaves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wider">Ingreso</p>
              <p className="text-sm font-medium text-blue-900">
                {new Date(paciente.fecha_ingreso).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wider">Días internado</p>
              <p className="text-sm font-medium text-blue-900">
                {calcularDiasInternado()} días
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wider">Próxima cita</p>
              <p className="text-sm font-medium text-blue-900">
                {new Date(paciente.proxima_cita || Date.now() + 7*24*60*60*1000)
                  .toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blue-600 uppercase tracking-wider">Terapeuta</p>
              <p className="text-sm font-medium text-blue-900 truncate">
                {paciente.terapeuta}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso del tratamiento - diseño más cálido */}
      <div className="bg-white/90 p-4 rounded-xl border border-blue-100 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Progreso del tratamiento</span>
          </div>
          <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
            {paciente.progreso}%
          </span>
        </div>

        <div className="w-full bg-blue-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full shadow-[0_2px_8px_rgba(59,130,246,0.3)]" 
            style={{ width: `${paciente.progreso}%` }}
          ></div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-blue-600">
          <span>Inicio</span>
          <span className="text-blue-700 font-medium">Fase {paciente.fase} de 4</span>
          <span>Finalización</span>
        </div>
      </div>

      {/* Información para familiares - sección destacada */}
      <div className="bg-blue-100/50 p-4 rounded-xl border border-blue-200 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-700" />
          Información para familiares
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/95 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-blue-600 uppercase tracking-wider">Contacto de emergencia</p>
                <p className="text-sm font-medium text-blue-900">
                  {paciente.familiar}
                </p>
                <p className="text-xs text-blue-700">
                  {paciente.contacto_emergencia?.telefono || 'Contactar al centro'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-blue-600 uppercase tracking-wider">Horario de visitas</p>
                <p className="text-sm font-medium text-blue-900">
                  Sábados y Domingos
                </p>
                <p className="text-xs text-blue-700">
                  10:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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