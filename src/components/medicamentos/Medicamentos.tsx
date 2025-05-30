"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore"
import { db } from "../../utils/firebase"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Dialog } from "../ui/Dialog"
import type { Medicamento } from "../../utils/supabase"
import { Clock, Edit, Filter, Pill, Plus, Search, Trash2, MoreHorizontal, Droplets, Repeat, Info } from "lucide-react"

interface Props {
  pacienteId: string
  usuarioId: string
}

const MedicamentosForm: React.FC<Props> = ({ pacienteId, usuarioId }) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [form, setForm] = useState<any>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState(true)

  const fetchMedicamentos = async () => {
    const q = query(collection(db, "medicamentos"), where("paciente_id", "==", pacienteId))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Medicamento[]
    setMedicamentos(data)
  }

  useEffect(() => {
    fetchMedicamentos()
  }, [pacienteId])

  const handleSubmit = async () => {
    const payload = {
      ...form,
      paciente_id: pacienteId,
      updated_at: new Date().toISOString(),
      updated_by: usuarioId,
      activo: form.activo !== undefined ? form.activo : true,
    }

    if (editando) {
      await updateDoc(doc(db, "medicamentos", editando), payload)
    } else {
      await addDoc(collection(db, "medicamentos"), {
        ...payload,
        created_at: new Date().toISOString(),
        created_by: usuarioId,
      })
    }

    setDialogOpen(false)
    setForm({})
    setEditando(null)
    fetchMedicamentos()
  }

  const handleEditar = (m: Medicamento) => {
    setForm(m)
    setEditando(m.id)
    setDialogOpen(true)
  }

  const handleEliminar = async (id: string) => {
    await deleteDoc(doc(db, "medicamentos", id))
    fetchMedicamentos()
  }

  const filteredMedicamentos = medicamentos
    .filter((m) => (filterActive ? m.activo !== false : true))
    .filter(
      (m) =>
        m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.dosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.via?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.frecuencia?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  // Agrupar medicamentos por vía de administración
  const medicamentosPorVia: Record<string, Medicamento[]> = {}
  filteredMedicamentos.forEach((med) => {
    const via = med.via || "Sin especificar"
    if (!medicamentosPorVia[via]) {
      medicamentosPorVia[via] = []
    }
    medicamentosPorVia[via].push(med)
  })

  // Obtener estadísticas
  const totalMedicamentos = medicamentos.length
  const medicamentosActivos = medicamentos.filter((m) => m.activo !== false).length

  return (
    <div className="space-y-6">
      {/* Encabezado con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Pill className="text-blue-600" size={24} />
              Medicamentos y Tratamiento
            </h2>
            <p className="text-sm text-gray-600">Gestión de medicamentos y tratamientos del paciente</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalMedicamentos}</p>
              <p className="text-xs text-gray-600">Total medicamentos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{medicamentosActivos}</p>
              <p className="text-xs text-gray-600">Medicamentos activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar medicamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={filterActive ? "default" : "outline"}
            
            onClick={() => setFilterActive(!filterActive)}
            className={filterActive ? "bg-blue-600 hover:bg-blue-700" : "border-gray-200"}
          >
            <Filter size={14} className="mr-1 text-white" />
            {filterActive ? "Mostrando activos" : "Mostrar todos"}
          </Button>

          <Button
            onClick={() => {
              setDialogOpen(true)
              setForm({})
              setEditando(null)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={16} className="mr-1" />
            Nuevo medicamento
          </Button>
        </div>
      </div>

      {/* Lista de medicamentos */}
      <div className="space-y-6">
        {Object.keys(medicamentosPorVia).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Pill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay medicamentos registrados</h3>
            <p className="text-gray-500 mb-4">Comienza agregando el primer medicamento del paciente</p>
            <Button
              onClick={() => {
                setDialogOpen(true)
                setForm({})
                setEditando(null)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              Agregar medicamento
            </Button>
          </div>
        ) : (
          Object.entries(medicamentosPorVia).map(([via, meds]) => (
            <div key={via} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{via}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meds.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
                      m.activo === false ? "border-gray-300" : "border-blue-500"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${m.activo === false ? "bg-gray-100" : "bg-blue-50"}`}>
                          <Pill size={16} className={m.activo === false ? "text-gray-400" : "text-blue-500"} />
                        </div>
                        <h3 className={`font-semibold ${m.activo === false ? "text-gray-500" : "text-gray-800"}`}>
                          {m.nombre}
                        </h3>
                      </div>

                      <div className="flex items-center">
                        {m.activo === false && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                            Inactivo
                          </span>
                        )}
                        <div className="relative group">
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <MoreHorizontal size={16} className="text-gray-500" />
                          </button>
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 invisible group-hover:visible z-10">
                            <button
                              onClick={() => handleEditar(m)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                            >
                              <Edit size={14} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(m.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Droplets size={14} className="text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Dosis:</span> {m.dosis || "No especificada"}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <Repeat size={14} className="text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Frecuencia:</span> {m.frecuencia || "No especificada"}
                        </p>
                      </div>

                      {m.observaciones && (
                        <div className="flex items-start gap-2 pt-2 mt-2 border-t border-gray-100">
                          <Info size={14} className="text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Observaciones:</span> {m.observaciones}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>
                          {m.updated_at
                            ? new Date(m.updated_at).toLocaleDateString()
                            : new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <button onClick={() => handleEditar(m)} className="text-blue-600 hover:text-blue-800 font-medium">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editando ? "Editar Medicamento" : "Nuevo Medicamento"}
        maxWidth="2xl"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nombre del medicamento"
                placeholder="Ej: Paracetamol, Omeprazol, etc."
                value={form.nombre || ""}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <Input
              label="Dosis"
              placeholder="Ej: 500mg, 1 tableta, 10ml, etc."
              value={form.dosis || ""}
              onChange={(e) => setForm({ ...form, dosis: e.target.value })}
            />

            <Input
              label="Frecuencia"
              placeholder="Ej: Cada 8 horas, 1 vez al día, etc."
              value={form.frecuencia || ""}
              onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Vía de administración</label>
              <select
                value={form.via || ""}
                onChange={(e) => setForm({ ...form, via: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar vía</option>
                <option value="Oral">Oral</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Tópica">Tópica</option>
                <option value="Inhalada">Inhalada</option>
                <option value="Oftálmica">Oftálmica</option>
                <option value="Ótica">Ótica</option>
                <option value="Rectal">Rectal</option>
                <option value="Otra">Otra</option>
              </select>
            </div>

            {editando && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Estado</label>
                <select
                  value={form.activo === false ? "inactivo" : "activo"}
                  onChange={(e) => setForm({ ...form, activo: e.target.value === "activo" })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-2">Observaciones</label>
              <textarea
                value={form.observaciones || ""}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Instrucciones especiales, efectos secundarios, etc."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-200 text-gray-600">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              {editando ? "Guardar cambios" : "Crear medicamento"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default MedicamentosForm
