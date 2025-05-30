import React, { useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { usePacientes } from "../hooks/usePacientes";
import { FileText, Home, Mail, Phone, User } from "lucide-react";

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
    fecha_ingreso: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const id = await createPaciente(formData);
    if (id) {
      onPacienteCreado();
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="🩺 Registrar paciente">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 font-poppins">
        {/* Nombre completo - ancho completo */}
        <div className="md:col-span-2">
          <Input
            name="nombre_completo"
            label="Nombre completo"
            placeholder="Ej: Andrea Gómez"
            value={formData.nombre_completo}
            onChange={handleChange}
            leftIcon={<User size={18} />}
          />
        </div>

        <Input
          name="documento"
          label="Documento"
          placeholder="1032456789"
          value={formData.documento}
          onChange={handleChange}
          leftIcon={<FileText size={18} />}
        />

        <Input
          name="telefono"
          label="Teléfono"
          placeholder="3001234567"
          value={formData.telefono}
          onChange={handleChange}
          leftIcon={<Phone size={18} />}
        />

        {/* SIN íconos en campos de fecha para evitar errores visuales */}
        <Input
          name="fecha_nacimiento"
          label="Fecha de nacimiento"
          type="date"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
        />

        <Input
          name="fecha_ingreso"
          label="Fecha de ingreso"
          type="date"
          value={formData.fecha_ingreso}
          onChange={handleChange}
        />

        {/* Dirección - ancho completo */}
        <div className="md:col-span-2">
          <Input
            name="direccion"
            label="Dirección"
            placeholder="Ej: Cra 45 #76-30"
            value={formData.direccion}
            onChange={handleChange}
            leftIcon={<Home size={18} />}
          />
        </div>

        {/* Email - ancho completo */}
        <div className="md:col-span-2">
          <Input
            name="email"
            label="Correo electrónico"
            type="email"
            placeholder="paciente@correo.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail size={18} />}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 pb-4 pt-2">
        <Button variant="outline" onClick={onClose} className="text-[#0F4C81] border-[#0F4C81]">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={loading} className="bg-[#2A93C9] hover:bg-[#1E88E5] text-white">
          Guardar paciente
        </Button>
      </div>
    </Dialog>
  );
};

export default CrearPacienteDialog;
