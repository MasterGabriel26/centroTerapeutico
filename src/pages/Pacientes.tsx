"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Calendar, Users, MoreVertical, User, Clock, Activity, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import { Dialog } from "../components/ui/Dialog"
import { PacienteForm } from "../components/anexados/PacienteForm"
import { db } from "../utils/firebase"
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore"
import { useAuthStore } from "../store/authStore"
import { uploadPacienteImage } from "../components/anexados/uploadPacienteImage"
import PacienteDrawerView from "../components/drawers/PacienteDrawer"

const Pacientes = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pacienteDrawer, setPacienteDrawer] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"todos" | "activo" | "inactivo">("todos")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showHistorialDialog, setShowHistorialDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any | null>(null)
  const [familiares, setFamiliares] = useState<any[]>([])
  const [searchFamiliar, setSearchFamiliar] = useState("")
  const [filterFamiliarTipo, setFilterFamiliarTipo] = useState<"todos" | "familiar" | "medico" | "admin">("todos")
  const { usuario } = useAuthStore()

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    message: "",
    onConfirm: () => {},
  })

  const handleAsignarFamiliar = async (pacienteId: string, familiarId: string) => {
    const confirmar = window.confirm("¿Deseas asignar este familiar al paciente?")
    if (!confirmar) return

    const fecha = new Date().toLocaleDateString("es-MX")

    // 1. Actualiza el paciente con el ID del familiar
    await updateDoc(doc(db, "pacientes", pacienteId), {
      familiar_id: familiarId,
      updated_at: fecha,
    })

    // 2. Actualiza el familiar con el ID del paciente
    await updateDoc(doc(db, "users", familiarId), {
      paciente_id: pacienteId,
      updated_at: fecha,
    })

    alert("Familiar asignado correctamente")

    // 🔁 Recargar ambas listas
    const [pacSnap, famSnap] = await Promise.all([
      getDocs(collection(db, "pacientes")),
      getDocs(collection(db, "users")),
    ])

    const nuevosPacientes = pacSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    const nuevosFamiliares = famSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((f: any) => f.tipo === "familiar")

    setPacientes(nuevosPacientes)
    setFamiliares(nuevosFamiliares)
    setPacienteSeleccionado(null)
  }

  useEffect(() => {
    const fetchFamiliares = async () => {
      const snapshot = await getDocs(collection(db, "users"))
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const soloFamiliares = data.filter((f: any) => f.tipo === "familiar")
      setFamiliares(soloFamiliares)
    }
    fetchFamiliares()
  }, [])

  useEffect(() => {
    const fetchPacientes = async () => {
      const snapshot = await getDocs(collection(db, "pacientes"))
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setPacientes(data)
    }
    fetchPacientes()
  }, [])

  const filteredPacientes = pacientes.filter((p) => {
    const matchesSearch =
      p.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.motivo_anexo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "todos" || p.estado === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleCreatePaciente = async (data: any) => {
    const fecha = new Date().toLocaleDateString("es-MX")

    let imagenUrl = ""
    if (data.imagen_archivo instanceof File) {
      imagenUrl = await uploadPacienteImage(data.imagen_archivo)
    }

    const payload = {
      nombre_completo: data.nombre_completo,
      motivo_anexo: data.motivo_anexo,
      fecha_ingreso: data.fecha_ingreso,
      fecha_salida: data.fecha_salida || "",
      imagen_url: imagenUrl,
      estado: "activo",
      created_at: fecha,
      created_by: usuario?.id || "admin",
    }

    const docRef = await addDoc(collection(db, "pacientes"), payload)
    setShowNewDialog(false)
    setPacientes((prev) => [...prev, { ...payload, id: docRef.id }])
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">Gestión de personas en tratamiento</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowNewDialog(true)}>
          Nuevo Paciente
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <Input
              placeholder="Buscar por nombre o motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="flex gap-2">
            {["todos", "activo", "inactivo"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "primary" : "outline"}
                onClick={() => setFilterStatus(status as any)}
              >
                {status[0].toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Dialog isOpen={showNewDialog} onClose={() => setShowNewDialog(false)} title="Registrar nuevo paciente">
        <PacienteForm onSubmit={handleCreatePaciente} />
      </Dialog>

      <Dialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} title="Editar paciente">
        <PacienteForm onSubmit={async () => {}} initialData={selectedPaciente || {}} />
      </Dialog>

      <Dialog
        isOpen={!!pacienteSeleccionado}
        onClose={() => setPacienteSeleccionado(null)}
        title="Selecciona un Familiar"
        maxWidth="xl"
      >
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            placeholder="Buscar familiar por nombre o correo..."
            value={searchFamiliar}
            onChange={(e) => setSearchFamiliar(e.target.value)}
            leftIcon={<Search size={18} />}
          />
          <div className="flex gap-2">
            {["familiar", "nuevos"].map((tipo) => (
              <Button
                key={tipo}
                variant={filterFamiliarTipo === tipo ? "primary" : "outline"}
                onClick={() => setFilterFamiliarTipo(tipo as any)}
                size="sm"
              >
                {tipo === "nuevos" ? "Nuevos" : "Familiares"}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {familiares
            .filter((f) => {
              const matchesTipo = f.tipo === "familiar" && !f.paciente_id

              const matchesSearch =
                f.nombre_completo?.toLowerCase().includes(searchFamiliar.toLowerCase()) ||
                f.email?.toLowerCase().includes(searchFamiliar.toLowerCase())

              return matchesTipo && matchesSearch
            })
            .map((f) => (
              <Card key={f.id} className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{f.nombre_completo}</h3>
                  <p className="text-sm text-gray-500">{f.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAsignarFamiliar(pacienteSeleccionado.id, f.id)}
                >
                  Asignar
                </Button>
              </Card>
            ))}
        </div>
      </Dialog>

      <Dialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        title="Confirmar asignación"
      >
        <p className="text-sm text-gray-700 mb-4">{confirmDialog.message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmDialog.onConfirm}>
            Confirmar
          </Button>
        </div>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPacientes.map((paciente) => (
          <Card key={paciente.id} hoverable className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="p-5">
              {/* Encabezado con estado */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {paciente.imagen_url ? (
                      <img
                        src={paciente.imagen_url || "/placeholder.svg"}
                        alt={paciente.nombre_completo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{paciente.nombre_completo}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        paciente.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {paciente.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Motivo de anexo */}
              {paciente.motivo_anexo && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Motivo de anexo</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{paciente.motivo_anexo}</p>
                </div>
              )}

              {/* Información de familiar */}
              {paciente.familiar_id && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                  <Users size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Familiar asignado</p>
                    <p className="text-sm font-medium text-gray-800">
                      {familiares.find((f) => f.id === paciente.familiar_id)?.nombre_completo || "Desconocido"}
                    </p>
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Calendar size={16} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ingreso</p>
                    <p className="text-sm font-medium text-gray-800">{paciente.fecha_ingreso}</p>
                  </div>
                </div>

                {paciente.fecha_salida ? (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Clock size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Salida</p>
                      <p className="text-sm font-medium text-gray-800">{paciente.fecha_salida}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Activity size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Estatus</p>
                      <p className="text-sm font-medium text-green-600">En tratamiento</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-4">
                {!paciente.familiar_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPacienteSeleccionado(paciente)}
                  >
                    <Users size={16} className="mr-1" />
                    Asignar Familiar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setPacienteDrawer(paciente)
                    setDrawerOpen(true)
                  }}
                >
                  <ChevronRight size={16} className="mr-1" />
                  Ver Detalle
                </Button>
              </div>
            </div>
          </Card>
        ))}
        <PacienteDrawerView
          pacienteDrawer={pacienteDrawer}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOpen={() => {}}
          familiares={familiares}
          usuario={usuario}
        />
      </div>
    </div>
  )
}

export default Pacientes
