import React, { useState, useEffect, useMemo } from 'react';
import { useMedicamentos } from '../hooks/useMedicamentos';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import DataTable from '../../../components/ui/DataTable';
import { Plus, Pill, AlertTriangle, Search, Eye, Edit } from 'lucide-react';
import { MedicamentoForm } from '../components/MedicamentosForm';
import { Medicamento } from '../types/medicamento';
import MedicamentoDetail from '../components/MedicamentoDetail';

const InventarioMedicamentos = () => {
  const { 
    medicamentos, 
    caducados, 
    loading, 
    error, 
    buscarMedicamentos,
    agregarMedicamento,
    editarMedicamento
  } = useMedicamentos();
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const medicamentosFiltrados = useMemo(() => {
    return searchTerm ? buscarMedicamentos(searchTerm) : medicamentos;
  }, [searchTerm, medicamentos, buscarMedicamentos]);

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'nombre',
      cell: ({ row }: { row: { original: Medicamento } }) => (
        <div className="min-w-[150px]">
          <div className="font-medium truncate">{row.original.nombre}</div>
          {row.original.nombreGenerico && (
            <div className="text-xs text-gray-500 truncate">{row.original.nombreGenerico}</div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      header: 'Presentación',
      accessorKey: 'presentacion',
      cell: ({ row }: { row: { original: Medicamento } }) => (
        <div className="min-w-[100px]">
          <span className="capitalize">{row.original.presentacion}</span>
          <div className="text-xs text-gray-500">{row.original.concentracion}</div>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      cell: ({ row }: { row: { original: Medicamento } }) => (
        <span className={`font-medium ${
          row.original.stock <= 10 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {row.original.stock}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Caducidad',
      accessorKey: 'fechaCaducidad',
      cell: ({ row }: { row: { original: Medicamento } }) => {
        const fecha = new Date(row.original.fechaCaducidad);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fecha.setHours(0, 0, 0, 0);
        const caducado = fecha < hoy;
        
        return (
          <div className="min-w-[120px]">
            <span className={caducado ? 'text-red-600' : ''}>
              {fecha.toLocaleDateString('es-ES')}
            </span>
            {caducado && (
              <div className="text-xs text-red-600 mt-1">Caducado</div>
            )}
          </div>
        );
      },
      sortable: true
    },
    {
      header: 'Precio',
      accessorKey: 'precioVenta',
      cell: ({ row }: { row: { original: Medicamento } }) => (
        <span className="font-medium">
          ${row.original.precioVenta?.toFixed(2) || '0.00'}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Acciones',
      accessorKey: 'actions',
      cell: ({ row }: { row: { original: Medicamento } }) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMedicamento(row.original);
              setShowDetailModal(true);
            }}
          >
            <Eye size={16} className="text-blue-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMedicamento(row.original);
              setShowModal(true);
            }}
          >
            <Edit size={16} className="text-green-500" />
          </Button>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      // El filtrado se maneja en el useMemo
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header con título */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-4">
          <Pill className="text-blue-500" /> Inventario de Medicamentos
        </h1>
        
        {/* Barra de búsqueda y botón - ahora debajo del título */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-grow max-w-2xl">
            <input
              type="text"
              placeholder="Buscar medicamentos por nombre, presentación, etc..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <Button 
            onClick={() => {
              setSelectedMedicamento(null);
              setShowModal(true);
            }} 
            className="whitespace-nowrap sm:w-auto w-full"
          >
            <Plus size={18} className="mr-2" /> Nuevo Medicamento
          </Button>
        </div>
      </div>

      {/* Alertas */}
      <div className="space-y-3 mb-6">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start gap-2">
            <AlertTriangle className="mt-0.5 flex-shrink-0" size={18} />
            <div>{error}</div>
          </div>
        )}

        {caducados.length > 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg flex items-start gap-2">
            <AlertTriangle className="mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium">Alerta: {caducados.length} medicamento(s) caducado(s)</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de datos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <DataTable
          columns={columns}
          data={medicamentosFiltrados}
          loading={loading}
          emptyMessage={
            searchTerm 
              ? "No se encontraron medicamentos con ese criterio de búsqueda" 
              : "No hay medicamentos registrados. Comience agregando uno nuevo."
          }
          onRowClick={(row) => setSelectedMedicamento(row)}
        />
      </div>

      {/* Modales */}
      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMedicamento ? "Editar Medicamento" : "Nuevo Medicamento"}
        size="lg"
      >
        <MedicamentoForm
          initialData={selectedMedicamento || undefined}
          onSubmit={async (data) => {
            if (selectedMedicamento?.id) {
              await editarMedicamento(selectedMedicamento.id, data);
            } else {
              await agregarMedicamento(data);
            }
            setShowModal(false);
            setSelectedMedicamento(null);
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedMedicamento(null);
          }}
        />
      </Dialog>

      <Dialog
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles del Medicamento"
        size="md"
      >
        {selectedMedicamento && (
          <MedicamentoDetail medicamento={selectedMedicamento} />
        )}
      </Dialog>
    </div>
  );
};

export default InventarioMedicamentos;