"use client"

import React, { useState, useEffect } from "react"
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
  Loader,
} from "lucide-react"
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db,auth,app,functions } from "../utils/firebase"
import {  onAuthStateChanged } from "firebase/auth"
import { apiCall } from '../utils/api';


interface Paciente {
  id: string
  nombre_completo: string
  documento: string
  email: string
  telefono: string
}

interface Usuario {
  id: string
  nombre_completo: string
  email: string
  telefono?: string
  tipo: "admin" | "medico" | "familiar"
  created_at: string
  auth_uid?: string
  paciente_id?: string
}

interface NewUserForm {
  nombre_completo: string
  email: string
  telefono: string
  tipo: "admin" | "medico" | "familiar"
  password: string
  paciente_id?: string
}

const Familiares = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPacientes, setLoadingPacientes] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipo, setFilterTipo] = useState<"todos" | "familiar" | "medico" | "admin" | "nuevos">("todos")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  
  const [newUser, setNewUser] = useState<NewUserForm>({
    nombre_completo: "",
    email: "",
    telefono: "",
    tipo: "familiar",
    password: "",
  })

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [pacienteAsociado, setPacienteAsociado] = useState<Paciente | null>(null)
  const [loadingPaciente, setLoadingPaciente] = useState(false)
  

  // IMPORTANTE: Si estás en desarrollo local, descomenta esta línea
  // connectFunctionsEmulator(functions, "localhost", 5001)

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Estado de auth:", user ? "Autenticado" : "No autenticado")
      setAuthReady(true)
    })

    return () => unsubscribe()
  }, [auth])

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"))
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Usuario[]
        setUsuarios(data)
      } catch (error) {
        console.error("Error cargando usuarios:", error)
      } finally {
        setLoading(false)
      }
    }

    if (authReady) {
      fetchUsuarios()
    }
  }, [authReady])

  // Cargar pacientes cuando se abre el modal
  useEffect(() => {
    const fetchPacientes = async () => {
      if (showCreateModal && pacientes.length === 0) {
        setLoadingPacientes(true)
        try {
          const snapshot = await getDocs(collection(db, "pacientes"))
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Paciente[]
          setPacientes(data)
        } catch (error) {
          console.error("Error cargando pacientes:", error)
        } finally {
          setLoadingPacientes(false)
        }
      }
    }
    
    fetchPacientes()
  }, [showCreateModal, pacientes.length])

  // Cargar paciente asociado
  useEffect(() => {
    const fetchPacienteAsociado = async () => {
      if (showProfileModal && selectedUser?.tipo === "familiar" && selectedUser.paciente_id) {
        setLoadingPaciente(true)
        try {
          const pacienteDoc = await getDoc(doc(db, "pacientes", selectedUser.paciente_id))
          if (pacienteDoc.exists()) {
            setPacienteAsociado({
              id: pacienteDoc.id,
              ...pacienteDoc.data()
            } as Paciente)
          }
        } catch (error) {
          console.error("Error cargando paciente:", error)
        } finally {
          setLoadingPaciente(false)
        }
      }
    }
    
    fetchPacienteAsociado()
  }, [showProfileModal, selectedUser])

  // Manejar scroll con modales
  useEffect(() => {
    if (showCreateModal || showProfileModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showCreateModal, showProfileModal])

  // Filtrar usuarios
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
  e.preventDefault();
  setCreating(true);

  try {
    const result = await apiCall('createUserHttp', {
      nombre_completo: newUser.nombre_completo,
      email: newUser.email,
      telefono: newUser.telefono,
      tipo: newUser.tipo,
      password: newUser.password,
      ...(newUser.paciente_id && { paciente_id: newUser.paciente_id })
    });

    if (result.success) {
      // Agregar nuevo usuario a la lista
      const nuevoUsuario: Usuario = {
        id: result.userId, // Ahora es el mismo que auth_uid
        nombre_completo: newUser.nombre_completo,
        email: newUser.email,
        telefono: newUser.telefono,
        tipo: newUser.tipo,
        created_at: new Date().toLocaleDateString("es-MX"),
        auth_uid: result.authUid, // Mismo valor que id
        ...(newUser.paciente_id && { paciente_id: newUser.paciente_id })
      };

      setUsuarios(prev => [nuevoUsuario, ...prev]);
      setShowCreateModal(false);
      
      // Limpiar formulario
      setNewUser({
        nombre_completo: "",
        email: "",
        telefono: "",
        tipo: "familiar",
        password: "",
      });

      alert("Usuario creado exitosamente");
    }

  } catch (error: any) {
    console.error("Error:", error);
    alert(error.message || "Error al crear usuario");
  } finally {
    setCreating(false);
  }
};

