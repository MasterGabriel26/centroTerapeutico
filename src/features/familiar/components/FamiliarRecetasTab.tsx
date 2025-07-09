// pages/FamiliarRecetasTab.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { collection, query, where, getDocs,getDoc,doc } from "firebase/firestore"
import { db } from "../../../utils/firebase"
import { Pill, Calendar, User, Loader2, AlertCircle, Search, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../../../components/ui/Button"
import { Card } from "../../../components/ui/Card"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useAuthStore } from "../../../store/authStore"

interface MedicamentoReceta {
  medicamentoId: string
  nombre: string
  posologia: string
  tiempoUso: string
  cantidad: number
  notasAdicionales: string
  precioUnitario: number
  subtotal: number
}

interface Receta {
  id: string
  idDoctor: string
  motivo: string
  medicamentos: MedicamentoReceta[]
  fecha: Date
  isActive: boolean
  total: number
  folio: string
  riesgos?: string
}

interface DoctorInfo {
  id: string
  nombre_completo: string
}

const FamiliarRecetasTab = () => {
  const { usuario } = useAuthStore()
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({})
  const [expandedRecetaId, setExpandedRecetaId] = useState<string | null>(null)
  const [pacienteId, setPacienteId] = useState<string | null>(null)

  // Obtener el ID del paciente asociado al familiar
  useEffect(() => {
    const fetchPacienteId = async () => {
      try {
        if (!usuario) return

        const userDoc = await getDoc(doc(db, "users", usuario.id))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.paciente_id) {
            setPacienteId(userData.paciente_id)
          }
        }
      } catch (err) {
        console.error("Error al obtener ID del paciente:", err)
        setError("Error al cargar información del paciente")
      }
    }

    fetchPacienteId()
  }, [usuario])

  // Cargar recetas cuando se tenga el pacienteId
  useEffect(() => {
    const fetchRecetas = async () => {
      if (!pacienteId) return

      try {
        setLoading(true)
        setError(null)

        // Obtener recetas del paciente
        const recetasRef = collection(db, `pacientes/${pacienteId}/recetas`)
        const recetasQuery = query(recetasRef, where("isActive", "==", true))
        const snapshot = await getDocs(recetasQuery)

        const recetasData: Receta[] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            idDoctor: data.idDoctor,
            motivo: data.motivo,
            medicamentos: data.medicamentos,
            fecha: data.fecha?.toDate(),
            isActive: data.isActive,
            total: data.total,
            folio: data.folio,
            riesgos: data.riesgos || ""
          }
        })

        setRecetas(recetasData)

        // Obtener información de los doctores
        const doctorIds = Array.from(new Set(recetasData.map(r => r.idDoctor)))
        const doctores: Record<string, string> = {}

        for (const id of doctorIds) {
          const doctorDoc = await getDoc(doc(db, "users", id))
          if (doctorDoc.exists()) {
            doctores[id] = doctorDoc.data().nombre_completo || "Médico no registrado"
          } else {
            doctores[id] = "Médico no encontrado"
          }
        }

        setDoctoresInfo(doctores)
      } catch (err) {
        console.error("Error al cargar recetas:", err)
        setError("Error al cargar las recetas del paciente")
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      fetchRecetas()
    }
  }, [pacienteId])

  // Filtrar recetas según término de búsqueda
  const filteredRecetas = useMemo(() => {
    return recetas.filter(receta => {
      if (!searchTerm) return true

      const term = searchTerm.toLowerCase()
      const matchesMotivo = receta.motivo.toLowerCase().includes(term)
      const matchesDoctor = (doctoresInfo[receta.idDoctor] || "").toLowerCase().includes(term)
      const matchesFolio = receta.folio.toLowerCase().includes(term)
      const matchesRiesgos = receta.riesgos?.toLowerCase().includes(term) || false
      const matchesMedicamento = receta.medicamentos.some(m => 
        m.nombre.toLowerCase().includes(term) || 
        m.posologia.toLowerCase().includes(term)
      )

      return matchesMotivo || matchesDoctor || matchesFolio || matchesRiesgos || matchesMedicamento
    })
  }, [recetas, searchTerm, doctoresInfo])

  const formatFecha = (fecha: Date) => {
    try {
      return format(fecha, "PPP", { locale: es })
    } catch (err) {
      console.warn("Error al formatear fecha:", err)
      return "Fecha no disponible"
    }
  }

  const toggleExpandReceta = (id: string) => {
    setExpandedRecetaId(expandedRecetaId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando recetas del paciente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
        <p className="font-medium">{error}</p>
        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:bg-blue-50"
        >
          Intentar nuevamente
        </Button>
      </div>
    )
  }

  if (!pacienteId) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600">No tienes un paciente asociado.</p>
        <p className="text-gray-500 text-sm mt-1">Contacta al administrador para más información.</p>
      </div>
    )
  }

  if (recetas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Pill className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600">No hay recetas registradas para este paciente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar recetas (folio, médico, motivo, medicamento...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Lista de recetas */}
      <div className="space-y-4">
        {filteredRecetas.map((receta) => (
          <Card key={receta.id} className="overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              onClick={() => toggleExpandReceta(receta.id)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">{receta.folio}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFecha(receta.fecha)} • {doctoresInfo[receta.idDoctor] || "Médico no disponible"}
                </p>
              </div>
              <div>
                {expandedRecetaId === receta.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedRecetaId === receta.id && (
              <div className="border-t p-4 bg-gray-50">
                {/* Motivo y riesgos */}
                <div className="mb-4">
                  <p className="font-medium text-gray-700">Motivo:</p>
                  <p className="text-gray-600">{receta.motivo}</p>
                </div>

                {receta.riesgos && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-700">Riesgos detectados:</p>
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg">
                      <p>{receta.riesgos}</p>
                    </div>
                  </div>
                )}

                {/* Medicamentos */}
                <div>
                  <p className="font-medium text-gray-700 mb-2">Medicamentos:</p>
                  <div className="space-y-3">
                    {receta.medicamentos.map((med, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{med.nombre}</p>
                            <p className="text-sm text-gray-600">{med.posologia}</p>
                            {med.tiempoUso && (
                              <p className="text-xs text-gray-500 mt-1">Duración: {med.tiempoUso}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${med.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {med.cantidad} x ${med.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        {med.notasAdicionales && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Notas:</span> {med.notasAdicionales}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <p className="font-medium text-gray-700">Total:</p>
                  <p className="font-bold">
                    ${receta.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredRecetas.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron recetas que coincidan con la búsqueda.
        </div>
      )}
    </div>
  )
}

export default FamiliarRecetasTab