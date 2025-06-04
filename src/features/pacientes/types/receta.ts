export interface Medicamento {
    nombre: string;
    posologia: string; // Dosis y frecuencia (ej: "500mg cada 8 horas")
}

export interface Receta {
    id?: string;
    idDoctor: string;
    motivo: string;
    medicamentos: Medicamento[]; 
    fecha?:Date;
    isActive:boolean;
}