export interface MedicamentoReceta {
    medicamentoId: string;
    nombre: string; // Añadir este campo
    posologia: string;
    tiempoUso: string;
    cantidad: number;
    notasAdicionales: string;
    precioUnitario: number; // Añadir este campo
    subtotal: number; // Añadir este campo
}

export interface Receta {
    id?: string;
    idDoctor: string;
    motivo: string;
    medicamentos: MedicamentoReceta[];
    fecha?: Date;
    isActive: boolean;
    total: number; // Suma de todos los subtotales de medicamentos
    folio: string;
    riesgos?: string; // Campo opcional para riesgos detectados
}