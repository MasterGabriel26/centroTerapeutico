import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { getPlantillasTests, guardarTestRealizado, getPlantillaTestById, subscribeToTestRealizado } from '../services/testPsicologicoService';
import { PlantillaTestPsicologico } from '../types/test_psicologico';
import { QRCodeCanvas } from 'qrcode.react';




interface CrearTestModalProps {
  onClose: () => void;
  pacienteId: string; // Nueva prop
  onTestInstanceCreated: (testId: string, testUrl: string, plantillaId: string) => void; // Prop modificada
  onStartDirectly: (plantillaId: string) => void; // Nueva prop
}

const CrearTestModal: React.FC<CrearTestModalProps> = ({ onClose, pacienteId, onTestInstanceCreated, onStartDirectly }) => {
  const [plantillas, setPlantillas] = useState<PlantillaTestPsicologico[]>([]);
  const [selectedPlantillaId, setSelectedPlantillaId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [currentTestInstanceId, setCurrentTestInstanceId] = useState<string | null>(null);
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaTestPsicologico | null>(null);

  useEffect(() => {
    const fetchPlantillas = async () => {
      const data = await getPlantillasTests();
      setPlantillas(data);
      console.log("Plantillas cargadas en modal:", data);
    };
    fetchPlantillas();
  }, []);

  const handleCreateTestInstance = async () => {
    if (selectedPlantillaId) {
      console.log("1. handleCreateTestInstance: Plantilla seleccionada ID:", selectedPlantillaId);
      const plantilla = plantillas.find(p => p.id === selectedPlantillaId);
      if (!plantilla) {
        console.error("ERROR: Plantilla no encontrada para ID:", selectedPlantillaId);
        return;
      }
      setSelectedPlantilla(plantilla);
      console.log("2. handleCreateTestInstance: Plantilla encontrada:", plantilla);

      try {
        const newTestInstance = {
          pacienteId,
          plantillaTestId: plantilla.id,
          tituloTest: plantilla.titulo,
          fecha: Date.now(),
          respuestas: [],
          estado: 'creado', // Estado inicial
        };
        console.log("3. handleCreateTestInstance: Creando nueva instancia de test en Firestore:", newTestInstance);
        const newTestId = await guardarTestRealizado(newTestInstance);
        setCurrentTestInstanceId(newTestId);
        const publicUrl = `${window.location.origin}/test/${newTestId}`;
        setQrCodeUrl(publicUrl);
        onTestInstanceCreated(newTestId, publicUrl, plantilla.id);
        console.log("4. handleCreateTestInstance: Instancia de test creada. ID:", newTestId, "URL QR:", publicUrl);

        // Suscribirse a cambios en el estado del test recién creado
        const unsubscribe = subscribeToTestRealizado(newTestId, (updatedTest) => {
          if (updatedTest && updatedTest.estado === 'leido por paciente') {
            console.log("Test escaneado y leído por paciente. Cerrando modal.");
            onClose(); // Cerrar el modal
            unsubscribe(); // Desuscribirse una vez que el estado cambie
          }
        });

        // Asegurarse de desuscribirse si el modal se cierra manualmente
        return () => unsubscribe();

      } catch (error) {
        console.error("ERROR: Error al crear la instancia del test:", error);
      }
    }
  };

  const handleStartDirectly = () => {
    if (selectedPlantilla) {
      onStartDirectly(selectedPlantilla.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {!qrCodeUrl ? (
          <>
            <h2 className="text-lg font-bold mb-4">Seleccionar Test Psicológico</h2>
            <Select
              value={selectedPlantillaId}
              onChange={(e) => {
                setSelectedPlantillaId(e.target.value);
                console.log("Selected Plantilla ID:", e.target.value);
              }}
              options={[{ value: '', label: 'Seleccione un test', disabled: true }, ...plantillas.map(p => ({ value: p.id, label: p.titulo }))]}
            >
              {/* Options are now passed via the 'options' prop */}
            </Select>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleCreateTestInstance} disabled={!selectedPlantillaId}>Crear Test</Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">Test Creado</h2>
            <p className="mb-4 text-gray-700">Escanee el código QR para realizar el test en otro dispositivo:</p>
            <div className="flex justify-center mb-6">
             <QRCodeCanvas value={qrCodeUrl ?? ''} size={256} level="H" includeMargin />


            </div>
            <p className="text-sm text-gray-500 break-all mb-4">{qrCodeUrl}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleStartDirectly}>Iniciar Test Ahora (en este dispositivo)</Button>
              <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearTestModal;
