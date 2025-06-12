import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Calendar, Clock, Camera, FileText, User, CreditCard, AlertCircle, Loader2, Activity, Phone, MapPin, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';

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

type Imagen = {
  id: string;
  url: string;
  descripcion: string;
  fecha: string;
};

type Pago = {
  id: string;
  monto: number;
  metodo_pago: string;
  estado: string;
  fecha: string;
  comprobante_url: string;
};

const PacientePage = () => {
  const { usuario } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [activeTab, setActiveTab] = useState('seguimiento');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Usuario desde store:', usuario);

        if (!usuario) {
          throw new Error('No hay usuario autenticado');
        }

        if (!usuario.id && !usuario.uid) {
          throw new Error('El usuario no tiene un ID válido');
        }

        const userId = usuario.id || usuario.uid;
        console.log('ID de usuario a usar:', userId);

        const userDoc = await getDoc(doc(db, 'users', userId));
        
        console.log('Documento de usuario existe:', userDoc.exists());
        console.log('Datos del documento:', userDoc.data());

        if (!userDoc.exists()) {
          const usuariosQuery = query(
            collection(db, 'users'), 
            where('email', '==', usuario.email)
          );
          const usuariosSnapshot = await getDocs(usuariosQuery);
          
          if (usuariosSnapshot.empty) {
            throw new Error(`Usuario no encontrado en la base de datos. ID buscado: ${userId}, Email: ${usuario.email}`);
          }
          
          const userDocData = usuariosSnapshot.docs[0];
          const userData = userDocData.data();
          const pacienteId = userData.paciente_id;
          
          console.log('Usuario encontrado por email:', userData);
          
          if (!pacienteId) {
            setLoading(false);
            return;
          }

          await fetchPacienteData(pacienteId, userDocData.id);
          
        } else {
          const userData = userDoc.data();
          const pacienteId = userData.paciente_id;

          console.log('Datos del usuario:', userData);
          console.log('ID del paciente:', pacienteId);

          if (!pacienteId) {
            setLoading(false);
            return;
          }

          await fetchPacienteData(pacienteId, userId);
        }

      } catch (err) {
        console.error('Error detallado:', err);
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    const fetchPacienteData = async (pacienteId: string, familiarId: string) => {
      const pacienteDoc = await getDoc(doc(db, 'pacientes', pacienteId));
      if (!pacienteDoc.exists()) {
        throw new Error('Paciente no encontrado');
      }

      setPaciente({
        id: pacienteDoc.id,
        ...pacienteDoc.data()
      } as Paciente);

      try {
        const imagenesQuery = query(collection(db, `pacientes/${pacienteId}/imagenes`));
        const imagenesSnapshot = await getDocs(imagenesQuery);
        const imagenesData = imagenesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Imagen[];
        setImagenes(imagenesData);
      } catch (imgError) {
        console.warn('Error al cargar imágenes:', imgError);
        setImagenes([]);
      }

      try {
        const pagosQuery = query(collection(db, 'pagos'), where('familiar_id', '==', familiarId));
        const pagosSnapshot = await getDocs(pagosQuery);
        const pagosData = pagosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Pago[];
        setPagos(pagosData);
      } catch (pagoError) {
        console.warn('Error al cargar pagos:', pagoError);
        setPagos([]);
      }
    };

    if (usuario) {
      fetchData();
    } else {
      setLoading(false);
      setError('No hay usuario autenticado');
    }
  }, [usuario]);

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
            {process.env.NODE_ENV === 'development' && usuario && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left text-sm max-w-md mx-auto">
                <p className="font-semibold text-gray-700 mb-2">Debug Info:</p>
                <div className="space-y-1 text-gray-600">
                  <p>Usuario ID: {usuario.id || 'undefined'}</p>
                  <p>Usuario UID: {usuario.uid || 'undefined'}</p>
                  <p>Usuario Email: {usuario.email || 'undefined'}</p>
                </div>
              </div>
            )}
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
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento del Paciente</h1>
            <p className="text-gray-500 text-lg">Información actualizada sobre {paciente.nombre_completo}</p>
          </div>
        </div>

        {/* Información básica mejorada */}
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

        {/* Tabs mejorados */}
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
                {/* Resumen mejorado */}
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
                        <p className="text-emerald-700font-medium mb-1">Días en tratamiento</p>
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

                {/* Galería de imágenes mejorada */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <Camera className="h-6 w-6 text-blue-600" />
                    Registro Visual
                  </h3>
                  
                  {imagenes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagenes.map((imagen) => (
                        <div key={imagen.id} className="group relative">
                          <div className="rounded-xl overflow-hidden aspect-square bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
                            <img
                              src={imagen.url}
                              alt={imagen.descripcion || 'Registro del paciente'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          {imagen.descripcion && (
                            <p className="mt-2 text-sm text-gray-600 text-center">{imagen.descripcion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay imágenes registradas aún</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Historial de pagos mejorado */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    Historial de Pagos
                  </h3>
                  
                  {pagos.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Fecha
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Monto
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Método
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pagos.map((pago) => (
                              <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                  {formatFecha(pago.fecha)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                                  ${pago.monto.toLocaleString('es-CO')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                                  {pago.metodo_pago}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                    pago.estado === 'pendiente' 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}>
                                    {pago.estado === 'pendiente' ? 'Pendiente' : 'Completado'}
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
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay registros de pagos</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card de contacto mejorada */}
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