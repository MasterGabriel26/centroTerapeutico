import { useEffect, useState, useCallback } from "react";
import { getCuentasDeCobro, getPacientesMap, getUsuariosMap,getTotalesPorEstado } from "../services/cuentaCobroService";
import { CuentaCobro } from "../types/cuenta_cobro";
import { getTodasLasCuentasConPaciente } from "../services/cuentaCobroService";

export function useResumenPagos() {
  const [totales, setTotales] = useState<{ totalMonto: number; estadoTotales: Record<string, number> }>({
    totalMonto: 0,
    estadoTotales: {},
  });
  const [loading, setLoading] = useState(false);

  const fetchTotales = async () => {
    setLoading(true);
    const data = await getTotalesPorEstado();
    setTotales(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTotales();
  }, []);

  return { ...totales, loading, refetch: fetchTotales };
}


export function useCuentaDeCobro() {
  const [cuentas, setCuentas] = useState<CuentaCobro[]>([]);
  const [usuarios, setUsuarios] = useState<{ [key: string]: string }>({});
  const [pacientes, setPacientes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [cuentasList, pacientesMap, usuariosMap] = await Promise.all([
      getCuentasDeCobro(),
      getPacientesMap(),
      getUsuariosMap(),
    ]);
    setCuentas(cuentasList);
    setPacientes(pacientesMap);
    setUsuarios(usuariosMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { cuentas, pacientes, usuarios, loading, refetch: fetchData };
}

export function useTodasLasCuentas() {
  const [cuentas, setCuentas] = useState<(CuentaCobro & { paciente_nombre: string })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const cuentasCompletas = await getTodasLasCuentasConPaciente();
    setCuentas(cuentasCompletas);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  return { cuentas, loading, refetch: fetch };
}