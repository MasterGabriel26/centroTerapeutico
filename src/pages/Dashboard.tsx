import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import {
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
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
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { db } from "../utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

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

  // Resumen numérico
  const [pacientesAct, setPacientesAct] = useState(0);
  const [pagosPend, setPagosPend] = useState(0);

  // Datos para gráficas
  const [labels, setLabels] = useState<string[]>([]);
  const [ingresosData, setIngresosData] = useState<number[]>([]);
  const [gastosData, setGastosData] = useState<number[]>([]);
  const [nuevosPacData, setNuevosPacData] = useState<number[]>([]);
  const [distGastos, setDistGastos] = useState<
    { cat: string; monto: number }[]
  >([]);

  const [actividades, setActividades] = useState<
    { tipo: string; texto: string; fecha: Date }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const pacientesSnap = await getDocs(
        query(collection(db, "pacientes"), where("estado", "==", "activo"))
      );
      setPacientesActivos(pacientesSnap.docs.length);

      const pagosSnap = await getDocs(collection(db, "pagos"));
      const hoy = new Date();
      let ingresos = 0;
      let pendientes = 0;
      pagosSnap.docs.forEach((doc) => {
        const data = doc.data();
        const fecha = new Date(data.fecha);
        if (fecha.getMonth() === hoy.getMonth()) {
          if (data.estado === "completado") ingresos += data.monto || 0;
          if (data.estado === "pendiente") pendientes += 1;
        }
      });
      setIngresosMes(ingresos);
      setPagosPendientes(pendientes);

      const gastosSnap = await getDocs(collection(db, "gastos"));
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

  useEffect(() => {
    const fetchAll = async () => {
      const hoy = new Date();
      // Construir array de etiquetas últimos 6 meses
      const meses: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        meses.push(d.toLocaleString("es-MX", { month: "short" }));
      }
      setLabels(meses);

      // 1) Obtener todos los pagos y gastos
      const pagosSnap = await getDocs(collection(db, "pagos"));
      const gastosSnap = await getDocs(collection(db, "gastos"));

      // Inicializar acumuladores
      const ingByMonth = Array(6).fill(0);
      const gasByMonth = Array(6).fill(0);
      let pend = 0;

      pagosSnap.forEach((d) => {
        const data = d.data() as any;
        const f = new Date(data.fecha);
        const idx =
          hoy.getMonth() -
          f.getMonth() +
          5 -
          (hoy.getFullYear() - f.getFullYear()) * 12;

        if (idx >= 0 && idx < 6) {
          if (data.estado === "completado") ingByMonth[idx] += data.monto || 0;
          if (
            data.estado === "pendiente" &&
            f.getMonth() === hoy.getMonth() &&
            f.getFullYear() === hoy.getFullYear()
          )
            pend++;
        }
      });

      gastosSnap.forEach((d) => {
        const data = d.data() as any;
        const f = new Date(data.fecha);
        const idx =
          hoy.getMonth() -
          f.getMonth() +
          5 -
          (hoy.getFullYear() - f.getFullYear()) * 12;
        if (idx >= 0 && idx < 6) gasByMonth[idx] += data.monto || 0;
      });

      setIngresosData(ingByMonth);
      setGastosData(gasByMonth);
      setPagosPend(pend);

      // 2) Nuevos pacientes por mes
      const pacSnap = await getDocs(collection(db, "pacientes"));
      const newPacByMonth = Array(6).fill(0);
      pacSnap.forEach((d) => {
        const data = d.data() as any;
        const f = new Date(data.created_at);
        const idx =
          hoy.getMonth() -
          f.getMonth() +
          5 -
          (hoy.getFullYear() - f.getFullYear()) * 12;
        if (idx >= 0 && idx < 6) newPacByMonth[idx]++;
      });
      setNuevosPacData(newPacByMonth);
      setPacientesAct(pacSnap.docs.length);

      // 3) Distribución de gastos por categoría
      const distMap: Record<string, number> = {};
      gastosSnap.forEach((d) => {
        const { categoria, monto } = d.data() as any;
        distMap[categoria] = (distMap[categoria] || 0) + (monto || 0);
      });
      setDistGastos(
        Object.entries(distMap).map(([cat, m]) => ({ cat, monto: m }))
      );

      // 4) Actividad reciente: últimos 8 eventos de varias colecciones
      const act: { tipo: string; texto: string; fecha: Date }[] = [];
      pagosSnap.docs.forEach((d) => {
        const data = d.data() as any;
        act.push({
          tipo: "pago",
          texto: `Pago de $${data.monto}`,
          fecha: new Date(data.created_at || data.fecha),
        });
      });
      gastosSnap.docs.forEach((d) => {
        const data = d.data() as any;
        act.push({
          tipo: "gasto",
          texto: `Gasto de $${data.monto}`,
          fecha: new Date(data.fecha),
        });
      });
      pacSnap.docs.forEach((d) => {
        const data = d.data() as any;
        act.push({
          tipo: "paciente",
          texto: `Paciente ${data.nombre_completo}`,
          fecha: new Date(data.created_at),
        });
      });
      const famSnap = await getDocs(collection(db, "familiares"));
      famSnap.docs.forEach((d) => {
        const data = d.data() as any;
        act.push({
          tipo: "familiar",
          texto: `Familiar ${data.nombre_completo}`,
          fecha: new Date(data.created_at),
        });
      });
      act.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      setActividades(act.slice(0, 8));
    };

    fetchAll();
  }, []);

  // Datos fijos simulados para los gráficos
  const lineData = {
    labels,
    datasets: [
      {
        label: "Ingresos",
        data: ingresosData,
        borderColor: "rgb(37,99,235)",
        backgroundColor: "rgba(37,99,235,0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Gastos",
        data: gastosData,
        borderColor: "rgb(239,68,68)",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "Nuevos Pacientes",
        data: nuevosPacData,
        backgroundColor: "rgba(37,99,235,0.6)",
      },
    ],
  };

  const doughnutData = {
    labels: distGastos.map((d) => d.cat),
    datasets: [
      {
        data: distGastos.map((d) => d.monto),
        backgroundColor: [
          "rgba(37,99,235,0.6)",
          "rgba(16,185,129,0.6)",
          "rgba(249,115,22,0.6)",
          "rgba(139,92,246,0.6)",
          "rgba(107,114,128,0.6)",
        ],
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
              <p className="text-sm font-medium text-gray-500">
                Pacientes Activos
              </p>
              <h3 className="text-2xl font-bold mt-1">{pacientesActivos}</h3>
              {/* <div className="flex items-center mt-2 text-success-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+5 este mes</span>
              </div> */}
            </div>
            <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
              <Users size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Ingresos del Mes
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ${ingresosMes.toLocaleString()}
              </h3>
              {/* <div className="flex items-center mt-2 text-success-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+12% vs mes anterior</span>
              </div> */}
            </div>
            <div className="p-3 rounded-lg bg-success-50 text-success-600">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Gastos del Mes
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ${gastosMes.toLocaleString()}
              </h3>
              {/* <div className="flex items-center mt-2 text-error-600 text-sm">
                <TrendingDown size={16} className="mr-1" />
                <span>-3% vs mes anterior</span>
              </div> */}
            </div>
            <div className="p-3 rounded-lg bg-error-50 text-error-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pagos Pendientes
              </p>
              <h3 className="text-2xl font-bold mt-1">{pagosPendientes}</h3>
              {/* <div className="flex items-center mt-2 text-warning-600 text-sm">
                <Calendar size={16} className="mr-1" />
                <span>Próximos 7 días</span>
              </div> */}
            </div>
            <div className="p-3 rounded-lg bg-warning-50 text-warning-600">
              <Activity size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Resumen Financiero</h3>
          <Line data={lineData} />
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">
            Nuevos Pacientes (últimos 6 meses)
          </h3>
          <Bar data={barData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-2">
        {/* Distribución de Gastos */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Distribución de Gastos</h3>
          <div className="mt-8">
            <Doughnut data={doughnutData} />
          </div>
        </Card>

        {/* Actividad Reciente */}
        <Card className="lg:col-span-2 p-4">
          <h3 className="font-semibold mb-4">Actividad Reciente</h3>
          <div className="max-h-[410px] overflow-y-auto space-y-3">
            {actividades.slice(0, 7).map((a, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 pb-2 border-b last:border-0"
              >
                <div
                  className={`p-2 rounded-full ${
                    a.tipo === "pago"
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {a.tipo === "pago" ? (
                    <CreditCard size={18} />
                  ) : (
                    <Users size={18} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{a.texto}</p>
                  <p className="text-xs text-gray-400">
                    {a.fecha.toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
