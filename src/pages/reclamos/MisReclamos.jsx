// pages/reclamos/MisReclamos.jsx
import React, { useState, useEffect } from "react";
import { reclamoService, devolucionService, pedidoService } from "../../services/api";
import { 
  FileText, AlertCircle, Package, Shield, XCircle, 
  Clock, CheckCircle, RefreshCw, Plus, X, Upload, 
  Trash2, Eye 
} from "lucide-react";

export default function MisReclamos({ embedded = false }) {
  const [reclamos, setReclamos] = useState([]);
  const [reclamosFiltrados, setReclamosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEvidenciasModal, setShowEvidenciasModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [evidenciasSubiendo, setEvidenciasSubiendo] = useState(false);
  
  const [formData, setFormData] = useState({
    pedidoId: "",
    tipo: "",
    descripcion: ""
  });

  useEffect(() => {
    cargarReclamos();
    cargarPedidosEntregados();
  }, []);

  useEffect(() => {
    filtrarReclamos();
  }, [reclamos, filtroEstado, busqueda]);

  const cargarReclamos = async () => {
    setLoading(true);
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const clienteId = usuario.clienteId;

      if (!clienteId) {
        setReclamos([]);
        return;
      }

      const data = await reclamoService.buscarPorCliente(clienteId);
      const reclamosOrdenados = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        : [];

      // Cargar devoluciones asociadas
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
    } catch (error) {
      console.error("Error cargando reclamos:", error);
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

  const cargarEvidencias = async (reclamoId) => {
    try {
      const data = await reclamoService.listarEvidencias(reclamoId);
      setEvidencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando evidencias:", error);
      setEvidencias([]);
    }
  };

  const filtrarReclamos = () => {
    let filtrados = [...reclamos];

    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter(r => r.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(r =>
        r.id?.toString().includes(termino) ||
        r.tipo?.toLowerCase().includes(termino) ||
        r.descripcion?.toLowerCase().includes(termino)
      );
    }

    setReclamosFiltrados(filtrados);
  };

  const verDetalle = async (reclamo) => {
    setReclamoSeleccionado(reclamo);
    await cargarEvidencias(reclamo.id);
    setShowModal(true);
  };

  const verEvidencias = async (reclamo) => {
    setReclamoSeleccionado(reclamo);
    await cargarEvidencias(reclamo.id);
    setShowEvidenciasModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubirEvidencia = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setEvidenciasSubiendo(true);
    
    for (const file of files) {
      const formDataEvidencia = new FormData();
      formDataEvidencia.append("imagen", file);
      
      try {
        await reclamoService.subirEvidencia(reclamoSeleccionado.id, formDataEvidencia);
      } catch (error) {
        console.error("Error subiendo evidencia:", error);
      }
    }
    
    await cargarEvidencias(reclamoSeleccionado.id);
    setEvidenciasSubiendo(false);
  };

  const handleEliminarEvidencia = async (evidenciaId) => {
    if (window.confirm("¿Eliminar esta evidencia?")) {
      try {
        await reclamoService.eliminarEvidencia(evidenciaId);
        await cargarEvidencias(reclamoSeleccionado.id);
      } catch (error) {
        console.error("Error eliminando evidencia:", error);
      }
    }
  };

  const handleSubmitReclamo = async (e) => {
    e.preventDefault();
    
    if (!formData.tipo) {
      setError("Debes seleccionar un tipo de reclamo");
      return;
    }
    
    if (!formData.descripcion) {
      setError("Debes describir el reclamo");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const clienteId = usuario.clienteId;
      
      const reclamoData = {
        clienteId: clienteId,
        pedidoId: formData.pedidoId || null,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        estado: "REGISTRADO"
      };
      
      const nuevoReclamo = await reclamoService.crear(reclamoData);
      
      // Si hay evidencias pendientes, subirlas
      if (evidenciasPendientes.length > 0 && nuevoReclamo.id) {
        for (const file of evidenciasPendientes) {
          const formDataEvidencia = new FormData();
          formDataEvidencia.append("imagen", file);
          try {
            await reclamoService.subirEvidencia(nuevoReclamo.id, formDataEvidencia);
          } catch (error) {
            console.error("Error subiendo evidencia:", error);
          }
        }
      }
      
      setFormData({ pedidoId: "", tipo: "", descripcion: "" });
      setEvidenciasPendientes([]);
      setShowFormModal(false);
      
      await cargarReclamos();
      
      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2";
      successMsg.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Reclamo registrado correctamente';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
      
    } catch (error) {
      console.error("Error al crear reclamo:", error);
      setError(error.message || "Error al registrar el reclamo");
    } finally {
      setSubmitting(false);
    }
  };

  const [evidenciasPendientes, setEvidenciasPendientes] = useState([]);

  const handleSeleccionarEvidencias = (e) => {
    const files = Array.from(e.target.files);
    setEvidenciasPendientes(prev => [...prev, ...files]);
  };

  const eliminarEvidenciaPendiente = (index) => {
    setEvidenciasPendientes(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      "REGISTRADO": "bg-amber-100 text-amber-700",
      "EN_REVISION": "bg-blue-100 text-blue-700",
      "APROBADO": "bg-green-100 text-green-700",
      "REVISION": "bg-purple-100 text-purple-700",
      "RECHAZADO": "bg-red-100 text-red-700",
      "CERRADO": "bg-gray-100 text-gray-700"
    };
    return colores[estado] || "bg-gray-100 text-gray-700";
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      "REGISTRADO": <Clock size={18} className="inline" />,
      "EN_REVISION": <RefreshCw size={18} className="inline" />,
      "APROBADO": <CheckCircle size={18} className="inline" />,
      "REVISION": <AlertCircle size={18} className="inline" />,
      "RECHAZADO": <XCircle size={18} className="inline" />,
      "CERRADO": <FileText size={18} className="inline" />
    };
    return icons[estado] || <FileText size={18} className="inline" />;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      "REGISTRADO": "Registrado",
      "EN_REVISION": "En Revisión",
      "APROBADO": "Aprobado",
      "REVISION": "Revisión",
      "RECHAZADO": "Rechazado",
      "CERRADO": "Cerrado"
    };
    return labels[estado] || estado;
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      "DEVOLUCION": <RefreshCw size={16} className="inline" />,
      "DEFECTO": <AlertCircle size={16} className="inline" />,
      "GARANTIA": <Shield size={16} className="inline" />,
      "NO_CONFORMIDAD": <XCircle size={16} className="inline" />
    };
    return icons[tipo] || <FileText size={16} className="inline" />;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      "DEVOLUCION": "Devolución",
      "DEFECTO": "Producto defectuoso",
      "GARANTIA": "Garantía",
      "NO_CONFORMIDAD": "No conformidad"
    };
    return labels[tipo] || tipo;
  };

  const estadosDisponibles = [
    { value: "todos", label: "Todos", icon: <FileText size={16} className="inline" /> },
    { value: "REGISTRADO", label: "Registrado", icon: <Clock size={16} className="inline" /> },
    { value: "EN_REVISION", label: "En Revisión", icon: <RefreshCw size={16} className="inline" /> },
    { value: "APROBADO", label: "Aprobado", icon: <CheckCircle size={16} className="inline" /> },
    { value: "REVISION", label: "Revisión", icon: <AlertCircle size={16} className="inline" /> },
    { value: "RECHAZADO", label: "Rechazado", icon: <XCircle size={16} className="inline" /> },
    { value: "CERRADO", label: "Cerrado", icon: <FileText size={16} className="inline" /> }
  ];

  const tiposReclamo = [
    { value: "DEVOLUCION", label: "Devolución", icon: <RefreshCw size={16} className="inline" /> },
    { value: "DEFECTO", label: "Producto defectuoso", icon: <AlertCircle size={16} className="inline" /> },
    { value: "GARANTIA", label: "Garantía", icon: <Shield size={16} className="inline" /> },
    { value: "NO_CONFORMIDAD", label: "No conformidad", icon: <XCircle size={16} className="inline" /> }
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
      {/* Encabezado con botón para nuevo reclamo */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFormModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Reclamo
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar reclamo..."
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
            {reclamosFiltrados.length} {reclamosFiltrados.length === 1 ? "reclamo encontrado" : "reclamos encontrados"}
          </p>
        </div>
      </div>

      {reclamosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <span className="text-5xl block mb-3">📋</span>
          <p className="text-lg font-medium">No tienes reclamos registrados</p>
          <p className="text-sm mt-1">Cuando registres un reclamo, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reclamosFiltrados.map(reclamo => (
            <div
              key={reclamo.id}
              onClick={() => verDetalle(reclamo)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-[#5b4eff] overflow-hidden cursor-pointer"
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getTipoIcon(reclamo.tipo)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 text-lg">Reclamo #{reclamo.id}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(reclamo.estado)}`}>
                          {getEstadoIcon(reclamo.estado)} {getEstadoLabel(reclamo.estado)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(reclamo.fecha)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 text-sm">{getTipoLabel(reclamo.tipo)}</p>
                    {reclamo.pedidoId && (
                      <p className="text-xs text-gray-400">Pedido #{reclamo.pedidoId}</p>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Descripción</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{reclamo.descripcion}</p>
                </div>

                {reclamo.devolucion && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <RefreshCw size={12} />
                      Devolución asociada - Estado: {reclamo.devolucion.estado}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      verEvidencias(reclamo);
                    }}
                    className="text-gray-500 text-sm font-medium hover:text-[#5b4eff] transition flex items-center gap-1"
                  >
                    <Eye size={14} /> Ver evidencias
                  </button>
                  <span className="text-[#5b4eff] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver detalles completos →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para nuevo reclamo */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Nuevo Reclamo</h3>
                <p className="text-sm text-gray-500 mt-1">Registra tu reclamo o solicitud</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitReclamo} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Selección de pedido (opcional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pedido relacionado (opcional)
                </label>
                <select
                  name="pedidoId"
                  value={formData.pedidoId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                >
                  <option value="">Sin pedido asociado</option>
                  {pedidos.map(pedido => (
                    <option key={pedido.id} value={pedido.id}>
                      Pedido #{pedido.id} - {formatDate(pedido.fecha)} - {formatPrice(pedido.total)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de reclamo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tipo de reclamo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tiposReclamo.map(tipo => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.value }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 justify-center ${
                        formData.tipo === tipo.value
                          ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {tipo.icon}
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition resize-none"
                  placeholder="Describe detalladamente tu reclamo..."
                  required
                />
              </div>

              {/* Evidencias */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Evidencias (imágenes)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#5b4eff] transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSeleccionarEvidencias}
                    className="hidden"
                    id="evidencias-input"
                  />
                  <label htmlFor="evidencias-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Haz clic para subir imágenes</span>
                    <span className="text-xs text-gray-400">JPEG, PNG hasta 5MB</span>
                  </label>
                </div>
                {evidenciasPendientes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600">Evidencias seleccionadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {evidenciasPendientes.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                          <span className="text-xs">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => eliminarEvidenciaPendiente(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Información importante</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Una vez registrado tu reclamo, nuestro equipo lo revisará y te contactará 
                      dentro de 3-5 días hábiles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    "Registrar Reclamo"
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

      {/* Modal de detalle del reclamo */}
      {showModal && reclamoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">Reclamo #{reclamoSeleccionado.id}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(reclamoSeleccionado.estado)}`}>
                    {getEstadoIcon(reclamoSeleccionado.estado)} {getEstadoLabel(reclamoSeleccionado.estado)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatDate(reclamoSeleccionado.fecha)}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📋</span> Información General
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Tipo de reclamo</p>
                    <p className="font-medium flex items-center gap-1">
                      {getTipoIcon(reclamoSeleccionado.tipo)} {getTipoLabel(reclamoSeleccionado.tipo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pedido relacionado</p>
                    <p className="font-medium">{reclamoSeleccionado.pedidoId ? `#${reclamoSeleccionado.pedidoId}` : "No asociado"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span> Descripción del Reclamo
                </h4>
                <p className="text-gray-700 leading-relaxed">{reclamoSeleccionado.descripcion}</p>
              </div>

              {reclamoSeleccionado.devolucion && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <RefreshCw size={18} /> Devolución Asociada
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-green-600">Estado</p>
                      <p className="font-medium text-green-800">{reclamoSeleccionado.devolucion.estado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Monto</p>
                      <p className="font-bold text-green-800">{formatPrice(reclamoSeleccionado.devolucion.monto || 0)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-green-600">Fecha</p>
                      <p className="font-medium text-green-800">{formatDate(reclamoSeleccionado.devolucion.fecha)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 text-lg">💡</span>
                  <p className="text-xs text-amber-700">
                    Para cualquier consulta sobre tu reclamo, contáctanos a soporte@tienda.com o al (01) 234-5678
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de evidencias */}
      {showEvidenciasModal && reclamoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEvidenciasModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Evidencias - Reclamo #{reclamoSeleccionado.id}</h3>
                <p className="text-sm text-gray-500 mt-1">Imágenes adjuntas al reclamo</p>
              </div>
              <button onClick={() => setShowEvidenciasModal(false)} className="text-gray-400 hover:text-gray-600 transition text-2xl">✕</button>
            </div>

            <div className="p-6">
              {/* Subir nuevas evidencias */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#5b4eff] transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSubirEvidencia}
                    className="hidden"
                    id="subir-evidencia"
                    disabled={evidenciasSubiendo}
                  />
                  <label htmlFor="subir-evidencia" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {evidenciasSubiendo ? "Subiendo..." : "Subir nueva evidencia"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Lista de evidencias */}
              {evidencias.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No hay evidencias adjuntas</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {evidencias.map(evidencia => (
                    <div key={evidencia.id} className="relative group">
                      <img
                        src={`http://localhost:8080${evidencia.urlImagen}`}
                        alt={`Evidencia ${evidencia.id}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleEliminarEvidencia(evidencia.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(evidencia.fecha)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}