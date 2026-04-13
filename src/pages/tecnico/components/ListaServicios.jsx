// pages/tecnico/components/ListaServicios.jsx
import React, { useState } from "react";
import { useServicios } from "../hooks/useServicios";
import DetalleServicio from "./DetalleServicio";

export default function ListaServicios() {
    const { servicios, loading, error } = useServicios();
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [searchCliente, setSearchCliente] = useState("");
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const handleFiltroChange = (estado) => {
        setFiltroEstado(estado);
        setVisibleCount(6);
    };

    const handleSearchChange = (e) => {
        setSearchCliente(e.target.value);
        setVisibleCount(6);
    };

    const verDetalle = (servicio) => {
        setServicioSeleccionado(servicio);
        setShowModal(true);
    };

    const handleUpdate = async () => {
        showToast("Servicio actualizado correctamente", "success");
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const cargarMas = () => setVisibleCount(prev => prev + 6);
    const mostrarMenos = () => setVisibleCount(6);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    const getEstadoIcon = (estado) => {
        const icons = {
            "RECIBIDO": "📋",
            "EN_REVISION": "🔍",
            "EN_PROCESO": "🔧",
            "FINALIZADO": "✅",
            "ENTREGADO": "🎉"
        };
        return icons[estado] || "📦";
    };

    // Filtrar servicios
    const serviciosFiltrados = servicios.filter(s => {
        const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado;
        const matchCliente = searchCliente === "" || 
            (s.clienteNombre && s.clienteNombre.toLowerCase().includes(searchCliente.toLowerCase()));
        return matchEstado && matchCliente;
    });

    const serviciosMostrados = serviciosFiltrados.slice(0, visibleCount);
    const hasMore = visibleCount < serviciosFiltrados.length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
                <p className="mt-4 text-gray-500">Cargando servicios...</p>
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
        <div>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-24 right-6 z-50 animate-slide-in">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                        <span className="text-xl">{toast.type === "success" ? "✅" : "❌"}</span>
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button onClick={() => setToast({ show: false, message: "", type: "" })} className="ml-2">✕</button>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda por cliente */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar cliente</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder=" Buscar por nombre de cliente..."
                                value={searchCliente}
                                onChange={handleSearchChange}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                            />
                            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Filtro por estado */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por estado</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFiltroChange("todos")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    filtroEstado === "todos"
                                        ? "bg-[#5b4eff] text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => handleFiltroChange("RECIBIDO")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                                    filtroEstado === "RECIBIDO"
                                        ? "bg-amber-500 text-white shadow-md"
                                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                }`}
                            >
                                Recibido
                            </button>

                            <button
                                onClick={() => handleFiltroChange("EN_REVISION")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                                    filtroEstado === "EN_REVISION"
                                        ? "bg-blue-500 text-white shadow-md"
                                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                            >
                                En Revisión 
                            </button>

                            <button
                                onClick={() => handleFiltroChange("EN_PROCESO")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                                    filtroEstado === "EN_PROCESO"
                                        ? "bg-purple-500 text-white shadow-md"
                                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                }`}
                            >
                                En Proceso
                            </button>
                            <button
                                onClick={() => handleFiltroChange("FINALIZADO")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                                    filtroEstado === "FINALIZADO"
                                        ? "bg-green-500 text-white shadow-md"
                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                            >
                                Finalizado
                            </button>
                            <button
                                onClick={() => handleFiltroChange("ENTREGADO")}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                                    filtroEstado === "ENTREGADO"
                                        ? "bg-emerald-500 text-white shadow-md"
                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                }`}
                            >
                                Entregado
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? "servicio encontrado" : "servicios encontrados"}
                    </p>
                </div>
            </div>

            {/* Grid de servicios - 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {serviciosMostrados.map(servicio => (
                    <div
                        key={servicio.id}
                        onClick={() => verDetalle(servicio)}
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 hover:border-[#5b4eff]/30"
                    >
                        <div className="relative p-4 pb-3 border-b border-gray-100">
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                                    {getEstadoIcon(servicio.estado)} {servicio.estado}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#5b4eff]/20 to-[#4a3dcc]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="text-2xl">{getEstadoIcon(servicio.estado)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">#{servicio.id}</p>
                                    <p className="text-xs text-gray-400">{formatDate(servicio.fecha)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-2">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Equipo</p>
                                <p className="font-medium text-gray-800 truncate">{servicio.equipo || "Equipo no especificado"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Cliente</p>
                                <p className="text-sm text-gray-600 truncate">{servicio.clienteNombre || `Cliente #${servicio.clienteId}`}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Problema</p>
                                <p className="text-sm text-gray-500 line-clamp-2">{servicio.problema || "Sin descripción"}</p>
                            </div>
                            {servicio.diagnostico && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 font-semibold">Diagnóstico</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{servicio.diagnostico}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <button className="w-full text-center text-[#5b4eff] text-sm font-medium hover:underline">
                                Ver detalles →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {serviciosFiltrados.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                    <span className="text-5xl block mb-3">🔧</span>
                    <p className="text-lg font-medium">No hay servicios que coincidan con los filtros</p>
                    <p className="text-sm mt-1">Intenta cambiar el estado o buscar otro cliente</p>
                </div>
            )}

            {serviciosFiltrados.length > 6 && (
                <div className="flex justify-center mt-8">
                    {hasMore ? (
                        <button onClick={cargarMas} className="px-6 py-3 bg-white border-2 border-[#5b4eff] text-[#5b4eff] rounded-xl font-bold text-sm hover:bg-[#5b4eff] hover:text-white transition-all duration-300 flex items-center gap-2">
                            <span></span> Ver más servicios
                            <span className="text-xs">({visibleCount} de {serviciosFiltrados.length})</span>
                        </button>
                    ) : (
                        <button onClick={mostrarMenos} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
                            <span>⬆️</span> Mostrar menos
                        </button>
                    )}
                </div>
            )}

            {showModal && servicioSeleccionado && (
                <DetalleServicio
                    servicio={servicioSeleccionado}
                    onClose={() => {
                        setShowModal(false);
                        setServicioSeleccionado(null);
                    }}
                    onUpdate={handleUpdate}
                />
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}