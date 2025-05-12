import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { db } from '../utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [pacientesActivos, setPacientesActivos] = useState<number>(0);
  const [ingresosMes, setIngresosMes] = useState<number>(0);
  const [gastosMes, setGastosMes] = useState<number>(0);
  const [pagosPendientes, setPagosPendientes] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const pacientesSnap = await getDocs(query(collection(db, 'pacientes'), where('estado', '==', 'activo')));
      setPacientesActivos(pacientesSnap.docs.length);

      const pagosSnap = await getDocs(collection(db, 'pagos'));
      const hoy = new Date();
      let ingresos = 0;
      let pendientes = 0;
      pagosSnap.docs.forEach((doc) => {
        const data = doc.data();
        const fecha = new Date(data.fecha);
        if (fecha.getMonth() === hoy.getMonth()) {
          if (data.estado === 'completado') ingresos += data.monto || 0;
          if (data.estado === 'pendiente') pendientes += 1;
        }
      });
      setIngresosMes(ingresos);
      setPagosPendientes(pendientes);

      const gastosSnap = await getDocs(collection(db, 'gastos'));
      let totalGastos = 0;
      gastosSnap.docs.forEach((doc) => {
        const data = doc.data();
        const fecha = new Date(data.fecha);
        if (fecha.getMonth() === hoy.getMonth()) {
          totalGastos += data.monto || 0;
        }
      });
      setGastosMes(totalGastos);
    };

    fetchData();
  }, []);

  // Datos fijos simulados para los gráficos
  const lineChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos',
        data: [12000, 19000, 15000, 22000, 20000, ingresosMes],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Gastos',
        data: [8000, 12000, 10000, 14000, 13000, gastosMes],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Nuevos Pacientes',
        data: [5, 8, 6, 9, 7, 10],
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Alimentos', 'Medicamentos', 'Personal', 'Servicios', 'Otros'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen general de la clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
              <h3 className="text-2xl font-bold mt-1">{pacientesActivos}</h3>
              <div className="flex items-center mt-2 text-success-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+5 este mes</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
              <Users size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos del Mes</p>
              <h3 className="text-2xl font-bold mt-1">${ingresosMes.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-success-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+12% vs mes anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-success-50 text-success-600">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Gastos del Mes</p>
              <h3 className="text-2xl font-bold mt-1">${gastosMes.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-error-600 text-sm">
                <TrendingDown size={16} className="mr-1" />
                <span>-3% vs mes anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-error-50 text-error-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
              <h3 className="text-2xl font-bold mt-1">{pagosPendientes}</h3>
              <div className="flex items-center mt-2 text-warning-600 text-sm">
                <Calendar size={16} className="mr-1" />
                <span>Próximos 7 días</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning-50 text-warning-600">
              <Activity size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <Card className="p-0">
          <h3 className="text-lg font-semibold mb-4">Resumen Financiero</h3>
          <div className="h-64">
            <Line data={lineChartData} />
          </div>
        </Card>

        <Card className="p-0">
          <h3 className="text-lg font-semibold mb-4">Nuevos Pacientes</h3>
          <div className="h-64">
            <Bar data={barChartData} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <Card className="p-2">
          <h3 className="text-lg font-semibold mb-4">Distribución de Gastos</h3>
          <div className="h-64">
            <Doughnut data={doughnutChartData} />
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-2">
            <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-primary-50 text-primary-600' : 'bg-success-50 text-success-600'}`}>
                    {i % 2 === 0 ? <Users size={18} /> : <CreditCard size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {i % 2 === 0 ? 'Nuevo paciente registrado' : 'Pago recibido'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {i % 2 === 0 ? 'Juan Pérez - Adicción a alcohol' : 'María Rodríguez - $3,600'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Hace {i * 2} horas</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
