import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileText } from 'lucide-react';

interface PagoFormData {
  monto: string;
  metodo_pago: 'efectivo' | 'transferencia';
  comprobante?: File | null;
}

interface PagoFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<PagoFormData>;
  isLoading?: boolean;
}

export const PagoForm: React.FC<PagoFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PagoFormData>({
    monto: initialData.monto || '',
    metodo_pago: initialData.metodo_pago || 'efectivo',
    comprobante: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, comprobante: e.target.files?.[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('monto', formData.monto);
    formDataToSend.append('metodo_pago', formData.metodo_pago);
    if (formData.comprobante) {
      formDataToSend.append('comprobante', formData.comprobante);
    }

    await onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Monto"
        type="number"
        name="monto"
        value={formData.monto}
        onChange={handleChange}
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Método de pago
        </label>
        <select
          name="metodo_pago"
          value={formData.metodo_pago}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 p-2"
          required
        >
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comprobante de pago
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <FileText size={48} className="mx-auto text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                <span>Subir comprobante</span>
                <input
                  type="file"
                  name="comprobante"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={formData.metodo_pago === 'transferencia'}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Registrar pago
        </Button>
      </div>
    </form>
  );
};