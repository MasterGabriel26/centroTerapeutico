"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "../components/ui/Card"
import { Users, CreditCard, Activity, TrendingUp, TrendingDown, Calendar } from "lucide-react"
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
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { db } from "../utils/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

// Función mejorada para obtener los meses según el rango seleccionado
const getMonthsRange = (range: string) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const today = new Date()
  const result = []

  let monthCount = 6
  if (range === "1_mes") monthCount = 1
  else if (range === "3_meses") monthCount = 3
  else if (range === "6_meses") monthCount = 6
  else if (range === "12_meses") monthCount = 12

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    result.push({
      label: `${months[date.getMonth()]} ${date.getFullYear()}`,
      year: date.getFullYear(),
      month: date.getMonth(),
    })
  }

  return result
}

// Función corregida para calcular fechas de inicio
const getDateRange = (range: string) => {
  const today = new Date()
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // Último día del mes actual
  let startDate = new Date()

  if (range === "1_mes") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1)
  } else if (range === "3_meses") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
  } else if (range === "6_meses") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)
  } else if (range === "12_meses") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1)
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)
  }

  return { startDate, endDate }
}

// Función mejorada para formatear fecha
const formatFirestoreDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Función para obtener el índice del mes basado en una fecha
const getMonthIndex = (dateString: string, monthsRange: any[]) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth()

  return monthsRange.findIndex((m) => m.year === year && m.month === month)
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<string>("6_meses")
  const [pacientesActivos, setPacientesActivos] = useState<number>(0)
  const [ingresosTotales, setIngresosTotales] = useState<number>(0)
  const [gastosTotales, setGastosTotales] = useState<number>(0)
  const [pagosPendientes, setPagosPendientes] = useState<number>(0)
  const [financialData, setFinancialData] = useState<{ ingresos: number[]; gastos: number[] }>({
    ingresos: [],
    gastos: [],
  })
  const [newPatientsData, setNewPatientsData] = useState<number[]>([])
  const [expensesData, setExpensesData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const { startDate, endDate } = getDateRange(dateRange)
        const monthsRange = getMonthsRange(dateRange)
        const monthCount = monthsRange.length

        // Convertir fechas a formato Firestore
        const startDateStr = formatFirestoreDate(startDate)
        const endDateStr = formatFirestoreDate(endDate)

        console.log(`Fetching data from ${startDateStr} to ${endDateStr}`)

        // 1. Pacientes activos (siempre actual, no depende del rango)
        const pacientesSnap = await getDocs(query(collection(db, "pacientes"), where("estado", "==", "activo")))
        setPacientesActivos(pacientesSnap.docs.length)

        // Inicializar arrays para datos históricos
        const ingresosPorMes = new Array(monthCount).fill(0)
        const gastosPorMes = new Array(monthCount).fill(0)
        const nuevosPacientesPorMes = new Array(monthCount).fill(0)
        const gastosPorCategoria: { [key: string]: number } = {}

        // 2. Procesar pagos para el rango completo
        const pagosSnap = await getDocs(
          query(collection(db, "pagos"), where("fecha", ">=", startDateStr), where("fecha", "<=", endDateStr)),
        )

        let totalIngresos = 0
        let totalPendientes = 0

        pagosSnap.docs.forEach((doc) => {
          const data = doc.data()
          const monthIndex = getMonthIndex(data.fecha, monthsRange)

          // Para el gráfico histórico
          if (monthIndex !== -1) {
            if (data.estado === "completado") {
              ingresosPorMes[monthIndex] += data.monto || 0
            }
          }

          // Para las tarjetas de resumen
          if (data.estado === "completado") {
            totalIngresos += data.monto || 0
          } else if (data.estado === "pendiente") {
            totalPendientes += 1
          }
        })

        setIngresosTotales(totalIngresos)
        setPagosPendientes(totalPendientes)

        // 3. Procesar gastos para el rango completo
        const gastosSnap = await getDocs(
          query(collection(db, "gastos"), where("fecha", ">=", startDateStr), where("fecha", "<=", endDateStr)),
        )

        let totalGastos = 0

        gastosSnap.docs.forEach((doc) => {
          const data = doc.data()
          const monthIndex = getMonthIndex(data.fecha, monthsRange)
          const monto = data.monto || 0

          totalGastos += monto

          // Para el gráfico histórico
          if (monthIndex !== -1) {
            gastosPorMes[monthIndex] += monto
          }

          // Para la distribución de gastos
          const categoria = data.categoria || "Otros"
          gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto
        })

        setGastosTotales(totalGastos)
        setFinancialData({
          ingresos: ingresosPorMes,
          gastos: gastosPorMes,
        })

        // 4. Nuevos pacientes para el rango completo
        const startDateISO = startDate.toISOString()
        const endDateISO = endDate.toISOString()

        const pacientesNuevosSnap = await getDocs(
          query(collection(db, "pacientes"), where("creado", ">=", startDateISO), where("creado", "<=", endDateISO)),
        )

        pacientesNuevosSnap.docs.forEach((doc) => {
          const data = doc.data()
          const fechaCreacion = new Date(data.creado)
          const monthIndex = getMonthIndex(fechaCreacion.toISOString().split("T")[0], monthsRange)

          if (monthIndex !== -1) {
            nuevosPacientesPorMes[monthIndex] += 1
          }
        })

        setNewPatientsData(nuevosPacientesPorMes)

        // 5. Distribución de gastos
        const gastosLabels = Object.keys(gastosPorCategoria)
        const gastosValues = Object.values(gastosPorCategoria)

        if (gastosLabels.length === 0) {
          gastosLabels.push("Sin datos")
          gastosValues.push(1)
        }

        setExpensesData({ labels: gastosLabels, values: gastosValues })

        // 6. Actividad reciente (siempre últimos 4 registros)
        const pacientesRecientes = await getDocs(
          query(collection(db, "pacientes"), orderBy("creado", "desc"), limit(4)),
        )

        const pagosRecientes = await getDocs(
          query(collection(db, "pagos"), where("estado", "==", "completado"), orderBy("fecha", "desc"), limit(4)),
        )

        const actividad = []

        pacientesRecientes.docs.forEach((doc) => {
          const data = doc.data()
          actividad.push({
            type: "paciente",
            nombre: data.nombre_completo,
            fecha: data.creado,
            extra: data.diagnostico || "Sin diagnóstico",
          })
        })

        pagosRecientes.docs.forEach((doc) => {
          const data = doc.data()
          actividad.push({
            type: "pago",
            monto: data.monto,
            fecha: data.fecha,
            pacienteId: data.paciente_id,
          })
        })

        actividad.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

        setRecentActivity(actividad.slice(0, 4))

        console.log("Data fetched successfully:", {
          totalIngresos,
          totalGastos,
          totalPendientes,
          ingresosPorMes,
          gastosPorMes,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Datos para gráficos
  const lineChartData = useMemo(
    () => ({
      labels: getMonthsRange(dateRange).map((m) => m.label),
      datasets: [
        {
          label: "Ingresos",
          data: financialData.ingresos,
          borderColor: "rgb(37, 99, 235)",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Gastos",
          data: financialData.gastos,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [financialData, dateRange],
  )

  const barChartData = useMemo(
    () => ({
      labels: getMonthsRange(dateRange).map((m) => m.label),
      datasets: [
        {
          label: "Nuevos Pacientes",
          data: newPatientsData,
          backgroundColor: "rgba(37, 99, 235, 0.8)",
        },
      ],
    }),
    [newPatientsData, dateRange],
  )

  const doughnutChartData = useMemo(() => {
    const colors = [
      "rgba(37, 99, 235, 0.8)",
      "rgba(16, 185, 129, 0.8)",
      "rgba(249, 115, 22, 0.8)",
      "rgba(139, 92, 246, 0.8)",
      "rgba(220, 38, 38, 0.8)",
      "rgba(107, 114, 128, 0.8)",
    ]

    return {
      labels: expensesData.labels,
      datasets: [
        {
          data: expensesData.values,
          backgroundColor: colors.slice(0, expensesData.labels.length),
          borderWidth: 1,
        },
      ],
    }
  }, [expensesData])

  // Formateador de fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 24) {
      return `Hace ${diffHours} horas`
    }
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
  }

  // Función para obtener el texto del rango
  const getRangeText = () => {
    switch (dateRange) {
      case "1_mes":
        return "Último mes"
      case "3_meses":
        return "Últimos 3 meses"
      case "6_meses":
        return "Últimos 6 meses"
      case "12_meses":
        return "Últimos 12 meses"
      default:
        return "Últimos 6 meses"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen general de la clínica - {getRangeText()}</p>
        </div>

        <div className="mt-4 md:mt-0">
          <label htmlFor="date-range" className="mr-2 text-sm font-medium text-gray-700">
            Rango de informe:
          </label>
          <select
            id="date-range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1_mes">Último mes</option>
            <option value="3_meses">Últimos 3 meses</option>
            <option value="6_meses">Últimos 6 meses</option>
            <option value="12_meses">Últimos 12 meses</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <Card className="p-0 border border-gray-100 hover:border-primary-100 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
              <h3 className="text-2xl font-bold mt-1">{pacientesActivos}</h3>
              <div className="flex items-center mt-2 text-success-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>Activos actualmente</span>
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
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <h3 className="text-2xl font-bold mt-1">${ingresosTotales.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-success-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>En el periodo</span>
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
              <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
              <h3 className="text-2xl font-bold mt-1">${gastosTotales.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-error-600 text-sm">
                <TrendingDown size={16} className="mr-1" />
                <span>En el periodo</span>
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
                <span>En el periodo</span>
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
            {expensesData.labels.length > 0 && expensesData.labels[0] !== "Sin datos" ? (
              <Doughnut data={doughnutChartData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay datos de gastos para este periodo
              </div>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-2">
            <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                  <div
                    className={`p-2 rounded-full ${
                      item.type === "paciente" ? "bg-primary-50 text-primary-600" : "bg-success-50 text-success-600"
                    }`}
                  >
                    {item.type === "paciente" ? <Users size={18} /> : <CreditCard size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {item.type === "paciente" ? "Nuevo paciente registrado" : "Pago recibido"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === "paciente"
                        ? `${item.nombre} - ${item.extra}`
                        : `$${item.monto?.toLocaleString() || "0"} - Paciente ID: ${item.pacienteId?.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(item.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
