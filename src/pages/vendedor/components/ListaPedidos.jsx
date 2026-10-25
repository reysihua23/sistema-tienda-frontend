// pages/vendedor/components/ListaPedidos.jsx
import React, { useState, useEffect } from "react";
import {
    Package, User, Calendar, DollarSign, Eye,
    Clock, CheckCircle, Truck, Award, XCircle,
    ShoppingBag, Loader2, X, FileText
} from "lucide-react";
import { pedidoService, detallePedidoService, productoImagenService } from "../../../services/api";
import { buildImageUrl } from "../../../config/apiConfig";

export default function ListaPedidos({ onRefresh }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [imagenesCache, setImagenesCache] = useState({});

    useEffect(() => {
        cargarPedidos();
    }, []);

    // ✅ Cargar SOLO pedidos ONLINE
    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await pedidoService.listar();

            // ✅ FILTRAR SOLO PEDIDOS ONLINE
            const pedidosOnline = Array.isArray(data)
                ? data.filter(p => (p.origen || "").toUpperCase() === "TIENDA_ONLINE")
                : [];

            console.log("🛒 PEDIDOS ONLINE ENCONTRADOS:", pedidosOnline.length);
            setPedidos(pedidosOnline.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        } finally {
            setLoading(false);
        }
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

    const verDetalles = async (pedido) => {
        setLoading(true);
        try {
            const detalles = await detallePedidoService.buscarPorPedido(pedido.id);
            console.log("Detalles recibidos (DTO):", detalles);

            const detallesConImagenes = await Promise.all(detalles.map(async (detalle) => ({
                ...detalle,
                imagenUrl: await cargarImagenProducto(detalle.productoId)
            })));

            setSelectedPedido({ ...pedido, detalles: detallesConImagenes });
            setShowDetalleModal(true);
        } catch (error) {
            console.error("Error cargando detalles:", error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            await pedidoService.cambiarEstado(id, nuevoEstado);
            await cargarPedidos();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Error cambiando estado:", error);
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
            "PENDIENTE": <Clock size={12} />,
            "PAGADO": <CheckCircle size={12} />,
            "ENVIADO": <Truck size={12} />,
            "ENTREGADO": <Award size={12} />,
            "CANCELADO": <XCircle size={12} />
        };
        return icons[estado] || <FileText size={12} />;
    };

    if (loading && pedidos.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-[#5b4eff]" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-xl font-black text-gray-800 tracking-tight">Pedidos Online</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Gestiona los pedidos realizados desde la tienda virtual</p>
            </div>

            {/* ==================== VISTA MÓVIL ==================== */}
            <div className="md:hidden space-y-3">
                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200">
                        <ShoppingBag size={48} className="mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-gray-500">No hay pedidos online registrados</p>
                    </div>
                ) : (
                    pedidos.map(pedido => (
                        <div key={pedido.id} className="bg-white rounded-2xl border-2 border-indigo-300 shadow-sm p-4">
                            {/* Header: PEDIDO + Nº + Estado (badge arriba derecha) */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-0.5">
                                        Pedido
                                    </p>
                                    <p className="text-lg font-black text-gray-900">
                                        Nº {pedido.id}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${getEstadoColor(pedido.estado)}`}>
                                    {getEstadoIcon(pedido.estado)}
                                    {pedido.estado}
                                </span>
                            </div>

                            {/* Cliente + Fecha con iconos */}
                            <div className="space-y-1.5 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <User size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">
                                        {pedido.clienteNombre || `Cliente #${pedido.clienteId}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                    <span>{formatDateShort(pedido.fecha)}</span>
                                </div>
                            </div>

                            {/* Total + Ver Detalles */}
                            <div className="flex items-center justify-between pt-1 gap-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Total</p>
                                    <p className="text-lg font-black text-[#5b4eff]">
                                        {formatPrice(pedido.total)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => verDetalles(pedido)}
                                    className="px-4 py-2.5 bg-[#5b4eff]/10 text-[#5b4eff] rounded-xl text-xs font-black hover:bg-[#5b4eff]/20 transition flex items-center gap-1.5"
                                >
                                    <Eye size={16} />
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ==================== VISTA DESKTOP ==================== */}
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
                            {pedidos.map(pedido => (
                                <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-black text-gray-400">#{pedido.id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{pedido.clienteNombre || `Cliente #${pedido.clienteId}`}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{formatDateLong(pedido.fecha)}</td>
                                    <td className="px-6 py-4 text-sm font-black text-[#5b4eff]">{formatPrice(pedido.total)}</td>
                                    <td className="px-6 py-4">
                                        {/* ✅ AHORA ES SOLO UN BADGE, NO UN SELECT */}
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${getEstadoColor(pedido.estado)}`}>
                                            {getEstadoIcon(pedido.estado)}
                                            {pedido.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => verDetalles(pedido)}
                                            className="text-[#5b4eff] hover:text-[#4a3dcc] text-sm font-bold transition-colors inline-flex items-center gap-1"
                                        >
                                            <Eye size={16} />
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pedidos.length === 0 && (
                    <div className="p-12 text-center text-gray-400 border-t border-gray-100">
                        <ShoppingBag size={48} className="mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-gray-500">No hay pedidos online registrados</p>
                    </div>
                )}
            </div>

            {/* Modal de detalles */}
            {showDetalleModal && selectedPedido && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setShowDetalleModal(false)}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Pedido #{selectedPedido.id}</h3>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">{formatDateLong(selectedPedido.fecha)}</p>
                            </div>
                            <button
                                onClick={() => setShowDetalleModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 sm:p-6 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente</p>
                                    <p className="font-bold text-gray-800 text-sm truncate">{selectedPedido.clienteNombre || `Cliente #${selectedPedido.clienteId}`}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${getEstadoColor(selectedPedido.estado)}`}>
                                        {getEstadoIcon(selectedPedido.estado)} {selectedPedido.estado}
                                    </span>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p>
                                    <p className="font-black text-lg text-[#5b4eff]">{formatPrice(selectedPedido.total)}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Productos</p>
                                    <p className="font-black text-gray-800">{selectedPedido.detalles?.length || 0} und.</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                    <Package size={18} className="text-[#5b4eff]" />
                                    Productos del Pedido
                                </h4>
                                <div className="space-y-3">
                                    {selectedPedido.detalles?.map((detalle, idx) => (
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
                                                <p className="text-xs font-medium text-gray-500">Código: #{detalle.productoId}</p>
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

                            {/* ✅ GESTIÓN DEL ESTADO: Solo aquí se puede cambiar */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Actualizar estado del pedido:</label>
                                    <select
                                        value={selectedPedido.estado}
                                        onChange={(e) => {
                                            const nuevoEstado = e.target.value;
                                            cambiarEstado(selectedPedido.id, nuevoEstado);
                                            setSelectedPedido({ ...selectedPedido, estado: nuevoEstado });
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none cursor-pointer"
                                    >
                                        <option value="PENDIENTE">PENDIENTE</option>
                                        <option value="PAGADO">PAGADO</option>
                                        <option value="ENVIADO">ENVIADO</option>
                                        <option value="ENTREGADO">ENTREGADO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setShowDetalleModal(false)}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}