// components/reclamos/Reclamos.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, Loader2, RefreshCw, Clock,
  CheckCircle, XCircle, AlertCircle, Ban, Check
} from "lucide-react";
import { reclamoService } from "../../services/api";
import ReclamoStatsCards from "./ReclamoStatsCards";
import ReclamoCard from "./ReclamoCard";
import ReclamoDetalleModal from "./ReclamoDetalleModal";
import CambiarEstadoModal from "./CambiarEstadoModal";

const ESTADO_STYLES = {
  REGISTRADO:  { bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock },
  EN_REVISION: { bg: "bg-blue-50",    text: "text-blue-700",    icon: RefreshCw },
  APROBADO:    { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  REVISION:    { bg: "bg-purple-50",  text: "text-purple-700",  icon: AlertCircle },
  RECHAZADO:   { bg: "bg-red-50",     text: "text-red-700",     icon: XCircle },
  CERRADO:     { bg: "bg-gray-50",    text: "text-gray-700",    icon: FileText },
  CANCELADO:   { bg: "bg-gray-100",   text: "text-gray-600",    icon: Ban },
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

// =========================================================
// ✅ Toast (opcional para feedback)
// =========================================================
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`fixed top-20 right-4 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg z-[9999] flex items-center gap-2`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        ✕
      </button>
    </div>
  );
}

// =========================================================
// ✅ COMPONENTE PRINCIPAL
// =========================================================
export default function Reclamos() {
  const [reclamos, setReclamos] = useState([]);
  const [reclamosFiltrados, setReclamosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState(null);

  // Modales
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showCambiarEstado, setShowCambiarEstado] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-PE", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  // =========================================================
  // ✅ Cargar reclamos
  // =========================================================
  const cargarReclamos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reclamoService.listar();
      const lista = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        : [];
      setReclamos(lista);
    } catch (err) {
      console.error("Error cargando reclamos:", err);
      showToast("Error al cargar reclamos", "error");
      setReclamos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReclamos();
  }, [cargarReclamos]);

  // =========================================================
  // ✅ Filtrar
  // =========================================================
  useEffect(() => {
    let filtrados = [...reclamos];

    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter(r => r.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const t = busqueda.toLowerCase();
      filtrados = filtrados.filter(r =>
        r.id?.toString().includes(t) ||
        r.clienteNombre?.toLowerCase().includes(t) ||
        r.clienteEmail?.toLowerCase().includes(t) ||
        r.tipo?.toLowerCase().includes(t) ||
        r.descripcion?.toLowerCase().includes(t)
      );
    }

    setReclamosFiltrados(filtrados);
  }, [reclamos, filtroEstado, busqueda]);

  // =========================================================
  // ✅ Cambiar estado
  // =========================================================
  const handleCambiarEstado = async (nuevoEstado) => {
    if (!reclamoSeleccionado) return;
    setSubmitting(true);
    try {
      await reclamoService.cambiarEstado(reclamoSeleccionado.id, nuevoEstado);
      await cargarReclamos();
      setShowCambiarEstado(false);
      setReclamoSeleccionado(null);
      showToast(`Estado cambiado a ${ESTADO_LABEL[nuevoEstado] || nuevoEstado}`, "success");
    } catch (err) {
      console.error("Error cambiando estado:", err);
      showToast("Error al cambiar el estado", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // ✅ Loading
  // =========================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-10 h-10 text-[#5b4eff] animate-spin" />
        <p className="text-sm text-gray-500">Cargando reclamos...</p>
      </div>
    );
  }

  // =========================================================
  // ✅ RENDER
  // =========================================================
  return (
    <div className="max-w-6xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Reclamos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los reclamos de todos los clientes
          </p>
        </div>
        
        <button
          onClick={cargarReclamos}
          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <ReclamoStatsCards reclamos={reclamos} />

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por Nº, cliente, tipo o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filtroEstado === "todos"
                  ? "bg-[#5b4eff] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos ({reclamos.length})
            </button>
            {Object.entries(ESTADO_STYLES).map(([key, style]) => {
              const Icon = style.icon;
              const count = reclamos.filter(r => r.estado === key).length;
              if (count === 0 && filtroEstado !== key) return null;
              return (
                <button
                  key={key}
                  onClick={() => setFiltroEstado(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    filtroEstado === key
                      ? "bg-[#5b4eff] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={14} />
                  {ESTADO_LABEL[key]} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista */}
      {reclamosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-[#5b4eff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-[#5b4eff]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {reclamos.length === 0 ? "No hay reclamos registrados" : "Sin resultados"}
          </h3>
          <p className="text-sm text-gray-500">
            {reclamos.length === 0
              ? "Cuando los clientes registren reclamos, aparecerán aquí"
              : "Intenta cambiar los filtros o la búsqueda"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reclamosFiltrados.map(reclamo => (
            <ReclamoCard
              key={reclamo.id}
              reclamo={reclamo}
              formatDate={formatDate}
              onVerDetalle={() => {
                setReclamoSeleccionado(reclamo);
                setShowDetalle(true);
              }}
              onChangeEstado={() => {
                setReclamoSeleccionado(reclamo);
                setShowCambiarEstado(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Detalle */}
      {showDetalle && reclamoSeleccionado && (
        <ReclamoDetalleModal
          reclamo={reclamoSeleccionado}
          formatDate={formatDate}
          onClose={() => {
            setShowDetalle(false);
            setReclamoSeleccionado(null);
          }}
          onChangeEstado={() => {
            setShowDetalle(false);
            setShowCambiarEstado(true);
          }}
        />
      )}

      {/* Modal Cambiar Estado */}
      {showCambiarEstado && reclamoSeleccionado && (
        <CambiarEstadoModal
          reclamo={reclamoSeleccionado}
          loading={submitting}
          onClose={() => {
            setShowCambiarEstado(false);
            setReclamoSeleccionado(null);
          }}
          onConfirm={handleCambiarEstado}
        />
      )}
    </div>
  );
}