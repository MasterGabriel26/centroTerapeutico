// features/pacientes/components/PacienteDetalleTabs/FormulaTab.tsx

const FormulaTab = ({ pacienteId }: { pacienteId: string }) => {
  return (
    <div className="p-4 text-gray-700 font-poppins">
      <p className="text-sm mb-2">Aquí aparecerán las fórmulas médicas asociadas al paciente <strong>{pacienteId}</strong>.</p>
      {/* Puedes incluir un listado editable o formulario aquí */}
    </div>
  );
};

export default FormulaTab;
