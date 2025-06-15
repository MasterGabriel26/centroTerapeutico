import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Calendar, Clock, FileText, User, CreditCard, AlertCircle, Loader2, Activity, Phone, MapPin, Mail, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import { useSeguimientos } from '../features/pacientes/hooks/useSeguimiento';
import { useCuentaDeCobro } from '../features/pagos/hooks/useCuentaDeCobro';

type Paciente = {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  documento: string;
  direccion: string;
  email: string;
  telefono: string;
  estado: string;
  creado: string;
  voluntario: boolean;
};

type ImageModalProps = {
  imageUrl: string;
  onClose: () => void;
};

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full p-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-8 w-8" />
        </button>
        <div className="bg-white rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Imagen de seguimiento" 
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <div className="p-3 bg-gray-100 text-right">
            <button
              onClick={onClose}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PacientePage = () => {
  const { usuario } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [activeTab, setActiveTab] = useState('seguimiento');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { 
    seguimientos, 
    loading: loadingSeguimientos, 
    error: errorSeguimientos,
    fetchSeguimientos 
  } = useSeguimientos(paciente?.id || '');

  const { 
    cuentas, 
    loading: loadingCuentas, 
    error: errorCuentas 
  } = useCuentaDeCobro();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-64 bg-gray-100 flex flex-col items-center justify-center rounded-lg border border-gray-200">
          <ImageIcon class="h-12 w-12 text-gray-400 mb-2" />
          <p class="text-gray-500 text-sm">No se pudo cargar la imagen</p>
        </div>
      `;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!usuario) {
          throw new Error('No hay usuario autenticado');
        }

        const userId = usuario.id || usuario.uid;
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          const usuariosQuery = query(
            collection(db, 'users'), 
            where('email', '==', usuario.email)
          );
          const usuariosSnapshot = await getDocs(usuariosQuery);
          
          if (usuariosSnapshot.empty) {
            throw new Error(`Usuario no encontrado en la base de datos`);
          }
          
          const userDocData = usuariosSnapshot.docs[0];
          const userData = userDocData.data();
          const pacienteId = userData.paciente_id;
          
          if (!pacienteId) {
            setLoading(false);
            return;
          }

          await fetchPacienteData(pacienteId);
        } else {
          const userData = userDoc.data();
          const pacienteId = userData.paciente_id;

          if (!pacienteId) {
            setLoading(false);
            return;
          }

          await fetchPacienteData(pacienteId);
        }

      } catch (err) {
        console.error('Error al cargar datos:', err);
        const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar los datos';
        setError(errorMessage);
        
        // Intentar nuevamente después de 5 segundos (máximo 3 intentos)
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, 5000);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchPacienteData = async (pacienteId: string) => {
      try {
        const pacienteDoc = await getDoc(doc(db, 'pacientes', pacienteId));
        if (!pacienteDoc.exists()) {
          throw new Error('Paciente no encontrado');
        }

        const pacienteData = {
          id: pacienteDoc.id,
          ...pacienteDoc.data()
        } as Paciente;

        setPaciente(pacienteData);
        
        if (pacienteData.id) {
          try {
            await fetchSeguimientos();
          } catch (err) {
            console.error('Error al cargar seguimientos:', err);
            setError('Error al cargar los seguimientos. Por favor intenta recargar la página.');
          }
        }
      } catch (err) {
        console.error('Error al cargar paciente:', err);
        throw err;
      }
    };

    if (usuario) {
      fetchData();
    } else {
      setLoading(false);
      setError('No hay usuario autenticado');
    }
  }, [usuario, retryCount]);

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "PPP", { locale: es });
    } catch (err) {
      console.warn('Error al formatear fecha:', fecha, err);
      return fecha;
    }
  };

  const formatFechaCorta = (fecha: string) => {
    try {
      return format(parseISO(fecha), "dd MMM yyyy", { locale: es });
    } catch (err) {
      console.warn('Error al formatear fecha:', fecha, err);
      return fecha;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'pendiente':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completado':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const seguimientosActivos = seguimientos
    .filter(seg => seg.isActive)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const cuentasPaciente = cuentas.filter(cuenta => cuenta.paciente_id === paciente?.id);

  if (selectedImage) {
    return (
      <>
        <div style={{ display: 'none' }}>
          {/* Contenido normal oculto mientras el modal está abierto */}
          <PacientePage />
        </div>
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4 mx-auto" />
            <p className="text-gray-600 font-medium">Cargando información del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white shadow-xl rounded-2xl p-8 text-center border-0">
            <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Error al cargar los datos</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">{error}</p>
            {retryCount < 3 ? (
              <p className="text-gray-500 mb-4">Intentando nuevamente en {5 - retryCount} segundos...</p>
            ) : null}
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
              className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Intentar nuevamente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white shadow-xl rounded-2xl p-8 text-center border-0">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No tienes ningún paciente asociado</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
              Por favor contacta al administrador para más información sobre tu familiar.
            </p>
            <Button 
              variant="primary"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Contactar soporte
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento del Paciente</h1>
            <p className="text-gray-500 text-lg">Información actualizada sobre {paciente.nombre_completo}</p>
          </div>
        </div>

        {/* Información básica */}
        <Card className="mb-8 bg-white shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-400 to-blue-300 p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-32 flex-shrink-0">
                <div className="relative pb-[125%] rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                  <User className="absolute inset-0 m-auto h-12 w-12 text-white/80" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 text-white">
                <h2 className="text-2xl font-bold mb-4">{paciente.nombre_completo}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white/70 text-sm font-medium mb-1">Edad</p>
                    <p className="text-xl font-bold">{calcularEdad(paciente.fecha_nacimiento)} años</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white/70 text-sm font-medium mb-1">Documento</p>
                    <p className="text-xl font-bold">{paciente.documento}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Teléfono</p>
                  <p className="font-semibold text-gray-900">{paciente.telefono || 'No registrado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="font-semibold text-gray-900">{paciente.email || 'No registrado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="h-5 w-5 flex items-center justify-center">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(paciente.estado)}`}>
                    {paciente.estado}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border-0">
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
                activeTab === 'seguimiento' 
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('seguimiento')}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-5 w-5" />
                Seguimiento
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
                activeTab === 'pagos' 
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('pagos')}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagos
              </div>
            </button>
          </div>

          {/* Contenido de tabs */}
          <div className="p-6">
            {activeTab === 'seguimiento' ? (
              <div className="space-y-8">
                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium mb-1">Fecha de ingreso</p>
                        <p className="font-bold text-blue-900">{formatFecha(paciente.creado)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-lg">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-emerald-700 font-medium mb-1">Días en tratamiento</p>
                        <p className="font-bold text-emerald-900">
                          {differenceInDays(new Date(), parseISO(paciente.creado))} días
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-600 p-3 rounded-xl text-white shadow-lg">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-purple-700 font-medium mb-1">Estado actual</p>
                        <p className="font-bold text-purple-900 capitalize">{paciente.estado}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de seguimientos */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Registro de Seguimientos
                  </h3>
                  
                  {loadingSeguimientos ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                  ) : errorSeguimientos ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                      {errorSeguimientos}
                      <Button 
                        variant="ghost" 
                        onClick={fetchSeguimientos}
                        className="mt-2 text-red-700 hover:bg-red-100"
                      >
                        Reintentar
                      </Button>
                    </div>
                  ) : seguimientosActivos.length > 0 ? (
                    <div className="space-y-6">
                      {seguimientosActivos.map((seguimiento) => (
                        <div 
                          key={seguimiento.id} 
                          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg"
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    {formatFechaCorta(seguimiento.fecha)}
                                  </span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">{seguimiento.comportamiento}</h4>
                                <p className="text-gray-600 leading-relaxed">{seguimiento.descripcion}</p>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Activo
                                </span>
                              </div>
                            </div>
                            
                            {seguimiento.url && (
                              <div className="mt-4">
                                <div 
                                  className="relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => setSelectedImage(seguimiento.url)}
                                >
                                  <img 
                                    src={seguimiento.url} 
                                    alt="Seguimiento" 
                                    className="w-full h-64 object-contain bg-gray-100"
                                    onError={handleImageError}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-4 opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-medium flex items-center">
                                      <ImageIcon className="inline mr-1 h-4 w-4" />
                                      Haz clic para ampliar
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay seguimientos activos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Historial de pagos */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    Historial de Pagos
                  </h3>
                  
                  {loadingCuentas ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                  ) : errorCuentas ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                      {errorCuentas}
                    </div>
                  ) : cuentasPaciente.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Fecha
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Concepto
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Monto
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Periodo
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {cuentasPaciente.map((cuenta) => (
                              <tr key={cuenta.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                  {formatFecha(cuenta.fecha)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {cuenta.concepto}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                                  ${cuenta.monto.toLocaleString('es-CO')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {formatFecha(cuenta.periodo.desde)} - {formatFecha(cuenta.periodo.hasta)}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                    cuenta.estado === 'pagada' 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {cuenta.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay registros de pagos</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card de contacto */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-3">¿Necesitas ayuda?</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Contacta a nuestro equipo de soporte para cualquier inquietud sobre el tratamiento.
                </p>
              </div>
              <Button 
                variant="primary"
                className="bg-blue-400 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
              >
                Contactar soporte
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PacientePage;