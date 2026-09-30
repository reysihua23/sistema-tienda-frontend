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

    // Fecha larga (desktop)
    const formatDateLong = (date) => {
        if (!date) return "Fecha no disponible";
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fecha corta (móvil)
    const formatDateShort = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getEstadoColor = (estado) => ({
        "PENDIENTE": "bg-amber-100 text-amber-700",
        "PAGADO": "bg-green-100 text-green-700",
        "ENVIADO": "bg-blue-100 text-blue-700",
        "ENTREGADO": "bg-emerald-100 text-emerald-700",
        "CANCELADO": "bg-red-100 text-red-700"
    }[estado] || "bg-gray-100 text-gray-700");

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
        <div>
            {/* Header */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Store size={22} className="text-[#5b4eff]" />
                        Ventas Presenciales
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">Historial de ventas realizadas en tienda física</p>
                </div>
                {/*<button
                    onClick={cargarVentas}
                    className="px-4 py-2 bg-[#5b4eff] text-white rounded-lg text-sm font-medium hover:bg-[#4a3dcc] transition flex items-center gap-2 self-start sm:self-auto"
                >
                    <RefreshCw size={16} />
                    Actualizar
                </button>*/}
            </div>

            {/* Resumen */}
            {ventas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Total Ventas</p>
                                <p className="text-xl sm:text-2xl font-bold text-[#5b4eff] truncate">{formatPrice(totalVentas)}</p>
                            </div>
                            <div className="w-10 h-10 bg-[#5b4eff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <TrendingUp size={20} className="text-[#5b4eff]" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Ventas Completadas</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">{resumenEstados.PAGADO}</p>
                            </div>
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle size={20} className="text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Ventas Canceladas</p>
                                <p className="text-xl sm:text-2xl font-bold text-red-600">{resumenEstados.CANCELADO}</p>
                            </div>
                            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <XCircle size={20} className="text-red-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#5b4eff] focus:outline-none"
                    />
                </div>

                {/* ✅ Dropdown custom con Lucide */}
                <div className="relative" ref={filtroRef}>
                    <button
                        type="button"
                        onClick={() => setShowFiltroDropdown(!showFiltroDropdown)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#5b4eff] focus:outline-none flex items-center gap-2 bg-white hover:bg-gray-50 transition min-w-[180px] justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <FiltroIcon size={16} className={filtroActual.color} />
                            <span className="text-gray-700">{filtroActual.label}</span>
                        </div>
                        <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform ${showFiltroDropdown ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showFiltroDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-40 overflow-hidden">
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
                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition ${selected ? 'bg-[#5b4eff]/5 text-[#5b4eff] font-medium' : 'text-gray-700'
                                            }`}
                                    >
                                        <Icon size={16} className={opt.color} />
                                        <span className="flex-1">{opt.label}</span>
                                        {selected && <Check size={14} className="text-[#5b4eff]" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {(filtroEstado !== "TODOS" || searchTerm) && (
                    <button
                        onClick={() => { setFiltroEstado("TODOS"); setSearchTerm(""); }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-1"
                    >
                        <X size={14} /> Limpiar filtros
                    </button>
                )}
            </div>

            {/* ==================== VISTA MÓVIL (TARJETAS) ==================== */}
            <div className="md:hidden space-y-3">
                {ventasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
                        <Store size={48} className="mx-auto mb-2 opacity-50" />
                        <p>
                            {ventas.length === 0
                                ? "No hay ventas presenciales registradas"
                                : `No hay ventas ${filtroEstado !== "TODOS" ? `con estado "${filtroEstado}"` : "que coincidan con la búsqueda"}`}
                        </p>
                    </div>
                ) : (
                    ventasFiltradas.map(venta => (
                        <div
                            key={venta.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                        >
                            {/* Header: VENTA + Nº + Estado */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                        Venta
                                    </p>
                                    <p className="text-base font-black text-gray-800">
                                        Nº {venta.id}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${getEstadoColor(venta.estado)}`}>
                                    {getEstadoIcon(venta.estado)}
                                    {venta.estado}
                                </span>
                            </div>

                            {/* Cliente + Fecha */}
                            <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">
                                        {venta.clienteNombre || `Cliente #${venta.clienteId}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                    <span>{formatDateShort(venta.fecha)}</span>
                                </div>
                            </div>

                            {/* Total + Ver detalles */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                                    <p className="text-base font-black text-[#5b4eff]">
                                        {formatPrice(venta.total)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => verDetalles(venta)}
                                    className="px-3 py-2 text-[#5b4eff] bg-[#5b4eff]/10 rounded-lg hover:bg-[#5b4eff]/20 transition flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <Eye size={14} />
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ==================== VISTA DESKTOP (TABLA ORIGINAL) ==================== */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ventasFiltradas.map(venta => (
                                <tr key={venta.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                        Nº {venta.id}
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            {/*<User size={14} className="text-gray-400 flex-shrink-0" />*/}
                                            <span className="text-gray-700">
                                                {venta.clienteNombre || `Cliente #${venta.clienteId}`}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            {/*<Calendar size={14} className="text-gray-400 flex-shrink-0" />*/}
                                            <span className="text-gray-600">
                                                {formatDateLong(venta.fecha)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm font-bold text-[#5b4eff]">
                                        {formatPrice(venta.total)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(venta.estado)}`}>
                                            {getEstadoIcon(venta.estado)} {venta.estado}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => verDetalles(venta)}
                                            className="text-[#5b4eff] hover:underline text-sm font-medium inline-flex items-center gap-1"
                                        >
                                            <Eye size={14} />
                                            Ver detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {ventasFiltradas.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <Store size={48} className="mx-auto mb-2 opacity-50" />
                        <p>
                            {ventas.length === 0
                                ? "No hay ventas presenciales registradas"
                                : `No hay ventas ${filtroEstado !== "TODOS" ? `con estado "${filtroEstado}"` : "que coincidan con la búsqueda"}`}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de detalles */}
            {showDetalleModal && selectedVenta && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetalleModal(false)}>
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-[#5b4eff]" />
                                    Venta Presencial Nº: {selectedVenta.id}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDateLong(selectedVenta.fecha)}
                                </p>
                            </div>
                            <button onClick={() => setShowDetalleModal(false)} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Información general */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                        <User size={12} /> Cliente
                                    </p>
                                    <p className="font-medium text-gray-800">{selectedVenta.clienteNombre || `Cliente #${selectedVenta.clienteId}`}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                        <ClipboardList size={12} /> Estado
                                    </p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getEstadoColor(selectedVenta.estado)}`}>
                                        {getEstadoIcon(selectedVenta.estado)} {selectedVenta.estado}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                        Monto Total
                                    </p>
                                    <p className="font-bold text-xl text-[#5b4eff]">{formatPrice(selectedVenta.total)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                        <ShoppingBag size={12} /> Productos
                                    </p>
                                    <p className="font-medium">{selectedVenta.detalles?.length || 0} </p>
                                </div>
                            </div>

                            {/* Productos */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Package size={18} className="text-[#5b4eff]" />
                                    Productos
                                </h4>
                                <div className="space-y-3">
                                    {selectedVenta.detalles?.map((detalle, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:shadow-md transition">
                                            <img
                                                src={detalle.imagenUrl || "https://placehold.co/60x60?text=Producto"}
                                                alt={detalle.productoNombre}
                                                className="w-16 h-16 object-cover rounded-lg bg-white"
                                                onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Producto"; }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{detalle.productoNombre}</p>
                                                <p className="text-xs text-gray-500">Código: {detalle.productoId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{formatPrice(detalle.precio)} c/u</p>
                                                <p className="font-bold text-[#5b4eff]">{formatPrice(detalle.subtotal)}</p>
                                                <p className="text-xs text-gray-400">Cantidad: {detalle.cantidad}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setShowDetalleModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition flex items-center justify-center gap-2"
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