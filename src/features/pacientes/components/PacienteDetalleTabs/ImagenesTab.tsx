// features/pacientes/components/PacienteDetalleTabs/ImagenesTab.tsx

const ImagenesTab = ({ pacienteId }: { pacienteId: string }) => {
  return (
    <div className="p-4 text-gray-700 font-poppins">
      <p className="text-sm mb-2">Aquí se mostrará el seguimiento fotográfico del paciente <strong>{pacienteId}</strong>.</p>
      {/* Puedes integrar aquí una galería o grid de imágenes */}
    </div>
  );
};

export default ImagenesTab;
