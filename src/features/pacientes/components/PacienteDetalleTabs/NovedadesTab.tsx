// features/pacientes/components/PacienteDetalleTabs/NovedadesTab.tsx

const NovedadesTab = ({ pacienteId }: { pacienteId: string }) => {
  return (
    <div className="p-4 text-gray-700 font-poppins">
      <p className="text-sm mb-2">Aquí se registrarán las novedades o reportes relacionados con el paciente <strong>{pacienteId}</strong>.</p>
      {/* Puedes integrar un textarea para añadir notas o ver historial */}
    </div>
  );
};

export default NovedadesTab;
