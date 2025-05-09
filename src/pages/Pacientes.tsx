import React, { useState } from 'react';
import { Plus, Search, Calendar, Users, MoreVertical, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { AnexadoForm } from '../components/anexados/AnexadoForm';

// Datos simulados
const anexadosMock = [
  {
    id: '1',
    nombre_completo: 'Juan Pérez López',
    fecha_ingreso: '2023-06-15',
    estado: 'activo',
    motivo_anexo: 'Adicción a alcohol',
    familiar: 'María Pérez (Esposa)',
    telefono_familiar: '555-123-4567',
  },
  {
    id: '2',
    nombre_completo: 'Roberto González Martínez',
    fecha_ingreso: '2023-08-22',
    estado: 'activo',
    motivo_anexo: 'Adicción a drogas',
    familiar: 'Ana González (Madre)',
    telefono_familiar: '555-987-6543',
  },
  {
    id: '3',
    nombre_completo: 'Carlos Ramírez Silva',
    fecha_ingreso: '2023-05-10',
    estado: 'activo',
    motivo_anexo: 'Alcoholismo y depresión',
    familiar: 'Luis Ramírez (Hermano)',
    telefono_familiar: '555-456-7890',
  },
  {
    id: '4',
    nombre_completo: 'Miguel Hernández Torres',
    fecha_ingreso: '2023-07-30',
    estado: 'activo',
    motivo_anexo: 'Adicción a drogas',
    familiar: 'Rosa Hernández (Madre)',
    telefono_familiar: '555-789-0123',
  },
  {
    id: '5',
    nombre_completo: 'Fernando López García',
    fecha_ingreso: '2023-09-05',
    estado: 'inactivo',
    motivo_anexo: 'Alcoholismo',
    familiar: 'Elena López (Esposa)',
    telefono_familiar: '555-234-5678',
  },
];

const Pacientes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [showNewAnexadoDialog, setShowNewAnexadoDialog] = useState(false);
  const [showHistorialDialog, setShowHistorialDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAnexado, setSelectedAnexado] = useState<typeof anexadosMock[0] | null>(null);
  
  // Filtrar anexados según búsqueda y estado
  const filteredAnexados = anexadosMock.filter(anexado => {
    const matchesSearch = anexado.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anexado.motivo_anexo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || anexado.estado === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateAnexado = async (data: any) => {
    console.log('Crear anexado:', data);
    // Implement creation logic
    setShowNewAnexadoDialog(false);
  };

  const handleEditAnexado = async (data: any) => {
    console.log('Editar anexado:', data);
    // Implement edit logic
    setShowEditDialog(false);
  };

  const handleDarDeBaja = async (anexado: typeof anexadosMock[0]) => {
    if (confirm(`¿Estás seguro de dar de baja a ${anexado.nombre_completo}?`)) {
      console.log('Dar de baja:', anexado);
      // Implement dar de baja logic
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anexados</h1>
          <p className="text-gray-500">Gestión de personas en tratamiento</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => setShowNewAnexadoDialog(true)}
        >
          Nuevo Anexado
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <Input
              placeholder="Buscar por nombre o motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === 'todos' ? 'primary' : 'outline'} 
              onClick={() => setFilterStatus('todos')}
            >
              Todos
            </Button>
            <Button 
              variant={filterStatus === 'activo' ? 'primary' : 'outline'} 
              onClick={() => setFilterStatus('activo')}
            >
              Activos
            </Button>
            <Button 
              variant={filterStatus === 'inactivo' ? 'primary' : 'outline'} 
              onClick={() => setFilterStatus('inactivo')}
            >
              Inactivos
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        isOpen={showNewAnexadoDialog}
        onClose={() => setShowNewAnexadoDialog(false)}
        title="Nuevo Anexado"
      >
        <AnexadoForm onSubmit={handleCreateAnexado} />
      </Dialog>

      <Dialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        title="Editar Anexado"
      >
        <AnexadoForm
          onSubmit={handleEditAnexado}
          initialData={selectedAnexado || {}}
        />
      </Dialog>

      <Dialog
        isOpen={showHistorialDialog}
        onClose={() => setShowHistorialDialog(false)}
        title="Historial del Anexado"
        maxWidth="lg"
      >
        {selectedAnexado && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{selectedAnexado.nombre_completo}</h3>
            <div className="space-y-2">
              {/* Add historial content here */}
              <p className="text-gray-600">Historial del anexado...</p>
            </div>
          </div>
        )}
      </Dialog>

      {/* Lista de anexados en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnexados.map((anexado) => (
          <Card key={anexado.id} hoverable className="overflow-visible">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{anexado.nombre_completo}</h3>
                <div className="relative group">
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => {
                            setSelectedAnexado(anexado);
                            setShowHistorialDialog(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Ver historial
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setSelectedAnexado(anexado);
                            setShowEditDialog(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Editar información
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleDarDeBaja(anexado)}
                          className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-100"
                        >
                          Dar de baja
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mt-3">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  anexado.estado === 'activo' 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {anexado.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <Calendar size={16} className="text-gray-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de ingreso</p>
                    <p className="text-sm text-gray-900">{new Date(anexado.fecha_ingreso).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users size={16} className="text-gray-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Familiar responsable</p>
                    <p className="text-sm text-gray-900">{anexado.familiar}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone size={16} className="text-gray-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{anexado.telefono_familiar}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedAnexado(anexado);
                      setShowHistorialDialog(true);
                    }}
                  >
                    Ver Historial
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                  >
                    Registrar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Mensaje cuando no hay resultados */}
      {filteredAnexados.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron anexados</h3>
          <p className="text-gray-500 mb-6">No hay anexados que coincidan con los criterios de búsqueda.</p>
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setShowNewAnexadoDialog(true)}
          >
            Registrar nuevo anexado
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pacientes;