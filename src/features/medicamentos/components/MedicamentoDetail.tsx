import React from 'react';
import { Medicamento } from '../types/medicamento';
import { Pill, Calendar, Box, Factory, Tag, ClipboardList, FileText } from 'lucide-react';

interface MedicamentoDetailProps {
  medicamento: Medicamento;
}

const MedicamentoDetail: React.FC<MedicamentoDetailProps> = ({ medicamento }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Pill className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold">{medicamento.nombre}</h3>
          {medicamento.nombreGenerico && (
            <p className="text-sm text-gray-600">Genérico: {medicamento.nombreGenerico}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Tag className="text-gray-500" size={18} />
          <div>
            <p className="text-sm text-gray-500">Categoría</p>
            <p className="capitalize">{medicamento.categoria}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Box className="text-gray-500" size={18} />
          <div>
            <p className="text-sm text-gray-500">Presentación</p>
            <p className="capitalize">{medicamento.presentacion} ({medicamento.concentracion})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Factory className="text-gray-500" size={18} />
          <div>
            <p className="text-sm text-gray-500">Laboratorio</p>
            <p>{medicamento.laboratorio}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="text-gray-500" size={18} />
          <div>
            <p className="text-sm text-gray-500">Caducidad</p>
            <p className={medicamento.estado === 'caducado' ? 'text-red-600' : ''}>
              {formatDate(medicamento.fechaCaducidad)}
              {medicamento.estado === 'caducado' && ' (Caducado)'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium flex items-center gap-2 mb-2">
          <ClipboardList size={16} /> Información adicional
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Lote</p>
            <p>{medicamento.lote || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Stock</p>
            <p className={medicamento.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}>
              {medicamento.stock}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Precio</p>
            <p>${medicamento.precioVenta?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-gray-500">Ubicación</p>
            <p>{medicamento.ubicacion || 'N/A'}</p>
          </div>
        </div>
      </div>

      {medicamento.descripcion && (
        <div className="pt-4 border-t">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <FileText size={16} /> Descripción
          </h4>
          <p className="text-sm text-gray-700">{medicamento.descripcion}</p>
        </div>
      )}
    </div>
  );
};

export default MedicamentoDetail;