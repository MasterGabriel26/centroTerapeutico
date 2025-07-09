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



// services/recetas.ts
function generarFolioSimple(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 caracteres aleatorios
  
  return `R${year}${month}${day}-${randomChars}`;
}

// services/recetaService.ts
export const addReceta = async (pacienteId: string, data: Omit<Receta, 'id' | 'fecha' | 'folio'>) => {
    try {
        const recetasRef = collection(db, `pacientes/${pacienteId}/recetas`);
        
        // 1. Generar folio
        const timestamp = new Date().getTime().toString();
        const randomPart = Math.floor(Math.random() * 900) + 100; // 100-999
        const folio = `REC-${timestamp.slice(-6)}-${randomPart}`;
        
        console.log('Generando folio:', folio); // Debug
        
        // 2. Calcular total y procesar medicamentos
        let total = 0;
        const medicamentosConInfo = await Promise.all(
            data.medicamentos.map(async (med) => {
                const medicamentoInfo = await getMedicamentoInfo(med.medicamentoId);
                const subtotal = medicamentoInfo.precioVenta * med.cantidad;
                total += subtotal;
                
                return {
                    ...med,
                    nombre: medicamentoInfo.nombre,
                    precioUnitario: medicamentoInfo.precioVenta,
                    subtotal
                };
            })
        );
        
        // 3. Preparar datos completos
        const recetaCompleta = {
            ...data,
            medicamentos: medicamentosConInfo,
            total,
            fecha: new Date(),
            isActive: true,
            folio,
            riesgos: data.riesgos || '' // Incluir riesgos si existe, sino cadena vacía
        };
        
        console.log('Datos completos de receta:', recetaCompleta); // Debug
        
        // 4. Crear documento
        const docRef = await addDoc(recetasRef, recetaCompleta);
        
        console.log('Receta creada con ID:', docRef.id); // Debug
        
        return docRef.id;
    } catch (error) {
        console.error('Error en addReceta:', error);
        throw error;
    }
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
            folio: data.folio,
            riesgos: data.riesgos || '' // Incluir riesgos si existe, sino cadena vacía
        } as Receta;
    });
};