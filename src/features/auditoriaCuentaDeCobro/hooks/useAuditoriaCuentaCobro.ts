// src/domains/auditoria/hooks/useAuditoriaCuentaCobro.ts

import { useEffect, useState, useCallback } from "react";
import { AuditoriaCuentaCobro } from "../type/auditoria_cuenta_cobro";
import {
  getAuditoriasCuentaCobro,
  addAuditoriaCuentaCobro
} from "../services/auditoriaCuentaCobroService";

import { getPacientesMap, getUsuariosMap } from "../../pagos/services/cuentaCobroService";

export function useAuditoriaCuentaCobro(pacienteId: string, cuentaCobroId: string) {
  const [auditorias, setAuditorias] = useState<AuditoriaCuentaCobro[]>([]);
  const [usuarios, setUsuarios] = useState<{ [key: string]: string }>({});
  const [pacientes, setPacientes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [auditoriasList, pacientesMap, usuariosMap] = await Promise.all([
      getAuditoriasCuentaCobro(pacienteId, cuentaCobroId),
      getPacientesMap(),
      getUsuariosMap(),
    ]);
    setAuditorias(auditoriasList);
    setPacientes(pacientesMap);
    setUsuarios(usuariosMap);
    setLoading(false);
  }, [pacienteId, cuentaCobroId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { auditorias, pacientes, usuarios, loading, refetch: fetchData };
}
