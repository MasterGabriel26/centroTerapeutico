import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { db } from "../../utils/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { uploadPacienteImage } from "../anexados/uploadPacienteImage";
import { Clock, Edit, History, Plus, RotateCcw, Trash } from "lucide-react";

interface Props {
  pacienteId: string;
  familiarId: string;
  usuarioId: string;
}

export const PagosTable: React.FC<Props> = ({
  pacienteId,
  familiarId,
  usuarioId,
}) => {
  const [pagos, setPagos] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmacion, setConfirmacion] = useState<{
    open: boolean;
    mensaje: string;
  }>({
    open: false,
    mensaje: "",
  });

  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [editingPago, setEditingPago] = useState<any | null>(null);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia">(
    "efectivo"
  );
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [historialPago, setHistorialPago] = useState<any[] | null>(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [usuarios, setUsuarios] = useState<{ [id: string]: string }>({});

  const handleVerHistorial = (pago: any) => {
    const historialOrdenado = [...(pago.historial || [])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    setHistorialPago(historialOrdenado);
    setShowHistorial(true);
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const userData: { [id: string]: string } = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        userData[doc.id] =
          data.nombre_completo || data.nombre_completo || "Usuario";
      });
      setUsuarios(userData);
    };
    fetchUsuarios();
  }, []);

  useEffect(() => {
    const fetchPagos = async () => {
      const q = query(
        collection(db, "pagos"),
        where("paciente_id", "==", pacienteId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPagos(data);
    };
    fetchPagos();
  }, [pacienteId]);

  if (!familiarId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-md">
        Este paciente no tiene un familiar asignado. Por favor, asigna un
        familiar para poder registrar pagos.
      </div>
    );
  }

  const resetDialog = () => {
    setFecha("");
    setMonto("");
    setMetodoPago("efectivo");
    setComprobante(null);
    setEditingPago(null);
  };

  const handleGuardarPago = async () => {
    setLoading(true);
    let comprobanteUrl = editingPago?.comprobante_url || "";

    if (comprobante) {
      comprobanteUrl = await uploadPacienteImage(comprobante);
    }

    const fechaActual = new Date().toISOString();

    if (editingPago) {
      const pagoRef = doc(db, "pagos", editingPago.id);
      await updateDoc(pagoRef, {
        fecha,
        monto: parseFloat(monto),
        metodo_pago: metodoPago,
        comprobante_url: comprobanteUrl,
        updated_by: usuarioId,
        updated_at: fechaActual,
        historial: [
          ...(editingPago.historial || []),
          { tipo: "edicion", fecha: fechaActual, usuario: usuarioId },
        ],
      });

      setPagos((prev) =>
        prev.map((p) =>
          p.id === editingPago.id
            ? {
                ...p,
                fecha,
                monto: parseFloat(monto),
                metodo_pago: metodoPago,
                comprobante_url: comprobanteUrl,
              }
            : p
        )
      );
      setConfirmacion({ open: true, mensaje: "Pago editado correctamente" });
    } else {
      const nuevoPago = {
        paciente_id: pacienteId,
        familiar_id: familiarId,
        fecha,
        monto: parseFloat(monto),
        metodo_pago: metodoPago,
        comprobante_url: comprobanteUrl,
        estado: "completado",
        created_at: fechaActual,
        created_by: usuarioId,
        historial: [],
      };

      const docRef = await addDoc(collection(db, "pagos"), nuevoPago);
      setPagos((prev) => [...prev, { ...nuevoPago, id: docRef.id }]);
    }

    resetDialog();
    setShowDialog(false);
    setLoading(false);
  };

  const handleEliminarPago = async (pago: any) => {
    const fecha = new Date().toISOString();
    const pagoRef = doc(db, "pagos", pago.id);

    await updateDoc(pagoRef, {
      estado: "borrado",
      updated_by: usuarioId,
      updated_at: fecha,
      historial: [
        ...(pago.historial || []),
        { tipo: "borrado", fecha, usuario: usuarioId },
      ],
    });

    setPagos((prev) =>
      prev.map((p) => (p.id === pago.id ? { ...p, estado: "borrado" } : p))
    );
    setConfirmacion({ open: true, mensaje: "Pago marcado como borrado" });
  };

  const handleReactivarPago = async (pago: any) => {
    const fecha = new Date().toISOString();
    const pagoRef = doc(db, "pagos", pago.id);

    await updateDoc(pagoRef, {
      estado: "reactivado",
      updated_by: usuarioId,
      updated_at: fecha,
      historial: [
        ...(pago.historial || []),
        { tipo: "reactivado", fecha, usuario: usuarioId },
      ],
    });

    setPagos((prev) =>
      prev.map((p) => (p.id === pago.id ? { ...p, estado: "completado" } : p))
    );
    setConfirmacion({ open: true, mensaje: "Pago reactivado correctamente" });
  };

  const handleMarcarComoPendiente = async (pago: any) => {
    const fecha = new Date().toISOString();
    const pagoRef = doc(db, "pagos", pago.id);

    await updateDoc(pagoRef, {
      estado: "pendiente",
      updated_by: usuarioId,
      updated_at: fecha,
      historial: [
        ...(pago.historial || []),
        { tipo: "pendiente", fecha, usuario: usuarioId },
      ],
    });

    setPagos((prev) =>
      prev.map((p) => (p.id === pago.id ? { ...p, estado: "pendiente" } : p))
    );
    setConfirmacion({ open: true, mensaje: "Pago marcado como pendiente" });
  };

  const handleEditarPago = (pago: any) => {
    setEditingPago(pago);
    setFecha(pago.fecha);
    setMonto(pago.monto.toString());
    setMetodoPago(pago.metodo_pago);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Historial de Pagos
        </h3>
        <Button
          icon={<Plus size={18} />}
          onClick={() => {
            resetDialog(); // 👈 aseguras que editingPago sea null
            setShowDialog(true);
          }}
        >
          Nuevo Pago
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 border-b text-xs uppercase">
            <tr className="text-center">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Comprobante</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos
              .sort(
                (a, b) =>
                  new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
              )
              .map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2 text-center">{p.fecha}</td>
                  <td className="p-2 text-end">${p.monto}</td>
                  <td className="p-2 capitalize text-center">
                    {p.metodo_pago}
                  </td>
                  <td className="p-2 h-[64px]">
                    <div className="grid place-items-center h-full">
                      <img
                        src={p.comprobante_url}
                        alt="Comprobante"
                        className="h-12 w-12 object-cover rounded-md cursor-pointer hover:ring-2 hover:ring-primary-500"
                        onClick={() => setZoomImageUrl(p.comprobante_url)}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.estado === "completado"
                          ? "bg-green-100 text-green-700"
                          : p.estado === "borrado"
                          ? "bg-red-100 text-red-700"
                          : p.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-2 justify-center">
                      {p.estado === "borrado" ? (
                        <Button
                          icon={<RotateCcw size={14} />}
                          onClick={() => handleReactivarPago(p)}
                        >
                          Reactivar
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="primary"
                            icon={<Edit size={14} />}
                            onClick={() => handleEditarPago(p)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            icon={<Trash size={14} />}
                            onClick={() => handleEliminarPago(p)}
                          >
                            Eliminar
                          </Button>
                          <Button
                            variant="outline"
                            icon={<History size={14} />}
                            onClick={() => handleVerHistorial(p)}
                          >
                            Historial
                          </Button>
                          {p.estado !== "pendiente" && (
                            <Button
                              icon={<Clock size={14} />}
                              variant="primary"
                              onClick={() => handleMarcarComoPendiente(p)}
                            >
                              Pendiente
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            {pagos.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-gray-500 italic"
                >
                  Sin pagos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Dialog
        isOpen={showHistorial}
        onClose={() => setShowHistorial(false)}
        title="Historial del Pago"
        maxWidth="md"
      >
        <div className="max-h-[400px] overflow-y-auto px-2">
          {historialPago && historialPago.length > 0 ? (
            <ul className="space-y-3">
              {[...historialPago]
                .sort(
                  (a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                )
                .map((item, i) => (
                  <li
                    key={i}
                    className="border border-gray-200 rounded-lg px-4 py-3 shadow-sm bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="font-semibold text-gray-800">
                        {item.tipo.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 md:mt-0">
                        {new Date(item.fecha).toLocaleString("es-MX", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Realizado por{" "}
                      <span className="font-medium text-gray-800">
                        {usuarios[item.usuario] || item.usuario}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm px-2">
              Este pago no tiene historial registrado.
            </p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowHistorial(false)}>Cerrar</Button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={editingPago ? "Editar pago" : "Registrar Pago"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <Input
              label="Monto"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium block mb-1">
                Método de pago
              </label>
              <select
                className="w-full border px-3 py-2 rounded-md text-sm"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as any)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Comprobante
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setComprobante(e.target.files?.[0] || null)}
            />
            {comprobante && (
              <img
                src={URL.createObjectURL(comprobante)}
                alt="Comprobante"
                className="mt-2 h-32 rounded-md border object-contain"
              />
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleGuardarPago} isLoading={loading}>
              {editingPago ? "Editar pago" : "Registrar Pago"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={!!zoomImageUrl}
        onClose={() => setZoomImageUrl(null)}
        title="Comprobante de Pago"
        maxWidth="xl"
      >
        {zoomImageUrl && (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={zoomImageUrl}
              alt="Comprobante"
              className="max-h-[70vh] object-contain rounded-md border"
            />
            <a
              href={zoomImageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 text-sm underline"
            >
              Descargar imagen
            </a>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={confirmacion.open}
        onClose={() => setConfirmacion({ ...confirmacion, open: false })}
        title="Confirmación"
      >
        <p className="text-gray-700 text-sm">{confirmacion.mensaje}</p>
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => setConfirmacion({ ...confirmacion, open: false })}
          >
            Cerrar
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
