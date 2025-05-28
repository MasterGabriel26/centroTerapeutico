import React, { useState } from "react";
import { Tabs, TabList, Tab, TabPanel } from "../../../components/ui/Tabs";
import InfoGeneral from "./PacienteDetalleTabs/InfoGeneral";
import FamiliaresTab from "./PacienteDetalleTabs/FamiliaresTab";
import ImagenesTab from "./PacienteDetalleTabs/ImagenesTab";
import FormulaTab from "./PacienteDetalleTabs/FormulaTab";
import NovedadesTab from "./PacienteDetalleTabs/NovedadesTab";
import { Paciente } from "../types/paciente";

interface Props {
  open: boolean;
  onClose: () => void;
  paciente: Paciente | null;
}

const PacienteDetalleDialog: React.FC<Props> = ({ open, onClose, paciente }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!open || !paciente) return null;
  console.log("PacienteDetalleDialogs:", paciente);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center font-poppins">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl min-h-[600px] flex flex-col overflow-hidden relative">

        {/* Botón cerrar (posición absoluta) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-100 bg-black/30 hover:bg-black/50 p-1.5 rounded-full text-lg z-10"
          title="Cerrar"
        >
          &times;
        </button>

        {/* Header superior con color */}

        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_Peru_%281884%E2%80%931950%29.svg"
          alt="Foto perfil"
          className="w-24 h-24  border-4 border-white shadow-md object-cover mt-10 ml-10"
        />
        {/* Nombre y correo */}
        <div className="mt-5 text-center px-4">
          <h2 className="text-xl font-semibold text-gray-800">{paciente.nombre_completo}</h2>
          <p className="text-sm text-gray-500">{paciente.email}</p>
        </div>

        {/* Tabs + contenido */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
          <Tabs selectedIndex={tabIndex} onSelect={setTabIndex}>
            <TabList selectedIndex={tabIndex} onSelect={setTabIndex}>
              <Tab>Información</Tab>
              <Tab>Familiares</Tab>
              <Tab>Fotografías</Tab>
              <Tab>Receta médica</Tab>
              <Tab>Novedades</Tab>
            </TabList>

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
      </div>
    </div>
  );
};

export default PacienteDetalleDialog;
