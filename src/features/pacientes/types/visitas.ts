export interface Visita {
    id?: string;                    
    fecha: Date;  
    visitantes: Visitante[];
    duracion?: number;               
    observaciones?: string;          
    registradoPor: string;           
}

export interface Visitante {
    id?: string;
    nombre: string;
    parentesco: string; 
    telefono: string;
}