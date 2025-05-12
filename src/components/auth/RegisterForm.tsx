// src/components/auth/RegisterForm.tsx
import React, { useState } from "react";
import { Mail, Lock, User, AlertCircle, PhoneIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const ladaOptions = ["+52", "+1", "+34", "+44"];
const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const errorFromStore = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    lada: "+52",
    telefono: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    if (!form.nombre.trim()) {
      setLocalError("El nombre es obligatorio");
      return;
    }
    if (!/^[0-9]+$/.test(form.telefono)) {
      setLocalError("Teléfono inválido");
      return;
    }
    const telefonoCompleto = `${form.lada}${form.telefono}`;
    await register(form.email, form.password, form.nombre, telefonoCompleto);
    // tras registro, redirige al login
    navigate("/login");
  };

  const errorMessage = localError || errorFromStore;

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Crear Cuenta</h2>
        {errorMessage && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-error-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-700">{errorMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="nombre"
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={form.nombre}
            onChange={handleChange}
            leftIcon={<User size={18} />}
            required
          />
          <p className="mb-0 pb-0">Telefono</p>
          <div className="flex space-x-2 mt-0 pt-0" style={{margin: 0}}>
            <select
              name="lada"
              value={form.lada}
              onChange={handleChange}
              className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm"
            >
              {ladaOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <Input
              name="telefono"
              type="tel"
              label=""
              placeholder="1234567890"
              value={form.telefono}
              onChange={handleChange}
              leftIcon={<PhoneIcon size={18} />}
              required
            />
          </div>
          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={handleChange}
            leftIcon={<Mail size={18} />}
            required
          />
          <Input
            name="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            leftIcon={<Lock size={18} />}
            required
          />
          <Input
            name="confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            leftIcon={<Lock size={18} />}
            required
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Registrar Familiar
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default RegisterForm;
