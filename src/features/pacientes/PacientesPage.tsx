// src/features/pacientes/PacientesPage.tsx

import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Dialog } from "../../components/ui/Dialog";
import PacienteForm from "./components/PacienteForm";

import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import DataTable from "../../components/ui/DataTable";
import PacienteDrawerView from "../../components/drawers/PacienteDrawer";
import { Paciente } from "./types/paciente"; // Asegúrate de que este tipo de Paciente sea correcto
import { Column } from "../../components/ui/DataTable";
import CrearPacienteDialog from "./components/CrearPacienteDialog";
import { getPacientes } from "./services/pacienteService"; // Ajusta la ruta si estás en otro nivel
import PacienteDetalleDialog from "./components/PacienteDetalleDialog";

const PacientesList: React.FC = () => {
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pacienteDrawer, setPacienteDrawer] = useState<Paciente | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");

    useEffect(() => {
        const fetchPacientes = async () => {
            setLoading(true);
            try { // Agrega un try-catch para manejar errores en la carga
                const snapshot = await getDocs(collection(db, "pacientes"));
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Paciente, "id">),
                })) as Paciente[];
                setPacientes(data);
            } catch (error) {
                console.error("Error al cargar pacientes:", error);
                // Opcional: mostrar un mensaje de error al usuario
            } finally {
                setLoading(false);
            }
        };
        fetchPacientes();
    }, []);

    const filteredPacientes = pacientes.filter((p) => {
        // **MODIFICACIÓN AQUÍ**
        // Primero, verifica si p.nombre existe y es una cadena
        const pacienteNombre = p.nombre_completo ? p.nombre_completo.toLowerCase() : ''; // Si p.nombre es null/undefined, usa una cadena vacía
        console.log("Nombre del paciente en minúsculas:", pacienteNombre);
        const searchLower = searchQuery;

        const matchesSearch = pacienteNombre.includes(searchLower);

        // Lógica de filtrado por estado (similar a Familiares)
        const matchesEstado = filterEstado === "todos" || p.estado === filterEstado;

        return matchesSearch && matchesEstado;
    });

    const handleCreatePaciente = async (data: Omit<Paciente, "id" | "creado" | "estado">) => {
        const creado = new Date().toISOString();
        const payload: Omit<Paciente, "id"> = {
            ...data,
            estado: "activo",
            creado,
        };
        const docRef = await addDoc(collection(db, "pacientes"), payload);
        setShowNewDialog(false);
        setPacientes((prev) => [...prev, { ...payload, id: docRef.id }]);
    };

    const columns: Column<Paciente>[] = [
        {
            header: "Nombre",
            accessorKey: "nombre_completo" as keyof Paciente,
        },
        {
            header: "Ingreso",
            accessorKey: "fecha_ingreso" as keyof Paciente,
        },
        {
            header: "Estado",
            accessorKey: "estado" as keyof Paciente,
            cell: ({ cell }: any) => (
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
            header: "Options",
            id: "actions",
            cell: ({ row }: any) => (
                <div className="flex justify-center">
                    <Button
                        variant="outlinePrimary"
                        size="sm"
                        onClick={() => {
                            setPacienteDrawer(row.original);
                            setDrawerOpen(true);
                        }}
                    >
                        Detalle
                    </Button>



                </div>
            ),
        }

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
                    <Plus size={18} />
                    Agregar Paciente
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

            <Dialog
                isOpen={showNewDialog}
                onClose={() => setShowNewDialog(false)}
                title="Registrar nuevo paciente"
            >
                <PacienteForm onSubmit={handleCreatePaciente} />
            </Dialog>

            <DataTable
                columns={columns}
                data={filteredPacientes}
                loading={loading}
                emptyText="No hay pacientes registrados"
            />

            <PacienteDetalleDialog
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                paciente={pacienteDrawer}
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