export interface Medicamento {
  id?: string;
  nombre: string;
  nombreGenerico?: string;
  descripcion: string;
  categoria: 'analgesico' | 'antibiotico' | 'antiinflamatorio' | 'antidepresivo' | 'otros';
  presentacion: string;
  concentracion: string;
  laboratorio: string;
  lote: string;
  fechaCaducidad: string;
  stock: number;
  stockInicial: number; // Nuevo campo: stock inicial
  precioCompra: number;
  precioVenta: number;
  ubicacion: string;
  proveedor: string;
  fechaRegistro: string;
  requiereReceta: boolean;
  estado: 'activo' | 'inactivo' | 'caducado';
  notas?: string;
}