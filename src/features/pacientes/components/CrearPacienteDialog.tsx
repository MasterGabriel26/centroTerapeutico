import React, { useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { usePacientes } from "../hooks/usePacientes";
import { FileText, Home, Mail, Phone, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TextArea } from "../../../components/ui/TextArea";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPacienteCreado: () => void;
}

const CrearPacienteDialog: React.FC<Props> = ({ isOpen, onClose, onPacienteCreado }) => {
  const { createPaciente, loading } = usePacientes();

  const [formData, setFormData] = useState({
  nombre_completo: "",
  documento: "",
  fecha_nacimiento: "",
  direccion: "",
  telefono: "",
  email: "",
  fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
  motivo_ingreso: "",
  voluntario: false,
});


  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = "Nombre completo es requerido";
    if (!formData.documento.trim()) newErrors.documento = "Documento es requerido";
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Fecha de nacimiento es requerida";
    if (!formData.telefono.trim()) newErrors.telefono = "Teléfono es requerido";
    else if (!/^\d{7,15}$/.test(formData.telefono)) newErrors.telefono = "Teléfono no válido";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Correo electrónico no válido";
if (!formData.motivo_ingreso.trim()) newErrors.motivo_ingreso = "Motivo de ingreso requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const id = await createPaciente(formData);
    if (id) {
      onPacienteCreado();
      onClose();
      setFormData({
        nombre_completo: "",
        documento: "",
        fecha_nacimiento: "",
        motivo_ingreso: "",
        direccion: "",
        telefono: "",
        email: "",
        fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
        voluntario: false,
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Registrar nuevo paciente</h2>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4 p-6">
        <Input
          name="nombre_completo"
          label="Nombre completo"
          placeholder="Ej: Andrea Gómez"
          value={formData.nombre_completo}
          onChange={handleChange}
          leftIcon={<User size={18} className="text-gray-400" />}
          error={errors.nombre_completo}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="documento"
            label="Número de documento"
            placeholder="1032456789"
            value={formData.documento}
            onChange={handleChange}
            leftIcon={<FileText size={18} className="text-gray-400" />}
            error={errors.documento}
            required
          />

          <Input
            name="telefono"
            label="Teléfono"
            placeholder="3001234567"
            value={formData.telefono}
            onChange={handleChange}
            leftIcon={<Phone size={18} className="text-gray-400" />}
            error={errors.telefono}
            required
          />

          <Input
            name="fecha_nacimiento"
            label="Fecha de nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            leftIcon={<Calendar size={18} className="text-gray-400" />}
            error={errors.fecha_nacimiento}
            required
            max={format(new Date(), 'yyyy-MM-dd')}
          />

          <Input
            name="fecha_ingreso"
            label="Fecha de ingreso"
            type="date"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            leftIcon={<Calendar size={18} className="text-gray-400" />}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        <Input
          name="voluntario"
          label="¿Es voluntario?"
          type="checkbox"
          checked={formData.voluntario}
          onChange={handleChange}
        />
<TextArea
  name="motivo_ingreso"
  label="Motivo de ingreso"
  placeholder="Describe brevemente el motivo del ingreso"
  value={formData.motivo_ingreso}
  onChange={(e) => handleChange(e as any)}
  required
/>

        <Input
          name="direccion"
          label="Dirección"
          placeholder="Ej: Cra 45 #76-30"
          value={formData.direccion}
          onChange={handleChange}
          leftIcon={<Home size={18} className="text-gray-400" />}
        />

        <Input
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="paciente@correo.com"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail size={18} className="text-gray-400" />}
          error={errors.email}
        />
      </div>

      <div className="flex justify-end gap-3 px-6 pb-4 pt-2 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar paciente"}
        </Button>
      </div>
    </Dialog>
  );
};

export default CrearPacienteDialog;
