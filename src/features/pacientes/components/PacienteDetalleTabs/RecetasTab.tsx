// features/pacientes/components/PacienteDetalleTabs/RecetasTab.tsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Pill } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Dialog } from "../../../../components/ui/Dialog";
import { useRecetas } from "../../hooks/useRecetas";
import { Receta, Medicamento } from "../../types/receta";

const RecetasTab = ({ pacienteId }: { pacienteId: string }) => {
  const { 
    recetas, 
    loading, 
    error, 
    cargarRecetas, 
    crearReceta 
  } = useRecetas(pacienteId);
  
  const [openModal, setOpenModal] = useState(false);
  const [idDoctor, setIdDoctor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [currentMedicamento, setCurrentMedicamento] = useState<Medicamento>({ nombre: "", posologia: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cargar recetas al montar el componente
  useEffect(() => {
    if (initialLoad) {
      cargarRecetas().finally(() => setInitialLoad(false));
    }
  }, [cargarRecetas, initialLoad]);

  const resetForm = () => {
    setIdDoctor("");
    setMotivo("");
    setMedicamentos([]);
    setCurrentMedicamento({ nombre: "", posologia: "" });
    setFormError(null);
  };

  const handleAddMedicamento = () => {
    if (!currentMedicamento.nombre.trim() || !currentMedicamento.posologia.trim()) {
      setFormError("Por favor, complete ambos campos del medicamento");
      return;
    }
    
    setMedicamentos([...medicamentos, currentMedicamento]);
    setCurrentMedicamento({ nombre: "", posologia: "" }); // Reset current
    setFormError(null);
  };

  const handleRemoveMedicamento = (index: number) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos.splice(index, 1);
    setMedicamentos(newMedicamentos);
  };

  const handleSubmit = async () => {
    if (!idDoctor.trim() || !motivo.trim()) {
      setFormError("Por favor, complete los campos obligatorios");
      return;
    }
    
    if (medicamentos.length === 0) {
      setFormError("Debe agregar al menos un medicamento");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await crearReceta({ idDoctor, motivo, medicamentos });
      setOpenModal(false);
      resetForm();
      setInitialLoad(true); // Forzar recarga de recetas
    } catch (err) {
      setFormError("Error al crear la receta. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 font-poppins">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
            <Pill className="text-blue-500" size={24} />
            Recetas Médicas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de recetas médicas del paciente
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Nueva Receta
        </Button>
      </div>

      {/* Modal para crear receta */}
      <Dialog 
        isOpen={openModal} 
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }} 
        title="Crear nueva receta"
      >
        <div className="p-4 space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="idDoctor" className="block text-sm font-medium text-gray-700 mb-1">
              ID del médico *
            </label>
            <input
              type="text"
              id="idDoctor"
              value={idDoctor}
              onChange={(e) => setIdDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: DR-1234"
            />
          </div>

          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la receta *
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Infección respiratoria"
              rows={3}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-700 mb-3">Medicamentos</h3>
            
            {/* Lista de medicamentos agregados */}
            {medicamentos.length > 0 && (
              <div className="mb-4 space-y-2">
                {medicamentos.map((med, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{med.nombre}</p>
                      <p className="text-sm text-gray-600">{med.posologia}</p>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveMedicamento(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar medicamento */}
            <div className="space-y-3">
              <div>
                <label htmlFor="medNombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del medicamento
                </label>
                <input
                  type="text"
                  id="medNombre"
                  value={currentMedicamento.nombre}
                  onChange={(e) => setCurrentMedicamento({...currentMedicamento, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Amoxicilina"
                />
              </div>

              <div>
                <label htmlFor="medPosologia" className="block text-sm font-medium text-gray-700 mb-1">
                  Posología
                </label>
                <input
                  type="text"
                  id="medPosologia"
                  value={currentMedicamento.posologia}
                  onChange={(e) => setCurrentMedicamento({...currentMedicamento, posologia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 500mg cada 8 horas"
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddMedicamento}
                className="w-full"
              >
                Agregar medicamento
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setOpenModal(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || medicamentos.length === 0}
            >
              {isSubmitting ? 'Creando...' : 'Crear Receta'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Estado de carga INICIAL */}
      {initialLoad ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Mensaje cuando no hay recetas */}
          {!initialLoad && recetas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <Pill className="text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mt-4">No hay recetas registradas</h3>
              <p className="text-gray-500 text-sm mt-2">
                Aún no se han creado recetas para este paciente
              </p>
              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear primera receta
              </Button>
            </div>
          )}

          {/* Lista de recetas */}
          {!initialLoad && recetas.length > 0 && (
            <div className="space-y-4 mt-4">
              {recetas.map((receta) => (
                <div 
                  key={receta.id} 
                  className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
                >
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-blue-800">Receta médica</h3>
                      <span className="text-sm text-blue-600">
                        {formatDate(receta.fecha)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Médico: {receta.idDoctor}</p>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-700 mb-3">
                      <span className="font-medium">Motivo:</span> {receta.motivo}
                    </p>
                    
                    <h4 className="font-medium text-gray-700 mb-2">Medicamentos:</h4>
                    <ul className="space-y-2">
                      {receta.medicamentos.map((med, index) => (
                        <li key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium">{med.nombre}</p>
                            <p className="text-sm text-gray-600">{med.posologia}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                      className="text-red-600 hover:text-red-800 flex items-center text-sm"
                      onClick={() => setDeletingId(receta.id!)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      <Dialog 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Confirmar eliminación"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                // Aquí iría la lógica para eliminar la receta
                console.log("Eliminar receta:", deletingId);
                setDeletingId(null);
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default RecetasTab;