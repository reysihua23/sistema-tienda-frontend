// components/reclamos/ReclamoCard.jsx
import React from "react";
import {
  FileText, AlertCircle, Shield, XCircle, Clock,
  RefreshCw, CheckCircle, Calendar, Hash, User,
  Mail, Image as ImageIcon, ChevronRight, Ban
} from "lucide-react";

const ESTADO_STYLES = {
  REGISTRADO:  { bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock },
  EN_REVISION: { bg: "bg-blue-50",    text: "text-blue-700",    icon: RefreshCw },
  APROBADO:    { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  REVISION:    { bg: "bg-purple-50",  text: "text-purple-700",  icon: AlertCircle },
  RECHAZADO:   { bg: "bg-red-50",     text: "text-red-700",     icon: XCircle },
  CERRADO:     { bg: "bg-gray-50",    text: "text-gray-700",    icon: FileText },
  CANCELADO:   { bg: "bg-gray-100",   text: "text-gray-600",    icon: Ban },
};

const TIPO_STYLES = {
  DEVOLUCION:     { label: "Devolución",          icon: RefreshCw },
  DEFECTO:        { label: "Producto defectuoso", icon: AlertCircle },
  GARANTIA:       { label: "Garantía",            icon: Shield },
  NO_CONFORMIDAD: { label: "No conformidad",      icon: XCircle },
};

const ESTADO_LABEL = {
  REGISTRADO: "Registrado",
  EN_REVISION: "En revisión",
  APROBADO: "Aprobado",
  REVISION: "Revisión",
  RECHAZADO: "Rechazado",
  CERRADO: "Cerrado",
  CANCELADO: "Cancelado",
};

export default function ReclamoCard({
  reclamo,
  onVerDetalle,
  onChangeEstado,
  formatDate,
}) {
  const estadoStyle = ESTADO_STYLES[reclamo.estado] || ESTADO_STYLES.REGISTRADO;
  const tipoStyle = TIPO_STYLES[reclamo.tipo] || { label: reclamo.tipo, icon: FileText };
  const EstadoIcon = estadoStyle.icon;
  const TipoIcon = tipoStyle.icon;

  // Estados que se pueden cambiar por admin/vendedor
  const puedeCambiarEstado = !["CANCELADO", "CERRADO"].includes(reclamo.estado);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className={`h-1 ${estadoStyle.bg.replace("50", "500").replace("100", "400")}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${estadoStyle.bg} ${estadoStyle.text}`}>
              <TipoIcon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">Reclamo Nº {reclamo.id}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${estadoStyle.bg} ${estadoStyle.text}`}>
                  <EstadoIcon size={12} />
                  {ESTADO_LABEL[reclamo.estado]}
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(reclamo.fecha)}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-gray-700">{tipoStyle.label}</p>
            {reclamo.pedidoId && (
              <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                <Hash size={10} />
                Pedido Nº {reclamo.pedidoId}
              </p>
            )}
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <User size={12} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate">
              {reclamo.clienteNombre || "Cliente sin nombre"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Mail size={12} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 truncate">
              {reclamo.clienteEmail || "Sin email"}
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</p>
          <p className="text-sm text-gray-700 line-clamp-2">{reclamo.descripcion}</p>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onVerDetalle(); }}
            className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#5b4eff] hover:bg-[#5b4eff]/5 rounded-lg transition flex items-center gap-1.5"
          >
            <ImageIcon size={14} />
            Ver detalle
          </button>
          {puedeCambiarEstado && (
            <button
              onClick={(e) => { e.stopPropagation(); onChangeEstado(); }}
              className="px-3 py-2 text-xs font-semibold text-[#5b4eff] hover:bg-[#5b4eff]/10 rounded-lg transition flex items-center gap-1.5"
            >
              Cambiar estado
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}