export interface Medicamento {
  id?: string; // ID autogenerado por Firebase
  nombre: string;
  nombreGenerico?: string;
  descripcion: string;
  categoria: 'analgesico' | 'antibiotico' | 'antiinflamatorio' | 'antidepresivo' | 'otros';
  presentacion: string; // Tabletas, jarabe, inyección, etc.
  concentracion: string; // Ej: "500mg", "10mg/ml"
  laboratorio: string;
  lote: string;
  fechaCaducidad: string; // ISO string o Date
  stock: number;
  precioCompra: number;
  precioVenta: number;
  ubicacion: string; // Estante, armario, etc.
  proveedor: string;
  fechaRegistro: string; // ISO string o Date
  requiereReceta: boolean;
  estado: 'activo' | 'inactivo' | 'caducado';
  notas?: string;
}