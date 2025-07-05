// services/recetas.ts
import { db } from '../../../utils/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Receta, MedicamentoReceta } from '../types/receta';
import { Medicamento } from '../../medicamentos/types/medicamento';

// Función auxiliar para obtener información de medicamentos
async function getMedicamentoInfo(medicamentoId: string): Promise<Medicamento> {
  const medicamentoDoc = await getDoc(doc(db, 'medicamentos', medicamentoId));
  if (!medicamentoDoc.exists()) {
    throw new Error(`Medicamento con ID ${medicamentoId} no encontrado`);
  }
  return {
    id: medicamentoDoc.id,
    ...medicamentoDoc.data()
  } as Medicamento;
}
export const addReceta = async (pacienteId: string, data: Receta) => {
    const recetasRef = collection(db, `pacientes/${pacienteId}/recetas`);
    
    // Calcular el total sumando los precios de los medicamentos
    let total = 0;
    const medicamentosConInfo = await Promise.all(
        data.medicamentos.map(async (med) => {
            const medicamentoInfo = await getMedicamentoInfo(med.medicamentoId);
            const subtotal = medicamentoInfo.precioVenta * med.cantidad;
            total += subtotal;
            
            return {
                ...med,
                nombre: medicamentoInfo.nombre, // Guardamos el nombre para fácil referencia
                precioUnitario: medicamentoInfo.precioVenta,
                subtotal
            };
        })
    );
    
    const docRef = await addDoc(recetasRef, {
        ...data,
        medicamentos: medicamentosConInfo,
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
            idDoctor: data.idDoctor,
            motivo: data.motivo,
            medicamentos: data.medicamentos.map((med: any) => ({
                medicamentoId: med.medicamentoId,
                nombre: med.nombre, // Nombre guardado para referencia
                posologia: med.posologia,
                tiempoUso: med.tiempoUso,
                cantidad: med.cantidad,
                precioUnitario: med.precioUnitario,
                subtotal: med.subtotal,
                notasAdicionales: med.notasAdicionales
            })),
            fecha: data.fecha?.toDate() || null,
            isActive: data.isActive,
            total: data.total,
            folio: data.folio
        } as Receta;
    });
};