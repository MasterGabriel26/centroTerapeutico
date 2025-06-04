import React from "react";
import { AuditoriaCuentaCobro } from "../../auditoriaCuentaDeCobro/type/auditoria_cuenta_cobro";

interface Props {
  auditorias: AuditoriaCuentaCobro[];
  usuarios: { [key: string]: string };
  onClose: () => void;
}

const AuditoriaTimeline = ({ auditorias, usuarios, onClose }: Props) => {
  return (
    <div className="relative px-6 py-6 max-h-[85vh] overflow-y-auto bg-white rounded-lg shadow-lg">
      {/* Línea central vertical */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-green-500 to-cyan-500 h-full rounded" />

      <div className="space-y-10 relative z-10">
        {auditorias.map((a, i) => {
          const fecha = new Date(a.fecha).toLocaleString("es-ES");
          const nombreUsuario = usuarios[a.usuario_id] || a.usuario_id;

          const icon = {
            creado: "📄",
            aprobado: "✅",
            enviado: "📤",
            pagado: "💰",
            editado: "✏️",
            anulado: "🚫",
            rechazado: "❌",
          }[a.accion];

          return (
            <div key={a.id} className="flex items-start relative gap-4">
              {/* Ícono */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-4 border-current flex items-center justify-center text-xl font-semibold shadow-md z-20">
                {icon}
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <h4 className="font-bold capitalize text-primary-700">{a.accion}</h4>
                <p className="text-sm text-gray-700">
                  Realizado por <span className="font-medium">{nombreUsuario}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{fecha}</p>
                {a.observaciones && (
                  <p className="italic text-sm text-gray-600 mt-1">“{a.observaciones}”</p>
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
          );
        })}
      </div>

      {/* Botón cerrar */}
      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded shadow"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default AuditoriaTimeline;
