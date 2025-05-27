// Reemplaza tu componente Familiares por este completo:

import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, Calendar, User, Image } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Dialog } from "@mui/material";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const Familiares = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState<
    "todos" | "familiar" | "medico" | "admin" | "nuevos"
  >("todos");

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    password: "",
    imagen_perfil: "",
  });

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
      prev.map((u) => (u.id === usuarioId ? { ...u, tipo: nuevoRol } : u))
    );
  };

  const verPerfil = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setFormData(usuario);
    setModoEdicion(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev: typeof formData) => ({ ...prev, imagen_perfil: url }));
    }
  };
  

  const guardarCambios = async () => {
    if (!formData.id) return;
    const userRef = doc(db, "users", formData.id);
    const camposActualizables = {
      nombre_completo: formData.nombre_completo,
      email: formData.email,
      telefono: formData.telefono,
      password: formData.password,
      imagen_perfil: formData.imagen_perfil || "",
    };
    await updateDoc(userRef, camposActualizables);
    setUsuarios((prev) =>
      prev.map((u) => (u.id === formData.id ? { ...u, ...camposActualizables } : u))
    );
    setUsuarioSeleccionado({ ...formData, ...camposActualizables });
    setModoEdicion(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-gray-500">Gestión de cuentas creadas en el sistema</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Buscar por nombre o correo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />
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

      {filteredUsuarios.map((usuario) => (
        <Card key={usuario.id} className="mb-4">
          <div className="p-4">
            <h3 className="text-lg font-semibold">{usuario.nombre_completo}</h3>
            <p className="text-sm text-gray-500">{usuario.email}</p>
            <p className="text-sm text-gray-500">
              Rol: {usuario.tipo} — Fecha: {usuario.created_at}
            </p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => verPerfil(usuario)}>
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

      <Dialog open={!!usuarioSeleccionado} onClose={() => setUsuarioSeleccionado(null)}>
        {usuarioSeleccionado && (
          <div className="p-6 bg-white rounded w-full max-w-md space-y-4">
            <div className="text-center">
              {formData.imagen_perfil ? (
                <img
                  src={formData.imagen_perfil}
                  alt="Perfil"
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                  <User className="text-gray-500" />
                </div>
              )}
              <div className="mt-3">
                {modoEdicion ? (
                  <input
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className="text-center border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{formData.nombre_completo}</h2>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 capitalize">Rol: {formData.tipo}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                {modoEdicion ? (
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  formData.email
                )}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} />
                {modoEdicion ? (
                  <input
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  formData.telefono || "No disponible"
                )}
              </div>

              {/* <div className="flex items-center gap-2">
                <User size={16} />
                {modoEdicion ? (
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  "••••••••••"
                )}
              </div> */}

              {modoEdicion && (
                <div className="flex items-center gap-2">
                  <Image size={16} />
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setModoEdicion(!modoEdicion)}
              >
                {modoEdicion ? "Cancelar" : "Editar perfil"}
              </Button>
              {modoEdicion ? (
                <Button variant="primary" onClick={guardarCambios}>
                  Guardar
                </Button>
              ) : (
                <Button onClick={() => setUsuarioSeleccionado(null)}>Cerrar</Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Familiares;
