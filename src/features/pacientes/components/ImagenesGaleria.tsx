// features/pacientes/components/ImagenesGaleria.tsx
import React, { useEffect } from "react";
import { useImagenes } from "../hooks/useSeguimiento";

const ImagenesGaleria = ({ pacienteId }: { pacienteId: string }) => {
  const { imagenes, loading, error, fetchImagenes, subirImagen } = useImagenes(pacienteId);

  useEffect(() => {
    fetchImagenes();
  }, [pacienteId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await subirImagen(file, "Progreso nuevo");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {loading && <div>Cargando...</div>}
      {error && <div>{error}</div>}
      <div>
        {imagenes.map((img) => (
          <img key={img.id} src={img.url} alt={img.descripcion} width={100} />
        ))}
      </div>
    </div>
  );
};

export default ImagenesGaleria;
