import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import AgregarFamiliarForm from "../AgregarFamiliarForm";
import { useFamiliares } from "../../hooks/useFamiliares";

const FamiliaresTab = ({ pacienteId }: { pacienteId: string }) => {
  const [openModal, setOpenModal] = useState(false);
  const { familiares, crearFamiliar, cargarFamiliares } = useFamiliares(pacienteId);

  // Cargar familiares al montar el componente (por si es tab)
  useEffect(() => {
    cargarFamiliares();
  }, [cargarFamiliares]);

  return (
    <div className="p-4 text-gray-700 font-poppins">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outlinePrimary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
        >
          Agregar familiar
        </Button>
      </div>

      <Dialog isOpen={openModal} onClose={() => setOpenModal(false)} title="Agregar familiar">
        <AgregarFamiliarForm
          onSubmit={async (familiarData) => {
            await crearFamiliar(familiarData);
            setOpenModal(false);
            await cargarFamiliares(); // también recarga después de agregar
          }}
          onCancel={() => setOpenModal(false)}
        />
      </Dialog>

      {familiares.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No hay familiares registrados.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {familiares.map((f) => (
            <li key={f.id} className="border p-3 rounded-lg bg-white shadow-sm">
              <p className="font-semibold">{f.nombre}</p>
              <p className="text-sm text-gray-600">{f.parentesco}</p>
              <p className="text-sm text-gray-600">
                📞 {f.telefono1} {f.telefono2 && ` / ${f.telefono2}`}
              </p>
              <p className="text-sm text-gray-500">✉️ {f.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FamiliaresTab;
