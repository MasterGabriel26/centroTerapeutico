// features/pacientes/components/InfoGeneral.tsx - Versión responsiva
import { Paciente } from "../../types/paciente";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  FileText, 
  Phone, 
  Mail, 
  Home, 
  Calendar, 
  Edit,
  GraduationCap,
  Users,
  Heart,
  DollarSign,
  Briefcase,
  Clock
} from "lucide-react";

const InfoGeneral = ({ paciente }: { paciente: Paciente }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).replace('_', ' ');
  };

  const handleEdit = () => {
    console.log("🔗 Navegando a editar paciente con ID:", paciente.id);
    if (!paciente.id) {
      console.error("❌ ID del paciente no disponible");
      return;
    }
    navigate(`/pacientes/${paciente.id}/editar`);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header responsivo */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <User className="text-blue-600" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Información General
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Expediente: {paciente.numero_expediente || "No asignado"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 px-3 sm:px-4 py-2 rounded-lg bg-white border border-blue-200 hover:border-blue-300 text-xs sm:text-sm transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <Edit size={14} />
            <span className="sm:hidden">Editar</span>
            <span className="hidden sm:inline">Editar información</span>
          </button>
        </div>
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
        
        {/* Datos Personales Básicos */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-blue-700">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <h3 className="font-semibold text-sm sm:text-base">Datos Personales</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <FileText size={12} className="text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Documento</p>
                <p className="text-sm font-medium text-gray-800 break-words">
                  {paciente.documento || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Calendar size={12} className="text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Nacimiento</p>
                <p className="text-sm font-medium text-gray-800 break-words">
                  {formatDate(paciente.fecha_nacimiento)}
                </p>
                <p className="text-xs text-gray-600">{paciente.edad || 0} años</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Users size={12} className="text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Sexo / Estado Civil</p>
                <p className="text-sm font-medium text-gray-800 break-words">
                  {capitalize(paciente.sexo || "no especificado")}
                </p>
                <p className="text-xs text-gray-600">
                  {capitalize(paciente.estado_civil || "no especificado")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-green-700">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
            <h3 className="font-semibold text-sm sm:text-base">Contacto y Ubicación</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Phone size={12} className="text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm font-medium text-gray-800 break-all">
                  {paciente.telefono || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Mail size={12} className="text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Correo Electrónico</p>
                <p className="text-sm font-medium text-gray-800 break-all">
                  {paciente.email || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Home size={12} className="text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed break-words">
                  {paciente.direccion || "No registrada"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información Educativa y Laboral */}
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-purple-700">
            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
            <h3 className="font-semibold text-sm sm:text-base">Educación y Empleo</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <GraduationCap size={12} className="text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Escolaridad</p>
                <p className="text-sm font-medium text-gray-800 break-words">
                  {paciente.escolaridad || "No especificada"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Briefcase size={12} className="text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Situación Laboral</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.desempleado ? "Desempleado" : "Empleado"}
                </p>
              </div>
            </div>

            {paciente.desempleado && paciente.tiempo_desempleo && (
              <div className="flex items-start gap-3">
                <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                  <Clock size={12} className="text-purple-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Tiempo Desempleado</p>
                  <p className="text-sm font-medium text-gray-800 break-words">
                    {paciente.tiempo_desempleo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información Económica */}
        <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-amber-700">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            <h3 className="font-semibold text-sm sm:text-base">Situación Económica</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <DollarSign size={12} className="text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dependencia Económica</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.depende_economicamente ? "Sí" : "No"}
                </p>
                {paciente.depende_economicamente && paciente.de_quien_depende && (
                  <p className="text-xs text-gray-600 mt-1 break-words">
                    {paciente.de_quien_depende}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Users size={12} className="text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Personas a Cargo</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.alguien_depende_de_usted ? "Sí" : "No"}
                </p>
                {paciente.alguien_depende_de_usted && paciente.quien_depende && (
                  <p className="text-xs text-gray-600 mt-1 break-words">
                    {paciente.quien_depende}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información Familiar y Social */}
        <div className="bg-rose-50 rounded-lg p-3 sm:p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-rose-700">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
            <h3 className="font-semibold text-sm sm:text-base">Información Familiar</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Users size={12} className="text-rose-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Convivencia</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed break-words">
                  {paciente.personas_con_vive || "No especificado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estado Sentimental</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.tiene_pareja ? "En pareja" : "Sin pareja"}
                </p>
                {paciente.tiene_pareja && paciente.tiempo_relacion && (
                  <p className="text-xs text-gray-600 mt-1 break-words">
                    {paciente.tiempo_relacion}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información de Registro */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-gray-700">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <h3 className="font-semibold text-sm sm:text-base">Registro en Sistema</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Calendar size={12} className="text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Entrevista</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.fecha_entrevista)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <FileText size={12} className="text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Registro en Sistema</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.creado)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md flex-shrink-0">
                <Users size={12} className="text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estado Actual</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  paciente.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {capitalize(paciente.estado || "activo")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoGeneral;