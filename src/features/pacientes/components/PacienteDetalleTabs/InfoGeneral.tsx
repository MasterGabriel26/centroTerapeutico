// features/pacientes/components/InfoGeneral.tsx - Versión completa
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

// features/pacientes/components/InfoGeneral.tsx
const handleEdit = () => {
  console.log("🔗 Navegando a editar paciente con ID:", paciente.id); // DEBUG
  if (!paciente.id) {
    console.error("❌ ID del paciente no disponible");
    return;
  }
  navigate(`/pacientes/${paciente.id}/editar`);
};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
              <p className="text-sm text-gray-600">
                Expediente: {paciente.numero_expediente || "No asignado"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleEdit}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg bg-white border border-blue-200 hover:border-blue-300 text-sm transition-colors shadow-sm hover:shadow-md"
          >
            <Edit size={16} />
            Editar información
          </button>
        </div>
      </div>

      {/* Grid de información expandida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        
        {/* Datos Personales Básicos */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <User size={16} />
            <h3 className="font-semibold text-base">Datos Personales</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <FileText size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Documento</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.documento || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Calendar size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Nacimiento</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.fecha_nacimiento)} • {paciente.edad || 0} años
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Users size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Sexo / Estado Civil</p>
                <p className="text-sm font-medium text-gray-800">
                  {capitalize(paciente.sexo || "no especificado")} • {capitalize(paciente.estado_civil || "no especificado")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <Phone size={16} />
            <h3 className="font-semibold text-base">Contacto y Ubicación</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Phone size={14} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.telefono || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Mail size={14} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Correo Electrónico</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {paciente.email || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-md">
                <Home size={14} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {paciente.direccion || "No registrada"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información Educativa y Laboral */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-4 text-purple-700">
            <GraduationCap size={16} />
            <h3 className="font-semibold text-base">Educación y Empleo</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <GraduationCap size={14} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Escolaridad</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.escolaridad || "No especificada"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Briefcase size={14} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Situación Laboral</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.desempleado ? "Desempleado" : "Empleado"}
                </p>
              </div>
            </div>

            {paciente.desempleado && paciente.tiempo_desempleo && (
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-md">
                  <Clock size={14} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Tiempo Desempleado</p>
                  <p className="text-sm font-medium text-gray-800">
                    {paciente.tiempo_desempleo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información Económica */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-4 text-amber-700">
            <DollarSign size={16} />
            <h3 className="font-semibold text-base">Situación Económica</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <DollarSign size={14} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dependencia Económica</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.depende_economicamente ? "Sí" : "No"}
                  {paciente.depende_economicamente && paciente.de_quien_depende && 
                    ` - ${paciente.de_quien_depende}`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Users size={14} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Personas a Cargo</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.alguien_depende_de_usted ? "Sí" : "No"}
                  {paciente.alguien_depende_de_usted && paciente.quien_depende && 
                    ` - ${paciente.quien_depende}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información Familiar y Social */}
        <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-4 text-rose-700">
            <Heart size={16} />
            <h3 className="font-semibold text-base">Información Familiar</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-md">
                <Users size={14} className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Convivencia</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {paciente.personas_con_vive || "No especificado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Heart size={14} className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estado Sentimental</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.tiene_pareja ? "En pareja" : "Sin pareja"}
                  {paciente.tiene_pareja && paciente.tiempo_relacion && 
                    ` - ${paciente.tiempo_relacion}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Registro */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Calendar size={16} />
            <h3 className="font-semibold text-base">Registro en Sistema</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Calendar size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Entrevista</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.fecha_entrevista)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <FileText size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Registro en Sistema</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.creado)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-md">
                <Users size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estado Actual</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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