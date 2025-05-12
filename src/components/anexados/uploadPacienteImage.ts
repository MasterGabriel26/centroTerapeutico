// src/lib/uploadPacienteImage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../utils/firebase';

export const uploadPacienteImage = async (file: File): Promise<string> => {
  const fileRef = ref(storage, `pacientes/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};
