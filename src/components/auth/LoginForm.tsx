import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);

    // La redirección se manejará en el componente principal App.tsx
    // después de verificar la autenticación
  };

  return (
    <Card className="w-full">
      <div className="px-6 pt-6 pb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Ingrese sus credenciales para acceder al sistema
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-error-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            id="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
            leftIcon={<Mail size={18} />}
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            leftIcon={<Lock size={18} />}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <p className="mt-4 text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary-600">
            Regístrate
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginForm;
