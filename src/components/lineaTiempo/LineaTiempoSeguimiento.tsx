// RegistroDiarioSeguimiento.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../utils/firebase";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Dialog } from "../ui/Dialog";
import { RegistroDiario } from "../../utils/supabase";
import {
  CalendarDays,
  Clock3,
  Edit,
  FileText,
  ImageIcon,
  Maximize2,
  Pill,
  Smile,
  StickyNote,
  Trash2,
  Utensils,
  Weight,
} from "lucide-react";

interface Props {
  pacienteId: string;
  usuarioId: string;
}

const RegistroDiarioSeguimiento: React.FC<Props> = ({
  pacienteId,
  usuarioId,
}) => {
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [form, setForm] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null); // ← ESTA LÍNEA
  const [fechaIngreso, setFechaIngreso] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaciente = async () => {
      const docSnap = await getDoc(doc(db, "pacientes", pacienteId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFechaIngreso(data.fecha_ingreso);
      }
    };

    fetchPaciente();
  }, [pacienteId]);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [pacienteId]);

  const handleSubmit = async () => {
    let url = form.imagen_evidencia || "";
    if (file) {
      const nombre = `seguimiento/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, nombre);
      await uploadBytes(storageRef, file);
      url = await getDownloadURL(storageRef);
    }

    const fechaActual = new Date().toISOString();
    const payload = {
      ...form,
      imagen_evidencia: url,
      paciente_id: pacienteId,
      updated_at: fechaActual,
      updated_by: usuarioId,
      historial: [
        ...(form.historial || []),
        {
          tipo: editando ? "edicion" : "creacion",
          fecha: fechaActual,
          usuario: usuarioId,
        },
      ],
    };

    if (editando) {
      await updateDoc(doc(db, "seguimiento", editando), payload);
    } else {
      await addDoc(collection(db, "seguimiento"), {
        ...payload,
        created_at: fechaActual,
        created_by: usuarioId,
      });
    }

    setDialogOpen(false);
    setForm({});
    setFile(null);
    setEditando(null);
    fetchData();
  };

  const handleEditar = (r: RegistroDiario) => {
    setForm(r);
    setEditando(r.id);
    setDialogOpen(true);
  };

  const handleEliminar = async (id: string) => {
    await deleteDoc(doc(db, "seguimiento", id));
    fetchData();
  };

  const handleVerHistorial = (r: any) => {
    const ordenado = [...(r.historial || [])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    setHistorial(ordenado);
    setShowHistorial(true);
  };

  const CardItem = ({
    icon: Icon,
    label,
    content,
    color = "bg-blue-100",
    iconColor = "text-blue-600",
    borderColor = "border-gray-200",
  }: {
    icon: React.ElementType;
    label: string;
    content?: string;
    color?: string;
    iconColor?: string;
    borderColor?: string;
  }) => (
    <div
      className={`rounded-xl p-4 min-w-[180px] max-w-full ${color} border ${borderColor} text-gray-800 flex-1 flex items-start gap-2`}
    >
      <div className={`bg-white bg-opacity-40 p-2 rounded-full ${iconColor}`}>
        <Icon className={`w-5 h-5`} />
      </div>
      <div>
        <p className="font-semibold text-sm leading-none mb-1">{label}</p>
        <p className="text-sm whitespace-pre-wrap leading-snug">
          {content || "Sin información"}
        </p>
      </div>
    </div>
  );

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

  const diasDesdeIngreso = (
    fechaSeguimiento: string,
    fechaIngresoStr: string | null
  ): string => {
    if (!fechaIngresoStr || !fechaSeguimiento) return "—";

    const [iy, im, id] = fechaIngresoStr.split("-").map(Number);
    const [sy, sm, sd] = fechaSeguimiento.split("-").map(Number);

    const ingreso = new Date(iy, im - 1, id);
    const seguimiento = new Date(sy, sm - 1, sd);

    const diff = seguimiento.getTime() - ingreso.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)).toString();
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setDialogOpen(true);
          setForm({});
          setEditando(null);
        }}
      >
        Agregar seguimiento
      </Button>

      <div className="grid gap-6">
        {registros.map((r: any) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 space-y-4"
          >
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row ">
              {/* Imagen */}
              {r.imagen_evidencia && (
                <div
                  className="relative group cursor-pointer w-full md:w-1/3 flex-shrink-0"
                  style={{ aspectRatio: "1/1" }} // hace cuadrada la caja
                  onClick={() => setZoomUrl(r.imagen_evidencia)}
                >
                  <img
                    src={r.imagen_evidencia}
                    alt="Evidencia"
                    className="w-full h-full object-cover rounded-l-xl"
                  />
                  <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow">
                    <Maximize2 className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              )}

              <div className="w-full ">
                {/* Contenido */}
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800 text-lg font-semibold">
                      {formatFechaLocal(r.fecha)}
                      
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {r.peso} kg
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <CardItem
                      icon={Pill}
                      label="Medicamentos"
                      content={r.medicamentos}
                      color="bg-blue-100"
                      iconColor="text-blue-400"
                      borderColor="border-blue-400"
                    />
                    <CardItem
                      icon={Utensils}
                      label="Comidas"
                      content={r.comidas}
                      color="bg-green-100"
                      iconColor="text-green-400"
                      borderColor="border-green-400"
                    />
                    <CardItem
                      icon={Smile}
                      label="Comportamiento"
                      content={r.comportamiento}
                      color="bg-purple-100"
                      iconColor="text-purple-400"
                      borderColor="border-purple-400"
                    />
                  </div>

                  {/* Descripción y Observaciones */}
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-300 flex flex-col">
                      <div className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                        <FileText className="w-5 h-5" /> Descripción general
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-4">
                        {r.descripcion || "Sin información"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-300 flex flex-col">
                      <div className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                        <FileText className="w-5 h-5" /> Observaciones
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-4">
                        {r.observaciones || "Sin información"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      icon={<Edit size={14} />}
                      onClick={() => handleEditar(r)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      icon={<Trash2 size={14} />}
                      variant="outline"
                      onClick={() => handleEliminar(r.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={!!zoomUrl}
        onClose={() => setZoomUrl(null)}
        title="Fotografía del Día"
        maxWidth="xl"
      >
        <img
          src={zoomUrl!}
          alt="Zoom evidencia"
          className="max-h-[60vh] w-full object-cover mx-auto rounded-md"
        />
      </Dialog>
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editando ? "Editar Seguimiento" : "Nuevo Seguimiento"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha"
            type="date"
            value={form.fecha || ""}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <Input
            label="Peso (kg)"
            type="number"
            value={form.peso || ""}
            onChange={(e) => setForm({ ...form, peso: e.target.value })}
          />
          <Input
            label="Descripción"
            value={form.descripcion || ""}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <Input
            label="Medicamentos"
            value={form.medicamentos || ""}
            onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
          />
          <Input
            label="Comidas"
            value={form.comidas || ""}
            onChange={(e) => setForm({ ...form, comidas: e.target.value })}
          />
          <Input
            label="Comportamiento"
            value={form.comportamiento || ""}
            onChange={(e) =>
              setForm({ ...form, comportamiento: e.target.value })
            }
          />
          <Input
            label="Observaciones"
            value={form.observaciones || ""}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
          />
          <div className="col-span-full">
            <label className="text-sm font-medium block mb-1">
              Imagen de Evidencia
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                className="mt-2 h-32 object-contain rounded border"
                alt="preview"
              />
            )}
            {!file && form.imagen_evidencia && (
              <img
                src={form.imagen_evidencia}
                className="mt-2 h-32 object-contain rounded border"
                alt="evidencia"
              />
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmit}>
            {editando ? "Guardar Cambios" : "Crear"}
          </Button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showHistorial}
        onClose={() => setShowHistorial(false)}
        title="Historial de Cambios"
      >
        <div className="space-y-2 text-sm text-gray-700">
          {historial.length > 0 ? (
            historial.map((h, idx) => (
              <p key={idx}>
                <strong>{h.tipo.toUpperCase()}</strong> -{" "}
                {new Date(h.fecha).toLocaleString("es-MX")} por{" "}
                <code>{h.usuario}</code>
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic">
              Este registro no tiene historial.
            </p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowHistorial(false)}>Cerrar</Button>
        </div>
      </Dialog>
    </div>
  );
};

export default RegistroDiarioSeguimiento;
