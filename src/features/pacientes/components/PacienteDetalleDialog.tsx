import React, { useState } from "react";
import { Tabs, TabList, Tab, TabPanel } from "../../../components/ui/Tabs";
import InfoGeneral from "./PacienteDetalleTabs/InfoGeneral";
import FamiliaresTab from "./PacienteDetalleTabs/FamiliaresTab";
import ImagenesTab from "./PacienteDetalleTabs/ImagenesTab";
import FormulaTab from "./PacienteDetalleTabs/RecetasTab";
import NovedadesTab from "./PacienteDetalleTabs/NovedadesTab";
import { Paciente } from "../types/paciente";
import { Button } from "../../../components/ui/Button";
import { X, User } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  paciente: Paciente | null;
}

const PacienteDetalleDialog: React.FC<Props> = ({ open, onClose, paciente }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!open || !paciente) return null;

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
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                {paciente.imagen_url ? (
                  <img
                    src={paciente.imagen_url}
                    alt={paciente.nombre_completo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">{paciente.nombre_completo}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-100 opacity-80 font-medium">ID: {paciente.id}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    paciente.estado === "activo" ? "bg-blue-200 text-blue-900" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {paciente.estado}
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

        {/* Tabs Navigation */}
        <div className="border-b border-gray-100 px-6 bg-gray-50">
          <TabList 
            selectedIndex={tabIndex} 
            onSelect={setTabIndex}
            className="flex space-x-8 overflow-x-auto hide-scrollbar"
          >
            <Tab 
              className={`py-4 px-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tabIndex === 0
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              }`}
            >
              Información
            </Tab>
            <Tab 
              className={`py-4 px-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tabIndex === 1
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              }`}
            >
              Familiares
            </Tab>
            <Tab 
              className={`py-4 px-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tabIndex === 2
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              }`}
            >
              Fotografías
            </Tab>
            <Tab 
              className={`py-4 px-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tabIndex === 3
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              }`}
            >
              Receta médica
            </Tab>
            <Tab 
              className={`py-4 px-2 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tabIndex === 4
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              }`}
            >
              Novedades
            </Tab>
          </TabList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs selectedIndex={tabIndex} onSelect={setTabIndex}>
            <TabPanel>
              <InfoGeneral paciente={paciente} />
            </TabPanel>
            <TabPanel>
              <FamiliaresTab pacienteId={paciente.id!} />
            </TabPanel>
            <TabPanel>
              <ImagenesTab pacienteId={paciente.id!} />
            </TabPanel>
            <TabPanel>
              <FormulaTab pacienteId={paciente.id!} />
            </TabPanel>
            <TabPanel>
              <NovedadesTab pacienteId={paciente.id!} />
            </TabPanel>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end items-center bg-gray-50">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-gray-200"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PacienteDetalleDialog;