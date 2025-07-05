import React from 'react';
import { Medicamento } from '../types/medicamento';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { TextArea } from '../../../components/ui/TextArea';
import { AlertTriangle } from 'lucide-react';

const categorias = [
  { value: 'analgesico', label: 'Analgésico' },
  { value: 'antibiotico', label: 'Antibiótico' },
  { value: 'antiinflamatorio', label: 'Antiinflamatorio' },
  { value: 'antidepresivo', label: 'Antidepresivo' },
  { value: 'otros', label: 'Otros' }
];

const presentaciones = [
  { value: 'tabletas', label: 'Tabletas' },
  { value: 'capsulas', label: 'Cápsulas' },
  { value: 'jarabe', label: 'Jarabe' },
  { value: 'inyeccion', label: 'Inyección' },
  { value: 'crema', label: 'Crema' },
  { value: 'supositorio', label: 'Supositorio' },
  { value: 'polvo', label: 'Polvo' },
  { value: 'suspension', label: 'Suspensión' }
];

interface MedicamentoFormProps {
  onSubmit: (data: Omit<Medicamento, 'id' | 'fechaRegistro' | 'estado'>) => void;
  onCancel: () => void;
  initialData?: Partial<Medicamento>;
}

export const MedicamentoForm: React.FC<MedicamentoFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialData 
}) => {
  const [formData, setFormData] = React.useState({
    nombre: initialData?.nombre || '',
    nombreGenerico: initialData?.nombreGenerico || '',
    descripcion: initialData?.descripcion || '',
    categoria: initialData?.categoria || 'analgesico',
    presentacion: initialData?.presentacion || 'tabletas',
    concentracion: initialData?.concentracion || '',
    laboratorio: initialData?.laboratorio || '',
    lote: initialData?.lote || '',
    fechaCaducidad: initialData?.fechaCaducidad || '',
    stock: initialData?.stock || 0,
    precioCompra: initialData?.precioCompra || 0,
    precioVenta: initialData?.precioVenta || 0,
    ubicacion: initialData?.ubicacion || '',
    proveedor: initialData?.proveedor || '',
    requiereReceta: initialData?.requiereReceta || false,
    notas: initialData?.notas || ''
  });

  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.stock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }
    
    if (new Date(formData.fechaCaducidad) < new Date()) {
      setError('La fecha de caducidad no puede ser anterior a hoy');
      return;
    }
    
    setError(null);
    onSubmit(formData);
  };

  return (
    <div className="max-h-[80vh] flex flex-col">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Registrar Nuevo Medicamento</h2>
      </div>
      
      <div className="overflow-y-auto p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 flex-shrink-0" size={16} />
              <div>{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Comercial*"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Nombre Genérico"
              value={formData.nombreGenerico}
              onChange={(e) => setFormData({...formData, nombreGenerico: e.target.value})}
              className="bg-gray-50"
            />
            
            <Select
              label="Categoría*"
              options={categorias}
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value as any})}
              className="bg-gray-50"
              required
            />
            
            <Select
              label="Presentación*"
              options={presentaciones}
              value={formData.presentacion}
              onChange={(e) => setFormData({...formData, presentacion: e.target.value as any})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Concentración*"
              value={formData.concentracion}
              onChange={(e) => setFormData({...formData, concentracion: e.target.value})}
              placeholder="Ej: 500mg, 10mg/ml"
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Laboratorio*"
              value={formData.laboratorio}
              onChange={(e) => setFormData({...formData, laboratorio: e.target.value})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Lote*"
              value={formData.lote}
              onChange={(e) => setFormData({...formData, lote: e.target.value})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Fecha Caducidad*"
              type="date"
              value={formData.fechaCaducidad}
              onChange={(e) => setFormData({...formData, fechaCaducidad: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Stock Inicial*"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Precio Compra*"
              type="number"
              min="0"
              step="0.01"
              value={formData.precioCompra}
              onChange={(e) => setFormData({...formData, precioCompra: Number(e.target.value)})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Precio Venta*"
              type="number"
              min="0"
              step="0.01"
              value={formData.precioVenta}
              onChange={(e) => setFormData({...formData, precioVenta: Number(e.target.value)})}
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Ubicación*"
              value={formData.ubicacion}
              onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
              placeholder="Ej: Estante A-2"
              className="bg-gray-50"
              required
            />
            
            <Input
              label="Proveedor*"
              value={formData.proveedor}
              onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
              className="bg-gray-50"
              required
            />
          </div>
          
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="requiereReceta"
              checked={formData.requiereReceta}
              onChange={(e) => setFormData({...formData, requiereReceta: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiereReceta" className="ml-2 text-sm text-gray-700">
              ¿Requiere receta médica?
            </label>
          </div>
          
          <TextArea
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            rows={3}
            className="bg-gray-50"
          />
          
          <TextArea
            label="Notas Adicionales"
            value={formData.notas}
            onChange={(e) => setFormData({...formData, notas: e.target.value})}
            rows={2}
            className="bg-gray-50"
          />
        </form>
      </div>
      
      <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          onClick={handleSubmit}
          className="px-6 py-2"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
};