import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Calendar,
  Check,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Dialog } from "@mui/material";
import { db } from "../utils/firebase";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

const PagosFamiliarView = () => {
  const [pagos, setPagos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "completado" | "pendiente">("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<{ [id: string]: string }>({});
  // Debajo de los useState existentes
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const [pacientes, setPacientes] = useState<{ [key: string]: string }>({});
  const [familiares, setFamiliares] = useState<{ [key: string]: string }>({});
  // Filtrar pagos según búsqueda, estado y fechas
  const filteredPagos = pagos.filter((pago) => {
    const matchesSearch =
      pacientes[pago.paciente_id]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      familiares[pago.familiar_id]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesEstado =
      filterEstado === "todos" || pago.estado === filterEstado;

    const pagoDate = new Date(pago.fecha);
    const matchesStartDate = !startDate || pagoDate >= new Date(startDate);
    const matchesEndDate = !endDate || pagoDate <= new Date(endDate);

    return matchesSearch && matchesEstado && matchesStartDate && matchesEndDate;
  });
  // Calcular índices para paginación
  const totalPaginas = Math.ceil(filteredPagos.length / registrosPorPagina);
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const pagosPaginados = filteredPagos.slice(indexPrimero, indexUltimo);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const usuarioId = auth.currentUser?.uid;
      if (!usuarioId) return;

      const pagosSnap = await getDocs(
        query(collection(db, "pagos"), where("familiar_id", "==", usuarioId))
      );
      const pacientesSnap = await getDocs(collection(db, "pacientes"));
      const usersSnap = await getDocs(collection(db, "users"));

      const pagosData = pagosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usuariosMap: { [id: string]: string } = {};
      const pacientesMap: { [id: string]: string } = {};
      const familiaresMap: { [id: string]: string } = {};

      usersSnap.forEach((doc) => {
        const data = doc.data();
        usuariosMap[doc.id] = data.nombre_completo;
        familiaresMap[doc.id] = data.nombre_completo;
      });

      pacientesSnap.forEach((doc) => {
        pacientesMap[doc.id] = doc.data().nombre_completo;
      });

      setPagos(pagosData);
      setUsuarios(usuariosMap);
      setPacientes(pacientesMap);
      setFamiliares(familiaresMap);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500">Gestión de mis pagos</p>
        </div>
        {/* <Button variant="primary" icon={<Plus size={18} />}>
          Registrar Pago
        </Button> */}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-2">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="md:flex-1">
            <Input
              placeholder="Buscar por nombre de anexado o familiar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterEstado === "todos" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterEstado("todos")}
            >
              Todos
            </Button>
            <Button
              variant={filterEstado === "completado" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterEstado("completado")}
            >
              Completados
            </Button>
            <Button
              variant={filterEstado === "pendiente" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterEstado("pendiente")}
            >
              Pendientes
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Fecha inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftIcon={<Calendar size={18} />}
              />
            </div>
            <div>
              <Input
                label="Fecha fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                leftIcon={<Calendar size={18} />}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabla de pagos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Anexado / Familiar
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Método
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Comprobante
                </th>
              </tr>
            </thead>
            <tbody>
              {pagosPaginados.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pacientes[p.paciente_id] || "Sin nombre"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {familiares[p.familiar_id] || "Familiar no asignado"}
                    </div>
                  </td>
                  <td className="px-4 py-2">{p.fecha}</td>
                  <td className="px-4 py-2">${p.monto}</td>
                  <td className="px-4 py-2 capitalize">{p.metodo_pago}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.estado === "completado"
                          ? "bg-green-100 text-green-700"
                          : p.estado === "borrado"
                          ? "bg-red-100 text-red-700"
                          : p.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {p.comprobante_url ? (
                      <img
                        src={p.comprobante_url}
                        alt="Comprobante"
                        className="h-12 w-12 object-cover rounded-md cursor-pointer hover:ring-2 hover:ring-primary-500"
                        onClick={() => setZoomImageUrl(p.comprobante_url)}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {filteredPagos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No se encontraron pagos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Dialog open={!!zoomImageUrl} onClose={() => setZoomImageUrl(null)}>
          <div className="p-6 w-full max-w-md bg-white rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Comprobante de Pago</h2>
            {zoomImageUrl && (
              <img
                src={zoomImageUrl}
                alt="Comprobante"
                className="w-full max-h-[500px] object-contain rounded"
              />
            )}
            <div className="flex justify-end mt-4">
              <Button onClick={() => setZoomImageUrl(null)}>Cerrar</Button>
            </div>
          </div>
        </Dialog>

        {filteredPagos.length === 0 && (
          <div className="py-8 text-center">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron pagos
            </h3>
            <p className="text-gray-500">
              Ajusta los filtros para ver más resultados.
            </p>
          </div>
        )}

        {filteredPagos.length > registrosPorPagina && (
          <div className="flex justify-center items-center py-4 gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (num) => (
                <Button
                  key={num}
                  size="sm"
                  variant={paginaActual === num ? "primary" : "outline"}
                  onClick={() => setPaginaActual(num)}
                >
                  {num}
                </Button>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PagosFamiliarView;
