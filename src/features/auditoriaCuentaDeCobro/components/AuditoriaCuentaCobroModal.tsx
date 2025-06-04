import ReactDOM from "react-dom";
import { Dialog } from "../../../../src/components/ui/Dialog";
import { AuditoriaCuentaCobro } from "../../auditoriaCuentaDeCobro/type/auditoria_cuenta_cobro";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  auditorias: AuditoriaCuentaCobro[];
  usuarios: { [key: string]: string };
}

const AuditoriaCuentaCobroModal = ({ open, onClose, auditorias, usuarios }: Props) => {
  if (typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-auditoria"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
         <Dialog isOpen={open} onClose={onClose} title="Historial de Auditoría">
  <div className="w-full max-w-5xl mx-auto px-6 py-4 max-h-[85vh] overflow-y-auto">
    {auditorias.length === 0 ? (
      <p className="text-gray-500 text-sm">No hay auditoría registrada.</p>
    ) : (
      <div className="relative pl-6 border-l-2 border-gray-200">
        {auditorias.map((a, index) => (
          <div
            key={a.id}
            className="relative mb-8 pb-4 border-b border-gray-100 last:border-none"
          >
            {/* Círculo del índice */}
            <div className="absolute -left-3 top-1.5 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
              {index + 1}
            </div>

            {/* Contenido separado visualmente */}
            <div className="pl-10">
              <p className="text-sm text-gray-700">
                <span className="font-semibold capitalize">{a.accion}</span> por{" "}
                <span className="text-gray-800 font-medium">
                  {usuarios[a.usuario_id] || a.usuario_id}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(a.fecha).toLocaleString("es-ES")}
              </p>
              {a.observaciones && (
                <p className="text-sm mt-1 text-gray-600 italic">
                  “{a.observaciones}”
                </p>
              )}
              {a.comprobante_url && (
                <a
                  href={a.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 text-sm underline"
                >
                  Ver comprobante
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</Dialog>

        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuditoriaCuentaCobroModal;
