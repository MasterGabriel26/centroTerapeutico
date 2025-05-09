import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  FileText, 
  Check, 
  X, 
  Plus 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

// Datos simulados
const pagosMock = [
  {
    id: '1',
    anexado_id: '1',
    anexado_nombre: 'Juan Pérez López',
    familiar_nombre: 'María Pérez',
    fecha: '2023-10-05',
    monto: 3600,
    metodo_pago: 'transferencia',
    comprobante_url: 'https://example.com/comprobante1.jpg',
    estado: 'completado',
  },
  {
    id: '2',
    anexado_id: '2',
    anexado_nombre: 'Roberto González Martínez',
    familiar_nombre: 'Ana González',
    fecha: '2023-10-03',
    monto: 3600,
    metodo_pago: 'efectivo',
    comprobante_url: null,
    estado: 'completado',
  },
  {
    id: '3',
    anexado_id: '3',
    anexado_nombre: 'Carlos Ramírez Silva',
    familiar_nombre: 'Luis Ramírez',
    fecha: '2023-10-01',
    monto: 3600,
    metodo_pago: 'transferencia',
    comprobante_url: 'https://example.com/comprobante3.jpg',
    estado: 'completado',
  },
  {
    id: '4',
    anexado_id: '1',
    anexado_nombre: 'Juan Pérez López',
    familiar_nombre: 'María Pérez',
    fecha: '2023-09-28',
    monto: 3600,
    metodo_pago: 'transferencia',
    comprobante_url: 'https://example.com/comprobante4.jpg',
    estado: 'completado',
  },
  {
    id: '5',
    anexado_id: '4',
    anexado_nombre: 'Miguel Hernández Torres',
    familiar_nombre: 'Rosa Hernández',
    fecha: '2023-10-10',
    monto: 3600,
    metodo_pago: 'transferencia',
    comprobante_url: null,
    estado: 'pendiente',
  },
];

const pagosPendientesMock = [
  {
    id: '1',
    anexado_id: '4',
    anexado_nombre: 'Miguel Hernández Torres',
    familiar_nombre: 'Rosa Hernández',
    fecha_vencimiento: '2023-10-10',
    monto: 3600,
  },
  {
    id: '2',
    anexado_id: '2',
    anexado_nombre: 'Roberto González Martínez',
    familiar_nombre: 'Ana González',
    fecha_vencimiento: '2023-10-12',
    monto: 3600,
  },
];

const Pagos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'completado' | 'pendiente'>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtrar pagos según búsqueda, estado y fechas
  const filteredPagos = pagosMock.filter(pago => {
    const matchesSearch = pago.anexado_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pago.familiar_nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEstado = filterEstado === 'todos' || pago.estado === filterEstado;
    
    const pagoDate = new Date(pago.fecha);
    const matchesStartDate = !startDate || pagoDate >= new Date(startDate);
    const matchesEndDate = !endDate || pagoDate <= new Date(endDate);
    
    return matchesSearch && matchesEstado && matchesStartDate && matchesEndDate;
  });

  // Calcular totales
  const totalPagos = filteredPagos.reduce((sum, pago) => sum + pago.monto, 0);
  const totalPagosCompletados = filteredPagos
    .filter(pago => pago.estado === 'completado')
    .reduce((sum, pago) => sum + pago.monto, 0);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500">Gestión de pagos de los pacientes</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
        >
          Registrar Pago
        </Button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-primary-50 text-primary-600 mr-4">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pagos</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalPagos.toLocaleString('es-MX')}</h3>
              <p className="text-xs text-gray-500 mt-1">{filteredPagos.length} registros</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-success-50 text-success-600 mr-4">
              <Check size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pagos Completados</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">${totalPagosCompletados.toLocaleString('es-MX')}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {filteredPagos.filter(p => p.estado === 'completado').length} registros
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-warning-50 text-warning-600 mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">${pagosPendientesMock.reduce((sum, p) => sum + p.monto, 0).toLocaleString('es-MX')}</h3>
              <p className="text-xs text-gray-500 mt-1">{pagosPendientesMock.length} pendientes</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Pagos pendientes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pagos Pendientes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagosPendientesMock.map((pago) => (
            <Card key={pago.id} hoverable className="border border-warning-200">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">{pago.anexado_nombre}</h3>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800">
                    Pendiente
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">Familiar: {pago.familiar_nombre}</p>
                
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Fecha límite</p>
                    <p className="font-medium">{new Date(pago.fecha_vencimiento).toLocaleDateString('es-MX')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monto</p>
                    <p className="font-medium">${pago.monto.toLocaleString('es-MX')}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button variant="primary" size="sm" fullWidth>
                    Registrar pago
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {pagosPendientesMock.length === 0 && (
            <div className="col-span-3 bg-white rounded-xl shadow-sm p-8 text-center">
              <Check size={48} className="mx-auto text-success-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡No hay pagos pendientes!</h3>
              <p className="text-gray-500">Todos los pagos están al corriente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="md:flex-1">
            <Input
              placeholder="Buscar por nombre de anexado o familiar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={filterEstado === 'todos' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilterEstado('todos')}
            >
              Todos
            </Button>
            <Button 
              variant={filterEstado === 'completado' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilterEstado('completado')}
            >
              Completados
            </Button>
            <Button 
              variant={filterEstado === 'pendiente' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setFilterEstado('pendiente')}
            >
              Pendientes
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Fecha inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftIcon={<Calendar size={18} />}
              />
            </div>
            <div>
              <Input
                label="Fecha fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                leftIcon={<Calendar size={18} />}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabla de pagos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anexado / Familiar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprobante
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pago.anexado_nombre}</div>
                    <div className="text-sm text-gray-500">{pago.familiar_nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pago.fecha).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${pago.monto.toLocaleString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {pago.metodo_pago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pago.estado === 'completado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pago.estado === 'completado' ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pago.comprobante_url ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        icon={<FileText size={14} />}
                      >
                        Ver comprobante
                      </Button>
                    ) : (
                      <span className="text-gray-400">No disponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPagos.length === 0 && (
          <div className="py-8 text-center">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron pagos</h3>
            <p className="text-gray-500">Ajusta los filtros para ver más resultados.</p>
          </div>
        )}
        
        {filteredPagos.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Mostrando {filteredPagos.length} de {pagosMock.length} registros
            </p>
            <Button 
              variant="outline" 
              size="sm"
              icon={<Download size={16} />}
            >
              Exportar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Pagos;