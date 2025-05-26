import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  ClipboardList, 
  CreditCard, 
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  PersonStandingIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import LOGO from "../../../public/logo_sin_fondo.png"


const DashboardLayout: React.FC = () => {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isMedico = usuario?.tipo === 'medico';
  const isAdmin = usuario?.tipo === 'admin';
  const isFamiliar = usuario?.tipo === 'familiar';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
        ${isActive 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
      onClick={() => setMobileMenuOpen(false)}
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center">
            <img 
              src={LOGO} 
              className='w-[50px]'
            />
            {/* <h1 className="text-xl font-bold">Centro terapéutico</h1> */}
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {!isFamiliar && <NavItem to="/dashboard" icon={<BarChart2 size={20} />} label="Dashboard" />}
          
          {(isAdmin || isMedico) && (
            <>
              <NavItem to="/pacientes" icon={<Users size={20} />} label="Pacientes" />
              <NavItem to="/familiares" icon={<PersonStandingIcon size={20} />} label="Familiares" />
              <NavItem to="/gastos" icon={<ClipboardList size={20} />} label="Gastos" />
                 <NavItem to="pacientesList" icon={<ClipboardList size={20} />} label="Pacientes list" />
                
            </>
          )}

          {isFamiliar && (
            <NavItem to="/mi-familiar" icon={<User size={20} />} label="Mi Familiar" />
          )}
          
          {(isAdmin || isFamiliar) && (
            <NavItem to="/pagos" icon={<CreditCard size={20} />} label="Pagos" />
          )}
          
          {/* {isAdmin && (
            <NavItem to="/configuracion" icon={<Settings size={20} />} label="Configuración" />
          )} */}
        </nav>
        
        <div className="px-4 py-6 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {usuario?.nombre_completo?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{usuario?.nombre_completo}</p>
              <p className="text-xs text-gray-500">{usuario?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            fullWidth 
            onClick={handleLogout}
            icon={<LogOut size={16} />}
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-primary-600 mr-2" />
          <h1 className="text-lg font-bold">Centro terapéutico</h1>
        </div>
        
        <button onClick={toggleMobileMenu} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-0 z-10 transition-opacity duration-300
        ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <div 
          className="absolute inset-0 bg-gray-900 bg-opacity-50" 
          onClick={() => setMobileMenuOpen(false)}
        /> 
        
        <div className={`
          absolute top-0 left-0 bottom-0 w-64 bg-white transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="px-6 py-6 border-b border-gray-200 mt-12">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {usuario?.nombre_completo?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{usuario?.nombre_completo}</p>
                <p className="text-xs text-gray-500">{usuario?.tipo}</p>
              </div>
            </div>
          </div>
          
          <nav className="px-4 py-6 space-y-1 overflow-y-auto">
            {!isFamiliar && <NavItem to="/dashboard" icon={<BarChart2 size={20} />} label="Dashboard" />}
            
            {(isAdmin || isMedico) && (
              <>
                <NavItem to="/anexados" icon={<Users size={20} />} label="Anexados" />
                <NavItem to="/registros" icon={<ClipboardList size={20} />} label="Registros" />
              </>
            )}

            {isFamiliar && (
              <NavItem to="/mi-familiar" icon={<User size={20} />} label="Mi Familiar" />
            )}
            
            {(isAdmin || isFamiliar) && (
              <NavItem to="/pagos" icon={<CreditCard size={20} />} label="Pagos" />
            )}
            
            {isAdmin && (
              <NavItem to="/configuracion" icon={<Settings size={20} />} label="Configuración" />
            )}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 px-4 py-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="sm" 
              fullWidth 
              onClick={handleLogout}
              icon={<LogOut size={16} />}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;