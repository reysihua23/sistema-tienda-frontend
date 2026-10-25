// pages/tecnico/components/NuevoServicioTecnico.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useServicios } from "../hooks/useServicios";
import NuevoServicio from "./NuevoServicio";
import DetalleServicioHistorial from "./DetalleServicioHistorial";
import { servicioTecnicoService } from "../../../services/api";
import EditarServicio from "./EditarServicio";
import {
    ClipboardList, Wrench, CheckCircle2, PackageCheck,
    FileText, Coins, Activity, Eye, Plus, X, Search, Inbox,
    Trash2, AlertTriangle, CheckCircle, XCircle, Info,
    Power, PowerOff, Filter, RefreshCw, Pencil
} from "lucide-react";

// =====================================================
// Helpers de estado
// =====================================================
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

const getEstadoIcon = (estado, size = 14) => {
    const icons = {
        "RECIBIDO": <ClipboardList size={size} />,
        "EN_REVISION": <Search size={size} />,
        "EN_PROCESO": <Wrench size={size} />,
        "FINALIZADO": <CheckCircle2 size={size} />,
        "ENTREGADO": <PackageCheck size={size} />
    };
    return icons[estado] || <FileText size={size} />;
};

const ESTADOS = ["todos", "RECIBIDO", "EN_REVISION", "EN_PROCESO", "FINALIZADO", "ENTREGADO"];

