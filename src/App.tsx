import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginForm from './components/auth/LoginForm';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import RegistroDiario from './pages/Gastos';
import Pagos from './pages/Pagos';
import FamiliarView from './pages/FamiliarView';

// Logo para preloader
import { Activity } from 'lucide-react';
import Familiares from './pages/Familiares';
import RegisterForm from './components/auth/RegisterForm';
import Gastos from './pages/Gastos';
import PagosFamiliarView from './pages/PagosFamiliarView';

const App: React.FC = () => {
  const { usuario, isLoading, checkSession } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (usuario) {
        // Si el usuario está autenticado y está en la página de login, redirigirlo al dashboard
        if (location.pathname === '/login') {
          if (usuario.tipo === 'familiar') {
            navigate('/mi-familiar');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        // Si el usuario no está autenticado y no está en login, redirigirlo a login
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
        }        
      }
    }
  }, [usuario, isLoading, location.pathname]);

  // Preloader mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Activity size={48} className="text-primary-600 animate-pulse" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} /> 
      </Route>

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          usuario ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="familiares" element={<Familiares />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="pagos_familiar" element={<PagosFamiliarView />} />
        <Route path="mi-familiar" element={<FamiliarView usuarioId={usuario?.id} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;