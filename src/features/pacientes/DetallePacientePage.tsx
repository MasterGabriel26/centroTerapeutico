import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabList, Tab, TabPanel } from "../../components/ui/Tabs";
import InfoGeneral from "./components/PacienteDetalleTabs/InfoGeneral";
import FamiliaresTab from "./components/PacienteDetalleTabs/FamiliaresTab";
import ImagenesTab from "./components/PacienteDetalleTabs/ImagenesTab";
import RecetasTab from "./components/PacienteDetalleTabs/RecetasTab";
import NovedadesTab from "./components/PacienteDetalleTabs/NovedadesTab";
import VisitasTab from "./components/PacienteDetalleTabs/VisitasTab";
import { Paciente } from "./types/paciente";
import { Button } from "../../components/ui/Button";
import { User, ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';



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
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className=" text-white px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button
              onClick={() => navigate('/pacientes')}
              variant="ghost"
              className="bg-gradient-to-r from-blue-700 to-blue-900 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Volver a pacientes</span>
            </Button>

            <h1 className="text-xl sm:text-2xl font-bold text-black text-center">
              Detalle del Paciente
            </h1>

            <div className="invisible sm:hidden">Espacio</div>
          </div>
        </div>
      </div>

      {/* Paciente Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
            {/* Foto de perfil con más protagonismo */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={imagenEjemplo}
                  alt={paciente.nombre_completo}
                  className="w-full h-full object-cover"
                />
                {/* {paciente.imagen_url ? (
                  <img
                    src={imagenEjemplo}
                    alt={paciente.nombre_completo}
                    className="w-full h-full object-cover"
                  />
                ) : (
               
                  <img
                    src={imagenEjemplo}
                    alt={paciente.nombre_completo}
                    className="w-full h-full object-cover"
                  />
                )} */}
              </div>

            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {paciente.nombre_completo}
                </h2>

                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    ID: {paciente.id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${paciente.estado === "activo"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                    }`}>
                    {paciente.estado}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <span className="font-medium">Ingreso:</span>
                  <span>{formatDate(paciente.fecha_ingreso)}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <span className="font-medium">Teléfono:</span>
                  <span>{paciente.telefono || "No especificado"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Tabs Navigation */}
          <div className="bg-gray-50 border-b border-gray-200 px-6">
            <TabList
              selectedIndex={tabIndex}
              onSelect={setTabIndex}
              className="flex overflow-x-auto hide-scrollbar"
            >
              <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 0
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Información General
              </Tab>
              <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 1
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Familiares
              </Tab>
              <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 2
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Seguimiento
              </Tab>
              <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 3
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Receta Médica
              </Tab>
              {/* <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 4
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Novedades
              </Tab> */}
              <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 4
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Cuentas de cobro
              </Tab>
              <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 5
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Ingresos del paciente
              </Tab>

               <Tab
                className={`py-4 px-4 flex items-center gap-2 font-medium border-b-2 whitespace-nowrap transition-all ${tabIndex === 6
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
              >
                Visitas
              </Tab>


            </TabList>
          </div>

          {/* Tab Content */}
          <div className="p-6">
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
              {/* <TabPanel>
                <NovedadesTab pacienteId={paciente.id!} />
              </TabPanel> */}
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