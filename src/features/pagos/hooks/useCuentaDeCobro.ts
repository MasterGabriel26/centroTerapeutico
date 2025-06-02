import { useEffect, useState, useCallback } from "react";
import { getCuentasDeCobro, getPacientesMap, getUsuariosMap } from "../services/cuentaCobroService";
import { CuentaCobro } from "../types/cuenta_cobro";

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
