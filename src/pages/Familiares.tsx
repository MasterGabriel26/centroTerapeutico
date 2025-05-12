import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const Familiares = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState<
    "todos" | "familiar" | "medico" | "admin" | "nuevos"
  >("todos");

  useEffect(() => {
    const fetchUsuarios = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);
    };
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesTipo =
      filterTipo === "todos" ||
      (filterTipo === "nuevos"
        ? u.created_at === new Date().toLocaleDateString("es-MX")
        : u.tipo === filterTipo);

    const matchesSearch =
      u.nombre_completo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTipo && matchesSearch;
  });

  const cambiarRol = async (usuarioId: string, nuevoRol: "admin" | "medico") => {
    await updateDoc(doc(db, "users", usuarioId), { tipo: nuevoRol });
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId ? { ...u, tipo: nuevoRol } : u
      )
    );
  };

  const verPerfil = (usuario: any) => {
    alert(`Perfil de: ${usuario.nombre_completo}\nCorreo: ${usuario.email}\nTeléfono: ${usuario.telefono || "No disponible"}`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500">
            Gestín de cuentas creadas en el sistema
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="flex gap-2">
            {["todos", "familiar", "medico", "admin", "nuevos"].map((tipo) => (
              <Button
                key={tipo}
                variant={filterTipo === tipo ? "primary" : "outline"}
                onClick={() => setFilterTipo(tipo as any)}
              >
                {tipo[0].toUpperCase() + tipo.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Lista de usuarios */}
      {filteredUsuarios.map((usuario) => (
        <Card key={usuario.id} className="mb-4">
          <div className="p-1">
            <h3 className="text-lg font-semibold">{usuario.nombre_completo}</h3>
            <p className="text-sm text-gray-500">{usuario.email}</p>
            <p className="text-sm text-gray-500">
              Rol: {usuario.tipo} — Fecha: {usuario.created_at}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => verPerfil(usuario)}
              >
                Ver perfil
              </Button>
              {usuario.tipo === "familiar" && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => cambiarRol(usuario.id, "medico")}
                  >
                    Convertir a Médico
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => cambiarRol(usuario.id, "admin")}
                  >
                    Convertir a Admin
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Familiares;
