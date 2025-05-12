// Gastos.tsx
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Search,
  ArrowLeft,
  ArrowRight,
  Plus,
  Edit,
  Trash,
  History,
  RotateCcw,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Dialog } from "../components/ui/Dialog";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const categorias = [
  "Ropa",
  "Cobijas",
  "Camas",
  "Sabanas",
  "Toallas",
  "Papeleria",
  "Medicamentos",
  "Alimentos",
  "Bebidas",
  "Productos de limpieza",
  "Artículos personales",
  "Jabón",
  "Shampoo",
  "Papel higiénico",
  "Transporte",
  "Reparaciones",
  "Mantenimiento general",
  "Electricidad",
  "Agua",
  "Gas",
  "Internet",
  "Teléfono",
  "Material terapéutico",
  "Juegos",
  "Libros",
  "Pagos administrativos",
  "Honorarios",
  "Consultorías",
  "Impuestos",
  "Publicidad",
  "Publicidad online",
  "Redes sociales",
  "Diseño gráfico",
  "Hosting",
  "Dominio",
  "Mobiliario",
  "Herramientas",
  "Decoración",
  "Seguridad",
  "Equipo de vigilancia",
  "Uniformes",
  "Capacitación",
  "Eventos",
  "Conferencias",
  "Talleres",
  "Viajes",
  "Combustible",
  "Renta",
  "Préstamos",
  "Intereses",
  "Multas",
  "Seguro",
  "Consultas médicas",
  "Psicólogos",
  "Psiquiatras",
  "Nutriólogos",
  "Visitas familiares",
  "Festejos",
  "Cumpleaños",
  "Actividades recreativas",
  "Paseos",
  "Excursiones",
  "Impresiones",
  "Copias",
  "Limpieza",
  "Lavandería",
  "Tintes",
  "Trámites",
  "Notaría",
  "Contabilidad",
  "Legal",
  "Papelería oficial",
  "Sellos",
  "Carpetas",
  "Cuadernos",
  "Lápices",
  "Plumas",
  "Marcadores",
  "Computadoras",
  "Tablets",
  "Monitores",
  "Sillas",
  "Mesas",
  "Escritorios",
  "Café",
  "Botanas",
  "Agua embotellada",
  "Tarifas bancarias",
  "Transferencias",
  "Honorarios externos",
  "Proveedores",
  "Imprevistos",
  "Otros",
];
const estados = ["confirmado", "eliminado"];

