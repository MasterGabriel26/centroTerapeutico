import React from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export interface FamiliarFormData {
  nombre: string;
  parentesco: string;
  telefono1: string;
  telefono2: string;
  email: string;
}

interface Props {
  onSubmit: (data: FamiliarFormData) => void;
  onCancel: () => void;
}

const AgregarFamiliarForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState<FamiliarFormData>({
    nombre: "",
    parentesco: "",
    telefono1: "",
    telefono2: "",
    email: "",
  });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  // Validar solo números en campos de teléfono
  const soloNumeros = ['telefono1', 'telefono2'];
  if (soloNumeros.includes(name)) {
    if (!/^\d*$/.test(value)) return; // evita letras
  }

  setFormData({ ...formData, [name]: value });
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-poppins">
      {/* Nombre y Parentesco */}
    
        <Input
          name="nombre"
          label="Nombre completo"
          placeholder="Ej: Juan Pérez"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <Input
          name="parentesco"
          label="Parentesco"
          placeholder="Ej: Madre, Padre, Hermano..."
          value={formData.parentesco}
          onChange={handleChange}
          required
        />
    

      {/* Correo */}
      <Input
        name="email"
        label="Correo electrónico"
        placeholder="Ej: ejemplo@correo.com"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />

      {/* Teléfonos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="telefono1"
          label="Teléfono principal"
          placeholder="Ej: 3201234567"
           inputMode="numeric"
           pattern="[0-9]*"
           type="tel"
          value={formData.telefono1}
          onChange={handleChange}
        />
        <Input
          name="telefono2"
           inputMode="numeric"
           pattern="[0-9]*"
           type="tel"
          label="Teléfono secundario"
          placeholder="Opcional"
          value={formData.telefono2}
          onChange={handleChange}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar familiar
        </Button>
      </div>
    </form>
  );
};

export default AgregarFamiliarForm;
