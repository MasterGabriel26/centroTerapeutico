import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Dialog } from "../ui/Dialog";
import { Medicamento } from "../../utils/supabase";

interface Props {
  pacienteId: string;
  usuarioId: string;
}

const MedicamentosForm: React.FC<Props> = ({ pacienteId, usuarioId }) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [form, setForm] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  const fetchMedicamentos = async () => {
    const q = query(collection(db, "medicamentos"), where("paciente_id", "==", pacienteId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Medicamento[];
    setMedicamentos(data);
  };

  useEffect(() => {
    fetchMedicamentos();
  }, [pacienteId]);

  const handleSubmit = async () => {
    const payload = {
      ...form,
      paciente_id: pacienteId,
      updated_at: new Date().toISOString(),
      updated_by: usuarioId,
    };

    if (editando) {
      await updateDoc(doc(db, "medicamentos", editando), payload);
    } else {
      await addDoc(collection(db, "medicamentos"), {
        ...payload,
        created_at: new Date().toISOString(),
        created_by: usuarioId,
      });
    }

    setDialogOpen(false);
    setForm({});
    setEditando(null);
    fetchMedicamentos();
  };

  const handleEditar = (m: Medicamento) => {
    setForm(m);
    setEditando(m.id);
    setDialogOpen(true);
  };

  const handleEliminar = async (id: string) => {
    await deleteDoc(doc(db, "medicamentos", id));
    fetchMedicamentos();
  };

  return (
    <div className="space-y-6">
      <Button onClick={() => { setDialogOpen(true); setForm({}); setEditando(null); }}>Agregar Medicamento</Button>

      <div className="space-y-4">
        {medicamentos.map(m => (
          <div key={m.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">{m.nombre}</h3>
              <div className="space-x-2">
                <Button size="sm" onClick={() => handleEditar(m)}>Editar</Button>
                <Button size="sm" onClick={() => handleEliminar(m.id)}>Eliminar</Button>
              </div>
            </div>
            <p className="text-sm text-gray-700"><strong>Dosis:</strong> {m.dosis}</p>
            <p className="text-sm text-gray-700"><strong>Frecuencia:</strong> {m.frecuencia}</p>
            <p className="text-sm text-gray-700"><strong>Vía:</strong> {m.via}</p>
            {m.observaciones && <p className="text-sm text-gray-700"><strong>Observaciones:</strong> {m.observaciones}</p>}
          </div>
        ))}
      </div>

      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title={editando ? "Editar Medicamento" : "Nuevo Medicamento"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Dosis" value={form.dosis || ""} onChange={(e) => setForm({ ...form, dosis: e.target.value })} />
          <Input label="Frecuencia" value={form.frecuencia || ""} onChange={(e) => setForm({ ...form, frecuencia: e.target.value })} />
          <Input label="Vía de administración" value={form.via || ""} onChange={(e) => setForm({ ...form, via: e.target.value })} />
          <Input label="Observaciones" value={form.observaciones || ""} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmit}>{editando ? "Guardar Cambios" : "Crear"}</Button>
        </div>
      </Dialog>
    </div>
  );
};

export default MedicamentosForm;
