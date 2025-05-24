"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  User,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  Users,
  Calendar,
  BadgeCheck,
  Plus,
  X,
  Eye,
  UserPlus,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "../utils/firebase"

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  telefono?: string
  tipo: "admin" | "medico" | "familiar"
  created_at: string
}

interface NewUserForm {
  nombre_completo: string
  email: string
  telefono: string
  tipo: "admin" | "medico" | "familiar"
}

const Familiares = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipo, setFilterTipo] = useState<"todos" | "familiar" | "medico" | "admin" | "nuevos">("todos")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState<NewUserForm>({
    nombre_completo: "",
    email: "",
    telefono: "",
    tipo: "familiar",
  })

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"))
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Usuario[]
        setUsuarios(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsuarios()
  }, [])

  useEffect(() => {
    if (showCreateModal || showProfileModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup function para restaurar el scroll cuando el componente se desmonte
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showCreateModal, showProfileModal])

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesTipo =
      filterTipo === "todos" ||
      (filterTipo === "nuevos" ? u.created_at === new Date().toLocaleDateString("es-MX") : u.tipo === filterTipo)

    const matchesSearch =
      u.nombre_completo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTipo && matchesSearch
  })

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const userData = {
        ...newUser,
        created_at: new Date().toLocaleDateString("es-MX"),
        created_timestamp: new Date(),
      }

      const docRef = await addDoc(collection(db, "users"), userData)
      const newUserWithId = { id: docRef.id, ...userData }

      setUsuarios((prev) => [newUserWithId, ...prev])
      setShowCreateModal(false)
      setNewUser({
        nombre_completo: "",
        email: "",
        telefono: "",
        tipo: "familiar",
      })
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setCreating(false)
    }
  }

  const verPerfil = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setShowProfileModal(true)
  }

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "admin":
        return "bg-red-50 text-red-700 border border-red-200"
      case "medico":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "familiar":
        return "bg-green-50 text-green-700 border border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case "admin":
        return <Shield className="w-3 h-3" />
      case "medico":
        return <Stethoscope className="w-3 h-3" />
      case "familiar":
        return <User className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="text-indigo-600" size={28} />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-2">Administra las cuentas registradas en el sistema</p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={20} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-6 mb-6 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {[
              { value: "todos", label: "Todos", icon: <Users size={16} />, count: usuarios.length },
              {
                value: "familiar",
                label: "Familiares",
                icon: <User size={16} />,
                count: usuarios.filter((u) => u.tipo === "familiar").length,
              },
              {
                value: "medico",
                label: "Médicos",
                icon: <Stethoscope size={16} />,
                count: usuarios.filter((u) => u.tipo === "medico").length,
              },
              {
                value: "admin",
                label: "Admins",
                icon: <Shield size={16} />,
                count: usuarios.filter((u) => u.tipo === "admin").length,
              },
              {
                value: "nuevos",
                label: "Nuevos",
                icon: <BadgeCheck size={16} />,
                count: usuarios.filter((u) => u.created_at === new Date().toLocaleDateString("es-MX")).length,
              },
            ].map((tipo) => (
              <Button
                key={tipo.value}
                variant={filterTipo === tipo.value ? "primary" : "outline"}
                onClick={() => setFilterTipo(tipo.value as any)}
                className="flex items-center gap-2 h-11"
              >
                {tipo.icon}
                {tipo.label}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    filterTipo === tipo.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tipo.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Contador de resultados */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-900">{filteredUsuarios.length}</span> de{" "}
          <span className="font-semibold text-gray-900">{usuarios.length}</span> usuarios
        </p>
      </div>

      {/* Lista de usuarios */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-3 flex-1">
                  <div className="h-5 w-[250px] bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda o crear un nuevo usuario</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 mt-4">
              <Plus size={18} />
              Crear Usuario
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsuarios.map((usuario) => (
            <Card
              key={usuario.id}
              className="p-6 hover:shadow-lg transition-all duration-200 bg-white border border-gray-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {getInitials(usuario.nombre_completo || "Usuario")}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm ${getRolColor(usuario.tipo)}`}
                    >
                      {getRolIcon(usuario.tipo)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{usuario.nombre_completo}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRolColor(usuario.tipo)}`}
                      >
                        {getRolIcon(usuario.tipo)}
                        {usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{usuario.email}</span>
                      </div>

                      {usuario.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{usuario.telefono}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Registrado: {usuario.created_at}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col lg:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => verPerfil(usuario)}
                    className="flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Perfil
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Usuario</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                <Input
                  type="text"
                  required
                  value={newUser.nombre_completo}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, nombre_completo: e.target.value }))}
                  placeholder="Ingresa el nombre completo"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico *</label>
                <Input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <Input
                  type="tel"
                  value={newUser.telefono}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, telefono: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario *</label>
                <select
                  required
                  value={newUser.tipo}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, tipo: e.target.value as "admin" | "medico" | "familiar" }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="familiar">Familiar</option>
                  <option value="medico">Médico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={creating}>
                  {creating ? "Creando..." : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver perfil de usuario */}
      {showProfileModal && selectedUser && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
    {/* Header del modal */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Perfil de Usuario</h2>
      <button
        onClick={() => setShowProfileModal(false)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>

    {/* Contenido del perfil con scroll */}
    <div className="overflow-y-auto p-5">
      {/* Avatar y nombre principal */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {getInitials(selectedUser.nombre_completo || "Usuario")}
          </div>
          <div
            className={`absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white shadow-lg ${getRolColor(selectedUser.tipo)}`}
          >
            {getRolIcon(selectedUser.tipo)}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedUser.nombre_completo}</h3>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getRolColor(selectedUser.tipo)}`}
        >
          {getRolIcon(selectedUser.tipo)}
          {selectedUser.tipo.charAt(0).toUpperCase() + selectedUser.tipo.slice(1)}
        </span>
      </div>

      {/* Información de contacto */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Información de Contacto
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Correo Electrónico</p>
                <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
              </div>
            </div>

            {selectedUser.telefono && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.telefono}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Información del Sistema
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Registro</p>
                <p className="text-sm font-medium text-gray-900">{selectedUser.created_at}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">ID de Usuario</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{selectedUser.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-600">
                {selectedUser.tipo === "familiar" ? "1" : selectedUser.tipo === "medico" ? "5+" : "10+"}
              </p>
              <p className="text-xs text-gray-600">
                {selectedUser.tipo === "familiar"
                  ? "Familiar"
                  : selectedUser.tipo === "medico"
                    ? "Pacientes"
                    : "Usuarios"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-purple-600">{Math.floor(Math.random() * 30) + 1}</p>
              <p className="text-xs text-gray-600">Días activo</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">
                {selectedUser.tipo === "admin" ? "100%" : "95%"}
              </p>
              <p className="text-xs text-gray-600">Disponibilidad</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer del modal */}
    <div className="px-5 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowProfileModal(false)} className="flex-1">
          Cerrar
        </Button>
        <Button
          onClick={() => {
            console.log("Editar usuario:", selectedUser.id)
            setShowProfileModal(false)
          }}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          Editar Usuario
        </Button>
      </div>
    </div>
  </div>
</div>
      )}
    </div>
  )
}

export default Familiares
