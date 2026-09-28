// admin/components/HistorialServiciosTecnicos.jsx
import React, { useState, useMemo } from "react";
import { useServicios } from "../../tecnico/hooks/useServicios";
import DetalleServicioHistorial from "../../tecnico/components/DetalleServicioHistorial";
import {
    ClipboardList, Wrench, CheckCircle2, PackageCheck,
    FileText, Coins, Activity, Eye, ChevronDown, ChevronUp,
    ArrowRight, Inbox, Search
} from "lucide-react";

// =====================================================
// Helpers (idénticos al técnico)
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
export default function HistorialServiciosTecnicos() {
    const { servicios, loading, error } = useServicios();
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);

    const verDetalle = (s) => {
        setServicioSeleccionado(s);
        setShowModal(true);
    };

    const cargarMas = () => setVisibleCount(p => p + 6);
    const mostrarMenos = () => setVisibleCount(6);

    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(price);

    const serviciosMostrados = servicios.slice(0, visibleCount);
    const hasMore = visibleCount < servicios.length;

    const totalIngresos = useMemo(
        () => servicios.reduce((sum, s) => sum + (s.costo || 0), 0),
        [servicios]
    );

    const completados = useMemo(
        () => servicios.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length,
        [servicios]
    );

    // ── Estados de carga / error ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            {/* ─── TARJETAS RESUMEN ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Total</p>
                        <ClipboardList size={18} className="opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{servicios.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Ingresos</p>
                        <Coins size={18} className="opacity-80" />
                    </div>
                    <p className="text-3xl font-bold truncate">{formatPrice(totalIngresos)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Completados</p>
                        <CheckCircle2 size={18} className="opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{completados}</p>
                </div>
            </div>

            {/* ─── LISTA ─── */}
            {servicios.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
                    <Inbox size={56} className="mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium text-gray-600">No hay servicios registrados</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {serviciosMostrados.map(s => (
                            <div
                                key={s.id}
                                onClick={() => verDetalle(s)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group border border-gray-100 hover:border-indigo-300"
                            >
                                {/* Header */}
                                <div className="relative p-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(s.estado)}`}>
                                            {getEstadoIcon(s.estado, 12)}
                                            {s.estado.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-indigo-600"
                                            style={{ backgroundColor: getEstadoBg(s.estado) }}
                                        >
                                            {getEstadoIcon(s.estado, 20)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Servicio #{s.id}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.fecha)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Equipo</p>
                                            <p className="font-medium text-gray-800 text-sm truncate">{s.equipo || "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <ClipboardList size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Cliente</p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {s.clienteNombre || `Cliente #${s.clienteId}`}
                                            </p>
                                        </div>
                                    </div>
                                    {s.tecnicoNombre && (
                                        <div className="flex items-start gap-2">
                                            <Wrench size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Técnico</p>
                                                <p className="text-sm text-indigo-600 font-medium truncate">{s.tecnicoNombre}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-indigo-600 text-sm">
                                        <Coins size={14} />
                                        {formatPrice(s.costo || 0)}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium group-hover:underline">
                                        <Eye size={14} />
                                        Ver detalles
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginación */}
                    {servicios.length > 6 && (
                        <div className="flex justify-center mt-8">
                            {hasMore ? (
                                <button
                                    onClick={cargarMas}
                                    className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <ChevronDown size={16} />
                                    Ver más
                                    <span className="text-xs opacity-75">({visibleCount} de {servicios.length})</span>
                                </button>
                            ) : (
                                <button
                                    onClick={mostrarMenos}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                                >
                                    <ChevronUp size={16} />
                                    Mostrar menos
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal de detalle (reutilizado del técnico) */}
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