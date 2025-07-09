import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { PlantillaTestPsicologico, TestRealizado } from '../types/test_psicologico';
import cuestionarios from '../../../../archivos/cuestionarios_psicologicos_completos.json';

const plantillasCollection = collection(db, 'plantillas_tests_psicologicos');
const testsRealizadosCollection = collection(db, 'tests_realizados');

export const inicializarPlantillasTests = async () => {
  try {
    const snapshot = await getDocs(plantillasCollection);
    if (snapshot.empty) {
      const { cuestionarios: plantillas } = cuestionarios;
      for (const plantilla of plantillas) {
        await addDoc(plantillasCollection, plantilla);
      }
      console.log('Plantillas de tests inicializadas correctamente.');
    } else {
      console.log('Las plantillas de tests ya han sido inicializadas.');
    }
  } catch (error) {
    console.error('Error al inicializar las plantillas de tests:', error);
  }
};

export const getPlantillasTests = async (): Promise<PlantillaTestPsicologico[]> => {
  const snapshot = await getDocs(plantillasCollection);
  const plantillas = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as PlantillaTestPsicologico[];
  return plantillas;
};

export const getPlantillaTestById = async (id: string): Promise<PlantillaTestPsicologico | null> => {
  const docRef = doc(db, 'plantillas_tests_psicologicos', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PlantillaTestPsicologico;
  } else {
    return null;
  }
};

export const subscribeToTestsRealizados = (pacienteId: string, callback: (tests: TestRealizado[]) => void) => {
  const q = query(testsRealizadosCollection, where('pacienteId', '==', pacienteId));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TestRealizado[];
    callback(tests);
  });
  return unsubscribe;
};

export const getTestRealizadoById = async (id: string): Promise<TestRealizado | null> => {
  const docRef = doc(db, 'tests_realizados', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TestRealizado;
  } else {
    return null;
  }
};

export const subscribeToTestRealizado = (testId: string, callback: (test: TestRealizado | null) => void) => {
  const docRef = doc(db, 'tests_realizados', testId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as TestRealizado);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};

export const guardarTestRealizado = async (test: TestRealizado) => {
  if (test.id) {
    // Si el test ya tiene un ID, actualizamos el documento existente
    const docRef = doc(db, 'tests_realizados', test.id);
    await updateDoc(docRef, { ...test });
    return test.id;
  } else {
    // Si no tiene ID, es un nuevo test, lo añadimos
    const docRef = await addDoc(testsRealizadosCollection, test);
    return docRef.id;
  }
};
