// pages/servicios/MisServicios.jsx
import React, { useState, useEffect } from "react";
import { servicioTecnicoService } from "../../services/api";
import {
  ClipboardList, Search, Wrench, CheckCircle, Truck,
  User, Laptop, HardHat, FileText, Package, X, Info, AlertCircle
} from "lucide-react";

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

      const serviciosOrdenados = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        : [];

      const total = serviciosOrdenados.length;

      const serviciosConNumero = serviciosOrdenados.map((servicio, index) => ({
        ...servicio,
        numeroCliente: total - index
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
      "RECIBIDO": "bg-amber-100 text-amber-800 border-amber-200",
      "EN_REVISION": "bg-blue-100 text-blue-800 border-blue-200",
      "EN_PROCESO": "bg-purple-100 text-purple-800 border-purple-200",
      "FINALIZADO": "bg-green-100 text-green-800 border-green-200",
      "ENTREGADO": "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return colores[estado] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getEstadoIcon = (estado, size = 18) => {
    const icons = {
      "RECIBIDO": <ClipboardList size={size} />,
      "EN_REVISION": <Search size={size} />,
      "EN_PROCESO": <Wrench size={size} />,
      "FINALIZADO": <CheckCircle size={size} />,
      "ENTREGADO": <Truck size={size} />
    };
    return icons[estado] || <ClipboardList size={size} />;
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

  const getEstadoBg = (estado) => {
    const bg = {
      "RECIBIDO": "bg-amber-50",
      "EN_REVISION": "bg-blue-50",
      "EN_PROCESO": "bg-purple-50",
      "FINALIZADO": "bg-green-50",
      "ENTREGADO": "bg-emerald-50"
    };
    return bg[estado] || "bg-gray-50";
  };

  const estadosDisponibles = [
    { value: "todos", label: "Todos", icon: <ClipboardList size={16} /> },
    { value: "RECIBIDO", label: "Recibido", icon: <ClipboardList size={16} /> },
    { value: "EN_REVISION", label: "En Revisión", icon: <Search size={16} /> },
    { value: "EN_PROCESO", label: "En Proceso", icon: <Wrench size={16} /> },
    { value: "FINALIZADO", label: "Finalizado", icon: <CheckCircle size={16} /> },
    { value: "ENTREGADO", label: "Entregado", icon: <Truck size={16} /> }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div>
        <p className="text-sm font-bold text-gray-500">Cargando tus servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center flex items-center justify-center gap-2">
        <AlertCircle size={18} />
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`${embedded ? "" : "min-h-screen bg-slate-50 pt-6 pb-16"} px-4`}>
      <div className={`${embedded ? "" : "max-w-4xl mx-auto"}`}>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mis Servicios Técnicos</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Sigue el estado de tus reparaciones</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por equipo o problema..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 outline-none transition text-sm font-medium"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="flex flex-wrap gap-2">
              {estadosDisponibles.map(estado => (
                <button
                  key={estado.value}
                  onClick={() => setFiltroEstado(estado.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filtroEstado === estado.value
                      ? "bg-[#5b4eff] text-white shadow-md shadow-[#5b4eff]/20"
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
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? "servicio encontrado" : "servicios encontrados"}
            </p>
          </div>
        </div>

        {serviciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-1">No tienes servicios registrados</h3>
            <p className="text-sm text-gray-500 font-medium">Cuando solicites un servicio técnico, aparecerá aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {serviciosFiltrados.map(servicio => (
              <div
                key={servicio.id}
                onClick={() => verDetalle(servicio)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-indigo-300 overflow-hidden cursor-pointer group"
              >
                <div className="p-5">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${getEstadoBg(servicio.estado)} text-[#5b4eff]`}>
                        {getEstadoIcon(servicio.estado, 22)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-900 text-lg">Servicio Nº {servicio.numeroCliente}</p>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide flex items-center gap-1 border ${getEstadoColor(servicio.estado)}`}>
                            {getEstadoIcon(servicio.estado, 12)} {getEstadoLabel(servicio.estado)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">{formatDate(servicio.fecha)}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-gray-50 p-2 sm:p-0 rounded-lg sm:bg-transparent">
                      <p className="font-black text-[#5b4eff] text-xl">{formatPrice(servicio.costo || 0)}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Costo estimado</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Equipo</p>
                      <p className="font-bold text-gray-800 text-sm truncate">{servicio.equipo || "Equipo no especificado"}</p>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Técnico asignado</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={10} className="text-indigo-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-800 truncate">{servicio.tecnicoNombre || "Por asignar"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Problema reportado</p>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{servicio.problema || "Sin descripción"}</p>
                  </div>

                  {servicio.diagnostico && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Diagnóstico</p>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{servicio.diagnostico}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <span className="text-[#5b4eff] text-xs font-bold bg-indigo-50 px-3 py-2 rounded-lg group-hover:bg-[#5b4eff] group-hover:text-white transition-colors flex items-center gap-1">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
            <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-t-3xl animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
              
              <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-start z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-gray-900">Servicio Nº {servicioSeleccionado.numeroCliente}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide flex items-center gap-1 border ${getEstadoColor(servicioSeleccionado.estado)}`}>
                      {getEstadoIcon(servicioSeleccionado.estado, 12)} {getEstadoLabel(servicioSeleccionado.estado)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mt-1">{formatDate(servicioSeleccionado.fecha)}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">ID de referencia: #{servicioSeleccionado.id}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 transition p-2 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Info Cliente */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#5b4eff]" /> Información del Cliente
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold">Nombre</p>
                      <p className="font-bold text-gray-800">{servicioSeleccionado.clienteNombre || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold">Teléfono</p>
                      <p className="font-bold text-gray-800">{servicioSeleccionado.clienteTelefono || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold">Email</p>
                      <p className="font-bold text-gray-800 truncate">{servicioSeleccionado.clienteEmail || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold">Documento</p>
                      <p className="font-bold text-gray-800">{servicioSeleccionado.clienteDocumento || "No especificado"}</p>
                    </div>
                  </div>
                </div>

                {/* Info Equipo */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Laptop size={16} className="text-[#5b4eff]" /> Información del Equipo
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold">Equipo</p>
                      <p className="font-bold text-gray-800">{servicioSeleccionado.equipo || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold">Problema reportado</p>
                      <p className="text-sm text-gray-700 font-medium">{servicioSeleccionado.problema || "Sin descripción"}</p>
                    </div>
                  </div>
                </div>

                {/* Técnico */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <HardHat size={16} className="text-[#5b4eff]" /> Técnico Asignado
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Wrench size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{servicioSeleccionado.tecnicoNombre || "Por asignar"}</p>
                      <p className="text-[10px] font-medium text-gray-500">Técnico especializado</p>
                    </div>
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-[#5b4eff]" /> Diagnóstico
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {servicioSeleccionado.diagnostico || "Aún no se ha registrado un diagnóstico. El técnico evaluará tu equipo pronto."}
                  </p>
                </div>

                {/* Estado y Costo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Estado Actual</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#5b4eff]">{getEstadoIcon(servicioSeleccionado.estado, 18)}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${getEstadoColor(servicioSeleccionado.estado)}`}>
                        {getEstadoLabel(servicioSeleccionado.estado)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        <span>Recibido</span>
                        <span>Revisión</span>
                        <span>Proceso</span>
                        <span>Listo</span>
                        <span>Entregado</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                        <div className={`h-full bg-amber-500 ${servicioSeleccionado.estado === "RECIBIDO" ? "w-[20%]" : "w-[20%]"}`}></div>
                        <div className={`h-full bg-blue-500 ${servicioSeleccionado.estado === "EN_REVISION" || servicioSeleccionado.estado === "EN_PROCESO" || servicioSeleccionado.estado === "FINALIZADO" || servicioSeleccionado.estado === "ENTREGADO" ? "w-[20%]" : "w-0"}`}></div>
                        <div className={`h-full bg-purple-500 ${servicioSeleccionado.estado === "EN_PROCESO" || servicioSeleccionado.estado === "FINALIZADO" || servicioSeleccionado.estado === "ENTREGADO" ? "w-[20%]" : "w-0"}`}></div>
                        <div className={`h-full bg-green-500 ${servicioSeleccionado.estado === "FINALIZADO" || servicioSeleccionado.estado === "ENTREGADO" ? "w-[20%]" : "w-0"}`}></div>
                        <div className={`h-full bg-emerald-500 ${servicioSeleccionado.estado === "ENTREGADO" ? "w-[20%]" : "w-0"}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-5 text-white shadow-md flex flex-col justify-center ${servicioSeleccionado.estado === "ENTREGADO" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc]"}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2 opacity-90">
                      <Package size={16} /> Costo Total
                    </h4>
                    <p className="text-3xl font-black">{formatPrice(servicioSeleccionado.costo || 0)}</p>
                    <p className="text-[10px] font-medium opacity-80 mt-2">Incluye diagnóstico y reparación</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
                  <Info size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Para cualquier consulta sobre el estado de tu servicio, puedes contactarnos al <b>997863112</b> o a <b>soporte@tienda.com</b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}