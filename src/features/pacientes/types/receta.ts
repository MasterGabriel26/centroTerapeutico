export interface Medicamento {
    nombre: string;
    uso: string; // Indicación o propósito del medicamento
    posologia: string; // Dosis y frecuencia (ej: "500mg cada 8 horas")
    tiempoUso: string; // Duración del tratamiento (ej: "7 días", "1 mes")
    cantidadPorCaja: number; // Cantidad de unidades por caja
    cajas: number; // Número de cajas prescritas
    costoPorCaja: number; // Precio por caja
    subtotal: number; // cajas * costoPorCaja
    contraindicaciones: string; // Advertencias o precauciones
    notasAdicionales: string; // Observaciones adicionales
}

export interface Receta {
    id?: string;
    idDoctor: string;
    motivo: string;
    medicamentos: Medicamento[];
    fecha?: Date;
    isActive: boolean;
    total: number; // Suma de todos los subtotales de medicamentos
    folio:string;
}