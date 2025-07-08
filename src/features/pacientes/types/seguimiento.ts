export interface Seguimiento {
  id?: string;
  urls: string[];  // Cambiamos de 'url' a 'urls' como array
  idDoctor: string;
  descripcion: string;
  fecha: string;
  comportamiento: string;
  isActive: boolean;
}