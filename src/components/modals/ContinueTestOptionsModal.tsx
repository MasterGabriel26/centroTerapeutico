import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface ContinueTestOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueOnDevice: () => void;
  onScan: () => void;
}

const ContinueTestOptionsModal: React.FC<ContinueTestOptionsModalProps> = ({
  isOpen,
  onClose,
  onContinueOnDevice,
  onScan,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Continuar Test">
      <div className="p-4">
        <p className="mb-4 text-gray-700">¿Cómo deseas continuar el test?</p>
        <div className="flex flex-col space-y-4">
          <Button onClick={onContinueOnDevice} className="w-full py-2">Continuar en este equipo</Button>
          <Button onClick={onScan} variant="outline" className="w-full py-2">Escanear (QR)</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ContinueTestOptionsModal;
