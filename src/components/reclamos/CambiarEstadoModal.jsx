// components/reclamos/CambiarEstadoModal.jsx
import React, { useState } from "react";
import {
  X, Clock, RefreshCw, CheckCircle, XCircle, FileText, Ban,
  Loader2, Check, AlertCircle
} from "lucide-react";

const ESTADOS_DISPONIBLES = [
  { value: "EN_REVISION", label: "En revisión", icon: RefreshCw,      color: "blue" },
  { value: "APROBADO",    label: "Aprobado",    icon: CheckCircle,    color: "emerald" },
  { value: "RECHAZADO",   label: "Rechazado",   icon: XCircle,        color: "red" },
  { value: "CERRADO",     label: "Cerrado",     icon: FileText,       color: "gray" },
];

const COLOR_CLASSES = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-300",    ring: "ring-blue-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300", ring: "ring-emerald-500" },
  red:     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-300",     ring: "ring-red-500" },
  gray:    { bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-300",    ring: "ring-gray-500" },
};

export default function CambiarEstadoModal({
  reclamo,
  onClose,
  onConfirm,
  loading = false,
}) {
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoEstado) {
      setError("Selecciona un nuevo estado");
      return;
    }
    setError("");
    await onConfirm(nuevoEstado);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-start z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Cambiar estado</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Reclamo Nº {reclamo.id} — Actual: <b>{reclamo.estado}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Nuevo estado */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Nuevo estado <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ESTADOS_DISPONIBLES.map(({ value, label, icon: Icon, color }) => {
                const styles = COLOR_CLASSES[color];
                const selected = nuevoEstado === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNuevoEstado(value)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2 justify-center ${
                      selected
                        ? `${styles.border} ${styles.bg} ${styles.text} shadow-sm ring-2 ${styles.ring}/30`
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comentario opcional */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Comentario <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows="3"
              maxLength={300}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition resize-none text-sm"
              placeholder="Añade un comentario sobre este cambio..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {comentario.length}/300
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              El cliente recibirá una notificación en tiempo real cuando cambies el estado.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !nuevoEstado}
              className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Confirmar cambio
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}