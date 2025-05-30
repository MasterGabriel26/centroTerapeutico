import React, { useEffect, useState } from "react";
import { Plus, User, Phone, Mail, UserCog, Edit, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import AgregarFamiliarForm from "../AgregarFamiliarForm";
import { useFamiliares } from "../../hooks/useFamiliares";
import { Familiar } from "../../types/familiar";

const FamiliaresTab = ({ pacienteId }: { pacienteId: string }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedFamiliar, setSelectedFamiliar] = useState<Familiar | null>(null);
  const { familiares, crearFamiliar, cargarFamiliares } = useFamiliares(pacienteId);

  useEffect(() => {
    cargarFamiliares();
  }, [cargarFamiliares]);

  const handleAgregarFamiliar = async (familiarData: any) => {
    await crearFamiliar(familiarData);
    setOpenModal(false);
    await cargarFamiliares();
  };

  const getParentescoColor = (parentesco: string) => {
    const colors: Record<string, string> = {
      padre: 'bg-blue-100 text-blue-800',
      madre: 'bg-pink-100 text-pink-800',
      hijo: 'bg-green-100 text-green-800',
      hija: 'bg-purple-100 text-purple-800',
      hermano: 'bg-yellow-100 text-yellow-800',
      hermana: 'bg-indigo-100 text-indigo-800',
      abuelo: 'bg-orange-100 text-orange-800',
      abuela: 'bg-red-100 text-red-800',
      tío: 'bg-cyan-100 text-cyan-800',
      tía: 'bg-fuchsia-100 text-fuchsia-800',
    };
    
    return colors[parentesco.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 font-poppins">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <UserCog className="text-blue-500" size={20} />
          <div>
            <h2 className="text-lg font-medium text-gray-800">Familiares</h2>
            <p className="text-xs text-gray-500">
              Contactos asociados al paciente
            </p>
          </div>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={14} />}
          onClick={() => {
            setSelectedFamiliar(null);
            setOpenModal(true);
          }}
          size="sm"
          className="shadow-sm"
        >
          Agregar
        </Button>
      </div>

      {/* Modal */}
      <Dialog 
        isOpen={openModal} 
        onClose={() => setOpenModal(false)} 
        title={selectedFamiliar ? "Editar familiar" : "Nuevo familiar"}
        size="md"
      >
        <AgregarFamiliarForm
          familiar={selectedFamiliar}
          onSubmit={handleAgregarFamiliar}
          onCancel={() => setOpenModal(false)}
        />
      </Dialog>

      {/* Lista optimizada */}
      {familiares.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <UserCog className="text-gray-400" size={36} />
          <h3 className="text-base font-medium text-gray-600 mt-3">Sin familiares registrados</h3>
          <Button
            variant="primary"
            onClick={() => setOpenModal(true)}
            size="sm"
            className="mt-3"
          >
            Agregar familiar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {familiares.map((familiar) => (
            <div 
              key={familiar.id} 
              className="border border-gray-200 rounded-lg bg-white shadow-xs transition-all hover:shadow-sm"
            >
              {/* Encabezado compacto */}
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-1.5 rounded-md">
                    <User className="text-blue-600" size={16} />
                  </div>
                  <h3 className="font-medium text-gray-800 truncate max-w-[120px]">
                    {familiar.nombre}
                  </h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getParentescoColor(familiar.parentesco)}`}>
                  {familiar.parentesco}
                </span>
              </div>
              
              {/* Contenido compacto */}
              <div className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-1.5 rounded-md">
                      <Phone className="text-gray-600" size={14} />
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <span className="text-sm text-gray-800">{familiar.telefono1}</span>
                      {familiar.telefono2 && (
                        <span className="text-sm text-gray-800">{familiar.telefono2}</span>
                      )}
                    </div>
                  </div>
                  
                  {familiar.email && (
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 p-1.5 rounded-md">
                        <Mail className="text-gray-600" size={14} />
                      </div>
                      <p className="text-sm text-gray-800 truncate">{familiar.email}</p>
                    </div>
                  )}
                </div>
                
                {/* Acciones compactas */}
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setSelectedFamiliar(familiar);
                      setOpenModal(true);
                    }}
                    className="p-1.5 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamiliaresTab;