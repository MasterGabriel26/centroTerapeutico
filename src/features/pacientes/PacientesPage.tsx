// src/features/pacientes/PacientesPage.tsx
import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import DataTable, { Column } from "../../components/ui/DataTable";
import CrearPacienteDialog from "./components/CrearPacienteDialog";
import { Link } from "react-router-dom";
import { Paciente } from "./types/paciente";
import { getPacientes } from "./services/pacienteService";
import { obtenerUltimoIngresoActivo } from "./services/ingresosService";
import { usePacientes } from "./hooks/usePacientes";

const PacientesList: React.FC = () => {
  const { createPaciente, loading: creando } = usePacientes();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");

  const handleCreatePaciente = async (data: Omit<Paciente, "id" | "creado" | "estado">) => {
    const id = await createPaciente(data);
    if (id) {
      const nuevos = await getPacientes();
      setPacientes(nuevos);
      setShowNewDialog(false);
    }
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const basePacientes = await getPacientes();
        const pacientesConIngreso = await Promise.all(
          basePacientes.map(async (paciente) => {
            const ultimoIngreso = await obtenerUltimoIngresoActivo(paciente.id!);
            return {
              ...paciente,
              ultimo_ingreso_activo: ultimoIngreso?.fecha_ingreso || null,
              ingreso_voluntario: ultimoIngreso?.voluntario ?? null,
            };
          })
        );
        setPacientes(pacientesConIngreso);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  const filteredPacientes = pacientes.filter((p) => {
    const nombre = p.nombre_completo?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();
    const matchesSearch = nombre.includes(search);
    const matchesEstado = filterEstado === "todos" || p.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const columns: Column<
    Paciente & { ultimo_ingreso_activo?: string | null; ingreso_voluntario?: boolean | null }
  >[] = [
    {
      header: "Nombre",
      accessorKey: "nombre_completo",
    },
    {
      header: "Ingreso",
      accessorKey: "ultimo_ingreso_activo",
      cell: ({ cell }) => <span className="text-sm text-gray-800">{cell.getValue() || "—"}</span>,
    },
    {
      header: "Voluntario",
      accessorKey: "ingreso_voluntario",
      cell: ({ cell }) => (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
          {cell.getValue() === true ? "Sí" : cell.getValue() === false ? "No" : "—"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ cell }) => (
        <span
          className={
            cell.getValue() === "activo"
              ? "px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs"
              : "px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
          }
        >
          {cell.getValue()}
        </span>
      ),
    },
    {
      header: "Opciones",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Link to={`/pacientes/${row.original.id}`}>
            <Button variant="outlinePrimary" size="sm">
              Detalle
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">Gestión de personas en tratamiento</p>
        </div>
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-[#2A93C9] hover:bg-[#1B7CAD] text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Agregar Paciente
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />
        <div className="flex gap-2">
          {["todos", "activo", "inactivo"].map((estado) => (
            <Button
              key={estado}
              variant={filterEstado === estado ? "primary" : "outline"}
              onClick={() => setFilterEstado(estado as any)}
            >
              {estado[0].toUpperCase() + estado.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPacientes}
        loading={loading}
        emptyText="No hay pacientes registrados"
      />

      <CrearPacienteDialog
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onPacienteCreado={async () => {
          const nuevos = await getPacientes();
          setPacientes(nuevos);
        }}
      />
    </div>
  );
};

export default PacientesList;