// =====================================================
// Toast
// =====================================================
const Toast = ({ toast, onClose }) => {
    if (!toast.show) return null;

    const config = {
        success: { bg: "from-emerald-500 to-green-600", icon: <CheckCircle size={20} className="text-white" />, title: "¡Éxito!" },
        error: { bg: "from-red-500 to-rose-600", icon: <XCircle size={20} className="text-white" />, title: "¡Error!" },
        info: { bg: "from-blue-500 to-indigo-600", icon: <Info size={20} className="text-white" />, title: "Información" }
    };
    const c = config[toast.type] || config.info;

    return (
        <div className="fixed top-24 right-4 sm:right-6 z-[200] animate-slide-in max-w-[calc(100vw-2rem)] sm:max-w-md">
            <div className={`rounded-xl shadow-lg p-4 flex items-start gap-3 bg-gradient-to-r ${c.bg} text-white`}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{c.title}</p>
                    <p className="text-xs opacity-90 break-words mt-0.5">{toast.message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition flex-shrink-0 p-1 rounded-lg hover:bg-white/10"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// =====================================================
// Modal de confirmación de desactivación
// =====================================================
const ModalConfirmarEliminar = ({ servicio, onClose, onConfirm, loading }) => {
    if (!servicio) return null;
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200"
            onClick={() => !loading && onClose()}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-red-50/50">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>

                    <h3 className="text-xl font-black text-gray-800 mb-2">
                        ¿Desactivar servicio?
                    </h3>

                    <p className="text-sm font-medium text-gray-500 mb-4 leading-relaxed">
                        El servicio <span className="font-bold text-gray-800">Nº {servicio.id}</span> para el equipo{" "}
                        <span className="font-semibold text-gray-800">"{servicio.equipo || "Sin equipo"}"</span> será desactivado.
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 text-left flex items-start gap-2">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <p>El registro no se borrará. Podrás verlo y reactivarlo marcando <b>"Ver inactivos"</b>.</p>
                    </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-md shadow-red-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Desactivando...
                            </>
                        ) : (
                            <>
                                <PowerOff size={16} />
                                Sí, desactivar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =====================================================
// Componente principal
// =====================================================
export default function NuevoServicioTecnico() {
    const { servicios, loading, error, recargar } = useServicios();

    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModalDetalle, setShowModalDetalle] = useState(false);
    const [showModalNuevo, setShowModalNuevo] = useState(false);
    const [servicioAEliminar, setServicioAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const [busqueda, setBusqueda] = useState("");
    const [busquedaDebounced, setBusquedaDebounced] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [servicioAEditar, setServicioAEditar] = useState(null);
    const [showModalEditar, setShowModalEditar] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setBusquedaDebounced(busqueda), 250);
        return () => clearTimeout(t);
    }, [busqueda]);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" });

    const formatPrice = (price) =>
        new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 })
            .format(price || 0);

    const verDetalle = (s) => {
        setServicioSeleccionado(s);
        setShowModalDetalle(true);
    };

    const confirmarEliminar = async () => {
        if (!servicioAEliminar) return;
        setEliminando(true);
        try {
            await servicioTecnicoService.eliminar(servicioAEliminar.id);
            showToast(`Servicio #${servicioAEliminar.id} desactivado correctamente`, "success");
            setServicioAEliminar(null);
            recargar();
        } catch (err) {
            console.error("Error al eliminar:", err);
            showToast(err?.message || "Error al desactivar el servicio", "error");
        } finally {
            setEliminando(false);
        }
    };

    const handleReactivar = async (id) => {
        try {
            await servicioTecnicoService.actualizar(id, { activo: true });
            showToast(`Servicio #${id} reactivado correctamente`, "success");
            recargar();
        } catch (err) {
            console.error("Error al reactivar:", err);
            showToast("Error al reactivar el servicio", "error");
        }
    };

    const handleEditarSuccess = () => {
        setShowModalEditar(false);
        setServicioAEditar(null);
        recargar();
        showToast("Servicio actualizado correctamente", "success");
    };

    const serviciosFiltrados = useMemo(() => {
        let result = servicios;

        if (!mostrarInactivos) {
            result = result.filter(s => s.activo !== false && s.activo !== 0 && s.activo !== "0");
        }

        if (filtroEstado !== "todos") {
            result = result.filter(s => s.estado === filtroEstado);
        }
        if (busquedaDebounced.trim()) {
            const term = busquedaDebounced.toLowerCase();
            result = result.filter(s =>
                s.equipo?.toLowerCase().includes(term) ||
                s.clienteNombre?.toLowerCase().includes(term) ||
                s.id.toString().includes(term)
            );
        }
        return result;
    }, [servicios, busquedaDebounced, filtroEstado, mostrarInactivos]);

    const totalIngresos = useMemo(() => servicios.reduce((sum, s) => sum + (s.costo || 0), 0), [servicios]);
    const completados = useMemo(() => servicios.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length, [servicios]);

    const hayFiltrosActivos = busquedaDebounced.trim() || filtroEstado !== "todos" || mostrarInactivos;

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroEstado("todos");
        setMostrarInactivos(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center flex flex-col items-center justify-center gap-3">
                <Activity size={20} />
                <span>Error: {error}</span>
                <button
                    onClick={recargar}
                    className="mt-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">
            <Toast toast={toast} onClose={() => setToast({ show: false, message: "", type: "" })} />

            {/* ─── HEADER ─── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Nuevo Servicio Técnico</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Registra y gestiona los servicios del taller</p>
                </div>
                <button
                    onClick={() => setShowModalNuevo(true)}
                    className="px-5 py-3 bg-[#5b4eff] text-white rounded-xl font-bold text-sm hover:bg-[#4a3dcc] shadow-md shadow-[#5b4eff]/20 active:scale-95 transition flex items-center gap-2"
                >
                    <Plus size={18} /> Nuevo Servicio
                </button>
            </div>

            {/* ─── TARJETAS RESUMEN ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Servicios</p>
                        <p className="text-3xl font-black text-gray-800">{servicios.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#5b4eff]">
                        <ClipboardList size={24} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ingresos Totales</p>
                        <p className="text-2xl font-black text-gray-800 truncate">{formatPrice(totalIngresos)}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Coins size={24} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Completados</p>
                        <p className="text-3xl font-black text-gray-800">{completados}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>

            {/* ─── BUSCADOR + FILTROS + LISTA ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por equipo, cliente o ID..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 text-sm font-medium transition"
                        />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                                aria-label="Limpiar búsqueda"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 text-sm font-medium appearance-none cursor-pointer"
                            >
                                {ESTADOS.map(e => (
                                    <option key={e} value={e}>
                                        {e === "todos" ? "Todos los estados" : e.replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition select-none">
                            <input
                                type="checkbox"
                                checked={mostrarInactivos}
                                onChange={(e) => setMostrarInactivos(e.target.checked)}
                                className="w-4 h-4 text-[#5b4eff] rounded border-gray-300 focus:ring-[#5b4eff]"
                            />
                            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Ver inactivos</span>
                        </label>

                        {hayFiltrosActivos && (
                            <button
                                onClick={limpiarFiltros}
                                className="px-3 py-2.5 text-xs font-bold text-[#5b4eff] bg-indigo-50 hover:bg-indigo-100 rounded-xl transition flex items-center gap-1.5"
                            >
                                <X size={14} /> Limpiar
                            </button>
                        )}
                    </div>

                    {hayFiltrosActivos && (
                        <span className="text-xs font-bold text-gray-400 self-end md:self-center md:ml-auto uppercase tracking-wide">
                            {serviciosFiltrados.length} de {servicios.length}
                        </span>
                    )}
                </div>

                {/* Tabla / estados vacíos */}
                {servicios.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Inbox size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-black text-gray-600">No hay servicios registrados</p>
                        <p className="text-sm font-medium">Haz clic en "Nuevo Servicio" para comenzar</p>
                    </div>
                ) : serviciosFiltrados.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Search size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-black text-gray-600">Sin resultados</p>
                        <p className="text-sm font-medium">Prueba con otros términos o limpia los filtros</p>
                        <button
                            onClick={limpiarFiltros}
                            className="mt-4 px-4 py-2 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] transition"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ✅ VISTA ESCRITORIO (Tabla) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Equipo</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Técnico</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Activo</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Costo</th>
                                        <th className="px-4 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {serviciosFiltrados.map((s) => {
                                        const activo = s.activo !== false && s.activo !== 0 && s.activo !== "0";

                                        return (
                                            <tr key={s.id} className={`transition ${activo ? "hover:bg-slate-50" : "bg-gray-50/60 opacity-70 grayscale-[20%]"}`}>
                                                <td className="px-4 py-4 text-sm font-black text-gray-400">#{s.id}</td>
                                                <td className="px-4 py-4">
                                                    <div className="max-w-[150px]">
                                                        <p className={`font-bold text-sm truncate ${activo ? "text-gray-800" : "text-gray-500 line-through"}`}>{s.equipo}</p>
                                                        <p className="text-[10px] font-medium text-gray-500">{formatDate(s.fecha)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{s.clienteNombre}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                                        {s.tecnicoNombre || <span className="text-gray-400 italic">Sin asignar</span>}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${getEstadoColor(s.estado)}`}>
                                                        {getEstadoIcon(s.estado, 10)}
                                                        {s.estado.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${activo ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-gray-200 text-gray-600 border-gray-300"}`}>
                                                        {activo ? <Power size={10} /> : <PowerOff size={10} />}
                                                        {activo ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-black text-gray-700">{formatPrice(s.costo)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button onClick={() => { setServicioAEditar(s); setShowModalEditar(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition" title="Editar servicio">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button onClick={() => verDetalle(s)} className="p-2 text-[#5b4eff] hover:bg-[#5b4eff]/10 rounded-lg transition" title="Ver detalles">
                                                            <Eye size={16} />
                                                        </button>
                                                        {activo ? (
                                                            <button onClick={() => setServicioAEliminar(s)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Desactivar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleReactivar(s.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Reactivar servicio">
                                                                <Power size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ✅ VISTA MÓVIL (Tarjetas Premium) */}
                        <div className="md:hidden space-y-4 p-4 bg-slate-50"> {/* 🔹 Agregamos padding y separación */}
                            {serviciosFiltrados.map((s) => {
                                const activo = s.activo !== false && s.activo !== 0 && s.activo !== "0";
                                return (
                                    <div
                                        key={s.id}
                                        className={`rounded-2xl border-2 p-4 shadow-sm transition-all ${activo
                                                ? "bg-white border-indigo-100" // Tarjeta activa: borde azul
                                                : "bg-gray-50 border-gray-200 opacity-70 grayscale-[20%]" // Inactiva: borde gris
                                            }`}
                                    >
                                        {/* Fila 1: ID, Fecha, Estado */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{s.id}</p>
                                                    <p className="text-[10px] font-medium text-gray-500">{formatDate(s.fecha)}</p>
                                                </div>
                                                <p className={`font-black text-base truncate ${activo ? "text-gray-900" : "text-gray-500 line-through"}`}>
                                                    {s.equipo}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase border ${getEstadoColor(s.estado)}`}>
                                                    {s.estado.replace("_", " ")}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${activo ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-200 text-gray-500 border-gray-300"
                                                    }`}>
                                                    {activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fila 2: Cliente y Técnico (Cápsula) */}
                                        <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cliente</p>
                                                <p className="text-xs font-bold text-gray-800 truncate">{s.clienteNombre}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Técnico</p>
                                                <p className="text-xs font-bold text-gray-800 truncate">{s.tecnicoNombre || "Sin asignar"}</p>
                                            </div>
                                        </div>

                                        {/* Fila 3: Costo y Botones */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Costo</p>
                                                <p className={`text-lg font-black ${activo ? "text-[#5b4eff]" : "text-gray-500"}`}>
                                                    {formatPrice(s.costo)}
                                                </p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setServicioAEditar(s); setShowModalEditar(true); }} className="p-2.5 text-amber-600 bg-amber-50 rounded-xl active:scale-95 transition">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => verDetalle(s)} className="p-2.5 text-[#5b4eff] bg-[#5b4eff]/10 rounded-xl active:scale-95 transition">
                                                    <Eye size={16} />
                                                </button>
                                                {activo ? (
                                                    <button onClick={() => setServicioAEliminar(s)} className="p-2.5 text-red-600 bg-red-50 rounded-xl active:scale-95 transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleReactivar(s.id)} className="p-2.5 text-emerald-600 bg-emerald-50 rounded-xl active:scale-95 transition">
                                                        <Power size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* ─── MODAL NUEVO SERVICIO ─── */}
            {showModalNuevo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95">
                        <button
                            onClick={() => setShowModalNuevo(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        >
                            <X size={18} />
                        </button>
                        <div className="p-6">
                            <NuevoServicio
                                onSuccess={() => {
                                    setShowModalNuevo(false);
                                    recargar();
                                    showToast("Servicio registrado correctamente", "success");
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MODAL EDITAR ─── */}
            {showModalEditar && servicioAEditar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <EditarServicio
                        servicio={servicioAEditar}
                        onSuccess={handleEditarSuccess}
                        onClose={() => {
                            setShowModalEditar(false);
                            setServicioAEditar(null);
                        }}
                    />
                </div>
            )}

            {/* ─── MODAL DETALLE ─── */}
            {showModalDetalle && servicioSeleccionado && (
                <DetalleServicioHistorial
                    servicio={servicioSeleccionado}
                    onClose={() => {
                        setShowModalDetalle(false);
                        setServicioSeleccionado(null);
                    }}
                />
            )}

            {/* ─── MODAL CONFIRMAR DESACTIVAR ─── */}
            <ModalConfirmarEliminar
                servicio={servicioAEliminar}
                loading={eliminando}
                onClose={() => !eliminando && setServicioAEliminar(null)}
                onConfirm={confirmarEliminar}
            />

            {/* ✅ CORRECCIÓN: Se quitó el "jsx" para evitar el error en Vite */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}