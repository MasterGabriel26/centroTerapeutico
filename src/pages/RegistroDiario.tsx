import React, { useState } from 'react';
import { Calendar, Search, Filter, Camera, FileText, Activity, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { RegistroForm } from '../components/registros/RegistroForm';

// Datos simulados
const registrosMock = [
  {
    id: '1',
    anexado_id: '1',
    anexado_nombre: 'Juan Pérez López',
    fecha: '2023-10-05',
    descripcion: 'El paciente ha mostrado mejoras significativas en su autocontrol',
    medicamentos: 'Sertralina 50mg, Clonazepam 0.5mg',
    comidas: 'Desayuno: Huevos con jamón, Comida: Pollo con verduras, Cena: Sopa de verduras',
    peso: 75.5,
    comportamiento: 'Cooperativo, participativo en terapias grupales',
    foto_url: 'https://images.pexels.com/photos/6551890/pexels-photo-6551890.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '2',
    anexado_id: '1',
    anexado_nombre: 'Juan Pérez López',
    fecha: '2023-10-04',
    descripcion: 'Se muestra ansioso durante la mañana, pero más tranquilo por la tarde',
    medicamentos: 'Sertralina 50mg, Clonazepam 0.5mg',
    comidas: 'Desayuno: Cereal con frutas, Comida: Pescado, Cena: Sandwich',
    peso: 75.8,
    comportamiento: 'Ansioso por la mañana, cooperativo por la tarde',
    foto_url: 'https://images.pexels.com/photos/6551891/pexels-photo-6551891.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '3',
    anexado_id: '2',
    anexado_nombre: 'Roberto González Martínez',
    fecha: '2023-10-05',
    descripcion: 'Participó activamente en actividades recreativas',
    medicamentos: 'Bupropión 150mg, Olanzapina 5mg',
    comidas: 'Desayuno: Avena, Comida: Carne con ensalada, Cena: Quesadillas',
    peso: 82.1,
    comportamiento: 'Tranquilo, sociable con otros pacientes',
    foto_url: 'https://images.pexels.com/photos/6823526/pexels-photo-6823526.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '4',
    anexado_id: '3',
    anexado_nombre: 'Carlos Ramírez Silva',
    fecha: '2023-10-05',
    descripcion: 'Reporta mejor calidad de sueño, ánimo estable',
    medicamentos: 'Fluoxetina 20mg, Quetiapina 25mg',
    comidas: 'Desayuno: Fruta y yogurt, Comida: Sopa y enchiladas, Cena: Fruta y pan',
    peso: 70.3,
    comportamiento: 'Tranquilo, comunicativo',
    foto_url: 'https://images.pexels.com/photos/6823527/pexels-photo-6823527.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const RegistroDiario = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showNewRegistroDialog, setShowNewRegistroDialog] = useState(false);
  const [showEditRegistroDialog, setShowEditRegistroDialog] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<typeof registrosMock[0] | null>(null);
  
  // Filtrar registros por búsqueda y fecha
  const filteredRegistros = registrosMock.filter(registro => {
    const matchesSearch = registro.anexado_nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = selectedDate === '' || registro.fecha === selectedDate;
    
    return matchesSearch && matchesDate;
  });

  // Función para formatear fecha en español
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para cambiar día (anterior/siguiente)
  const cambiarDia = (incremento: number) => {
    const fecha = new Date(selectedDate);
    fecha.setDate(fecha.getDate() + incremento);
    setSelectedDate(fecha.toISOString().split('T')[0]);
  };

  const handleCreateRegistro = async (data: FormData) => {
    console.log('Crear registro:', data);
    // Implement creation logic
    setShowNewRegistroDialog(false);
  };

  const handleEditRegistro = async (data: FormData) => {
    console.log('Editar registro:', data);
    // Implement edit logic
    setShowEditRegistroDialog(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registros Diarios</h1>
          <p className="text-gray-500">Seguimiento diario de los anexados</p>
        </div>
        <Button 
          variant="primary" 
          icon={<FileText size={18} />}
          onClick={() => setShowNewRegistroDialog(true)}
        >
          Nuevo Registro
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <Input
              placeholder="Buscar por nombre de anexado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => cambiarDia(-1)}
              icon={<ArrowLeft size={16} />}
            />
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                leftIcon={<Calendar size={18} />}
                className="w-40"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => cambiarDia(1)}
              icon={<ArrowRight size={16} />}
            />
            <Button 
              variant={selectedDate === '' ? 'outline' : 'primary'} 
              size="sm"
              onClick={() => setSelectedDate('')}
            >
              Todos
            </Button>
          </div>
        </div>
      </div>

      {/* Fecha seleccionada */}
      {selectedDate && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {formatFecha(selectedDate)}
          </h2>
        </div>
      )}

      {/* Lista de registros diarios */}
      <div className="space-y-6">
        {filteredRegistros.map((registro) => (
          <Card key={registro.id} className="overflow-hidden">
            <div className="md:flex">
              {/* Imagen */}
              <div className="md:w-1/4 relative overflow-hidden h-64 md:h-auto">
                <img 
                  src={registro.foto_url} 
                  alt={registro.anexado_nombre} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 md:hidden">
                  <h3 className="text-white font-semibold">{registro.anexado_nombre}</h3>
                  <p className="text-white/80 text-sm">{new Date(registro.fecha).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
              
              {/* Contenido */}
              <div className="md:w-3/4 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 hidden md:block">{registro.anexado_nombre}</h3>
                    <p className="text-gray-500 hidden md:block">{new Date(registro.fecha).toLocaleDateString('es-MX')}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      <Activity size={12} className="mr-1" /> Seguimiento diario
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Descripción</h4>
                    <p className="text-gray-900">{registro.descripcion}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Comportamiento</h4>
                    <p className="text-gray-900">{registro.comportamiento}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Medicamentos</h4>
                    <p className="text-gray-900">{registro.medicamentos}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Peso</h4>
                    <p className="text-gray-900">{registro.peso} kg</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Comidas</h4>
                    <p className="text-gray-900">{registro.comidas}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    icon={<Camera size={16} />}
                  >
                    Ver galería
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setSelectedRegistro(registro);
                      setShowEditRegistroDialog(true);
                    }}
                  >
                    Editar registro
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Mensaje cuando no hay resultados */}
        {filteredRegistros.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron registros</h3>
            <p className="text-gray-500 mb-6">No hay registros diarios para esta fecha o anexado.</p>
            <Button 
              variant="primary" 
              icon={<FileText size={18} />}
              onClick={() => setShowNewRegistroDialog(true)}
            >
              Crear nuevo registro
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog
        isOpen={showNewRegistroDialog}
        onClose={() => setShowNewRegistroDialog(false)}
        title="Nuevo Registro Diario"
        maxWidth="lg"
      >
        <RegistroForm onSubmit={handleCreateRegistro} />
      </Dialog>

      <Dialog
        isOpen={showEditRegistroDialog}
        onClose={() => setShowEditRegistroDialog(false)}
        title="Editar Registro"
        maxWidth="lg"
      >
        <RegistroForm
          onSubmit={handleEditRegistro}
          // initialData={selectedRegistro || {}}
        />
      </Dialog>
    </div>
  );
};

export default RegistroDiario;