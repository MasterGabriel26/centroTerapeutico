"use client"

import { useState } from "react"
import {
  BadgeInfo,
  Calendar,
  Fingerprint,
  KeyRound,
  Phone,
  ClipboardList,
  Users,
  CreditCard,
  Activity,
  X,
  User,
} from "lucide-react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { PagosTable } from "../pagos/PagosTable"
import LineaTiempoSeguimiento from "../lineaTiempo/LineaTiempoSeguimiento"
import MedicamentosForm from "../medicamentos/Medicamentos"

interface PacienteDrawerProps {
  pacienteDrawer: any
  open: boolean
  onClose: () => void
  familiares: any[]
  usuario: any
}

const PacienteDetailsModal = ({ pacienteDrawer, open, onClose, familiares, usuario }: PacienteDrawerProps) => {
  const [activeTab, setActiveTab] = useState("seguimiento")

  if (!pacienteDrawer) return null

  const familiarAsignado = familiares.find((f) => f.id === pacienteDrawer.familiar_id)

  const tabs = [
    { id: "seguimiento", label: "Seguimiento", icon: <Activity size={18} /> },
    { id: "medico", label: "Médico", icon: <ClipboardList size={18} /> },
    { id: "familia", label: "Familia", icon: <Users size={18} /> },
    { id: "pagos", label: "Pagos", icon: <CreditCard size={18} /> },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-300`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform ${
          open ? "scale-100" : "scale-95"
        } transition-transform duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">{pacienteDrawer.nombre_completo}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-100 opacity-80 font-medium">ID: {pacienteDrawer.id}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    pacienteDrawer.estado === "activo" ? "bg-blue-200 text-blue-900" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {pacienteDrawer.estado}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {/* Información básica */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0 flex items-start">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                    {pacienteDrawer.imagen_url ? (
                      <img
                        src={pacienteDrawer.imagen_url || "/placeholder.svg"}
                        alt={pacienteDrawer.nombre_completo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={42} className="text-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Fecha de Ingreso</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      {pacienteDrawer.fecha_ingreso}
                    </p>
                  </Card>
                  <Card className="p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Fecha de Salida</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      {pacienteDrawer.fecha_salida || "En tratamiento"}
                    </p>
                  </Card>
                  <Card className="p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Familiar Asignado</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Users size={16} className="text-blue-500" />
                      {familiarAsignado?.nombre_completo || "No asignado"}
                    </p>
                  </Card>
                </div>

                <Card className="p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Motivo de Anexo</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{pacienteDrawer.motivo_anexo}</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="border-b border-gray-100 px-6 bg-gray-50">
            <nav className="flex space-x-8 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 ${
                      activeTab === tab.id ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {activeTab === "familia" && (
              <div className="space-y-6">
                {familiarAsignado ? (
                  <>
                    <div className="flex flex-col xl:flex-row gap-6">
                      <div className="w-full xl:w-1/3">
                        <Card className="p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm rounded-xl">
                          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-md mb-4">
                            {familiarAsignado.imagen_perfil ? (
                              <img
                                src={familiarAsignado.imagen_perfil || "/placeholder.svg"}
                                alt={familiarAsignado.nombre_completo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={36} className="text-gray-300" />
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">{familiarAsignado.nombre_completo}</h4>
                          <p className="text-sm text-gray-500 mt-1">{familiarAsignado.email}</p>
                          <div className="mt-4 w-full">
                            <Button variant="outline" size="sm" className="w-full">
                              Contactar
                            </Button>
                          </div>
                        </Card>
                      </div>

                      <div className="w-full xl:w-2/3">
                        <Card className="p-6 border border-gray-100 shadow-sm rounded-xl">
                          <h3 className="text-lg font-medium mb-5 text-gray-800 pb-2 border-b border-gray-100">
                            Detalles del Familiar
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Fingerprint className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">ID</p>
                                <p className="text-sm font-medium">{familiarAsignado.id}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Phone className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Teléfono</p>
                                <p className="text-sm font-medium">{familiarAsignado.telefono || "No disponible"}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <KeyRound className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Contraseña</p>
                                <p className="text-sm font-medium">{familiarAsignado.password || "No definida"}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                                  Registrado el
                                </p>
                                <p className="text-sm font-medium">
                                  {new Date(familiarAsignado.created_at).toLocaleString("es-MX")}
                                </p>
                              </div>
                            </div>
                          </div>

                          {familiarAsignado.descripcion && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <BadgeInfo className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">
                                    Descripción
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {familiarAsignado.descripcion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="p-8 text-center border border-gray-100 shadow-sm rounded-xl">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No hay familiar asignado</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      Este paciente no tiene un familiar asignado actualmente.
                    </p>
                    <div className="mt-6">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Asignar Familiar
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "seguimiento" && (
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <LineaTiempoSeguimiento pacienteId={pacienteDrawer.id} usuarioId={usuario?.id || "admin"} />
              </div>
            )}

            {activeTab === "medico" && (
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <MedicamentosForm pacienteId={pacienteDrawer.id} usuarioId={usuario?.id || "admin"} />
              </div>
            )}

            {activeTab === "pagos" && (
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <PagosTable
                  pacienteId={pacienteDrawer.id}
                  familiarId={pacienteDrawer.familiar_id}
                  usuarioId={usuario?.id || "admin"}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-between items-center bg-gray-50">
          <div className="text-xs text-gray-500 font-medium">Última actualización: {new Date().toLocaleString()}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="border-gray-200">
              Cerrar
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PacienteDetailsModal
