"use client"
import React from "react";

import { useState, useRef, useEffect } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  Users,
  ClipboardList,
  CreditCard,
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  PersonStandingIcon,
  ChevronDown,
  ChevronUp,
  Home,
  Calendar,
  FileText,
  Bell,
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { Button } from "../ui/Button"
import LOGO from "../../../public/logo_sin_fondo.png"


const DashboardLayout: React.FC = () => {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const isMedico = usuario?.tipo === "medico"
  const isAdmin = usuario?.tipo === "admin"
  const isFamiliar = usuario?.tipo === "familiar"

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "admin":
        return "Administrador"
      case "medico":
        return "Médico"
      case "familiar":
        return "Familiar"
      default:
        return tipo
    }
  }

  const getTypeBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "medico":
        return "bg-blue-100 text-blue-800"
      case "familiar":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

 const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
      ${
        isActive
          ? "bg-primary-50 text-primary-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }
    `}
    onClick={() => setMobileMenuOpen(false)}
  >
    {({ isActive }) => (
      <>
        <span className={`flex-shrink-0 ${isActive ? "text-primary-600" : "text-gray-500"}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </span>
        <span className="truncate">{label}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-6 bg-primary-600 rounded-l-full"></span>
        )}
      </>
    )}
  </NavLink>
);

const UserDropdown = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div className="relative" ref={userMenuRef}>
    <button
      onClick={() => setUserMenuOpen(!userMenuOpen)}
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg transition-colors
        ${userMenuOpen ? "bg-gray-50" : "hover:bg-gray-50"}
        ${isMobile ? "border-b border-gray-200 mb-4" : ""}
      `}
      aria-expanded={userMenuOpen}
      aria-haspopup="true"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
        {usuario?.nombre_completo?.charAt(0) || "U"}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nombre_completo || "Usuario"}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(usuario?.tipo || "")}`}
          >
            {getTypeLabel(usuario?.tipo || "")}
          </span>
        </div>
      </div>
      {userMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>

    {userMenuOpen && (
      <div
        className={`
          absolute ${isMobile ? "relative mt-2" : "top-full left-0 right-0 mt-2"}
          bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 w-full
        `}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nombre_completo}</p>
          <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
        </div>

        <button
          onClick={() => {
            navigate("/perfil")
            setUserMenuOpen(false)
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <UserIcon size={16} className="text-gray-500" />
          <span>Mi perfil</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              navigate("/configuracion")
              setUserMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings size={16} className="text-gray-500" />
            <span>Configuración</span>
          </button>
        )}

        <div className="border-t border-gray-100 mt-1 pt-1">
          <button
            onClick={() => {
              handleLogout()
              setUserMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} className="text-red-500" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    )}
  </div>
)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
     {/* Sidebar - Desktop */}
{/* Sidebar - Desktop */}
<aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 fixed h-full z-20">
  {/* Header del Sidebar */}
  <div className="px-6 py-5 border-b border-gray-200">
    <div className="flex items-center gap-3">
      <img 
        src={LOGO} 
        alt="Logo Centro Terapéutico" 
        className="w-10 h-10 object-contain"
      />
      <div>
        <h1 className="text-lg font-bold text-gray-900">Centro Terapéutico</h1>
        <p className="text-xs text-gray-500">Sistema de gestión integral</p>
      </div>
    </div>
  </div>

  {/* Perfil del Usuario */}
  <div className="px-4 py-4 border-b border-gray-200">
    <UserDropdown />
  </div>

  {/* Navegación - Esta es la versión activa */}
  <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
    <div className="mb-4">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Navegación principal
      </h3>
      {!isFamiliar && <NavItem to="/dashboard" icon={<BarChart2 />} label="Dashboard" />}
      {(isAdmin || isMedico) && (
        <NavItem to="/pacientes" icon={<Users />} label="Pacientes" />
      )}
      {isAdmin && (
        <>
          <NavItem to="/familiares" icon={<PersonStandingIcon />} label="Usuarios" />
          <NavItem to="/gastos" icon={<ClipboardList />} label="Gastos" />
          <NavItem to="pacientesList" icon={<ClipboardList size={20} />} label="Pacientes list" />
            <NavItem to="cuentasDeCobro" icon={<ClipboardList size={20} />} label="Cuentas de cobro" />
        </>
      )}
      {isFamiliar && <NavItem to="/mi-familiar" icon={<UserIcon />} label="Mi Familiar" />}
      {(isAdmin || isFamiliar) && <NavItem to="/pagos" icon={<CreditCard />} label="Pagos" />}
    </div>
  </nav>

  {/* Footer del Sidebar */}
  <div className="px-4 py-4 border-t border-gray-200 mt-auto">
    <Button 
      variant="outline" 
      size="sm" 
      fullWidth 
      onClick={handleLogout} 
      className="text-gray-700 hover:bg-gray-100 justify-start gap-2"
    >
      <LogOut size={16} />
      Cerrar sesión
    </Button>
  </div>
</aside>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src={LOGO} 
            alt="Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-lg font-bold text-gray-900">Centro Terapéutico</h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed inset-0 z-20 transition-opacity duration-300
          ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <div 
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)} 
        />

        <div
          className={`
            absolute top-0 left-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform duration-300 overflow-y-auto
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="px-6 py-6 border-b border-gray-200 mt-16">
            <UserDropdown isMobile />
          </div>

          <nav className="px-4 py-6 space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Navegación
            </h3>

            {!isFamiliar && <NavItem to="/dashboard" icon={<BarChart2 />} label="Dashboard" />}

            {(isAdmin || isMedico) && (
              <>
                <NavItem to="/pacientes" icon={<Users />} label="Pacientes" />
                <NavItem to="/familiares" icon={<PersonStandingIcon />} label="Familiares" />
                <NavItem to="/gastos" icon={<ClipboardList />} label="Gastos" />
              </>
            )}

            {isFamiliar && <NavItem to="/mi-familiar" icon={<UserIcon />} label="Mi Familiar" />}

            {(isAdmin || isFamiliar) && <NavItem to="/pagos" icon={<CreditCard />} label="Pagos" />}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavItem to="/" icon={<Home />} label="Inicio" />
             
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        <div className="pt-16 lg:pt-6 pb-6 min-h-screen">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout