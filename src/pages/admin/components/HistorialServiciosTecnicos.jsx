// admin/components/HistorialServiciosTecnicos.jsx
import React, { useState, useMemo } from "react";
import { useServicios } from "../../tecnico/hooks/useServicios";
import DetalleServicioHistorial from "../../tecnico/components/DetalleServicioHistorial";
import { servicioTecnicoService } from "../../../services/api"; // ⚠️ Asegúrate de que la ruta sea correcta
import {
    ClipboardList, Wrench, CheckCircle2, PackageCheck,
    FileText, Coins, Activity, Eye, ChevronDown, ChevronUp,
    ArrowRight, Inbox, Search, Power, PowerOff, Filter, CheckCircle, XCircle, X
} from "lucide-react";

// =====================================================
// Helpers
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
export default function HistorialServiciosTecnicos() {
    const { servicios, loading, error, recargar } = useServicios(); // 👈 Agregamos recargar
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    
    // 👇 NUEVOS ESTADOS
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    };

    const verDetalle = (s) => {
        setServicioSeleccionado(s);
        setShowModal(true);
    };

    // 👇 FUNCIÓN PARA REACTIVAR
    const handleReactivar = async (e, id) => {
        e.stopPropagation(); // Evita que se abra el modal de detalle al hacer clic
        try {
            await servicioTecnicoService.actualizar(id, { activo: true });
            showToast(`Servicio #${id} reactivado correctamente`, "success");
            recargar();
        } catch (err) {
            console.error("Error al reactivar:", err);
            showToast("Error al reactivar el servicio", "error");
        }
    };

    const cargarMas = () => setVisibleCount(p => p + 6);
    const mostrarMenos = () => setVisibleCount(6);

    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(price || 0);

    // 👇 FILTRADO DE ACTIVOS/INACTIVOS
    const serviciosFiltrados = useMemo(() => {
        let result = servicios;
        if (!mostrarInactivos) {
            result = result.filter(s => s.activo !== false && s.activo !== 0 && s.activo !== "0");
        }
        return result;
    }, [servicios, mostrarInactivos]);

    const serviciosMostrados = serviciosFiltrados.slice(0, visibleCount);
    const hasMore = visibleCount < serviciosFiltrados.length;

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
        <div className="space-y-6 relative">
            {/* ─── TOAST NOTIFICATION ─── */}
            {toast.show && (
                <div className="fixed top-24 right-6 z-[200] animate-slide-in">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                        {toast.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button onClick={() => setToast({ show: false, message: "", type: "" })} className="ml-2 hover:bg-white/20 p-1 rounded">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── TARJETAS RESUMEN ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide opacity-90 font-semibold">Total Activos</p>
                        <ClipboardList size={18} className="opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{serviciosFiltrados.length}</p>
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

            {/* ─── BARRA DE FILTROS (NUEVO) ─── */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter size={16} className="text-gray-400" />
                    <span className="font-medium">Filtros de visualización</span>
                </div>
                
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition select-none">
                    <input
                        type="checkbox"
                        checked={mostrarInactivos}
                        onChange={(e) => {
                            setMostrarInactivos(e.target.checked);
                            setVisibleCount(6); // Resetear paginación
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Mostrar servicios inactivos</span>
                </label>
            </div>

            {/* ─── LISTA ─── */}
            {serviciosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
                    <Inbox size={56} className="mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium text-gray-600">No hay servicios para mostrar</p>
                    <p className="text-sm mt-1">
                        {mostrarInactivos ? "No hay servicios inactivos." : "No hay servicios activos en este momento."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {serviciosMostrados.map(s => {
                            // Validación robusta
                            const esActivo = s.activo !== false && s.activo !== 0 && s.activo !== "0";
                            
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => verDetalle(s)}
                                    className={`bg-white rounded-xl shadow-sm transition-all overflow-hidden cursor-pointer group border ${
                                        esActivo 
                                            ? "hover:shadow-md hover:border-indigo-300 border-gray-100" 
                                            : "border-gray-200 opacity-70 grayscale-[20%]"
                                    }`}
                                >
                                    {/* Header */}
                                    <div className={`relative p-4 pb-3 border-b border-gray-100 ${esActivo ? 'bg-gradient-to-r from-gray-50 to-white' : 'bg-gray-100'}`}>
                                        
                                        {/* 👇 BADGE DE INACTIVO */}
                                        {!esActivo && (
                                            <div className="absolute top-3 left-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-200 text-gray-600">
                                                    <PowerOff size={10} /> Inactivo
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute top-3 right-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(s.estado)}`}>
                                                {getEstadoIcon(s.estado, 12)}
                                                {s.estado.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className={`flex items-center gap-3 ${!esActivo ? 'mt-5' : ''}`}>
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-indigo-600"
                                                style={{ backgroundColor: getEstadoBg(s.estado) }}
                                            >
                                                {getEstadoIcon(s.estado, 20)}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${esActivo ? 'text-gray-800' : 'text-gray-500 line-through'}`}>
                                                    Servicio #{s.id}
                                                </p>
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
                                    </div>

                                    {/* Footer */}
                                    <div className={`px-4 py-3 border-t border-gray-100 flex justify-between items-center ${esActivo ? 'bg-gray-50' : 'bg-gray-100'}`}>
                                        <span className="inline-flex items-center gap-1.5 font-bold text-indigo-600 text-sm">
                                            <Coins size={14} />
                                            {formatPrice(s.costo || 0)}
                                        </span>
                                        
                                        {/* 👇 ACCIÓN: VER O REACTIVAR */}
                                        {esActivo ? (
                                            <span className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium group-hover:underline">
                                                <Eye size={14} /> Ver <ArrowRight size={14} />
                                            </span>
                                        ) : (
                                            <button
                                                onClick={(e) => handleReactivar(e, s.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition"
                                            >
                                                <Power size={14} /> Reactivar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Paginación */}
                    {serviciosFiltrados.length > 6 && (
                        <div className="flex justify-center mt-8">
                            {hasMore ? (
                                <button
                                    onClick={cargarMas}
                                    className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <ChevronDown size={16} />
                                    Ver más
                                    <span className="text-xs opacity-75">({visibleCount} de {serviciosFiltrados.length})</span>
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