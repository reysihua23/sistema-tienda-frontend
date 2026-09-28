// pages/reclamos/MisReclamos.jsx
import React, { useState, useEffect, useCallback } from "react";
import { reclamoService, devolucionService, pedidoService } from "../../services/api";
import { buildImageUrl } from "../../config/apiConfig";
import {
  FileText, AlertCircle, Package, Shield, XCircle,
  Clock, CheckCircle, RefreshCw, Plus, X, Upload,
  Trash2, Eye, Search, ChevronRight, Image as ImageIcon,
  Loader2, Info, Calendar, Hash, Check, AlertTriangle, Ban
} from "lucide-react";

// =========================================================
// ✅ Componente Toast
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

  const icons = {
    success: <Check size={18} />,
    error: <AlertTriangle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`fixed top-20 right-4 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg z-[9999] flex items-center gap-2 animate-in slide-in-from-right`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .slide-in-from-right { animation: slideInRight 0.3s ease-out; }
        .animate-in { animation-fill-mode: both; }
      `}</style>
    </div>
  );
}

// =========================================================
// ✅ Estilos por estado y tipo
// =========================================================
const ESTADO_STYLES = {
  REGISTRADO:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock },
  EN_REVISION: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: RefreshCw },
  APROBADO:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle },
  REVISION:    { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  icon: AlertCircle },
  RECHAZADO:   { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: XCircle },
  CERRADO:     { bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-200",    icon: FileText },
  CANCELADO:   { bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-300",    icon: Ban },
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

const ESTADOS_PEDIDO_VALIDOS = ["PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"];
const MAX_DESCRIPCION = 500;

// =========================================================
// ✅ COMPONENTE PRINCIPAL
// =========================================================
export default function MisReclamos({ embedded = false }) {
  // Estados
  const [reclamos, setReclamos] = useState([]);
  const [reclamosFiltrados, setReclamosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showEvidenciasModal, setShowEvidenciasModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(null);

  // Datos
  const [pedidos, setPedidos] = useState([]);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [evidenciasSubiendo, setEvidenciasSubiendo] = useState(false);
  const [evidenciasPendientes, setEvidenciasPendientes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    pedidoId: "",
    tipo: "",
    descripcion: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // =========================================================
  // ✅ Helpers
  // =========================================================
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-PE", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price || 0);

  const extraerMensajeError = (err) => {
    let mensaje = "Error inesperado";
    if (err?.message) {
      try {
        const match = err.message.match(/\{.*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          mensaje = parsed.error || parsed.message || mensaje;
        } else {
          mensaje = err.message;
        }
      } catch {
        mensaje = err.message;
      }
    }
    return mensaje;
  };

  // ✅ NUEVO: numera los pedidos por cliente (1, 2, 3...) usando fecha ascendente
  const numerarPedidos = (listaPedidos) => {
    return [...listaPedidos]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)) // más antiguo primero
      .map((p, index) => ({
        ...p,
        numeroRelativo: index + 1,
      }));
  };

  // =========================================================
  // ✅ Cargar reclamos
  // =========================================================
  const cargarReclamos = useCallback(async () => {
    setLoading(true);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const clienteId = usuario?.clienteId;

      if (!clienteId) {
        setReclamos([]);
        setLoading(false);
        return;
      }

      const data = await reclamoService.buscarPorCliente(clienteId);
      const reclamosOrdenados = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        : [];

      const reclamosConDevolucion = await Promise.all(
        reclamosOrdenados.map(async (reclamo) => {
          try {
            const devolucion = await devolucionService.buscarPorReclamo(reclamo.id);
            return { ...reclamo, devolucion: devolucion || null };
          } catch {
            return { ...reclamo, devolucion: null };
          }
        })
      );

      setReclamos(reclamosConDevolucion);
    } catch (err) {
      console.error("Error cargando reclamos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // ✅ Cargar pedidos disponibles (con numeración por cliente)
  // =========================================================
  const cargarPedidosDisponibles = useCallback(async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const clienteId = usuario?.clienteId;
      if (!clienteId) return;

      const pedidosCliente = await pedidoService.buscarPorCliente(clienteId);

      const pedidosValidos = Array.isArray(pedidosCliente)
        ? pedidosCliente.filter(p => ESTADOS_PEDIDO_VALIDOS.includes(p.estado))
        : [];

      const reclamosCliente = await reclamoService.buscarPorCliente(clienteId);
      const pedidosConReclamo = new Set(
        (Array.isArray(reclamosCliente) ? reclamosCliente : [])
          .filter(r => r.pedidoId && r.estado !== "CANCELADO")
          .map(r => r.pedidoId)
      );

      const disponibles = pedidosValidos.filter(p => !pedidosConReclamo.has(p.id));

      // ✅ Numerar por cliente según fecha ascendente
      setPedidos(numerarPedidos(disponibles));
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    }
  }, []);

  useEffect(() => {
    cargarReclamos();
    cargarPedidosDisponibles();
  }, [cargarReclamos, cargarPedidosDisponibles]);

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
        r.tipo?.toLowerCase().includes(t) ||
        r.descripcion?.toLowerCase().includes(t)
      );
    }
    setReclamosFiltrados(filtrados);
  }, [reclamos, filtroEstado, busqueda]);

  // =========================================================
  // ✅ Evidencias
  // =========================================================
  const cargarEvidencias = async (reclamoId) => {
    try {
      const data = await reclamoService.listarEvidencias(reclamoId);
      setEvidencias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando evidencias:", err);
      setEvidencias([]);
    }
  };

  const handleSeleccionarEvidencias = (e) => {
    const files = Array.from(e.target.files);
    const validos = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validos.length !== files.length) {
      showToast("Algunas imágenes superan los 5MB", "warning");
    }
    setEvidenciasPendientes(prev => [...prev, ...validos]);
  };

  const eliminarEvidenciaPendiente = (index) => {
    setEvidenciasPendientes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubirEvidencias = async (files) => {
    if (!reclamoSeleccionado || files.length === 0) return;
    setEvidenciasSubiendo(true);
    try {
      const formDataEv = new FormData();
      files.forEach(f => formDataEv.append("files", f));
      await reclamoService.subirMultiplesEvidencias(reclamoSeleccionado.id, formDataEv);
      await cargarEvidencias(reclamoSeleccionado.id);
      showToast(`${files.length} evidencia(s) subida(s)`);
    } catch (err) {
      showToast("Error al subir evidencias", "error");
    } finally {
      setEvidenciasSubiendo(false);
    }
  };

  const handleEliminarEvidencia = async (id) => {
    try {
      await reclamoService.eliminarEvidencia(id);
      await cargarEvidencias(reclamoSeleccionado.id);
      setShowConfirmDelete(null);
      showToast("Evidencia eliminada");
    } catch (err) {
      showToast("Error al eliminar", "error");
    }
  };

  // =========================================================
  // ✅ Cancelar reclamo
  // =========================================================
  const handleCancelarReclamo = async (id) => {
    try {
      await reclamoService.cancelar(id);
      await cargarReclamos();
      await cargarPedidosDisponibles();
      setShowConfirmCancel(null);
      if (reclamoSeleccionado?.id === id) {
        setReclamoSeleccionado(prev => ({ ...prev, estado: "CANCELADO" }));
      }
      showToast("Reclamo cancelado correctamente");
    } catch (err) {
      showToast(extraerMensajeError(err), "error");
      setShowConfirmCancel(null);
    }
  };

  // =========================================================
  // ✅ Crear reclamo
  // =========================================================
  const validarFormulario = () => {
    const errors = {};
    if (!formData.tipo) errors.tipo = "Selecciona un tipo";
    if (!formData.descripcion.trim()) errors.descripcion = "Describe el problema";
    if (formData.descripcion.length > MAX_DESCRIPCION) errors.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReclamo = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setSubmitting(true);
    setError(null);

    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const clienteId = usuario?.clienteId;

      const reclamoData = {
        clienteId,
        pedidoId: formData.pedidoId ? parseInt(formData.pedidoId) : null,
        tipo: formData.tipo,
        descripcion: formData.descripcion.trim(),
      };

      const nuevoReclamo = await reclamoService.crear(reclamoData);

      if (evidenciasPendientes.length > 0 && nuevoReclamo?.id) {
        const formDataEv = new FormData();
        evidenciasPendientes.forEach(f => formDataEv.append("files", f));
        try {
          await reclamoService.subirMultiplesEvidencias(nuevoReclamo.id, formDataEv);
        } catch (err) {
          console.error("Reclamo creado pero falló la subida de evidencias", err);
        }
      }

      setFormData({ pedidoId: "", tipo: "", descripcion: "" });
      setEvidenciasPendientes([]);
      setFieldErrors({});
      setShowFormModal(false);
      await cargarReclamos();
      await cargarPedidosDisponibles();
      showToast("Reclamo registrado correctamente");
    } catch (err) {
      const mensaje = extraerMensajeError(err);
      setError(mensaje);
      showToast(mensaje, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // ✅ RENDER: Loading
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
    <div className={`${embedded ? "" : "max-w-6xl mx-auto"} px-4 sm:px-6`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Reclamos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus reclamos, devoluciones y garantías
          </p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl text-sm font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Nuevo Reclamo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, tipo o descripción..."
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
        <EmptyState
          onNew={() => setShowFormModal(true)}
          hasFilters={filtroEstado !== "todos" || busqueda}
        />
      ) : (
        <div className="space-y-3">
          {reclamosFiltrados.map(reclamo => (
            <ReclamoCard
              key={reclamo.id}
              reclamo={reclamo}
              onVerDetalle={() => {
                setReclamoSeleccionado(reclamo);
                setShowDetalleModal(true);
              }}
              onVerEvidencias={async () => {
                setReclamoSeleccionado(reclamo);
                await cargarEvidencias(reclamo.id);
                setShowEvidenciasModal(true);
              }}
              onCancelar={() => setShowConfirmCancel(reclamo.id)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Modal Nuevo Reclamo */}
      {showFormModal && (
        <NuevoReclamoModal
          formData={formData}
          setFormData={setFormData}
          fieldErrors={fieldErrors}
          evidenciasPendientes={evidenciasPendientes}
          handleSeleccionarEvidencias={handleSeleccionarEvidencias}
          eliminarEvidenciaPendiente={eliminarEvidenciaPendiente}
          handleSubmit={handleSubmitReclamo}
          submitting={submitting}
          pedidos={pedidos}
          formatDate={formatDate}
          formatPrice={formatPrice}
          onClose={() => {
            setShowFormModal(false);
            setFieldErrors({});
          }}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      )}

      {/* Modal Detalle */}
      {showDetalleModal && reclamoSeleccionado && (
        <DetalleModal
          reclamo={reclamoSeleccionado}
          onClose={() => setShowDetalleModal(false)}
          onCancelar={() => setShowConfirmCancel(reclamoSeleccionado.id)}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />
      )}

      {/* Modal Evidencias */}
      {showEvidenciasModal && reclamoSeleccionado && (
        <EvidenciasModal
          reclamo={reclamoSeleccionado}
          evidencias={evidencias}
          evidenciasSubiendo={evidenciasSubiendo}
          onSubir={handleSubirEvidencias}
          onEliminar={(id) => setShowConfirmDelete(id)}
          onClose={() => setShowEvidenciasModal(false)}
          formatDate={formatDate}
        />
      )}

      {/* Confirmar eliminar evidencia */}
      {showConfirmDelete && (
        <ConfirmModal
          titulo="¿Eliminar evidencia?"
          descripcion="Esta acción no se puede deshacer."
          icono={Trash2}
          colorIcono="red"
          textoConfirmar="Eliminar"
          onConfirm={() => handleEliminarEvidencia(showConfirmDelete)}
          onCancel={() => setShowConfirmDelete(null)}
        />
      )}

      {/* Confirmar cancelar reclamo */}
      {showConfirmCancel && (
        <ConfirmModal
          titulo="¿Cancelar este reclamo?"
          descripcion="Solo puedes cancelar reclamos en estado REGISTRADO. Esta acción no se puede deshacer."
          icono={Ban}
          colorIcono="amber"
          textoConfirmar="Sí, cancelar"
          onConfirm={() => handleCancelarReclamo(showConfirmCancel)}
          onCancel={() => setShowConfirmCancel(null)}
        />
      )}
    </div>
  );
}

// =========================================================
// ✅ SUBCOMPONENTES
// =========================================================

function EmptyState({ onNew, hasFilters }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
      <div className="w-16 h-16 bg-[#5b4eff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText size={32} className="text-[#5b4eff]" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        {hasFilters ? "Sin resultados" : "No tienes reclamos registrados"}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Intenta cambiar los filtros o el término de búsqueda"
          : "Si tienes un problema con un pedido, puedes registrar un reclamo y te ayudaremos"}
      </p>
      {!hasFilters && (
        <button
          onClick={onNew}
          className="px-6 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl text-sm font-bold hover:shadow-lg transition inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Registrar mi primer reclamo
        </button>
      )}
    </div>
  );
}

function ReclamoCard({ reclamo, onVerDetalle, onVerEvidencias, onCancelar, formatDate }) {
  const estadoStyle = ESTADO_STYLES[reclamo.estado] || ESTADO_STYLES.REGISTRADO;
  const tipoStyle = TIPO_STYLES[reclamo.tipo] || { label: reclamo.tipo, icon: FileText };
  const EstadoIcon = estadoStyle.icon;
  const TipoIcon = tipoStyle.icon;
  const puedeCancelar = reclamo.estado === "REGISTRADO";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className={`h-1 ${estadoStyle.bg.replace("50", "500").replace("100", "400")}`} />

      <div className="p-5">
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
                Pedido {reclamo.pedidoId}
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</p>
          <p className="text-sm text-gray-700 line-clamp-2">{reclamo.descripcion}</p>
        </div>

        {reclamo.devolucion && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
            <RefreshCw size={14} className="text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">
              Devolución asociada - Estado: {reclamo.devolucion.estado}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-100">
          {puedeCancelar && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancelar(); }}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Ban size={14} />
              Cancelar reclamo
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onVerEvidencias(); }}
            className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#5b4eff] hover:bg-[#5b4eff]/5 rounded-lg transition flex items-center gap-1.5"
          >
            <ImageIcon size={14} />
            Ver evidencias
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onVerDetalle(); }}
            className="px-3 py-2 text-xs font-semibold text-[#5b4eff] hover:bg-[#5b4eff]/10 rounded-lg transition flex items-center gap-1.5"
          >
            Ver detalle
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NuevoReclamoModal({
  formData, setFormData, fieldErrors, evidenciasPendientes,
  handleSeleccionarEvidencias, eliminarEvidenciaPendiente,
  handleSubmit, submitting, pedidos, formatDate, formatPrice, onClose,
  isDragging, setIsDragging,
}) {
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) handleSeleccionarEvidencias({ target: { files } });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-start z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Nuevo Reclamo</h3>
            <p className="text-sm text-gray-500 mt-0.5">Registra tu reclamo o solicitud</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Pedido */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Pedido relacionado
            </label>
            <select
              value={formData.pedidoId}
              onChange={(e) => setFormData(prev => ({ ...prev, pedidoId: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition text-sm"
            >
              <option value="">Sin pedido asociado</option>
              {pedidos.map(pedido => (
                <option key={pedido.id} value={pedido.id}>
                  Pedido Nº {pedido.numeroRelativo} — {pedido.estado} — {formatDate(pedido.fecha)} — {formatPrice(pedido.total)}
                </option>
              ))}
            </select>
            {pedidos.length === 0 && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Info size={12} />
                No tienes pedidos disponibles para reclamar
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de reclamo <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(TIPO_STYLES).map(([value, style]) => {
                const Icon = style.icon;
                const selected = formData.tipo === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: value }))}
                    className={`p-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 justify-center ${
                      selected
                        ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff] shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="truncate">{style.label}</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.tipo && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {fieldErrors.tipo}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">
                Descripción <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${
                formData.descripcion.length > MAX_DESCRIPCION ? "text-red-500" : "text-gray-400"
              }`}>
                {formData.descripcion.length}/{MAX_DESCRIPCION}
              </span>
            </div>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows="4"
              maxLength={MAX_DESCRIPCION}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition resize-none text-sm"
              placeholder="Describe detalladamente tu reclamo..."
            />
            {fieldErrors.descripcion && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {fieldErrors.descripcion}
              </p>
            )}
          </div>

          {/* Evidencias */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Evidencias <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                isDragging ? "border-[#5b4eff] bg-[#5b4eff]/5" : "border-gray-200 hover:border-[#5b4eff]"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSeleccionarEvidencias}
                className="hidden"
                id="evidencias-input"
              />
              <label htmlFor="evidencias-input" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload size={20} className="text-gray-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {isDragging ? "Suelta las imágenes aquí" : "Arrastra o haz clic para subir"}
                </span>
                <span className="text-xs text-gray-400">JPEG, PNG, WEBP — máx 5MB cada una</span>
              </label>
            </div>

            {evidenciasPendientes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {evidenciasPendientes.length} archivo(s) seleccionado(s)
                </p>
                <div className="space-y-2">
                  {evidenciasPendientes.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarEvidenciaPendiente(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Información importante</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Una vez registrado tu reclamo, nuestro equipo lo revisará y te contactará en 3-5 días hábiles.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Registrar Reclamo
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

function DetalleModal({ reclamo, onClose, onCancelar, formatDate, formatPrice }) {
  const estadoStyle = ESTADO_STYLES[reclamo.estado] || ESTADO_STYLES.REGISTRADO;
  const tipoStyle = TIPO_STYLES[reclamo.tipo] || { label: reclamo.tipo, icon: FileText };
  const EstadoIcon = estadoStyle.icon;
  const TipoIcon = tipoStyle.icon;
  const puedeCancelar = reclamo.estado === "REGISTRADO";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <InfoBlock title="Información general" icon={FileText}>
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
                <p className="font-semibold text-gray-800">
                  {reclamo.pedidoId ? `#${reclamo.pedidoId}` : "No asociado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                <p className={`font-semibold ${estadoStyle.text}`}>
                  {ESTADO_LABEL[reclamo.estado]}
                </p>
              </div>
            </div>
          </InfoBlock>

          <InfoBlock title="Descripción" icon={FileText}>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {reclamo.descripcion}
            </p>
          </InfoBlock>

          {reclamo.devolucion && (
            <InfoBlock title="Devolución asociada" icon={RefreshCw}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                  <p className="font-semibold text-gray-800">{reclamo.devolucion.estado}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Monto</p>
                  <p className="font-bold text-emerald-600">
                    {formatPrice(reclamo.devolucion.monto || 0)}
                  </p>
                </div>
              </div>
            </InfoBlock>
          )}

          {puedeCancelar && (
            <button
              onClick={onCancelar}
              className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
            >
              <Ban size={16} />
              Cancelar reclamo
            </button>
          )}

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
            <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Para cualquier consulta sobre tu reclamo, contáctanos a <b>soporte@tienda.com</b> o al <b>(01) 234-5678</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, icon: Icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
        <Icon size={16} className="text-[#5b4eff]" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function EvidenciasModal({ reclamo, evidencias, evidenciasSubiendo, onSubir, onEliminar, onClose, formatDate }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Evidencias</h3>
            <p className="text-sm text-gray-500 mt-0.5">Reclamo Nº {reclamo.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onSubir(Array.from(e.target.files))}
              className="hidden"
              id="subir-evidencia"
              disabled={evidenciasSubiendo}
            />
            <label
              htmlFor="subir-evidencia"
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center gap-2 ${
                evidenciasSubiendo
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-[#5b4eff] hover:bg-[#5b4eff]/5"
              }`}
            >
              {evidenciasSubiendo ? (
                <>
                  <Loader2 size={22} className="text-[#5b4eff] animate-spin" />
                  <span className="text-sm font-semibold text-gray-600">Subiendo evidencias...</span>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-[#5b4eff]" />
                  <span className="text-sm font-semibold text-gray-700">Subir nuevas evidencias</span>
                  <span className="text-xs text-gray-400">Puedes seleccionar varias a la vez</span>
                </>
              )}
            </label>
          </div>

          {evidencias.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={28} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No hay evidencias</p>
              <p className="text-xs text-gray-400 mt-1">Sube imágenes para respaldar tu reclamo</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                {evidencias.length} evidencia(s)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidencias.map(ev => (
                  <div key={ev.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={buildImageUrl(ev.urlImagen)}
                      alt={`Evidencia ${ev.id}`}
                      className="w-full h-32 sm:h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <a
                        href={buildImageUrl(ev.urlImagen)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition"
                        title="Ver"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        onClick={() => onEliminar(ev.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded text-center truncate">
                      {formatDate(ev.fecha)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ titulo, descripcion, icono: Icono, colorIcono = "red", textoConfirmar = "Confirmar", onConfirm, onCancel }) {
  const colorClasses = {
    red: { bg: "bg-red-100", text: "text-red-600", btn: "bg-red-500 hover:bg-red-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", btn: "bg-amber-500 hover:bg-amber-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", btn: "bg-blue-500 hover:bg-blue-600" },
  };
  const colors = colorClasses[colorIcono] || colorClasses.red;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`w-14 h-14 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icono size={24} className={colors.text} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{titulo}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{descripcion}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 ${colors.btn} text-white rounded-xl font-bold text-sm transition`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}