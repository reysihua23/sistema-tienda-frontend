// pages/vendedor/components/ListaPedidos.jsx
import React, { useState, useEffect } from "react";
import { pedidoService, detallePedidoService, productoImagenService } from "../../../services/api";

export default function ListaPedidos({ onRefresh }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [imagenesCache, setImagenesCache] = useState({});

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await pedidoService.listar();
            setPedidos(Array.isArray(data) ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : []);
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
            const url = imagenPrincipal?.urlImagen ? `http://localhost:8080${imagenPrincipal.urlImagen}` : null;
            setImagenesCache(prev => ({ ...prev, [productoId]: url }));
            return url;
        } catch (error) {
            return null;
        }
    };

    const verDetalles = async (pedido) => {
        setLoading(true);
        try {
            // Ahora los detalles vienen con DTO sin recursión
            const detalles = await detallePedidoService.buscarPorPedido(pedido.id);
            console.log("Detalles recibidos (DTO):", detalles);
            
            // Cargar imágenes para cada producto
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
    
    const formatDate = (date) => {
        if (!date) return "Fecha no disponible";
        return new Date(date).toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getEstadoColor = (estado) => ({
        "PENDIENTE": "bg-amber-100 text-amber-700",
        "PAGADO": "bg-green-100 text-green-700",
        "ENVIADO": "bg-blue-100 text-blue-700",
        "ENTREGADO": "bg-emerald-100 text-emerald-700",
        "CANCELADO": "bg-red-100 text-red-700"
    }[estado] || "bg-gray-100 text-gray-700");

    const getEstadoIcon = (estado) => ({ 
        "PENDIENTE": "⏳", 
        "PAGADO": "✅", 
        "ENVIADO": "📦", 
        "ENTREGADO": "🎉", 
        "CANCELADO": "❌" 
    }[estado] || "📋");

    if (loading && pedidos.length === 0) {
        return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Pedidos Online</h2>
                <p className="text-sm text-gray-500">Gestiona los pedidos realizados desde la tienda virtual</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                            {pedidos.map(pedido => (
                                <tr key={pedido.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">#{pedido.id}</td>
                                    <td className="px-6 py-4 text-sm">{pedido.clienteNombre || `Cliente #${pedido.clienteId}`}</td>
                                    <td className="px-6 py-4 text-sm">{formatDate(pedido.fecha)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#5b4eff]">{formatPrice(pedido.total)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={pedido.estado}
                                            onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(pedido.estado)} border-0 cursor-pointer`}
                                        >
                                            <option value="PENDIENTE">{getEstadoIcon("PENDIENTE")} PENDIENTE</option>
                                            <option value="PAGADO">{getEstadoIcon("PAGADO")} PAGADO</option>
                                            <option value="ENVIADO">{getEstadoIcon("ENVIADO")} ENVIADO</option>
                                            <option value="ENTREGADO">{getEstadoIcon("ENTREGADO")} ENTREGADO</option>
                                            <option value="CANCELADO">{getEstadoIcon("CANCELADO")} CANCELADO</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => verDetalles(pedido)} className="text-[#5b4eff] hover:underline text-sm font-medium">
                                            Ver detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pedidos.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <span className="text-4xl block mb-2">📦</span>
                        <p>No hay pedidos registrados</p>
                    </div>
                )}
            </div>

            {/* Modal de detalles */}
            {showDetalleModal && selectedPedido && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetalleModal(false)}>
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">Pedido #{selectedPedido.id}</h3>
                                <p className="text-sm text-gray-500 mt-1">{formatDate(selectedPedido.fecha)}</p>
                            </div>
                            <button onClick={() => setShowDetalleModal(false)} className="text-gray-400 hover:text-gray-600 transition text-2xl">✕</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información general */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">Cliente</p>
                                    <p className="font-medium text-gray-800">{selectedPedido.clienteNombre || `Cliente #${selectedPedido.clienteId}`}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">Estado</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getEstadoColor(selectedPedido.estado)}`}>
                                        {getEstadoIcon(selectedPedido.estado)} {selectedPedido.estado}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">Total</p>
                                    <p className="font-bold text-xl text-[#5b4eff]">{formatPrice(selectedPedido.total)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">Productos</p>
                                    <p className="font-medium">{selectedPedido.detalles?.length || 0} Productos</p>
                                </div>
                            </div>

                            {/* Productos */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-lg">📦</span> Productos
                                </h4>
                                <div className="space-y-3">
                                    {selectedPedido.detalles?.map((detalle, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:shadow-md transition">
                                            <img
                                                src={detalle.imagenUrl || "https://placehold.co/60x60?text=Producto"}
                                                alt={detalle.productoNombre}
                                                className="w-16 h-16 object-cover rounded-lg bg-white"
                                                onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Producto"; }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{detalle.productoNombre}</p>
                                                <p className="text-xs text-gray-500">Código: #{detalle.productoId}</p>
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
                                <select
                                    value={selectedPedido.estado}
                                    onChange={(e) => {
                                        cambiarEstado(selectedPedido.id, e.target.value);
                                        setSelectedPedido({ ...selectedPedido, estado: e.target.value });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#5b4eff] focus:outline-none"
                                >
                                    <option value="PENDIENTE">⏳ PENDIENTE</option>
                                    <option value="PAGADO">✅ PAGADO</option>
                                    <option value="ENVIADO">📦 ENVIADO</option>
                                    <option value="ENTREGADO">🎉 ENTREGADO</option>
                                    <option value="CANCELADO">❌ CANCELADO</option>
                                </select>
                                <button
                                    onClick={() => setShowDetalleModal(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}