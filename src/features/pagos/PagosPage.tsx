import React, { useState } from "react";
import { useCuentaDeCobro } from "./hooks/useCuentaDeCobro";
import { ResumenPagosCards } from "./components/ResumenPagosCards";
import { FiltrosPagos } from "./components/FiltrosPagos";
import { TablaPagos } from "./components/TablaPagos";
import { DialogComprobante } from "./components/DialogComprobante";
import { DialogHistorialPago } from "./components/DialogHistorialPago";
import { CuentaCobro } from "./types/cuenta_cobro";

const PagosPage: React.FC = () => {
  const { pagos, pacientes, familiares, usuarios } = useCuentaDeCobro();


  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "completado" | "pendiente">("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const filteredPagos = pagos.filter((p) => {
    const nombrePaciente = pacientes[p.paciente_id]?.toLowerCase() || "";
    const nombreFamiliar = familiares[p.familiar_id]?.toLowerCase() || "";
    const matchesSearch = nombrePaciente.includes(searchQuery.toLowerCase()) || nombreFamiliar.includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === "todos" || p.estado === filterEstado;
    const fechaPago = new Date(p.fecha);
    const matchesStart = !startDate || fechaPago >= new Date(startDate);
    const matchesEnd = !endDate || fechaPago <= new Date(endDate);
    return matchesSearch && matchesEstado && matchesStart && matchesEnd;
  });

  const totalPaginas = Math.ceil(filteredPagos.length / registrosPorPagina);
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const pagosPaginados = filteredPagos.slice(indexPrimero, indexUltimo);

  const totalPagos = filteredPagos.reduce((sum, p) => sum + p.monto, 0);
  const totalPagosCompletados = filteredPagos.filter((p) => p.estado === "completado").reduce((sum, p) => sum + p.monto, 0);
  const totalPagosPendientes = filteredPagos.filter((p) => p.estado === "pendiente").reduce((sum, p) => sum + p.monto, 0);
  const totalPendientesCount = filteredPagos.filter((p) => p.estado === "pendiente").length;

  const handleVerHistorial = (cuenta_cobro: CuentaCobro) => {
    // const ordenado = [...(pago.historial || [])].sort(
    //   (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    // );
    // setHistorialPago(ordenado);
    // setShowHistorial(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cuentas de cobros</h1>
        <p className="text-gray-500">Gestión de pagos de los pacientes</p>
      </div>

      <ResumenPagosCards
        totalPagos={totalPagos}
        totalPagosCompletados={totalPagosCompletados}
        totalPagosPendientes={totalPagosPendientes}
        totalRegistros={filteredPagos.length}
        totalPendientesCount={totalPendientesCount}
      />

      <FiltrosPagos
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <TablaPagos
        pagos={pagosPaginados}
        pacientes={pacientes}
        familiares={familiares}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        cambiarPagina={setPaginaActual}
        onZoomComprobante={setZoomImageUrl}
      />

      <DialogComprobante url={zoomImageUrl} onClose={() => setZoomImageUrl(null)} />
   
    </div>
  );
};

export default PagosPage;
