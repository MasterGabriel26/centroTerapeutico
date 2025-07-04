import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabList, TabPanel } from "../../components/ui/Tabs";
import InfoGeneral from "./components/PacienteDetalleTabs/InfoGeneral";
import FamiliaresTab from "./components/PacienteDetalleTabs/FamiliaresTab";
import ImagenesTab from "./components/PacienteDetalleTabs/SeguimientoTab";
import RecetasTab from "./components/PacienteDetalleTabs/RecetasTab";
import NovedadesTab from "./components/PacienteDetalleTabs/NovedadesTab";
import VisitasTab from "./components/PacienteDetalleTabs/VisitasTab";
import { Paciente } from "./types/paciente";
import { Button } from "../../components/ui/Button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  User,
  Users,
  Activity,
  Pill,
  CreditCard,
  Building2,
  FileText,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { TabWithTooltip } from "./components/TabWithTooltip";
import imagenEjemplo from "./ejemplo1.jpg"
import CuentasTab from "./components/PacienteDetalleTabs/CuentasTab";
import IngresosTab from "./components/PacienteDetalleTabs/IngresosTab";

// Configuración de tooltips para cada tab
const TAB_TOOLTIPS = {
  infoGeneral: "Información personal básica del paciente, datos de contacto y detalles médicos generales",
  familiares: "Registro de familiares y personas de contacto del paciente, fundamental para el apoyo durante el tratamiento",
  seguimiento: "Historial de progreso del paciente, evolución del tratamiento y notas de seguimiento médico",
  recetas: "Prescripciones médicas, medicamentos recetados y tratamientos farmacológicos del paciente",
  cuentas: "Gestión de pagos, facturación y estados de cuenta relacionados con el tratamiento",
  internamientos: "Historial de hospitalizaciones, ingresos y egresos del centro de rehabilitación",
  visitas: "Registro de visitas familiares, citas médicas y encuentros terapéuticos programados"
};

const PacienteDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaciente = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const docRef = doc(db, "pacientes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPaciente({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Paciente, "id">),
          });
        } else {
          console.log("No se encontró el paciente!");
        }
      } catch (error) {
        console.error("Error al cargar paciente:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";

    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Paciente no encontrado</h2>
          <p className="text-gray-600 mb-6">El paciente solicitado no existe o no se pudo cargar</p>
          <Button
            onClick={() => navigate('/pacientes')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Volver a la lista de pacientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    // En la parte del header
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Header mejorado */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/pacientes')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 p-2"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </Button>

            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Detalle del Paciente
            </h1>

            {/* Espacio para balance visual */}
            <div className="w-[60px] sm:w-[80px]"></div>
          </div>
        </div>
      </div>

      {/* Paciente Header mejorado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-blue-100">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
              {/* Foto de perfil responsiva */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={imagenEjemplo}
                    alt={paciente.nombre_completo}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-grow text-center sm:text-left w-full">
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                    {paciente.nombre_completo}
                  </h2>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                      ID: {paciente.id}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${paciente.estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }`}>
                      {paciente.estado}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">Ingreso:</span>
                    <span className="break-words">{formatDate(paciente.fecha_ingreso)}</span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm sm:text-base">
                    <span className="font-medium">Teléfono:</span>
                    <span className="break-words">{paciente.telefono || "No especificado"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Tabs Navigation completamente responsiva */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide px-2 sm:px-6">
              <div className="flex space-x-1 sm:space-x-2 min-w-max">
                <TabWithTooltip
                  tooltip="Información personal básica del paciente, datos de contacto y detalles médicos generales"
                  isActive={tabIndex === 0}
                  onClick={() => setTabIndex(0)}
                  icon={FileText}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <span className="sm:hidden">Info</span>
                  <span className="hidden sm:inline">Información General</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Registro de familiares y personas de contacto del paciente"
                  isActive={tabIndex === 1}
                  onClick={() => setTabIndex(1)}
                  icon={Users}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  Familiares
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Historial de progreso del paciente, evolución del tratamiento"
                  isActive={tabIndex === 2}
                  onClick={() => setTabIndex(2)}
                  icon={Activity}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  Seguimiento
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Prescripciones médicas y medicamentos recetados"
                  isActive={tabIndex === 3}
                  onClick={() => setTabIndex(3)}
                  icon={Pill}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <span className="sm:hidden">Recetas</span>
                  <span className="hidden sm:inline">Receta Médica</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Gestión de pagos y facturación"
                  isActive={tabIndex === 4}
                  onClick={() => setTabIndex(4)}
                  icon={CreditCard}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <span className="sm:hidden">Cuentas</span>
                  <span className="hidden sm:inline">Cuentas de cobro</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Historial de hospitalizaciones e ingresos"
                  isActive={tabIndex === 5}
                  onClick={() => setTabIndex(5)}
                  icon={Building2}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <span className="sm:hidden">Ingresos</span>
                  <span className="hidden sm:inline">Internamientos</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Registro de visitas familiares y citas médicas"
                  isActive={tabIndex === 6}
                  onClick={() => setTabIndex(6)}
                  icon={Calendar}
                  className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  Visitas
                </TabWithTooltip>
              </div>
            </div>
          </div>

          {/* Tab Content */}
         <div className="p-4 sm:p-6">
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
                <RecetasTab pacienteId={paciente.id!} />
              </TabPanel>
              <TabPanel>
                <CuentasTab pacienteId={paciente.id!} />
              </TabPanel>
              <TabPanel>
                <IngresosTab
                  paciente={paciente!}
                  onReingreso={() => console.log("Reingreso desde TabPanel")}
                />
              </TabPanel>
              <TabPanel>
                <VisitasTab pacienteId={paciente.id!} />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacienteDetallePage;