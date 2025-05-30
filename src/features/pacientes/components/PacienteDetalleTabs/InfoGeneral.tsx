import { Paciente } from "../../types/paciente";

const InfoGeneral = ({ paciente }: { paciente: Paciente }) => {
  console.log("InfoGeneral paciente:", paciente);
  return (
    <div className="p-6 rounded-lg bg-[#F0F8FF] text-gray-800 min-h-[200px] border border-[#2A93C9] shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-[#2A93C9]">Datos personales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><strong>Nombre:</strong> {paciente.nombre_completo}</div>
        <div><strong>Documento:</strong> {paciente.documento}</div>
        <div><strong>Teléfono:</strong> {paciente.telefono}</div>
        <div><strong>Correo:</strong> {paciente.email || "No registrado"}</div>
        <div><strong>Dirección:</strong> {paciente.direccion}</div>
        <div><strong>Fecha nacimiento:</strong> {paciente.fecha_nacimiento}</div>
        <div><strong>Fecha ingreso:</strong> {paciente.fecha_ingreso}</div>
        <div>
          <strong>Estado:</strong>{" "}
          <span className={`px-2 py-1 rounded-full text-xs text-white ${paciente.estado === "activo" ? "bg-green-500" : "bg-gray-400"}`}>
            {paciente.estado}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoGeneral;
