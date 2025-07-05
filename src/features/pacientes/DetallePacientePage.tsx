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
    <div className="bg-gray-50 min-h-screen">
      {/* Header simplificado */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate('/pacientes')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 p-2"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </Button>

            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-2xl">
              {paciente.nombre_completo}
            </h1>

            <div className="w-10"></div> {/* Espaciador para balance */}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tarjeta de información del paciente */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              {/* Foto de perfil */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  <img
                    src={imagenEjemplo}
                    alt={paciente.nombre_completo}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Información básica */}
              <div className="flex-grow text-center sm:text-left">
                <div className="mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {paciente.nombre_completo}
                  </h2>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      ID: {paciente.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      paciente.estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {paciente.estado}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <span className="font-medium">Ingreso:</span>
                    <span>{formatDate(paciente.fecha_ingreso)}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <span className="font-medium">Teléfono:</span>
                    <span>{paciente.telefono || "No especificado"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Navegación por pestañas - versión responsiva */}
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 min-w-max px-2 sm:px-4">
                <TabWithTooltip
                  tooltip="Información general del paciente"
                  isActive={tabIndex === 0}
                  onClick={() => setTabIndex(0)}
                  icon={FileText}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Información</span>
                  <span className="sm:hidden">Info</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Familiares y contactos"
                  isActive={tabIndex === 1}
                  onClick={() => setTabIndex(1)}
                  icon={Users}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  Familiares
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Seguimiento médico"
                  isActive={tabIndex === 2}
                  onClick={() => setTabIndex(2)}
                  icon={Activity}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Seguimiento</span>
                  <span className="sm:hidden">Seg.</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Recetas médicas"
                  isActive={tabIndex === 3}
                  onClick={() => setTabIndex(3)}
                  icon={Pill}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  Recetas
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Cuentas y pagos"
                  isActive={tabIndex === 4}
                  onClick={() => setTabIndex(4)}
                  icon={CreditCard}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Cuentas</span>
                  <span className="sm:hidden">Ctás.</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Internamientos"
                  isActive={tabIndex === 5}
                  onClick={() => setTabIndex(5)}
                  icon={Building2}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Ingresos</span>
                  <span className="sm:hidden">Int.</span>
                </TabWithTooltip>

                <TabWithTooltip
                  tooltip="Visitas programadas"
                  isActive={tabIndex === 6}
                  onClick={() => setTabIndex(6)}
                  icon={Calendar}
                  className="px-3 py-2 text-xs sm:text-sm"
                >
                  Visitas
                </TabWithTooltip>
              </div>
            </div>
          </div>

          {/* Contenido de las pestañas */}
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