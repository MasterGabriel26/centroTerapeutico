// services/recetas.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Receta,Medicamento } from '../types/receta';

export const addReceta = async (pacienteId: string, data: Receta) => {
  const recetasRef = collection(db, `pacientes/${pacienteId}/recetas`);
  
  // Calcular el total sumando todos los subtotales de medicamentos
  const total = data.medicamentos.reduce((sum, med) => sum + (med.subtotal || 0), 0);
  
  const docRef = await addDoc(recetasRef, {
    ...data,
    total,
    fecha: new Date(), // Fecha de creación automática
    isActive: true // Por defecto activa
  });
  
  return docRef.id;
};

export const getRecetas = async (pacienteId: string, options?: {
  activeOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}): Promise<Receta[]> => {
  let recetasQuery = collection(db, `pacientes/${pacienteId}/recetas`);
  
  // Construir consulta con filtros opcionales
  const queryConstraints = [];
  
  if (options?.activeOnly) {
    queryConstraints.push(where('isActive', '==', true));
  }
  
  if (options?.startDate) {
    queryConstraints.push(where('fecha', '>=', options.startDate));
  }
  
  if (options?.endDate) {
    queryConstraints.push(where('fecha', '<=', options.endDate));
  }
  
  // Aplicar los filtros si existen
  if (queryConstraints.length > 0) {
    recetasQuery = query(recetasQuery, ...queryConstraints);
  }
  
  const snapshot = await getDocs(recetasQuery);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convertir Firestore Timestamp a Date si existe
      fecha: data.fecha?.toDate() || null,
      // Asegurar que medicamentos tenga todos los campos
      medicamentos: data.medicamentos.map((med: any) => ({
        nombre: med.nombre || '',
        uso: med.uso || '',
        posologia: med.posologia || '',
        tiempoUso: med.tiempoUso || '',
        cantidadPorCaja: med.cantidadPorCaja || 0,
        cajas: med.cajas || 0,
        costoPorCaja: med.costoPorCaja || 0,
        subtotal: med.subtotal || 0,
        contraindicaciones: med.contraindicaciones || '',
        notasAdicionales: med.notasAdicionales || ''
      })) as Medicamento[],
      total: data.total || 0
    } as Receta;
  });
};