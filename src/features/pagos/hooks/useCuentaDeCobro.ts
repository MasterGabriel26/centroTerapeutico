import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebase";

export function useCuentaDeCobro() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<{ [key: string]: string }>({});
  const [familiares, setFamiliares] = useState<{ [key: string]: string }>({});
  const [usuarios, setUsuarios] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      const pagosSnap = await getDocs(collection(db, "cuentaCobro"));
      const pacientesSnap = await getDocs(collection(db, "pacientes"));
      const usersSnap = await getDocs(collection(db, "users"));

      const pagosData = pagosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const usuariosMap: { [id: string]: string } = {};
      const pacientesMap: { [id: string]: string } = {};
      const familiaresMap: { [id: string]: string } = {};

      usersSnap.forEach((doc) => {
        const data = doc.data();
        usuariosMap[doc.id] = data.nombre_completo;
        familiaresMap[doc.id] = data.nombre_completo;
      });

      pacientesSnap.forEach((doc) => {
        pacientesMap[doc.id] = doc.data().nombre_completo;
      });

      setPagos(pagosData);
      setUsuarios(usuariosMap);
      setPacientes(pacientesMap);
      setFamiliares(familiaresMap);
    };

    fetchData();
  }, []);

  return { pagos, pacientes, familiares, usuarios };
}
