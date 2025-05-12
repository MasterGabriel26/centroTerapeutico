import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { uploadPacienteImage } from './uploadPacienteImage';

interface PacienteFormData {
  nombre_completo: string;
  motivo_anexo: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  imagen_url?: string;
  imagen_archivo?: File | null;
}

interface PacienteFormProps {
  onSubmit: (data: PacienteFormData) => Promise<void>;
  initialData?: Partial<PacienteFormData>;
  isLoading?: boolean;
}

export const PacienteForm: React.FC<PacienteFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PacienteFormData>({
    nombre_completo: initialData.nombre_completo || '',
    motivo_anexo: initialData.motivo_anexo || '',
    fecha_ingreso: initialData.fecha_ingreso || format(new Date(), 'dd/MM/yyyy'),
    fecha_salida: initialData.fecha_salida || '',
    imagen_url: initialData.imagen_url || '',
    imagen_archivo: null,
  });

  const [showIngreso, setShowIngreso] = useState(false);
  const [showSalida, setShowSalida] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, imagen_archivo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = formData.imagen_url || '';
    if (formData.imagen_archivo) {
      finalImageUrl = await uploadPacienteImage(formData.imagen_archivo);
    }

    await onSubmit({
      ...formData,
      imagen_url: finalImageUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-1 sm:px-2">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso</label>
        <button
          type="button"
          onClick={() => setShowIngreso(!showIngreso)}
          className="w-full px-3 py-2 border rounded-md text-left text-sm"
        >
          <Calendar size={16} className="inline mr-2 text-gray-500" />
          {formData.fecha_ingreso}
        </button>
        {showIngreso && (
          <div className="bg-white shadow rounded-md p-3 mt-2">
            <DayPicker
              mode="single"
              onSelect={(date) => {
                if (date) {
                  setFormData((prev) => ({
                    ...prev,
                    fecha_ingreso: format(date, 'dd/MM/yyyy'),
                  }));
                  setShowIngreso(false);
                }
              }}
              locale={es}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de salida (opcional)</label>
        <button
          type="button"
          onClick={() => setShowSalida(!showSalida)}
          className="w-full px-3 py-2 border rounded-md text-left text-sm"
        >
          <Calendar size={16} className="inline mr-2 text-gray-500" />
          {formData.fecha_salida || 'Seleccionar fecha'}
        </button>
        {showSalida && (
          <div className="bg-white shadow rounded-md p-3 mt-2">
            <DayPicker
              mode="single"
              onSelect={(date) => {
                if (date) {
                  setFormData((prev) => ({
                    ...prev,
                    fecha_salida: format(date, 'dd/MM/yyyy'),
                  }));
                  setShowSalida(false);
                }
              }}
              locale={es}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del paciente</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-primary-100 file:text-primary-800"
        />
        {formData.imagen_archivo && (
          <img
            src={URL.createObjectURL(formData.imagen_archivo)}
            alt="Vista previa"
            className="mt-3 w-full rounded-md border max-h-56 object-cover"
          />
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Guardar
        </Button>
      </div>
    </form>
  );
};
