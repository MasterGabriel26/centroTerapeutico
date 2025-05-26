import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Dialog } from "../../components/ui/Dialog";
// features/pacientes/PacientesPage.tsx
import PacienteForm from "./components/PacienteForm"; // Correcto

import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import DataTable from "../../components/ui/DataTable";
import PacienteDrawerView from "../../components/drawers/PacienteDrawer";
import { Paciente } from "./types/paciente";
import { Column } from "../../components/ui/DataTable";
const Pacientes: React.FC = () => {
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pacienteDrawer, setPacienteDrawer] = useState<Paciente | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchPacientes = async () => {
            setLoading(true);
            const snapshot = await getDocs(collection(db, "pacientes"));
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Paciente, "id">),
            })) as Paciente[];
            setPacientes(data);
            setLoading(false);
        };
        fetchPacientes();
    }, []);

    const filteredPacientes = pacientes.filter((p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Solo los campos del modelo original
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

    // Tabla profesional usando solo los campos relevantes de tu modelo
    const columns: Column<Paciente>[] = [
        {
            header: "Nombre",
            accessorKey: "nombre" as keyof Paciente, // 👈 Forzamos a keyof Paciente
        },
        {
            header: "Documento",
            accessorKey: "documento" as keyof Paciente,
        },
        {
            header: "Teléfono",
            accessorKey: "telefono" as keyof Paciente,
        },
        {
            header: "Email",
            accessorKey: "email" as keyof Paciente,
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
            header: "",
            id: "actions",
            cell: ({ row }: any) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setPacienteDrawer(row.original);
                            setDrawerOpen(true);
                        }}
                    >
                        Detalle
                    </Button>
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
                    variant="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setShowNewDialog(true)}
                >
                    Nuevo Paciente
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
                <Input
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
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

            <PacienteDrawerView
                pacienteDrawer={pacienteDrawer}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => { }}         // función vacía temporal
                familiares={[]}           // array vacío si no tienes aún
                usuario={null}            // o tu objeto usuario real
            />
        </div>
    );
};

export default Pacientes;
