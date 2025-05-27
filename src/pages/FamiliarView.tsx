import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  Activity,
  Camera,
  FileText,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { db } from "../utils/firebase";
import { RegistroDiario } from "../utils/supabase";
import { Dialog } from "../components/ui/Dialog";

interface Props {
  usuarioId?: string; // ID del familiar
}

const FamiliarView: React.FC<Props> = ({ usuarioId }) => {
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [expandedRegistros, setExpandedRegistros] = useState<string[]>([]);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  console.log("Buscando usuario con auth_uid:", usuarioId);
  // ✅ Conversión de "DD/MM/YYYY" a Date
  const parseFecha = (fecha: string): Date => {
    const [dia, mes, año] = fecha.split("/");
    return new Date(Number(año), Number(mes) - 1, Number(dia)); // ← local
  };

  // ✅ Formateo de Date a "DD/MM/YYYY"
  const formatFechaCorta = (fecha: Date): string => {
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // 🔄 Obtener paciente asociado al familiar
  const fetchPacienteId = async () => {
    if (!usuarioId) return;

    console.log("Buscando usuario con auth_uid:", usuarioId);

    const userSnap = await getDocs(
      query(collection(db, "users"), where("auth_uid", "==", usuarioId))
    );

    if (userSnap.empty) {
      console.error("No se encontró el usuario con ese auth_uid");
      return;
    }

    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();
    const familiarId = userDoc.id; // este es el id que se guarda en familiar_id del paciente

    console.log("Buscando paciente con familiar_id:", familiarId);

    const pacienteSnap = await getDocs(
      query(collection(db, "pacientes"), where("familiar_id", "==", familiarId))
    );

    if (pacienteSnap.empty) {
      console.error("No se encontró paciente con ese familiar_id");
      return;
    }

    const pacienteDoc = pacienteSnap.docs[0];
    const pacienteData = { id: pacienteDoc.id, ...pacienteDoc.data() };

    setPacienteInfo(pacienteData);
    fetchRegistros(pacienteData.id);
  };

  // 📦 Obtener registros de seguimiento
  const fetchRegistros = async (pacienteId: string) => {
    const q = query(
      collection(db, "seguimiento"),
      where("paciente_id", "==", pacienteId)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RegistroDiario[];

    const ordenados = data.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    setRegistros(ordenados);
    if (ordenados.length > 0) {
      setExpandedRegistros([ordenados[0].id]);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      fetchPacienteId();
    }
  }, [usuarioId]);

  const toggleExpand = (id: string) => {
    setExpandedRegistros((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calcularDiasInternado = () => {
    if (!pacienteInfo?.fecha_ingreso) return 0;
    const fechaInicio = parseFecha(pacienteInfo.fecha_ingreso);
    const hoy = new Date();

    const diferencia = hoy.getTime() - fechaInicio.getTime();
    return Math.max(Math.floor(diferencia / (1000 * 3600 * 24)), 0);
  };

  const formatFechaLocal = (fechaStr: string) => {
    if (!fechaStr) return "Fecha inválida";
    const [year, month, day] = fechaStr.split("-");
    return new Date(+year, +month - 1, +day).toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!pacienteInfo)
    return (
      <p className="p-6 text-gray-500">Cargando información del paciente...</p>
    );

  const calcularProgreso = () => {
    const fechaInicio = pacienteInfo?.fecha_ingreso
      ? parseFecha(pacienteInfo.fecha_ingreso)
      : null;

    const fechaFin = pacienteInfo?.fecha_salida
      ? parseFecha(pacienteInfo.fecha_salida)
      : null;

    if (!fechaInicio || isNaN(fechaInicio.getTime())) return 0;

    const ahora = new Date();

    const total =
      fechaFin && !isNaN(fechaFin.getTime())
        ? fechaFin.getTime() - fechaInicio.getTime()
        : ahora.getTime() - fechaInicio.getTime();

    const avance = ahora.getTime() - fechaInicio.getTime();

    if (total <= 0) return 0;

    return Math.min((avance / total) * 100, 100);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Seguimiento de mi familiar
        </h1>
        <p className="text-gray-500">Visualiza el progreso diario</p>
      </div>

      {/* Card del paciente */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="p-2 md:p-2">
          <h2 className="text-2xl font-bold mb-1 text-white">
            {pacienteInfo.nombre_completo}
          </h2>
          <p className="text-primary-100 mb-4">
            {pacienteInfo.motivo_anexo || "Sin motivo registrado"}
          </p>
          <div className="flex gap-8 items-center flex-wrap">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {formatFechaCorta(parseFecha(pacienteInfo.fecha_ingreso))}
            </div>
            {/* <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {calcularDiasInternado()} días internado
            </div> */}
            <div className="w-full">
              <div className="">
                <div className="flex justify-between mb-1 text-sm text-white">
                  <span>
                    Inicio:{" "}
                    {formatFechaCorta(parseFecha(pacienteInfo.fecha_ingreso))}
                  </span>
                  <span>Progreso: {Math.floor(calcularProgreso())}%</span>
                  <span>
                    Salida:{" "}
                    {pacienteInfo.fecha_salida
                      ? formatFechaCorta(parseFecha(pacienteInfo.fecha_salida))
                      : ""}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div
                    className="bg-white h-2.5 rounded-full"
                    style={{ width: `${calcularProgreso()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Estado:{" "}
              {calcularProgreso() >= 100
                ? "Dado de alta"
                : pacienteInfo.estado || "activo"}
            </span>
          </div>
        </div>
      </Card>

      {/* Línea de tiempo */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Línea de tiempo</h2>
        <div className="space-y-8">
          {registros.map((r) => (
            <Card key={r.id} className="relative overflow-hidden">
              <div className="p-2 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">
                      {formatFechaLocal(r.fecha)}
                    </h3>
                    {/* <p className="text-gray-500 text-sm">
                      Día {calcularDiasInternado() - registros.indexOf(r)}
                    </p> */}
                  </div>
                  <button onClick={() => toggleExpand(r.id)}>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandedRegistros.includes(r.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Descripción
                  </h4>
                  <p className="text-gray-900">{r.descripcion}</p>
                </div>

                {r.imagen_evidencia && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <Camera size={16} className="mr-1" /> Fotografía del día
                    </h4>
                    <img
                      src={r.imagen_evidencia}
                      alt="Evidencia"
                      className="w-full max-h-60 object-cover rounded border cursor-pointer hover:opacity-90"
                      onClick={() => setZoomUrl(r.imagen_evidencia)}
                    />
                  </div>
                )}

                {expandedRegistros.includes(r.id) && (
                  <div className="pt-4 border-t border-gray-200 grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Medicamentos
                      </h4>
                      <p className="text-gray-900">
                        {r.medicamentos || "No registrado"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Comidas
                      </h4>
                      <p className="text-gray-900">
                        {r.comidas || "No registrado"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Comportamiento
                      </h4>
                      <p className="text-gray-900">
                        {r.comportamiento || "No registrado"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Peso
                      </h4>
                      <p className="text-gray-900">{r.peso} kg</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Observaciones
                      </h4>
                      <p className="text-gray-900">
                        {r.observaciones || "Sin observaciones"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText size={16} />}
                    onClick={() => toggleExpand(r.id)}
                  >
                    {expandedRegistros.includes(r.id) ? "Ver menos" : "Ver más"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {zoomUrl && (
        <Dialog
          isOpen={!!zoomUrl}
          onClose={() => setZoomUrl(null)}
          title="Fotografía"
        >
          <img
            src={zoomUrl}
            alt="Zoom evidencia"
            className="max-h-[70vh] w-full object-contain rounded"
          />
        </Dialog>
      )}
    </div>
  );
};

export default FamiliarView;