// Función opcional para verificar un usuario
const verifyUser = async (userId: string) => {
  try {
    const result = await apiCall('getUserHttp', { userId });
    console.log('Verificación de usuario:', result);
  } catch (error) {
    console.error('Error verificando usuario:', error);
  }
};


const testAuth = async () => {
  try {
    const result = await apiCall('testAuthHttp');
    console.log("Auth test result:", result);
    alert(`Autenticado: ${result.authenticated ? 'Sí' : 'No'}`);
  } catch (error) {
    console.error("Error:", error);
    alert("Error en test");
  }
};

// Función para probar con fetch directo
const testAuthAlt = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("No autenticado");
      return;
    }
    
    const token = await user.getIdToken(true);
    console.log("Token para alt:", token.substring(0, 50));
    
    const response = await fetch(
      'https://us-central1-anexodb-9f806.cloudfunctions.net/testAuthAlt',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ test: true })
      }
    );
    
    const data = await response.json();
    console.log("Alt result:", data);
    
  } catch (error) {
    console.error("Error alt:", error);
  }
};

// Función para debug de Firebase SDK
const debugFirebaseCall = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user");
      return;
    }
    
    // Verificar la configuración de functions
    console.log("Functions config:", {
      app: functions.app.name,
      region: functions._region,
      // @ts-ignore
      customDomain: functions._customDomain,
      // @ts-ignore
      useFetchImpl: functions._useFetchImpl
    });
    
    // Intentar con diferentes configuraciones
    const token = await user.getIdToken(true);
    
    // Opción 1: Con httpsCallable normal
    console.log("=== Intento 1: Normal ===");
    const fn1 = httpsCallable(functions, 'testAuth');
    const r1 = await fn1({});
    console.log("R1:", r1.data);
    
    // Opción 2: Con nueva instancia de functions
    console.log("=== Intento 2: Nueva instancia ===");
    const { getFunctions, httpsCallable: httpsCallable2 } = await import('firebase/functions');
    const fn2Instance = getFunctions(app, 'us-central1');
    const fn2 = httpsCallable2(fn2Instance, 'testAuth');
    const r2 = await fn2({});
    console.log("R2:", r2.data);
    
  } catch (error) {
    console.error("Debug error:", error);
  }
};

  // Funciones auxiliares
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

  const verPerfil = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setShowProfileModal(true)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header fijo */}
      <div className="bg-white shadow-sm z-10">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="text-indigo-600" size={28} />
                </div>
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-2">Administra las cuentas registradas en el sistema</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus size={20} />
                Nuevo Usuario
              </Button>
              
              <Button onClick={testAuth} variant="outline">
                Debug Auth
              </Button>

              <Button onClick={testAuthAlt} variant="outline">
                Test Auth Alt
              </Button>
              <Button onClick={debugFirebaseCall} variant="outline">
                Debug Firebase
              </Button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="p-6 mt-6 bg-white shadow-sm">
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
          <div className="mt-6 mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{filteredUsuarios.length}</span> de{" "}
              <span className="font-semibold text-gray-900">{usuarios.length}</span> usuarios
            </p>
          </div>
        </div>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
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
        </div>
      </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                <Input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Ingresa una contraseña segura"
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
                  onChange={(e) => {
                    const tipo = e.target.value as "admin" | "medico" | "familiar"
                    setNewUser((prev) => ({ 
                      ...prev, 
                      tipo,
                      paciente_id: tipo === "familiar" ? prev.paciente_id : ""
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="familiar">Familiar</option>
                  <option value="medico">Médico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {newUser.tipo === "familiar" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente Asociado *
                  </label>
                  {loadingPacientes ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader className="animate-spin text-indigo-600" />
                      <span className="ml-2">Cargando pacientes...</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={newUser.paciente_id || ""}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, paciente_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Selecciona un paciente</option>
                      {pacientes.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nombre_completo} - {paciente.documento}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

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
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Perfil de Usuario</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
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

                {selectedUser.tipo === "familiar" && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Paciente Asociado
                    </h4>
                    
                    {loadingPaciente ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader className="animate-spin text-indigo-600" />
                        <span className="ml-2">Cargando paciente...</span>
                      </div>
                    ) : pacienteAsociado ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                            <p className="text-sm font-medium text-gray-900">{pacienteAsociado.nombre_completo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Documento</p>
                            <p className="text-sm font-medium text-gray-900">{pacienteAsociado.documento}</p>
                          </div>
                        </div>
                        
                        {pacienteAsociado.telefono && (
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                              <Phone className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                              <p className="text-sm font-medium text-gray-900">{pacienteAsociado.telefono}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No se encontró paciente asociado</p>
                    )}
                  </div>
                )}

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
              </div>
            </div>

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