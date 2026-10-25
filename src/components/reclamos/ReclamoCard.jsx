// components/reclamos/ReclamoCard.jsx
import React from "react";
import {
  FileText, AlertCircle, Shield, XCircle, Clock,
  RefreshCw, CheckCircle, Calendar, Hash, User,
  Mail, Image as ImageIcon, ChevronRight, Ban
} from "lucide-react";

const ESTADO_STYLES = {
  REGISTRADO:  { bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-200",   icon: Clock },
  EN_REVISION: { bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-200",    icon: RefreshCw },
  APROBADO:    { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", icon: CheckCircle },
  REVISION:    { bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-200",  icon: AlertCircle },
  RECHAZADO:   { bg: "bg-red-100",     text: "text-red-800",     border: "border-red-200",     icon: XCircle },
  CERRADO:     { bg: "bg-gray-100",    text: "text-gray-700",    border: "border-gray-200",    icon: FileText },
  CANCELADO:   { bg: "bg-gray-100",    text: "text-gray-500",    border: "border-gray-200",    icon: Ban },
};

const TIPO_STYLES = {
  DEVOLUCION:     { label: "Devolución",          icon: RefreshCw,   color: "text-indigo-600", bg: "bg-indigo-50" },
  DEFECTO:        { label: "Producto defectuoso", icon: AlertCircle, color: "text-rose-600",   bg: "bg-rose-50" },
  GARANTIA:       { label: "Garantía",            icon: Shield,      color: "text-blue-600",   bg: "bg-blue-50" },
  NO_CONFORMIDAD: { label: "No conformidad",      icon: XCircle,     color: "text-orange-600", bg: "bg-orange-50" },
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
  const tipoStyle = TIPO_STYLES[reclamo.tipo] || { label: reclamo.tipo, icon: FileText, color: "text-gray-600", bg: "bg-gray-50" };
  
  const EstadoIcon = estadoStyle.icon;
  const TipoIcon = tipoStyle.icon;

  // Estados que se pueden cambiar por admin/vendedor
  const puedeCambiarEstado = !["CANCELADO", "CERRADO"].includes(reclamo.estado);

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 overflow-hidden group">
      
      <div className="p-5">
        {/* Header: ID, Fecha y Estado */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1">
            
            {/* Icono del tipo de reclamo */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tipoStyle.bg} ${tipoStyle.color} shadow-sm border border-white`}>
              <TipoIcon size={22} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-black text-gray-900 text-lg">Reclamo #{reclamo.id}</h3>
                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-black flex items-center gap-1 border ${estadoStyle.bg} ${estadoStyle.text} ${estadoStyle.border}`}>
                  <EstadoIcon size={12} />
                  {ESTADO_LABEL[reclamo.estado]}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(reclamo.fecha)}
              </p>
            </div>
          </div>

          {/* Tipo y Pedido Asociado */}
          <div className="text-left sm:text-right flex-shrink-0 bg-gray-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
            <p className={`text-sm font-bold ${tipoStyle.color}`}>{tipoStyle.label}</p>
            {reclamo.pedidoId && (
              <p className="text-xs text-gray-500 font-medium flex items-center sm:justify-end gap-1 mt-1">
                <Hash size={10} />
                Pedido #{reclamo.pedidoId}
              </p>
            )}
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <User size={12} className="text-gray-500" />
            </div>
            <span className="text-gray-800 font-bold truncate">
              {reclamo.clienteNombre || "Cliente sin nombre"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Mail size={12} className="text-gray-500" />
            </div>
            <span className="text-gray-600 font-medium truncate">
              {reclamo.clienteEmail || "Sin email"}
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Motivo del reclamo</p>
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed bg-gray-50/50 p-2 rounded-lg border border-gray-100">{reclamo.descripcion}</p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onVerDetalle(); }}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-[#5b4eff] bg-gray-50 hover:bg-[#5b4eff]/10 rounded-xl transition flex items-center justify-center gap-2"
          >
            <ImageIcon size={16} />
            Ver Detalle
          </button>
          
          {puedeCambiarEstado && (
            <button
              onClick={(e) => { e.stopPropagation(); onChangeEstado(); }}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#5b4eff] hover:bg-[#4a3dcc] rounded-xl shadow-sm shadow-[#5b4eff]/30 transition flex items-center justify-center gap-2"
            >
              Gestionar Estado
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}