export default function Gastos() {
  const auth = getAuth();
  const usuarioId = auth.currentUser?.uid || "anon";
  const [usuariosMap, setUsuariosMap] = useState<{ [key: string]: string }>({});
  const [gastos, setGastos] = useState<any[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [estado, setEstado] = useState("confirmado");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<
    "todos" | "confirmado" | "eliminado"
  >("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [historialActivo, setHistorialActivo] = useState<any[] | null>(null);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      const snap = await getDocs(collection(db, "users"));
      const map: { [key: string]: string } = {};
      snap.forEach((u) => {
        const d = u.data();
        map[u.id] = d.nombre_completo || "Usuario";
      });
      setUsuariosMap(map);
    };
    fetchUsuarios();
  }, []);

  // Cargar gastos
  useEffect(() => {
    const fetchGastos = async () => {
      const snap = await getDocs(collection(db, "gastos"));
      setGastos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchGastos();
  }, []);

  // Filtrado
  const filteredGastos = gastos.filter((g) => {
    const matchConcepto = g.concepto
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchDate = !selectedDate || g.fecha === selectedDate;
    const matchEstado = filterEstado === "todos" || g.estado === filterEstado;
    return matchConcepto && matchDate && matchEstado;
  });

  // Guardar/Actualizar
  const handleGuardar = async () => {
    const ts = new Date().toISOString();
    const base = {
      concepto,
      monto: parseFloat(monto),
      categoria,
      fecha,
      estado,
      updated_at: ts,
      updated_by: usuarioId,
    };
    if (editing) {
      const ref = doc(db, "gastos", editing.id);
      const historial = [
        ...(editing.historial || []),
        { tipo: "edicion", fecha: ts, usuario: usuarioId },
      ];
      await updateDoc(ref, { ...base, historial });
      setGastos((prev) =>
        prev.map((g) =>
          g.id === editing.id ? { ...g, ...base, historial } : g
        )
      );
    } else {
      const nuevo = {
        ...base,
        created_at: ts,
        created_by: usuarioId,
        historial: [],
      };
      const ref = await addDoc(collection(db, "gastos"), nuevo);
      setGastos((prev) => [...prev, { ...nuevo, id: ref.id }]);
    }
    cerrarDialog();
  };

  const abrirEdicion = (g: any) => {
    setEditing(g);
    setFecha(g.fecha);
    setCategoria(g.categoria);
    setMonto(String(g.monto));
    setConcepto(g.concepto);
    setEstado(g.estado);
    setDialogOpen(true);
  };

  // Eliminar -> cambiar a 'eliminado'
  const handleEliminar = async (g: any) => {
    const ref = doc(db, "gastos", g.id);
    const ts = new Date().toISOString();
    const historial = [
      ...(g.historial || []),
      { tipo: "eliminado", fecha: ts, usuario: usuarioId },
    ];
    await updateDoc(ref, { estado: "eliminado", historial });
    setGastos((prev) =>
      prev.map((x) =>
        x.id === g.id ? { ...x, estado: "eliminado", historial } : x
      )
    );
  };

  // Reactivar (completar)
  const handleReact = async (g: any) => {
    const ref = doc(db, "gastos", g.id);
    const ts = new Date().toISOString();
    const historial = [
      ...(g.historial || []),
      { tipo: "confirmado", fecha: ts, usuario: usuarioId },
    ];
    await updateDoc(ref, { estado: "confirmado", historial });
    setGastos((prev) =>
      prev.map((x) =>
        x.id === g.id ? { ...x, estado: "confirmado", historial } : x
      )
    );
  };

  const handleVerHistorial = (g: any) => {
    const list = [...(g.historial || [])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    setHistorialActivo(list);
    setShowHistorial(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setConcepto("");
    setMonto("");
    setCategoria("");
    setFecha(new Date().toISOString().split("T")[0]);
    setEstado("confirmado");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <Button icon={<Plus size={18} />} onClick={() => setDialogOpen(true)}>
          Agregar Gasto
        </Button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex gap-2 items-center">
        <Input
          placeholder="Buscar por concepto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => setFilterEstado("todos")}
        >
          Todos
        </Button>
        {estados.map((e) => (
          <Button
            key={e}
            variant={filterEstado === e ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterEstado(e as any)}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </Button>
        ))}
        <Input
          type="date"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
          leftIcon={<Calendar size={18} />}
        />
      </div>
      <Card>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Fecha",
                "Concepto",
                "Categoría",
                "Monto",
                "Estado",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGastos.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="p-2 text-center">{g.fecha}</td>
                <td className="p-2 text-center">{g.concepto}</td>
                <td className="p-2 text-end">${g.monto.toFixed(2)}</td>
                <td className="p-2 text-center">{g.categoria}</td>
                <td className="p-2 text-center">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      g.estado === "confirmado"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {g.estado}
                  </span>
                </td>
                <td className="p-2 align-middle">
                  <div className="flex items-center gap-2 justify-center">
                    {g.estado === "eliminado" ? (
                      <Button
                        icon={<RotateCcw size={14} />}
                        variant="primary"
                        onClick={() => handleReact(g)}
                      >
                        Reactivar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          icon={<Edit size={14} />}
                          onClick={() => abrirEdicion(g)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          icon={<Trash size={14} />}
                          onClick={() => handleEliminar(g)}
                        >
                          Eliminar
                        </Button>
                        <Button
                          variant="outline"
                          icon={<History size={14} />}
                          onClick={() => handleVerHistorial(g)}
                        >
                          Historial
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredGastos.length === 0 && (
          <p className="p-4 text-center text-gray-500">
            No se encontraron gastos
          </p>
        )}
      </Card>

      <Dialog
        isOpen={dialogOpen}
        onClose={cerrarDialog}
        title={editing ? "Editar Gasto" : "Agregar Gasto"}
        maxWidth="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Input
            label="Concepto"
            type="text"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
          />
          <Input
            label="Monto"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border px-3 py-2 rounded-md text-sm"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleGuardar}>
            {editing ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showHistorial}
        onClose={() => setShowHistorial(false)}
        title="Historial del Gasto"
        maxWidth="md"
      >
        <div className="max-h-[400px] overflow-y-auto px-2">
          {historialActivo?.length ? (
            <ul className="space-y-3">
              {historialActivo.map((item, i) => (
                <li
                  key={i}
                  className="border border-gray-200 rounded-lg px-4 py-3 shadow-sm bg-white"
                >
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="font-semibold text-gray-800">
                      {item.tipo.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 md:mt-0">
                      {new Date(item.fecha).toLocaleString("es-MX")}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Realizado por{" "}
                    <span className="font-medium text-gray-800">
                      {usuariosMap[item.usuario] || item.usuario}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm px-2">
              Este gasto no tiene historial.
            </p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowHistorial(false)}>Cerrar</Button>
        </div>
      </Dialog>
    </div>
  );
}
