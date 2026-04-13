// pages/devoluciones/MisDevoluciones.jsx
import React, { useState, useEffect } from "react";
import { devolucionService, pedidoService } from "../../services/api";
import { RefreshCw, Clock, CheckCircle, XCircle, FileText, Plus, X } from "lucide-react";

export default function MisDevoluciones({ embedded = false }) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [devolucionesFiltradas, setDevolucionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devolucionSeleccionada, setDevolucionSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    pedidoId: "",
    motivo: "",
    descripcion: ""
  });

  useEffect(() => {
    cargarDevoluciones();
    cargarPedidosEntregados();
  }, []);

  useEffect(() => {
    filtrarDevoluciones();
  }, [devoluciones, filtroEstado, busqueda]);

  const cargarDevoluciones = async () => {
    setLoading(true);
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const clienteId = usuario.clienteId;

      if (!clienteId) {
        setDevoluciones([]);
        return;
      }

      // Usar listar() y filtrar por clienteId
      const todasLasDevoluciones = await devolucionService.listar();
      const devolucionesDelCliente = Array.isArray(todasLasDevoluciones)
        ? todasLasDevoluciones.filter(d => d.clienteId === clienteId)
        : [];
      
      const devolucionesOrdenadas = devolucionesDelCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setDevoluciones(devolucionesOrdenadas);
    } catch (error) {
      console.error("Error cargando devoluciones:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarPedidosEntregados = async () => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const clienteId = usuario.clienteId;

      if (!clienteId) return;

      const todosLosPedidos = await pedidoService.listar();
      const pedidosCliente = Array.isArray(todosLosPedidos)
        ? todosLosPedidos.filter(p => p.clienteId === clienteId && p.estado === "ENTREGADO")
        : [];
      
      setPedidos(pedidosCliente);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
  };

  const filtrarDevoluciones = () => {
    let filtradas = [...devoluciones];

    if (filtroEstado !== "todos") {
      filtradas = filtradas.filter(d => d.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtradas = filtradas.filter(d =>
        d.pedidoId?.toString().includes(termino) ||
        d.motivo?.toLowerCase().includes(termino)
      );
    }

    setDevolucionesFiltradas(filtradas);
  };

  const verDetalle = (devolucion) => {
    setDevolucionSeleccionada(devolucion);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si selecciona un pedido, buscar su monto
    if (name === "pedidoId" && value) {
      const pedidoSeleccionado = pedidos.find(p => p.id === parseInt(value));
      if (pedidoSeleccionado) {
        setFormData(prev => ({ ...prev, pedidoId: value, monto: pedidoSeleccionado.total }));
      }
    }
  };

  const handleSubmitDevolucion = async (e) => {
    e.preventDefault();
    
    if (!formData.pedidoId) {
      setError("Debes seleccionar un pedido");
      return;
    }
    
    if (!formData.motivo) {
      setError("Debes indicar el motivo de la devolución");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const clienteId = usuario.clienteId;
      
      const pedidoSeleccionado = pedidos.find(p => p.id === parseInt(formData.pedidoId));
      
      const devolucionData = {
        clienteId: clienteId,
        pedidoId: parseInt(formData.pedidoId),
        monto: pedidoSeleccionado?.total || 0,
        motivo: formData.motivo,
        descripcion: formData.descripcion || null,
        estado: "PENDIENTE"
      };
      
      await devolucionService.crear(devolucionData);
      
      // Limpiar formulario y cerrar modal
      setFormData({ pedidoId: "", motivo: "", descripcion: "" });
      setShowFormModal(false);
      
      // Recargar devoluciones
      await cargarDevoluciones();
      
      // Mostrar mensaje de éxito
      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2";
      successMsg.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Devolución solicitada correctamente';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (error) {
      console.error("Error al crear devolución:", error);
      setError(error.message || "Error al solicitar la devolución");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      "PENDIENTE": "bg-amber-100 text-amber-700",
      "EN_PROCESO": "bg-blue-100 text-blue-700",
      "PROCESADA": "bg-green-100 text-green-700",
      "RECHAZADA": "bg-red-100 text-red-700"
    };
    return colores[estado] || "bg-gray-100 text-gray-700";
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      "PENDIENTE": <Clock size={18} className="inline" />,
      "EN_PROCESO": <RefreshCw size={18} className="inline" />,
      "PROCESADA": <CheckCircle size={18} className="inline" />,
      "RECHAZADA": <XCircle size={18} className="inline" />
    };
    return icons[estado] || <FileText size={18} className="inline" />;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      "PENDIENTE": "Pendiente",
      "EN_PROCESO": "En Proceso",
      "PROCESADA": "Procesada",
      "RECHAZADA": "Rechazada"
    };
    return labels[estado] || estado;
  };

  const estadosDisponibles = [
    { value: "todos", label: "Todos", icon: <FileText size={16} className="inline" /> },
    { value: "PENDIENTE", label: "Pendiente", icon: <Clock size={16} className="inline" /> },
    { value: "EN_PROCESO", label: "En Proceso", icon: <RefreshCw size={16} className="inline" /> },
    { value: "PROCESADA", label: "Procesada", icon: <CheckCircle size={16} className="inline" /> },
    { value: "RECHAZADA", label: "Rechazada", icon: <XCircle size={16} className="inline" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado con botón para nueva devolución */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mis Devoluciones</h2>
          <p className="text-sm text-gray-500 mt-1">Seguimiento de tus solicitudes de devolución y reembolsos</p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Solicitar Devolución
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar por número de pedido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {estadosDisponibles.map(estado => (
              <button
                key={estado.value}
                onClick={() => setFiltroEstado(estado.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filtroEstado === estado.value
                  ? "bg-[#5b4eff] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{estado.icon}</span>
                <span>{estado.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {devolucionesFiltradas.length} {devolucionesFiltradas.length === 1 ? "devolución encontrada" : "devoluciones encontradas"}
          </p>
        </div>
      </div>

      {devolucionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <span className="text-5xl block mb-3">🔄</span>
          <p className="text-lg font-medium">No tienes devoluciones registradas</p>
          <p className="text-sm mt-1">Cuando solicites una devolución, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devolucionesFiltradas.map(devolucion => (
            <div
              key={devolucion.id}
              onClick={() => verDetalle(devolucion)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-[#5b4eff] overflow-hidden cursor-pointer"
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getEstadoIcon(devolucion.estado)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 text-lg">Devolución #{devolucion.id}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(devolucion.estado)}`}>
                          {getEstadoIcon(devolucion.estado)} {getEstadoLabel(devolucion.estado)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(devolucion.fecha)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#5b4eff] text-lg">{formatPrice(devolucion.monto || 0)}</p>
                    <p className="text-xs text-gray-400">Monto a reembolsar</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Pedido relacionado</p>
                  <p className="font-medium text-gray-800">Pedido #{devolucion.pedidoId}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Motivo</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{devolucion.motivo || "Sin especificar"}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <span className="text-[#5b4eff] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver detalles completos →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para registrar nueva devolución */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Solicitar Devolución</h3>
                <p className="text-sm text-gray-500 mt-1">Completa el formulario para solicitar una devolución</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitDevolucion} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Selección de pedido */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pedido a devolver <span className="text-red-500">*</span>
                </label>
                <select
                  name="pedidoId"
                  value={formData.pedidoId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                  required
                >
                  <option value="">Selecciona un pedido</option>
                  {pedidos.map(pedido => (
                    <option key={pedido.id} value={pedido.id}>
                      Pedido #{pedido.id} - {formatDate(pedido.fecha)} - {formatPrice(pedido.total)}
                    </option>
                  ))}
                </select>
                {pedidos.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No tienes pedidos entregados disponibles para devolución
                  </p>
                )}
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Motivo de devolución <span className="text-red-500">*</span>
                </label>
                <select
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="PRODUCTO_DEFECTUOSO">Producto defectuoso</option>
                  <option value="PRODUCTO_EQUIVOCADO">Producto equivocado</option>
                  <option value="PRODUCTO_NO_DESEADO">Ya no deseo el producto</option>
                  <option value="PRODUCTO_DANADO">Producto dañado durante el envío</option>
                  <option value="OTRO">Otro motivo</option>
                </select>
              </div>

              {/* Descripción adicional */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción adicional
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition resize-none"
                  placeholder="Describe con más detalles el motivo de tu devolución..."
                />
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Información importante</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Una vez solicitada la devolución, nuestro equipo la revisará y te contactará 
                      dentro de 2-3 días hábiles para coordinar la recogida del producto y el reembolso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || pedidos.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    "Solicitar Devolución"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {showModal && devolucionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">Devolución #{devolucionSeleccionada.id}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(devolucionSeleccionada.estado)}`}>
                    {getEstadoIcon(devolucionSeleccionada.estado)} {getEstadoLabel(devolucionSeleccionada.estado)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatDate(devolucionSeleccionada.fecha)}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📦</span> Información del Pedido
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Número de pedido</p>
                    <p className="font-medium">#{devolucionSeleccionada.pedidoId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monto a reembolsar</p>
                    <p className="font-bold text-[#5b4eff]">{formatPrice(devolucionSeleccionada.monto || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span> Motivo de Devolución
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {devolucionSeleccionada.motivo?.replace(/_/g, " ") || "No se especificó un motivo"}
                </p>
              </div>

              {devolucionSeleccionada.descripcion && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span> Descripción Adicional
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{devolucionSeleccionada.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Estado Actual</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getEstadoIcon(devolucionSeleccionada.estado)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getEstadoColor(devolucionSeleccionada.estado)}`}>
                      {getEstadoLabel(devolucionSeleccionada.estado)}
                    </span>
                  </div>
                </div>
                <div className={`rounded-lg p-4 text-white ${devolucionSeleccionada.estado === "PROCESADA" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc]"}`}>
                  <h4 className="font-bold mb-2">Monto</h4>
                  <p className="text-3xl font-bold">{formatPrice(devolucionSeleccionada.monto || 0)}</p>
                  <p className="text-xs opacity-80 mt-2">Monto a reembolsar</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 text-lg">💡</span>
                  <p className="text-xs text-amber-700">
                    El tiempo estimado de procesamiento es de 5 a 7 días hábiles. 
                    Para cualquier consulta, contáctanos a soporte@tienda.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}