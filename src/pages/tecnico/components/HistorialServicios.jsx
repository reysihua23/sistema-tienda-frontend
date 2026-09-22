// pages/tecnico/components/HistorialServicios.jsx
import React, { useState, useMemo } from "react";
import { useServicios } from "../hooks/useServicios";
import DetalleServicioHistorial from "./DetalleServicioHistorial";
import {
    ClipboardList, Search, Wrench, CheckCircle2, PackageCheck,
    FileText, Coins, TrendingUp, Activity, Eye,
    ChevronDown, ChevronUp, ArrowRight, Inbox
} from "lucide-react";

// =====================================================
// Helpers de estado (iconos Lucide)
// =====================================================
const getEstadoIcon = (estado, size = 16) => {
    const icons = {
        "RECIBIDO": <ClipboardList size={size} />,
        "EN_REVISION": <Search size={size} />,
        "EN_PROCESO": <Wrench size={size} />,
        "FINALIZADO": <CheckCircle2 size={size} />,
        "ENTREGADO": <PackageCheck size={size} />
    };
    return icons[estado] || <FileText size={size} />;
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

const getEstadoBg = (estado) => {
    const bg = {
        "RECIBIDO": "#FEF3C7",
        "EN_REVISION": "#DBEAFE",
        "EN_PROCESO": "#F3E8FF",
        "FINALIZADO": "#D1FAE5",
        "ENTREGADO": "#D1FAE5"
    };
    return bg[estado] || "#F3F4F6";
};

// =====================================================
// Componente principal
// =====================================================
export default function HistorialServicios() {
    const { servicios, loading, error } = useServicios();
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);

    const verDetalle = (servicio) => {
        setServicioSeleccionado(servicio);
        setShowModal(true);
    };

    const cargarMas = () => setVisibleCount(prev => prev + 6);
    const mostrarMenos = () => setVisibleCount(6);

    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(price);

    const serviciosMostrados = servicios.slice(0, visibleCount);
    const hasMore = visibleCount < servicios.length;

    const totalIngresos = useMemo(() => {
        return servicios.reduce((sum, s) => sum + (s.costo || 0), 0);
    }, [servicios]);

    const serviciosCompletados = useMemo(() => {
        return servicios.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length;
    }, [servicios]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
                <p className="mt-4 text-gray-500">Cargando historial...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center flex items-center justify-center gap-2">
                <Activity size={20} />
                <span>Error: {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ─────────── HEADER ─────────── 
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                            <ClipboardList size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Historial de Servicios</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Todos los servicios técnicos registrados</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Total de servicios</p>
                        <p className="text-2xl font-bold text-[#5b4eff]">{servicios.length}</p>
                    </div>
                </div>
            </div>*/}

            {/* ─────────── TARJETAS DE RESUMEN ─────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total servicios */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Total Servicios</p>
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                            <ClipboardList size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{servicios.length}</p>
                </div>

                {/* Ingresos */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Ingresos Totales</p>
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                            <Coins size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold truncate">{formatPrice(totalIngresos)}</p>
                </div>

                {/* Completados */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Completados</p>
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{serviciosCompletados}</p>
                </div>
            </div>

            {/* ─────────── LISTA DE SERVICIOS ─────────── */}
            {servicios.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
                    <Inbox size={56} className="mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium text-gray-600">No hay servicios registrados</p>
                    <p className="text-sm mt-1">Los servicios aparecerán aquí cuando se registren</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {serviciosMostrados.map(servicio => (
                            <div
                                key={servicio.id}
                                onClick={() => verDetalle(servicio)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 hover:border-[#5b4eff]/30"
                            >
                                {/* Header de tarjeta */}
                                <div className="relative p-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                                            {getEstadoIcon(servicio.estado, 12)}
                                            {servicio.estado.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#5b4eff]"
                                            style={{ backgroundColor: getEstadoBg(servicio.estado) }}
                                        >
                                            {getEstadoIcon(servicio.estado, 20)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Servicio #{servicio.id}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(servicio.fecha)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Equipo</p>
                                            <p className="font-medium text-gray-800 text-sm truncate">{servicio.equipo || "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <ClipboardList size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Cliente</p>
                                            <p className="text-sm text-gray-600 truncate">{servicio.clienteNombre || `Cliente #${servicio.clienteId}`}</p>
                                        </div>
                                    </div>
                                    {servicio.diagnostico && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-start gap-2">
                                            <Wrench size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-400 font-semibold">Diagnóstico</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{servicio.diagnostico}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-[#5b4eff] text-sm">
                                        <Coins size={14} />
                                        {formatPrice(servicio.costo || 0)}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[#5b4eff] text-sm font-medium group-hover:underline">
                                        <Eye size={14} />
                                        Ver detalles
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botones Ver más / Ver menos */}
                    {servicios.length > 6 && (
                        <div className="flex justify-center mt-8">
                            {hasMore ? (
                                <button
                                    onClick={cargarMas}
                                    className="px-6 py-3 bg-white border-2 border-[#5b4eff] text-[#5b4eff] rounded-xl font-bold text-sm hover:bg-[#5b4eff] hover:text-white transition-all duration-300 flex items-center gap-2"
                                >
                                    <ChevronDown size={16} />
                                    Ver más servicios
                                    <span className="text-xs opacity-75">({visibleCount} de {servicios.length})</span>
                                </button>
                            ) : (
                                <button
                                    onClick={mostrarMenos}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                                >
                                    <ChevronUp size={16} />
                                    Mostrar menos
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal de detalle SOLO LECTURA */}
            {showModal && servicioSeleccionado && (
                <DetalleServicioHistorial
                    servicio={servicioSeleccionado}
                    onClose={() => {
                        setShowModal(false);
                        setServicioSeleccionado(null);
                    }}
                />
            )}
        </div>
    );
}