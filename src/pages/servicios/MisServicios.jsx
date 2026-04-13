// pages/servicios/MisServicios.jsx
import React, { useState, useEffect } from "react";
import { servicioTecnicoService } from "../../services/api";
import { ClipboardList, Search, Wrench, CheckCircle, Truck } from "lucide-react";

export default function MisServicios({ embedded = false }) {
  const [servicios, setServicios] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarServicios();
  }, []);

  useEffect(() => {
    filtrarServicios();
  }, [servicios, filtroEstado, busqueda]);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioStr);
      const clienteId = usuario.clienteId;

      if (!clienteId) {
        setServicios([]);
        return;
      }

      const data = await servicioTecnicoService.buscarPorCliente(clienteId);

      // 1. Ordenar por fecha DESCENDENTE (más reciente primero)
      const serviciosOrdenados = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        : [];

      const total = serviciosOrdenados.length;

      // 2. Asignar número secuencial INVERTIDO (el más reciente recibe el número más alto)
      const serviciosConNumero = serviciosOrdenados.map((servicio, index) => ({
        ...servicio,
        numeroCliente: total - index  // El más reciente = #total, el más antiguo = #1
      }));

      setServicios(serviciosConNumero);
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtrarServicios = () => {
    let filtrados = [...servicios];

    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter(s => s.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(s =>
        s.equipo?.toLowerCase().includes(termino) ||
        s.problema?.toLowerCase().includes(termino)
      );
    }

    setServiciosFiltrados(filtrados);
  };

  const verDetalle = (servicio) => {
    setServicioSeleccionado(servicio);
    setShowModal(true);
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
      "RECIBIDO": "bg-amber-100 text-amber-700",
      "EN_REVISION": "bg-blue-100 text-blue-700",
      "EN_PROCESO": "bg-purple-100 text-purple-700",
      "FINALIZADO": "bg-green-100 text-green-700",
      "ENTREGADO": "bg-emerald-100 text-emerald-700"
    };
    return colores[estado] || "bg-gray-100 text-gray-700";
  };

  // ✅ CORREGIDO: getEstadoIcon siempre devuelve un elemento React
  const getEstadoIcon = (estado) => {
    const icons = {
      "RECIBIDO": <ClipboardList size={18} className="inline" />,
      "EN_REVISION": <Search size={18} className="inline" />,
      "EN_PROCESO": <Wrench size={18} className="inline" />,
      "FINALIZADO": <CheckCircle size={18} className="inline" />,
      "ENTREGADO": <Truck size={18} className="inline" />
    };
    return icons[estado] || <ClipboardList size={18} className="inline" />;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      "RECIBIDO": "Recibido",
      "EN_REVISION": "En Revisión",
      "EN_PROCESO": "En Proceso",
      "FINALIZADO": "Finalizado",
      "ENTREGADO": "Entregado"
    };
    return labels[estado] || estado;
  };

  const estadosDisponibles = [
    { value: "todos", label: "Todos", icon: <ClipboardList size={16} className="inline" /> },
    { value: "RECIBIDO", label: "Recibido", icon: <ClipboardList size={16} className="inline" /> },
    { value: "EN_REVISION", label: "En Revisión", icon: <Search size={16} className="inline" /> },
    { value: "EN_PROCESO", label: "En Proceso", icon: <Wrench size={16} className="inline" /> },
    { value: "FINALIZADO", label: "Finalizado", icon: <CheckCircle size={16} className="inline" /> },
    { value: "ENTREGADO", label: "Entregado", icon: <Truck size={16} className="inline" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center">
        ⚠️ Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por equipo o problema..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtro por estado */}
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
            {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? "servicio encontrado" : "servicios encontrados"}
          </p>
        </div>
      </div>

      {serviciosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <span className="text-5xl block mb-3">🔧</span>
          <p className="text-lg font-medium">No tienes servicios registrados</p>
          <p className="text-sm mt-1">Cuando solicites un servicio técnico, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviciosFiltrados.map(servicio => (
            <div
              key={servicio.id}
              onClick={() => verDetalle(servicio)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-[#5b4eff] overflow-hidden cursor-pointer"
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getEstadoIcon(servicio.estado)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 text-lg">Servicio #{servicio.numeroCliente}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                          {getEstadoIcon(servicio.estado)} {getEstadoLabel(servicio.estado)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(servicio.fecha)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#5b4eff] text-lg">{formatPrice(servicio.costo || 0)}</p>
                    <p className="text-xs text-gray-400">Costo estimado</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Equipo</p>
                  <p className="font-medium text-gray-800">{servicio.equipo || "Equipo no especificado"}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Problema reportado</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{servicio.problema || "Sin descripción"}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Técnico asignado</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs">👨‍🔧</span>
                    </div>
                    <p className="text-sm text-gray-700">{servicio.tecnicoNombre || "Por asignar"}</p>
                  </div>
                </div>

                {servicio.diagnostico && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Diagnóstico</p>
                    <p className="text-sm text-gray-600">{servicio.diagnostico}</p>
                  </div>
                )}

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

      {/* Modal de detalle */}
      {showModal && servicioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">Servicio #{servicioSeleccionado.numeroCliente}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(servicioSeleccionado.estado)}`}>
                    {getEstadoIcon(servicioSeleccionado.estado)} {getEstadoLabel(servicioSeleccionado.estado)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatDate(servicioSeleccionado.fecha)}</p>
                <p className="text-xs text-gray-400 mt-1">ID de referencia: #{servicioSeleccionado.id}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">👤</span> Información del Cliente
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="font-medium">{servicioSeleccionado.clienteNombre || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-medium">{servicioSeleccionado.clienteTelefono || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{servicioSeleccionado.clienteEmail || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Documento</p>
                    <p className="font-medium">{servicioSeleccionado.clienteDocumento || "No especificado"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💻</span> Información del Equipo
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Equipo</p>
                    <p className="font-medium">{servicioSeleccionado.equipo || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Problema reportado</p>
                    <p className="text-gray-700">{servicioSeleccionado.problema || "Sin descripción"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">👨‍🔧</span> Técnico Asignado
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔧</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{servicioSeleccionado.tecnicoNombre || "Por asignar"}</p>
                    <p className="text-xs text-gray-500">Técnico especializado</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📋</span> Diagnóstico
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {servicioSeleccionado.diagnostico || "Aún no se ha registrado un diagnóstico. El técnico evaluará tu equipo pronto."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">Estado Actual</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getEstadoIcon(servicioSeleccionado.estado)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getEstadoColor(servicioSeleccionado.estado)}`}>
                      {getEstadoLabel(servicioSeleccionado.estado)}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Recibido</span>
                      <span>Revisión</span>
                      <span>Proceso</span>
                      <span>Finalizado</span>
                      <span>Entregado</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                      <div className="h-full bg-amber-500" style={{ width: servicioSeleccionado.estado === "RECIBIDO" ? "20%" : "20%" }}></div>
                      <div className="h-full bg-blue-500" style={{ width: servicioSeleccionado.estado === "EN_REVISION" ? "20%" : "20%" }}></div>
                      <div className="h-full bg-purple-500" style={{ width: servicioSeleccionado.estado === "EN_PROCESO" ? "20%" : "20%" }}></div>
                      <div className="h-full bg-green-500" style={{ width: servicioSeleccionado.estado === "FINALIZADO" ? "20%" : "20%" }}></div>
                      <div className="h-full bg-emerald-500" style={{ width: servicioSeleccionado.estado === "ENTREGADO" ? "20%" : "0%" }}></div>
                    </div>
                  </div>
                </div>
                <div className={`rounded-lg p-4 text-white ${servicioSeleccionado.estado === "ENTREGADO" ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc]"}`}>
                  <h4 className="font-bold mb-2">Costo Total</h4>
                  <p className="text-3xl font-bold">{formatPrice(servicioSeleccionado.costo || 0)}</p>
                  <p className="text-xs opacity-80 mt-2">Incluye diagnóstico y reparación</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 text-lg">💡</span>
                  <p className="text-xs text-amber-700">
                    Para cualquier consulta sobre el estado de tu servicio, puedes contactarnos al (01) 234-5678 o a soporte@tienda.com
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