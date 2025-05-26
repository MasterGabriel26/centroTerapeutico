// features/pacientes/services/imagenService.ts
import { db, storage } from '../../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Imagen } from '../types/imagen';

export const uploadImagen = async (pacienteId: string, file: File, descripcion = '') => {
  const storageRef = ref(storage, `pacientes/${pacienteId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const imagenesRef = collection(db, "pacientes", pacienteId, "imagenes");
  const imagenDoc = await addDoc(imagenesRef, {
    url,
    descripcion,
    fecha: new Date().toISOString(),
  });
  return imagenDoc.id;
};

export const getImagenes = async (pacienteId: string): Promise<Imagen[]> => {
  const imagenesRef = collection(db, "pacientes", pacienteId, "imagenes");
  const snapshot = await getDocs(imagenesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Imagen[];
};
