"use client"

// RegistroDiarioSeguimiento.tsx
import type React from "react"
import { useEffect, useState } from "react"
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../../utils/firebase"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Dialog } from "../ui/Dialog"
import type { RegistroDiario } from "../../utils/supabase"
import {
  CalendarDays,
  Clock,
  Edit,
  FileText,
  Maximize2,
  Pill,
  Smile,
  StickyNote,
  Trash2,
  Utensils,
  Weight,
  Plus,
  Activity,
  Camera,
  Upload,
} from "lucide-react"

interface Props {
  pacienteId: string
  usuarioId: string
}

const RegistroDiarioSeguimiento: React.FC<Props> = ({ pacienteId, usuarioId }) => {
  const [registros, setRegistros] = useState<RegistroDiario[]>([])
  const [form, setForm] = useState<any>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [showHistorial, setShowHistorial] = useState(false)
  const [zoomUrl, setZoomUrl] = useState<string | null>(null)

  const fetchData = async () => {
    const q = query(collection(db, "seguimiento"), where("paciente_id", "==", pacienteId))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RegistroDiario[]
    const ordenados = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    setRegistros(ordenados)
  }

  useEffect(() => {
    fetchData()
  }, [pacienteId])

  const handleSubmit = async () => {
    let url = form.imagen_evidencia || ""
    if (file) {
      const nombre = `seguimiento/${Date.now()}_${file.name}`
      const storageRef = ref(storage, nombre)
      await uploadBytes(storageRef, file)
      url = await getDownloadURL(storageRef)
    }

    const fechaActual = new Date().toISOString()
    const payload = {
      ...form,
      imagen_evidencia: url,
      paciente_id: pacienteId,
      updated_at: fechaActual,
      updated_by: usuarioId,
      historial: [
        ...(form.historial || []),
        {
          tipo: editando ? "edicion" : "creacion",
          fecha: fechaActual,
          usuario: usuarioId,
        },
      ],
    }

    if (editando) {
      await updateDoc(doc(db, "seguimiento", editando), payload)
    } else {
      await addDoc(collection(db, "seguimiento"), {
        ...payload,
        created_at: fechaActual,
        created_by: usuarioId,
      })
    }

    setDialogOpen(false)
    setForm({})
    setFile(null)
    setEditando(null)
    fetchData()
  }

  const handleEditar = (r: RegistroDiario) => {
    setForm(r)
    setEditando(r.id)
    setDialogOpen(true)
  }

  const handleEliminar = async (id: string) => {
    await deleteDoc(doc(db, "seguimiento", id))
    fetchData()
  }

  const handleVerHistorial = (r: any) => {
    const ordenado = [...(r.historial || [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    setHistorial(ordenado)
    setShowHistorial(true)
  }

  const InfoCard = ({
    icon: Icon,
    label,
    content,
    bgColor = "bg-blue-50",
    iconColor = "text-blue-600",
    borderColor = "border-blue-100",
  }: {
    icon: React.ElementType
    label: string
    content?: string
    bgColor?: string
    iconColor?: string
    borderColor?: string
  }) => (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-white rounded-lg shadow-sm ${iconColor}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm text-gray-800 leading-relaxed">{content || "Sin información registrada"}</p>
        </div>
      </div>
    </div>
  )

  // Calcular estadísticas
  const totalRegistros = registros.length
  const ultimoPeso = registros[0]?.peso || 0
  const diasSeguimiento =
    registros.length > 0
      ? Math.floor(
          (new Date().getTime() - new Date(registros[registros.length - 1]?.fecha).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Encabezado con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Activity className="text-blue-600" size={24} />
              Seguimiento Diario
            </h2>
            <p className="text-sm text-gray-600">Registro y monitoreo del progreso del paciente</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalRegistros}</p>
              <p className="text-xs text-gray-600">Registros totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{ultimoPeso} kg</p>
              <p className="text-xs text-gray-600">Último peso</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{diasSeguimiento}</p>
              <p className="text-xs text-gray-600">Días en seguimiento</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <Button
            onClick={() => {
              setDialogOpen(true)
              setForm({})
              setEditando(null)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Nuevo registro diario
          </Button>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="space-y-6">
        {registros.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay registros de seguimiento</h3>
            <p className="text-gray-500 mb-4">Comienza creando el primer registro diario del paciente</p>
            <Button
              onClick={() => {
                setDialogOpen(true)
                setForm({})
                setEditando(null)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Crear primer registro
            </Button>
          </div>
        ) : (
          registros.map((r: any, index) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Imagen de evidencia */}
                {r.imagen_evidencia && (
                  <div className="lg:w-80 flex-shrink-0">
                    <div
                      className="relative group cursor-pointer h-64 lg:h-full"
                      onClick={() => setZoomUrl(r.imagen_evidencia)}
                    >
                      <img
                        src={r.imagen_evidencia || "/placeholder.svg"}
                        alt="Evidencia del día"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <Maximize2 className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Día {index + 1}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido principal */}
                <div className="flex-1 p-6">
                  {/* Encabezado del registro */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1">
                        <CalendarDays className="w-5 h-5 text-blue-600" />
                        {new Date(r.fecha).toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Día {Math.floor((new Date().getTime() - new Date(r.fecha).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                          desde ingreso
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Peso actual</p>
                        <p className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                          <Weight size={20} />
                          {r.peso} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información en tarjetas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <InfoCard
                      icon={Pill}
                      label="Medicamentos"
                      content={r.medicamentos}
                      bgColor="bg-blue-50"
                      iconColor="text-blue-600"
                      borderColor="border-blue-100"
                    />
                    <InfoCard
                      icon={Utensils}
                      label="Alimentación"
                      content={r.comidas}
                      bgColor="bg-green-50"
                      iconColor="text-green-600"
                      borderColor="border-green-100"
                    />
                    <InfoCard
                      icon={Smile}
                      label="Comportamiento"
                      content={r.comportamiento}
                      bgColor="bg-purple-50"
                      iconColor="text-purple-600"
                      borderColor="border-purple-100"
                    />
                  </div>

                  {/* Descripción y observaciones */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 font-medium text-gray-700 mb-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Descripción general
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {r.descripcion || "Sin descripción registrada"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 font-medium text-gray-700 mb-3">
                        <StickyNote className="w-4 h-4 text-gray-500" />
                        Observaciones
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {r.observaciones || "Sin observaciones registradas"}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditar(r)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEliminar(r.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de zoom de imagen */}
      <Dialog isOpen={!!zoomUrl} onClose={() => setZoomUrl(null)} title="Evidencia fotográfica" maxWidth="4xl">
        <div className="p-4">
          <img
            src={zoomUrl! || "/placeholder.svg"}
            alt="Evidencia ampliada"
            className="max-h-[70vh] w-full object-contain mx-auto rounded-lg"
          />
        </div>
      </Dialog>

      {/* Modal de formulario */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editando ? "Editar Registro de Seguimiento" : "Nuevo Registro de Seguimiento"}
        maxWidth="4xl"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200">Información básica</h3>

              <Input
                label="Fecha del registro"
                type="date"
                value={form.fecha || ""}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />

              <Input
                label="Peso (kg)"
                type="number"
                step="0.1"
                placeholder="Ej: 75.5"
                value={form.peso || ""}
                onChange={(e) => setForm({ ...form, peso: e.target.value })}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Descripción general del día</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Describe cómo estuvo el paciente durante el día..."
                  value={form.descripcion || ""}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
            </div>

            {/* Detalles específicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200">Detalles específicos</h3>

              <Input
                label="Medicamentos administrados"
                placeholder="Ej: Paracetamol 500mg, Vitamina B12..."
                value={form.medicamentos || ""}
                onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
              />

              <Input
                label="Alimentación"
                placeholder="Ej: Desayuno completo, almuerzo ligero..."
                value={form.comidas || ""}
                onChange={(e) => setForm({ ...form, comidas: e.target.value })}
              />

              <Input
                label="Comportamiento observado"
                placeholder="Ej: Tranquilo, colaborativo, ansioso..."
                value={form.comportamiento || ""}
                onChange={(e) => setForm({ ...form, comportamiento: e.target.value })}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Observaciones adicionales</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Cualquier observación importante..."
                  value={form.observaciones || ""}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Sección de imagen */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Camera size={20} className="text-blue-600" />
              Evidencia fotográfica
            </h3>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />

              {!file && !form.imagen_evidencia && (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Haz clic para subir una imagen</p>
                  <p className="text-xs text-gray-400">PNG, JPG hasta 10MB</p>
                </label>
              )}

              {file && (
                <div className="space-y-4">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    className="mx-auto h-48 object-contain rounded-lg border"
                    alt="Vista previa"
                  />
                  <div className="flex justify-center gap-2">
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Cambiar imagen
                      </Button>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}

              {!file && form.imagen_evidencia && (
                <div className="space-y-4">
                  <img
                    src={form.imagen_evidencia || "/placeholder.svg"}
                    className="mx-auto h-48 object-contain rounded-lg border"
                    alt="Imagen actual"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      Cambiar imagen
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-200 text-gray-600">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              {editando ? "Guardar cambios" : "Crear registro"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal de historial */}
      <Dialog isOpen={showHistorial} onClose={() => setShowHistorial(false)} title="Historial de Cambios">
        <div className="p-6">
          <div className="space-y-3">
            {historial.length > 0 ? (
              historial.map((h, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {h.tipo.charAt(0).toUpperCase() + h.tipo.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(h.fecha).toLocaleString("es-MX")} por {h.usuario}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">Este registro no tiene historial de cambios.</p>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setShowHistorial(false)}>Cerrar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default RegistroDiarioSeguimiento
