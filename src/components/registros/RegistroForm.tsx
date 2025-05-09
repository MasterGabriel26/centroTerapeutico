import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Camera } from 'lucide-react';

interface RegistroFormData {
  descripcion: string;
  medicamentos: string;
  comidas: string;
  peso: string;
  comportamiento: string;
  fotos: FileList | null;
}

interface RegistroFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<RegistroFormData>;
  isLoading?: boolean;
}

export const RegistroForm: React.FC<RegistroFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<RegistroFormData>({
    descripcion: initialData.descripcion || '',
    medicamentos: initialData.medicamentos || '',
    comidas: initialData.comidas || '',
    peso: initialData.peso || '',
    comportamiento: initialData.comportamiento || '',
    fotos: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, fotos: e.target.files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'fotos' && value) {
        Array.from(value).forEach((file, index) => {
          formDataToSend.append(`foto_${index}`, file);
        });
      } else {
        formDataToSend.append(key, value.toString());
      }
    });

    await onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción general
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 p-2"
            required
          />
        </div>
        
        <Input
          label="Medicamentos"
          name="medicamentos"
          value={formData.medicamentos}
          onChange={handleChange}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comidas del día
          </label>
          <textarea
            name="comidas"
            value={formData.comidas}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 p-2"
            required
          />
        </div>
        
        <Input
          label="Peso (kg)"
          type="number"
          step="0.1"
          name="peso"
          value={formData.peso}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Comportamiento"
          name="comportamiento"
          value={formData.comportamiento}
          onChange={handleChange}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotografías
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <Camera size={48} className="mx-auto text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Subir archivos</span>
                  <input
                    type="file"
                    name="fotos"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    required
                  />
                </label>
                <p className="pl-1">o arrastrar y soltar</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Guardar registro
        </Button>
      </div>
    </form>
  );
};