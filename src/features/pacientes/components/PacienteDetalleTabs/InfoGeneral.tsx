import { Paciente } from "../../types/paciente";
import { User, FileText, Phone, Mail, Home, Calendar, Edit } from "lucide-react";

const InfoGeneral = ({ paciente }: { paciente: Paciente }) => {
  // Función para formatear fechas
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Cabecera compacta */}
      <div className="bg-gradient-to-r from-blue-50 to-white px-4 py-3 border-b border-gray-200 flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <User size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-medium text-gray-800 truncate max-w-[70%]">
              {paciente.nombre_completo}
            </h2>
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              paciente.estado === "activo" 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {paciente.estado}
            </div>
          </div>
          <p className="text-gray-500 mt-1 text-xs flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              ID: {paciente.id}
            </span>
          </p>
        </div>
      </div>

      {/* Grid de información compacta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
        {/* Datos personales */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <User size={14} />
            <h3 className="font-medium text-sm">Datos Personales</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <FileText size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Documento</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {paciente.documento || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Calendar size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Nacimiento</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.fecha_nacimiento)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <Phone size={14} />
            <h3 className="font-medium text-sm">Contacto</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Phone size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-800">
                  {paciente.telefono || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Mail size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Correo</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {paciente.email || "No registrado"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Home size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {paciente.direccion || "No registrada"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registro en sistema */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <Calendar size={14} />
            <h3 className="font-medium text-sm">Registro</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Calendar size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ingreso</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.fecha_ingreso)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-md">
                <Calendar size={12} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Actualización</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(paciente.fecha_ingreso)} {/* Cambiar si hay campo específico */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página compacto */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex justify-end">
        <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md bg-white border border-blue-200 hover:border-blue-300 text-sm transition-colors">
          <Edit size={14} />
          Editar información
        </button>
      </div>
    </div>
  );
};

export default InfoGeneral;