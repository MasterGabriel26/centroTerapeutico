export interface Novedad {
    id?: string;
    idDoctor: string;
    descripcion: string;
    evidencia: string[]; 
    fecha?:Date;
    gravedad:string;
    isActive:boolean;
}