import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AnexadoFormData {
  nombre_completo: string;
  motivo_anexo: string;
  familiar_nombre: string;
  familiar_email: string;
  familiar_telefono: string;
}

interface AnexadoFormProps {
  onSubmit: (data: AnexadoFormData) => Promise<void>;
  initialData?: Partial<AnexadoFormData>;
  isLoading?: boolean;
}

export const AnexadoForm: React.FC<AnexadoFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AnexadoFormData>({
    nombre_completo: initialData.nombre_completo || '',
    motivo_anexo: initialData.motivo_anexo || '',
    familiar_nombre: initialData.familiar_nombre || '',
    familiar_email: initialData.familiar_email || '',
    familiar_telefono: initialData.familiar_telefono || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <Input
          label="Nombre completo del paciente"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Motivo de ingreso"
          name="motivo_anexo"
          value={formData.motivo_anexo}
          onChange={handleChange}
          required
        />
        
        <div className="border-t border-gray-200 my-6 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Información del familiar responsable</h4>
          
          <Input
            label="Nombre del familiar"
            name="familiar_nombre"
            value={formData.familiar_nombre}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Correo electrónico"
            type="email"
            name="familiar_email"
            value={formData.familiar_email}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Teléfono"
            type="tel"
            name="familiar_telefono"
            value={formData.familiar_telefono}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Guardar
        </Button>
      </div>
    </form>
  );
};