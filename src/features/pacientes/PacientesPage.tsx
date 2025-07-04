// src/features/pacientes/PacientesPage.tsx
import React, { useState, useEffect } from "react";
import { Plus, Search, Grid, List } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import DataTable, { Column } from "../../components/ui/DataTable";
import PacientesGrid from "./components/PacientesGrid";
import { Link } from "react-router-dom";
import { Paciente } from "./types/paciente";
import { getPacientes } from "./services/pacienteService";
import { obtenerUltimoIngresoActivo } from "./services/ingresosService";
import { useIsMobile } from "../pacientes/hooks/useIsMobile";

const PacientesList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const isMobile = useIsMobile();

  // Cambiar automáticamente a grid en móvil
  useEffect(() => {
    if (isMobile) {
      setViewMode("grid");
    } else {
      setViewMode("table");
    }
  }, [isMobile]);

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
  Paciente & { ultimo_ingreso_activo?: string | null; ingreso_voluntario?: boolean | null | undefined }
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
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm sm:text-base text-gray-500">Gestión de personas en tratamiento</p>
        </div>
        <Link to="/pacientes/nuevo">
          <Button className="bg-[#2A93C9] hover:bg-[#1B7CAD] text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto justify-center">
            <Plus size={18} /> Agregar Paciente
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          
          {/* Botones de filtro de estado */}
          <div className="flex gap-2">
            {["todos", "activo", "inactivo"].map((estado) => (
              <Button
                key={estado}
                variant={filterEstado === estado ? "primary" : "outline"}
                onClick={() => setFilterEstado(estado as any)}
                className="flex-1 sm:flex-none"
              >
                {estado[0].toUpperCase() + estado.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Botones de vista (solo en desktop) */}
        {!isMobile && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 mr-2">Vista:</span>
            <Button
              variant={viewMode === "table" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex items-center gap-1"
            >
              <List size={16} />
              Tabla
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-1"
            >
              <Grid size={16} />
              Tarjetas
            </Button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={filteredPacientes}
          loading={loading}
          emptyText="No hay pacientes registrados"
        />
      ) : (
        <PacientesGrid
          pacientes={filteredPacientes}
          loading={loading}
          emptyText="No hay pacientes registrados"
        />
      )}
    </div>
  );
};

export default PacientesList;