import { Paciente } from "../types/paciente";

const InfoGeneral = ({ paciente }: { paciente: Paciente }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 font-poppins">
    <div>
      <strong>Nombre:</strong> {paciente.nombre_completo}
    </div>
    <div>
      <strong>Documento:</strong> {paciente.documento}
    </div>
    <div>
      <strong>Teléfono:</strong> {paciente.telefono}
    </div>
    <div>
      <strong>Correo:</strong> {paciente.email}
    </div>
    <div>
      <strong>Dirección:</strong> {paciente.direccion}
    </div>
    <div>
      <strong>Fecha de nacimiento:</strong> {paciente.fecha_nacimiento}
    </div>
    <div>
      <strong>Ingreso:</strong> {paciente.fecha_ingreso}
    </div>
    <div>
      <strong>Estado:</strong>{" "}
      <span className={`px-2 py-1 rounded-full text-xs text-white ${paciente.estado === "activo" ? "bg-green-500" : "bg-gray-400"}`}>
        {paciente.estado}
      </span>
    </div>
  </div>
);
