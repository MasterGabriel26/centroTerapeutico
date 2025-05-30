// features/pacientes/components/PacienteForm.tsx
import React, { useState } from "react";
import { Paciente } from "../types/paciente";

type PacienteFormProps = {
  onSubmit: (data: Omit<Paciente, "id" | "creado" | "estado">) => void | Promise<void>;
  initialData?: Partial<Paciente>;
  loading?: boolean;
};

const initialForm: Omit<Paciente, "id" | "creado" | "estado"> = {
  nombre: "",
  documento: "",
  fechaNacimiento: "",
  direccion: "",
  telefono: "",
  email: "",
  fechaIngreso: "",
  fechaSalida: "",
};

const PacienteForm: React.FC<PacienteFormProps> = ({
  onSubmit,
  initialData = {},
  loading = false,
}) => {
  const [form, setForm] = useState({ ...initialForm, ...initialData });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(initialForm); // Limpia el formulario
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input name="documento" value={form.documento} onChange={handleChange} placeholder="Documento" required />
      <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} required />
      <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Correo" />
      <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} required />
      <input name="fechaSalida" type="date" value={form.fechaSalida} onChange={handleChange} />
      <button type="submit" disabled={loading}>{loading ? "Agregando..." : "Agregar Paciente"}</button>
    </form>
  );
};

export default PacienteForm;
