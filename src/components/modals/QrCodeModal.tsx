import React from 'react';
import { Dialog } from '../ui/Dialog';
import { QRCodeCanvas  } from 'qrcode.react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string | null;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  testId,
}) => {
  const testUrl = testId ? `${window.location.origin}/test/${testId}` : '';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Escanear QR para Continuar Test">
      <div className="p-4 flex flex-col items-center">
        {testId ? (
          <>
            <p className="mb-4 text-gray-700 text-center">Escanea el código QR para continuar el test en otro dispositivo:</p>
            <div className="p-2 border border-gray-300 rounded-md">
              <QRCodeCanvas  value={testUrl} size={256} level="H" />
            </div>
            <p className="mt-4 text-sm text-gray-500 break-all">URL: {testUrl}</p>
          </>
        ) : (
          <p className="text-red-500">No se pudo generar el código QR. ID de test no proporcionado.</p>
        )}
      </div>
    </Dialog>
  );
};

export default QrCodeModal;
