// pages/vendedor/components/ListaVentasPresencial.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    Store, Eye, Clock, CheckCircle, XCircle,
    User, Calendar, DollarSign, ShoppingBag, Loader2, X,
    ClipboardList, Search, RefreshCw, TrendingUp, Package,
    ChevronDown, ListFilter, Check
} from "lucide-react";
import { pedidoService, detallePedidoService, productoImagenService } from "../../../services/api";
import { buildImageUrl } from "../../../config/apiConfig";

// ✅ Opciones del dropdown de filtros
const FILTRO_OPCIONES = [
    { value: "TODOS",     label: "Todos los estados", icon: ListFilter,   color: "text-gray-500" },
    { value: "PAGADO",    label: "Pagados",           icon: CheckCircle,  color: "text-green-500" },
    { value: "CANCELADO", label: "Cancelados",        icon: XCircle,      color: "text-red-500" },
];

export default function ListaVentasPresencial({ onRefresh }) {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [imagenesCache, setImagenesCache] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");

    // ✅ dropdown custom
    const [showFiltroDropdown, setShowFiltroDropdown] = useState(false);
    const filtroRef = useRef(null);

    // ✅ Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filtroRef.current && !filtroRef.current.contains(event.target)) {
                setShowFiltroDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        cargarVentas();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [ventas, filtroEstado, searchTerm]);

    const cargarVentas = async () => {
        setLoading(true);
        try {
            const data = await pedidoService.listar();

            // ✅ FILTRAR SOLO VENTAS PRESENCIALES
            const ventasPresencial = Array.isArray(data)
                ? data.filter(p => {
                    const origen = (p.origen || "").toUpperCase();
                    return origen === "TIENDA_FISICA" ||
                        origen === "PRESENCIAL" ||
                        origen === "TIENDA" ||
                        origen === "FISICA";
                })
                : [];

            setVentas(ventasPresencial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        } catch (error) {
            console.error("Error cargando ventas presenciales:", error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let filtrados = [...ventas];

        if (filtroEstado !== "TODOS") {
            filtrados = filtrados.filter(p => p.estado === filtroEstado);
        }

        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            filtrados = filtrados.filter(p =>
                p.id.toString().includes(term) ||
                (p.clienteNombre && p.clienteNombre.toLowerCase().includes(term))
            );
        }

        setVentasFiltradas(filtrados);
    };

    const cargarImagenProducto = async (productoId) => {
        if (!productoId) return null;
        if (imagenesCache[productoId]) return imagenesCache[productoId];

        try {
            const imagenes = await productoImagenService.buscarPorProducto(productoId);
            const imagenPrincipal = imagenes?.find(img => img.principal) || imagenes?.[0];
            const url = buildImageUrl(imagenPrincipal?.urlImagen);
            setImagenesCache(prev => ({ ...prev, [productoId]: url }));
            return url;
        } catch (error) {
            return null;
        }
    };

    const verDetalles = async (venta) => {
        setLoading(true);
        try {
            const detalles = await detallePedidoService.buscarPorPedido(venta.id);
            const detallesConImagenes = await Promise.all(detalles.map(async (detalle) => ({
                ...detalle,
                imagenUrl: await cargarImagenProducto(detalle.productoId)
            })));
            setSelectedVenta({ ...venta, detalles: detallesConImagenes });
            setShowDetalleModal(true);
        } catch (error) {
            console.error("Error cargando detalles:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return "S/ 0.00";
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);
    };

    const formatDateLong = (date) => {
        if (!date) return "Fecha no disponible";
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDateShort = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getEstadoColor = (estado) => ({
        "PENDIENTE": "bg-amber-100 text-amber-800 border-amber-200",
        "PAGADO": "bg-green-100 text-green-800 border-green-200",
        "ENVIADO": "bg-blue-100 text-blue-800 border-blue-200",
        "ENTREGADO": "bg-emerald-100 text-emerald-800 border-emerald-200",
        "CANCELADO": "bg-red-100 text-red-800 border-red-200"
    }[estado] || "bg-gray-100 text-gray-700 border-gray-200");

    const getEstadoIcon = (estado) => {
        const icons = {
            "PENDIENTE": <Clock size={14} className="inline" />,
            "PAGADO": <CheckCircle size={14} className="inline" />,
            "CANCELADO": <XCircle size={14} className="inline" />
        };
        return icons[estado] || <Clock size={14} className="inline" />;
    };

    // ✅ Filtro actual (para el dropdown)
    const filtroActual = FILTRO_OPCIONES.find(f => f.value === filtroEstado) || FILTRO_OPCIONES[0];
    const FiltroIcon = filtroActual.icon;

    const resumenEstados = {
        TOTAL: ventas.length,
        PAGADO: ventas.filter(p => p.estado === "PAGADO").length,
        CANCELADO: ventas.filter(p => p.estado === "CANCELADO").length
    };

    const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);

    if (loading && ventas.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[#5b4eff]" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 tracking-tight">
                        <Store size={22} className="text-[#5b4eff]" />
                        Ventas Presenciales
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Historial de ventas realizadas en tienda física</p>
                </div>
            </div>

            {/* Resumen */}
            {ventas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Ventas</p>
                            <p className="text-2xl font-black text-[#5b4eff] truncate">{formatPrice(totalVentas)}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 text-[#5b4eff]">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Completadas</p>
                            <p className="text-2xl font-black text-emerald-600">{resumenEstados.PAGADO}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-500">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Canceladas</p>
                            <p className="text-2xl font-black text-red-600">{resumenEstados.CANCELADO}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-500">
                            <XCircle size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 outline-none transition"
                    />
                </div>

                {/* ✅ Dropdown custom con Lucide */}
                <div className="relative" ref={filtroRef}>
                    <button
                        type="button"
                        onClick={() => setShowFiltroDropdown(!showFiltroDropdown)}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 outline-none flex items-center gap-2 bg-white hover:bg-gray-50 transition min-w-[200px] justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <FiltroIcon size={18} className={filtroActual.color} />
                            <span className="text-gray-700">{filtroActual.label}</span>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${showFiltroDropdown ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showFiltroDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-in fade-in zoom-in-95">
                            {FILTRO_OPCIONES.map(opt => {
                                const Icon = opt.icon;
                                const selected = filtroEstado === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setFiltroEstado(opt.value);
                                            setShowFiltroDropdown(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition ${selected ? 'bg-[#5b4eff]/5 text-[#5b4eff] font-bold' : 'text-gray-700 font-medium'}`}
                                    >
                                        <Icon size={16} className={opt.color} />
                                        <span className="flex-1">{opt.label}</span>
                                        {selected && <Check size={16} className="text-[#5b4eff]" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {(filtroEstado !== "TODOS" || searchTerm) && (
                    <button
                        onClick={() => { setFiltroEstado("TODOS"); setSearchTerm(""); }}
                        className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition flex items-center justify-center gap-1"
                    >
                        <X size={16} /> Limpiar
                    </button>
                )}
            </div>

            {/* ==================== VISTA MÓVIL (TARJETAS) ==================== */}
            <div className="md:hidden space-y-4">
                {ventasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200">
                        <Store size={48} className="mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-gray-500">
                            {ventas.length === 0
                                ? "No hay ventas presenciales registradas"
                                : `No hay ventas que coincidan`}
                        </p>
                    </div>
                ) : (
                    ventasFiltradas.map(venta => (
                        <div key={venta.id} className="bg-white rounded-2xl border-2 border-indigo-300 shadow-sm p-4">
                            {/* Header: VENTA + Nº + Estado */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-0.5">
                                        Venta
                                    </p>
                                    <p className="text-lg font-black text-gray-900">
                                        Nº {venta.id}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${getEstadoColor(venta.estado)}`}>
                                    {getEstadoIcon(venta.estado)}
                                    {venta.estado}
                                </span>
                            </div>

                            {/* Cliente + Fecha */}
                            <div className="space-y-1.5 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <User size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">
                                        {venta.clienteNombre || `Cliente #${venta.clienteId}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                    <span>{formatDateShort(venta.fecha)}</span>
                                </div>
                            </div>

                            {/* Total + Ver detalles */}
                            <div className="flex items-center justify-between pt-1 gap-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Total</p>
                                    <p className="text-lg font-black text-[#5b4eff]">
                                        {formatPrice(venta.total)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => verDetalles(venta)}
                                    className="px-4 py-2.5 text-[#5b4eff] bg-[#5b4eff]/10 rounded-xl hover:bg-[#5b4eff]/20 transition flex items-center gap-1.5 text-xs font-black"
                                >
                                    <Eye size={16} />
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ==================== VISTA DESKTOP (TABLA) ==================== */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ventasFiltradas.map(venta => (
                                <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-black text-gray-400">#{venta.id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                        {venta.clienteNombre || `Cliente #${venta.clienteId}`}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                        {formatDateLong(venta.fecha)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-[#5b4eff]">
                                        {formatPrice(venta.total)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${getEstadoColor(venta.estado)}`}>
                                            {getEstadoIcon(venta.estado)} {venta.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => verDetalles(venta)}
                                            className="text-[#5b4eff] hover:text-[#4a3dcc] text-sm font-bold inline-flex items-center gap-1 transition-colors"
                                        >
                                            <Eye size={16} />
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {ventasFiltradas.length === 0 && (
                    <div className="p-12 text-center text-gray-400 border-t border-gray-100">
                        <Store size={48} className="mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-gray-500">
                            {ventas.length === 0
                                ? "No hay ventas presenciales registradas"
                                : `No hay ventas que coincidan`}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de detalles */}
            {showDetalleModal && selectedVenta && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setShowDetalleModal(false)}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2 text-gray-900">
                                    <ShoppingBag size={22} className="text-[#5b4eff]" />
                                    Venta Nº {selectedVenta.id}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDateLong(selectedVenta.fecha)}
                                </p>
                            </div>
                            <button onClick={() => setShowDetalleModal(false)} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 sm:p-6 space-y-6">
                            {/* Información general */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <User size={12} /> Cliente
                                    </p>
                                    <p className="font-bold text-gray-800 text-sm truncate">{selectedVenta.clienteNombre || `Cliente #${selectedVenta.clienteId}`}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <ClipboardList size={12} /> Estado
                                    </p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${getEstadoColor(selectedVenta.estado)}`}>
                                        {selectedVenta.estado}
                                    </span>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto Total</p>
                                    <p className="font-black text-lg text-[#5b4eff]">{formatPrice(selectedVenta.total)}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <ShoppingBag size={12} /> Productos
                                    </p>
                                    <p className="font-black text-gray-800">{selectedVenta.detalles?.length || 0} und.</p>
                                </div>
                            </div>

                            {/* Productos */}
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                    <Package size={18} className="text-[#5b4eff]" />
                                    Productos de la venta
                                </h4>
                                <div className="space-y-3">
                                    {selectedVenta.detalles?.map((detalle, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                                <img
                                                    src={detalle.imagenUrl || "https://placehold.co/60x60?text=Producto"}
                                                    alt={detalle.productoNombre}
                                                    className="w-full h-full object-contain rounded-md"
                                                    onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Producto"; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-800 text-sm truncate">{detalle.productoNombre}</p>
                                                <p className="text-xs font-medium text-gray-500">Código: {detalle.productoId}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-medium text-gray-500">{formatPrice(detalle.precio)} c/u</p>
                                                <p className="font-black text-[#5b4eff]">{formatPrice(detalle.subtotal)}</p>
                                                <p className="text-[10px] font-bold text-gray-400">Cant: {detalle.cantidad}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowDetalleModal(false)}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}