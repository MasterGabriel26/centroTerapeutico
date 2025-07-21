import React, { useEffect } from 'react';
import { inicializarPlantillasTests } from './features/tests_psicologicos/services/testPsicologicoService';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginForm from './components/auth/LoginForm';
import PacienteDetallePage from './features/pacientes/DetallePacientePage';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import RegistroDiario from './pages/Gastos';
import InventarioMedicamentos from './features/medicamentos/pages/inventarioMedicamentos';
import Pagos from './pages/Pagos';
import FamiliarPage from './features/familiar/pages/FamiliarPage';
import PacientesList from '../src/features/pacientes/PacientesPage'; // Asegúrate de que la ruta sea correcta
import PagosPage from '../src/features/pagos/PagosPage';
// Logo para preloader
import { Activity } from 'lucide-react';
import Familiares from './pages/Usuarios';
import RegisterForm from './components/auth/RegisterForm';
import Gastos from './pages/Gastos';
import CrearPacientePage from './features/pacientes/pages/CrearPacientePage';
import PublicTestPage from './pages/PublicTestPage';
import TestEvaluationPage from './pages/TestEvaluationPage';
import TestResultPdfPage from './features/tests_psicologicos/pages/TestResultPdfPage';
import InventarioDepresionPdfPage from './features/tests_psicologicos/pages/InventarioDepresionPdfPage';
import InfoGeneralPdf from './features/pacientes/pages/InfoGeneralPdf';
import FamiliaresPdfPage from './features/pacientes/pages/FamiliaresPdfPage';
import CuentasPdfPage from './features/pacientes/pages/CuentasPdfPage';
import IngresosPdfPage from './features/pacientes/pages/IngresosPdfPage';
import NovedadesPdfPage from './features/pacientes/pages/NovedadesPdfPage';
import RecetasPdfPage from './features/pacientes/pages/RecetasPdfPage';
import SeguimientosPdfPage from './features/pacientes/pages/SeguimientosPdfPage';
import VisitasPdfPage from './features/pacientes/pages/VisitasPdfPage';
import SuperPdfPage from './features/pacientes/pages/SuperPdfPage';

const App: React.FC = () => {
  const { usuario, isLoading, checkSession } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkSession();
    inicializarPlantillasTests();
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
        // Si el usuario no está autenticado y no está en login, register o la página de test, redirigirlo a login
        if (location.pathname !== '/login' && location.pathname !== '/register' && !location.pathname.startsWith('/test/')) {
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

      {/* Ruta pública para realizar tests */}
      <Route path="/test/:testId" element={<PublicTestPage />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          usuario ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="pacientes" element={<PacientesList />} />
        <Route path="pacientes/nuevo" element={<CrearPacientePage />} />
        <Route path="pacientes/:id/editar" element={<CrearPacientePage />} />
        <Route path="/pacientes/:id" element={<PacienteDetallePage />} />
<Route path="medicamentos" element={<InventarioMedicamentos />} />
        <Route path="cuentasDeCobro" element={<PagosPage />} />
        <Route path="familiares" element={<Familiares />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="mi-familiar" element={<FamiliarPage />} />
        <Route path="/test-evaluation/:testId" element={<TestEvaluationPage />} />
        <Route path="/test-results/:testId" element={<TestResultPdfPage />} />
        <Route path="/test-depresion-results/:testId" element={<InventarioDepresionPdfPage />} />
        <Route path="/pacientes/:pacienteId/pdf" element={<InfoGeneralPdf />} />
        <Route path="/pacientes/:pacienteId/familiares/pdf" element={<FamiliaresPdfPage />} />
        <Route path="/pacientes/:pacienteId/cuentas/pdf" element={<CuentasPdfPage />} />
        <Route path="/pacientes/:pacienteId/ingresos/pdf" element={<IngresosPdfPage />} />
        <Route path="/pacientes/:pacienteId/novedades/pdf" element={<NovedadesPdfPage />} />
        <Route path="/pacientes/:pacienteId/recetas/pdf" element={<RecetasPdfPage />} />
        <Route path="/pacientes/:pacienteId/seguimientos/pdf" element={<SeguimientosPdfPage />} />
        <Route path="/pacientes/:pacienteId/visitas/pdf" element={<VisitasPdfPage />} />
        <Route path="/pacientes/:id/super-pdf" element={<SuperPdfPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Route>
    </Routes>
  );
};

export default App;