// pages/FamiliarVisitasTab.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../../../utils/firebase"
import { User, Calendar, Users, Clock, Search, ChevronDown, ChevronUp, Phone } from "lucide-react"
import { Button } from "../../../components/ui/Button"
import { Card } from "../../../components/ui/Card"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useAuthStore } from "../../../store/authStore"

interface Visitante {
  nombre: string
  parentesco: string
  telefono?: string
}

interface Visita {
  id: string
  fecha: Date
  visitantes: Visitante[]
  registradoPor: string
  observaciones?: string
}

interface DoctorInfo {
  id: string
  nombre_completo: string
}

const FamiliarVisitasTab = () => {
  const { usuario } = useAuthStore()
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctoresInfo, setDoctoresInfo] = useState<Record<string, string>>({})
  const [expandedVisitaId, setExpandedVisitaId] = useState<string | null>(null)
  const [pacienteId, setPacienteId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({})

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

  // Cargar visitas cuando se tenga el pacienteId
  useEffect(() => {
    const fetchVisitas = async () => {
      if (!pacienteId) return

      try {
        setLoading(true)
        setError(null)

        // Construir consulta base
        let visitasQuery = query(
          collection(db, `pacientes/${pacienteId}/visitas`),
          where("isActive", "==", true)
        )

        // Aplicar filtro de fecha si existe
        if (dateRange.start && dateRange.end) {
          visitasQuery = query(
            visitasQuery,
            where("fecha", ">=", dateRange.start),
            where("fecha", "<=", dateRange.end)
          )
        }

        // Obtener visitas
        const snapshot = await getDocs(visitasQuery)
        const visitasData: Visita[] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            fecha: data.fecha?.toDate(),
            visitantes: data.visitantes,
            registradoPor: data.registradoPor,
            observaciones: data.observaciones || ""
          }
        })

        // Ordenar por fecha descendente
        visitasData.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
        setVisitas(visitasData)

        // Obtener información de los doctores/registradores
        const registradorIds = Array.from(new Set(visitasData.map(v => v.registradoPor)))
        const doctores: Record<string, string> = {}

        for (const id of registradorIds) {
          const doctorDoc = await getDoc(doc(db, "users", id))
          if (doctorDoc.exists()) {
            doctores[id] = doctorDoc.data().nombre_completo || "Usuario desconocido"
          } else {
            doctores[id] = "Usuario no encontrado"
          }
        }

        setDoctoresInfo(doctores)
      } catch (err) {
        console.error("Error al cargar visitas:", err)
        setError("Error al cargar el historial de visitas")
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      fetchVisitas()
    }
  }, [pacienteId, dateRange])

  // Filtrar visitas según término de búsqueda
  const filteredVisitas = useMemo(() => {
    return visitas.filter(visita => {
      if (!searchTerm) return true
      
      const term = searchTerm.toLowerCase()
      const matchesVisitantes = visita.visitantes.some(visitante => 
        visitante.nombre.toLowerCase().includes(term) || 
        visitante.parentesco.toLowerCase().includes(term) ||
        (visitante.telefono && visitante.telefono.toLowerCase().includes(term))
      )
      const matchesRegistrador = (doctoresInfo[visita.registradoPor] || "").toLowerCase().includes(term)
      const matchesObservaciones = visita.observaciones?.toLowerCase().includes(term) || false
      
      return matchesVisitantes || matchesRegistrador || matchesObservaciones
    })
  }, [visitas, searchTerm, doctoresInfo])

  const formatFecha = (fecha: Date) => {
    try {
      return format(fecha, "PPPp", { locale: es })
    } catch (err) {
      console.warn("Error al formatear fecha:", err)
      return "Fecha no disponible"
    }
  }

  const formatFechaCorta = (fecha: Date) => {
    try {
      return format(fecha, "PP", { locale: es })
    } catch (err) {
      console.warn("Error al formatear fecha:", err)
      return "Fecha no disponible"
    }
  }

  const toggleExpandVisita = (id: string) => {
    setExpandedVisitaId(expandedVisitaId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial de visitas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-red-100 rounded-full p-2">
            <User className="h-6 w-6 text-red-500" />
          </div>
        </div>
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

  if (visitas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600">No hay visitas registradas para este paciente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar visitas (nombre, parentesco, teléfono...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtros de fecha */}
          <div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
              <span className="text-sm text-gray-600 font-medium">Filtrar por fecha:</span>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                <input
                  type="date"
                  onChange={(e) => setDateRange({...dateRange, start: e.target.valueAsDate || undefined})}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-sm text-gray-500 text-center sm:text-left">hasta</span>
                <input
                  type="date"
                  onChange={(e) => setDateRange({...dateRange, end: e.target.valueAsDate || undefined})}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {(dateRange.start || dateRange.end) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({})}
                    className="text-sm"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de visitas */}
      <div className="space-y-4">
        {filteredVisitas.map((visita) => (
          <Card key={visita.id} className="overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              onClick={() => toggleExpandVisita(visita.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{formatFechaCorta(visita.fecha)}</h3>
                  <p className="text-sm text-gray-500">
                    {doctoresInfo[visita.registradoPor] || "Registrador no disponible"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{visita.visitantes.length}</span>
                </div>
                {expandedVisitaId === visita.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedVisitaId === visita.id && (
              <div className="border-t p-4 bg-gray-50">
                {/* Detalles de fecha y registrador */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha y hora exacta:</p>
                    <p className="font-medium">{formatFecha(visita.fecha)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Registrado por:</p>
                    <p className="font-medium">{doctoresInfo[visita.registradoPor] || "No disponible"}</p>
                  </div>
                </div>

                {/* Lista de visitantes */}
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-2">Visitantes:</p>
                  <div className="space-y-3">
                    {visita.visitantes.map((visitante, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{visitante.nombre}</p>
                            <p className="text-sm text-gray-600">{visitante.parentesco}</p>
                            {visitante.telefono && (
                              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <Phone className="h-4 w-4 text-gray-500" />
                                {visitante.telefono}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observaciones */}
                {visita.observaciones && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Observaciones:</p>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-600 whitespace-pre-line">{visita.observaciones}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredVisitas.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron visitas que coincidan con la búsqueda.
        </div>
      )}
    </div>
  )
}

export default FamiliarVisitasTab