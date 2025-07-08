// pages/FamiliarPage.tsx
"use client"

import React, { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../../utils/firebase"
import { Calendar, Clock, FileText, User, CreditCard, AlertCircle, Loader2, Activity, Phone, Mail } from "lucide-react"
import { Button } from "../../../components/ui/Button"
import { Card } from "../../../components/ui/Card"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { useAuthStore } from "../../../store/authStore"
import { useSeguimientos } from "../../pacientes/hooks/useSeguimiento"
import { useCuentaDeCobro } from "../../pagos/hooks/useCuentaDeCobro"
import SeguimientoCard from "../components/SeguimientoCard"
import MediaModal from "../components/MediaModal"

type Paciente = {
  id: string
  nombre_completo: string
  fecha_nacimiento: string
  documento: string
  direccion: string
  email: string
  telefono: string
  estado: string
  creado: string
  voluntario: boolean
}

const FamiliarPage = () => {
  const { usuario } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [activeTab, setActiveTab] = useState("seguimiento")
  const [selectedMedia, setSelectedMedia] = useState<{ urls: string[]; index: number; types: string[] } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [mediaLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  const {
    seguimientos,
    loading: loadingSeguimientos,
    error: errorSeguimientos,
    fetchSeguimientos,
  } = useSeguimientos(paciente?.id || "")

  const { cuentas, loading: loadingCuentas, error: errorCuentas } = useCuentaDeCobro()

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors((prev) => new Set([...prev, imageUrl]))
  }

  const handleRetryMedia = (imageUrl: string) => {
    setImageLoadErrors((prev) => {
      const newSet = new Set(prev)
      newSet.delete(imageUrl)
      return newSet
    })
  }

const handleMediaClick = (urls: string[], index: number, types: string[]) => {
  setSelectedMedia({ urls, index, types })
}

  const handleRetryFetchSeguimientos = async () => {
    try {
      await fetchSeguimientos()
    } catch (err) {
      console.error("Error al reintentar cargar seguimientos:", err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!usuario) {
          throw new Error("No hay usuario autenticado")
        }

        const userId = usuario.id || usuario.uid
        let userData = null

        // Intentar obtener el usuario por ID primero
        try {
          const userDoc = await getDoc(doc(db, "users", userId))
          if (userDoc.exists()) {
            userData = userDoc.data()
          }
        } catch (err) {
          console.warn("No se pudo obtener usuario por ID, intentando por email")
        }

        // Si no se encontró por ID, buscar por email
        if (!userData) {
          const usuariosQuery = query(collection(db, "users"), where("email", "==", usuario.email))
          const usuariosSnapshot = await getDocs(usuariosQuery)

          if (usuariosSnapshot.empty) {
            throw new Error(`Usuario no encontrado en la base de datos`)
          }

          userData = usuariosSnapshot.docs[0].data()
        }

        const pacienteId = userData.paciente_id

        if (!pacienteId) {
          setLoading(false)
          return
        }

        // Cargar datos del paciente
        const pacienteDoc = await getDoc(doc(db, "pacientes", pacienteId))
        if (!pacienteDoc.exists()) {
          throw new Error("Paciente no encontrado")
        }

        const pacienteData = {
          id: pacienteDoc.id,
          ...pacienteDoc.data(),
        } as Paciente

        setPaciente(pacienteData)
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido al cargar los datos"
        setError(errorMessage)
        setLoading(false)

        // Intentar nuevamente después de 3 segundos (máximo 3 intentos)
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, 3000)
        }
      }
    }

    if (usuario) {
      fetchData()
    } else {
      setLoading(false)
      setError("No hay usuario autenticado")
    }
  }, [usuario, retryCount])

  // Efecto separado para cargar seguimientos cuando el paciente esté listo
  useEffect(() => {
    const loadSeguimientos = async () => {
      if (!paciente?.id) return

      try {
        let attempts = 0
        const maxAttempts = 3

        const attemptFetch = async (): Promise<void> => {
          try {
            await fetchSeguimientos()
          } catch (err) {
            attempts++
            console.error(`Error al cargar seguimientos (intento ${attempts}):`, err)

            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 2000 * attempts))
              return attemptFetch()
            } else {
              console.error("Se agotaron los intentos para cargar seguimientos")
              throw err
            }
          }
        }

        await attemptFetch()
      } catch (err) {
        console.error("Error final al cargar seguimientos:", err)
      }
    }

    loadSeguimientos()
  }, [paciente?.id])

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    return edad
  }

  const formatFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "PPP", { locale: es })
    } catch (err) {
      console.warn("Error al formatear fecha:", fecha, err)
      return fecha
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "pendiente":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "completado":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const seguimientosActivos = seguimientos
    .filter((seg) => seg.isActive)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const cuentasPaciente = cuentas.filter((cuenta) => cuenta.paciente_id === paciente?.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4 mx-auto" />
            <p className="text-gray-600 font-medium">Cargando información del paciente...</p>
            {retryCount > 0 && <p className="text-gray-500 text-sm mt-2">Intento {retryCount + 1} de 4</p>}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white shadow-xl rounded-2xl p-8 text-center border-0">
            <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Error al cargar los datos</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">{error}</p>
            {retryCount < 3 && (
              <p className="text-gray-500 mb-4">Reintentando automáticamente... ({retryCount + 1}/3)</p>
            )}
            <Button
              variant="primary"
              onClick={() => {
                setRetryCount(0)
                window.location.reload()
              }}
              className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Intentar nuevamente
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white shadow-xl rounded-2xl p-8 text-center border-0">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No tienes ningún paciente asociado</h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
              Por favor contacta al administrador para más información sobre tu familiar.
            </p>
            <Button
              variant="primary"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Contactar soporte
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento del Paciente</h1>
              <p className="text-gray-500 text-lg">Información actualizada sobre {paciente.nombre_completo}</p>
            </div>
          </div>

          {/* Información básica */}
          <Card className="mb-8 bg-white shadow-xl rounded-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-blue-300 p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-32 flex-shrink-0">
                  <div className="relative pb-[125%] rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                    <User className="absolute inset-0 m-auto h-12 w-12 text-white/80" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-white">
                  <h2 className="text-2xl font-bold mb-4">{paciente.nombre_completo}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white/70 text-sm font-medium mb-1">Edad</p>
                      <p className="text-xl font-bold">{calcularEdad(paciente.fecha_nacimiento)} años</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white/70 text-sm font-medium mb-1">Documento</p>
                      <p className="text-xl font-bold">{paciente.documento}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Teléfono</p>
                    <p className="font-semibold text-gray-900">{paciente.telefono || "No registrado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    <p className="font-semibold text-gray-900">{paciente.email || "No registrado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(paciente.estado)}`}>
                      {paciente.estado}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border-0">
            <div className="flex border-b border-gray-100">
              <button
                className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
                  activeTab === "seguimiento"
                    ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("seguimiento")}
              >
                <div className="flex items-center justify-center gap-2">
                  <Activity className="h-5 w-5" />
                  Seguimiento
                </div>
              </button>
              <button
                className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
                  activeTab === "pagos"
                    ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("pagos")}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagos
                </div>
              </button>
            </div>

            {/* Contenido de tabs */}
            <div className="p-6">
              {activeTab === "seguimiento" ? (
                <div className="space-y-8">
                  {/* Resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium mb-1">Fecha de ingreso</p>
                          <p className="font-bold text-blue-900">{formatFecha(paciente.creado)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-lg">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-emerald-700 font-medium mb-1">Días en tratamiento</p>
                          <p className="font-bold text-emerald-900">
                            {differenceInDays(new Date(), parseISO(paciente.creado))} días
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-600 p-3 rounded-xl text-white shadow-lg">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-purple-700 font-medium mb-1">Estado actual</p>
                          <p className="font-bold text-purple-900 capitalize">{paciente.estado}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de seguimientos */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Registro de Seguimientos
                      </h3>
                      {errorSeguimientos && (
                        <Button
                          variant="ghost"
                          onClick={handleRetryFetchSeguimientos}
                          className="text-blue-600 hover:bg-blue-50"
                          size="sm"
                        >
                          <Loader2 className="h-4 w-4 mr-2" />
                          Reintentar
                        </Button>
                      )}
                    </div>

                    {loadingSeguimientos ? (
                      <div className="flex justify-center py-8">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Cargando seguimientos...</p>
                        </div>
                      </div>
                    ) : errorSeguimientos ? (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium mb-2">Error al cargar seguimientos</p>
                        <p className="text-sm">{errorSeguimientos}</p>
                      </div>
                    ) : seguimientosActivos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {seguimientosActivos.map((seguimiento) => (
                          <SeguimientoCard
  key={seguimiento.id}
  seguimiento={seguimiento}
  onMediaClick={handleMediaClick}
  mediaLoadErrors={mediaLoadErrors}
  onRetryMedia={handleRetryMedia}
/>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No hay seguimientos activos registrados</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Historial de pagos */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      Historial de Pagos
                    </h3>

                    {loadingCuentas ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                    ) : errorCuentas ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-lg">{errorCuentas}</div>
                    ) : cuentasPaciente.length > 0 ? (
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Concepto</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Monto</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Periodo</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {cuentasPaciente.map((cuenta) => (
                                <tr key={cuenta.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {formatFecha(cuenta.fecha)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">{cuenta.concepto}</td>
                                  <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                                    ${cuenta.monto.toLocaleString("es-CO")}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {formatFecha(cuenta.periodo.desde)} - {formatFecha(cuenta.periodo.hasta)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                        cuenta.estado === "pagada"
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-amber-100 text-amber-800 border border-amber-200"
                                      }`}
                                    >
                                      {cuenta.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No hay registros de pagos</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card de contacto */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-3">¿Necesitas ayuda?</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Contacta a nuestro equipo de soporte para cualquier inquietud sobre el tratamiento.
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="bg-blue-400 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                >
                  Contactar soporte
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de imágenes */}
    {selectedMedia && (
  <MediaModal
    mediaUrls={selectedMedia.urls}
    mediaTypes={selectedMedia.types}
    initialIndex={selectedMedia.index}
    onClose={() => setSelectedMedia(null)}
    isOpen={!!selectedMedia}
  />
)}
    </>
  )
}

export default FamiliarPage