import React, { useState } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { PagosTable } from "../pagos/PagosTable";
import LineaTiempoSeguimiento from "../lineaTiempo/LineaTiempoSeguimiento";
import MedicamentosForm from "../medicamentos/Medicamentos";
import { BadgeInfo, Calendar, Fingerprint, KeyRound, Mail, Phone, ShieldCheck, User } from "lucide-react";

interface PacienteDrawerProps {
  pacienteDrawer: any;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  familiares: any[];
  usuario: any;
}

const PacienteDrawerView = ({
  pacienteDrawer,
  open,
  onClose,
  onOpen,
  familiares,
  usuario,
}: PacienteDrawerProps) => {
  const [activeTab, setActiveTab] = useState("seguimiento");

  if (!pacienteDrawer) return null;

  const familiarAsignado = familiares.find(
    (f) => f.id === pacienteDrawer.familiar_id
  );

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
    >
      <Box sx={{ width: "83vw", maxWidth: "100%", p: 4 }} role="presentation">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            {pacienteDrawer.nombre_completo}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <img
                src={pacienteDrawer.imagen_url}
                alt="Paciente"
                className="rounded-lg w-full h-[200px] object-cover"
              />
            </div>

            <div className="md:col-span-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border rounded-md p-3">
                  <h4 className="text-xs text-gray-500">Estado</h4>
                  <p className="font-sm">{pacienteDrawer.estado}</p>
                </div>
                <div className="bg-white border rounded-md p-3">
                  <h4 className="text-xs text-gray-500">Plan de tratamiento</h4>
                  <p className="text-sm">{pacienteDrawer.fecha_salida}</p>
                </div>
                <div className="bg-white border rounded-md p-3">
                  <h4 className="text-xs text-gray-500">Fecha ingreso</h4>
                  <p className="font-sm">{pacienteDrawer.fecha_ingreso}</p>
                </div>
              </div>

              <div className="bg-white border rounded-md p-3">
                <h4 className="text-xs text-gray-500">Motivo</h4>
                <p className="font-sm">{pacienteDrawer.motivo_anexo}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-4 border-b pb-2 mb-4">
              {["Medico", "seguimiento", "familia", "Pagos"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium pb-1 border-b-2 ${
                    activeTab === tab
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
              {activeTab === "familia" && (
                <div className="space-y-3">
                  {familiarAsignado ? (
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={
                          familiarAsignado.imagen_perfil ||
                          "/default-avatar.png"
                        }
                        alt="Familiar"
                        className="rounded-xl w-52 h-48 object-cover border shadow-sm"
                      />
                      <div className="text-gray-800 space-y-2 text-sm md:text-base flex-1">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">ID:</span>
                          <span>{familiarAsignado.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Nombre:</span>
                          <span>{familiarAsignado.nombre_completo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Correo:</span>
                          <span>{familiarAsignado.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Teléfono:</span>
                          <span>
                            {familiarAsignado.telefono || "No disponible"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Contraseña:</span>
                          <span>
                            {familiarAsignado.password || "No definida"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Registrado el:</span>
                          <span>
                            {new Date(
                              familiarAsignado.created_at
                            ).toLocaleString("es-MX")}
                          </span>
                        </div>
                        {familiarAsignado.descripcion && (
                          <div className="flex items-start gap-2">
                            <BadgeInfo className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="font-medium">Descripción:</span>
                            <span>{familiarAsignado.descripcion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No hay familiar asignado
                    </p>
                  )}
                </div>
              )}

              {activeTab === "seguimiento" && (
                <LineaTiempoSeguimiento
                  pacienteId={pacienteDrawer.id}
                  usuarioId={usuario?.id || "admin"}
                />
              )}
              {activeTab === "Medico" && (
                <MedicamentosForm
                  pacienteId={pacienteDrawer.id}
                  usuarioId={usuario?.id || "admin"}
                />
              )}
              {activeTab === "Pagos" && (
                <PagosTable
                  pacienteId={pacienteDrawer.id}
                  familiarId={pacienteDrawer.familiar_id}
                  usuarioId={usuario?.id || "admin"}
                />
              )}
            </div>
          </div>
        </div>
      </Box>
    </SwipeableDrawer>
  );
};

export default PacienteDrawerView;
