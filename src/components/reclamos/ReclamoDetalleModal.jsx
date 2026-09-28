// components/reclamos/ReclamoDetalleModal.jsx
import React, { useState, useEffect } from "react";
import {
  X, FileText, User, Mail, Hash, Calendar, Shield,
  AlertCircle, RefreshCw, XCircle, Clock, CheckCircle,
  Ban, Image as ImageIcon, Eye, Loader2, ChevronRight
} from "lucide-react";
import { reclamoService } from "../../services/api";
import { buildImageUrl } from "../../config/apiConfig";

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

export default function ReclamoDetalleModal({
  reclamo,
  onClose,
  onChangeEstado,
  formatDate,
}) {
  const [evidencias, setEvidencias] = useState([]);
  const [loadingEv, setLoadingEv] = useState(true);

  const estadoStyle = ESTADO_STYLES[reclamo.estado] || ESTADO_STYLES.REGISTRADO;
  const tipoStyle = TIPO_STYLES[reclamo.tipo] || { label: reclamo.tipo, icon: FileText };
  const EstadoIcon = estadoStyle.icon;
  const TipoIcon = tipoStyle.icon;
  const puedeCambiarEstado = !["CANCELADO", "CERRADO"].includes(reclamo.estado);

  useEffect(() => {
    (async () => {
      setLoadingEv(true);
      try {
        const data = await reclamoService.listarEvidencias(reclamo.id);
        setEvidencias(Array.isArray(data) ? data : []);
      } catch {
        setEvidencias([]);
      } finally {
        setLoadingEv(false);
      }
    })();
  }, [reclamo.id]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-start z-10">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${estadoStyle.bg} ${estadoStyle.text}`}>
              <TipoIcon size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Reclamo Nº {reclamo.id}</h3>
              <span className={`text-xs font-semibold flex items-center gap-1 mt-1 ${estadoStyle.text}`}>
                <EstadoIcon size={12} />
                {ESTADO_LABEL[reclamo.estado]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Cliente */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <User size={16} className="text-[#5b4eff]" />
              Datos del cliente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Nombre</p>
                <p className="font-semibold text-gray-800">
                  {reclamo.clienteNombre || "Sin nombre"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="font-semibold text-gray-800 break-all">
                  {reclamo.clienteEmail || "Sin email"}
                </p>
              </div>
            </div>
          </div>

          {/* Info general */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-[#5b4eff]" />
              Información general
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Tipo</p>
                <p className="font-semibold text-gray-800">{tipoStyle.label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Fecha</p>
                <p className="font-semibold text-gray-800 text-xs">{formatDate(reclamo.fecha)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Pedido</p>
                <p className="font-semibold text-gray-800 flex items-center gap-1">
                  <Hash size={12} />
                  {reclamo.pedidoId ? `Nº ${reclamo.pedidoId}` : "No asociado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                <p className={`font-semibold ${estadoStyle.text}`}>
                  {ESTADO_LABEL[reclamo.estado]}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-[#5b4eff]" />
              Descripción del cliente
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {reclamo.descripcion}
            </p>
          </div>

          {/* Evidencias */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <ImageIcon size={16} className="text-[#5b4eff]" />
              Evidencias ({loadingEv ? "..." : evidencias.length})
            </h4>

            {loadingEv ? (
              <div className="flex justify-center py-6">
                <Loader2 size={24} className="text-[#5b4eff] animate-spin" />
              </div>
            ) : evidencias.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                El cliente no adjuntó evidencias
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidencias.map((ev) => (
                  <a
                    key={ev.id}
                    href={buildImageUrl(ev.urlImagen)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white"
                  >
                    <img
                      src={buildImageUrl(ev.urlImagen)}
                      alt={`Evidencia ${ev.id}`}
                      className="w-full h-28 sm:h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye size={18} className="text-white" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Botón cambiar estado */}
          {puedeCambiarEstado && (
            <button
              onClick={onChangeEstado}
              className="w-full py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl text-sm font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              Cambiar estado
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}