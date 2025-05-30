// features/pacientes/hooks/useImagenes.ts
import { useState } from "react";
import { uploadImagen, getImagenes } from "../services/imagenService";
import { Imagen } from "../types/imagen";

export const useImagenes = (pacienteId: string) => {
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImagenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getImagenes(pacienteId);
      setImagenes(data);
    } catch (err) {
      setError("Error al obtener imágenes");
    } finally {
      setLoading(false);
    }
  };

  const subirImagen = async (file: File, descripcion?: string) => {
    setLoading(true);
    setError(null);
    try {
      await uploadImagen(pacienteId, file, descripcion);
      await fetchImagenes(); // actualiza galería después de subir
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  return {
    imagenes,
    loading,
    error,
    fetchImagenes,
    subirImagen,
  };
};
