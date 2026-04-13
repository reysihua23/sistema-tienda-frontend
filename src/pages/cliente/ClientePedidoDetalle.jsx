import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pedidoService, detallePedidoService } from "../../services/api";

export default function ClientePedidoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pedido, setPedido] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDetalle();
    }, [id]);

    const cargarDetalle = async () => {
        try {
            const pedidoData = await pedidoService.buscarPorId(id);
            setPedido(pedidoData);
            
            const detallesData = await detallePedidoService.buscarPorPedido(id);
            setDetalles(detallesData);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoColor = (estado) => {
        const colores = {
            PENDIENTE: "#ffc107",
            PAGADO: "#28a745",
            ENVIADO: "#17a2b8",
            ENTREGADO: "#28a745",
            CANCELADO: "#dc3545"
        };
        return colores[estado] || "#6c757d";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Pedido no encontrado</p>
                    <button
                        onClick={() => navigate("/perfil")}
                        className="mt-4 px-6 py-2 bg-[#5b4eff] text-white rounded-lg"
                    >
                        Volver a Mi Perfil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7fe] py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate("/perfil")}
                    className="mb-6 text-[#5b4eff] font-bold hover:underline"
                >
                    ← Volver a Mi Perfil
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#0d0c1e] to-[#1a1930]">
                        <h1 className="text-2xl font-black text-white">Pedido #{pedido.id}</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {new Date(pedido.fecha).toLocaleString()}
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-600">Estado:</span>
                            <span
                                className="px-4 py-2 rounded-full text-sm font-bold text-white"
                                style={{ backgroundColor: getEstadoColor(pedido.estado) }}
                            >
                                {pedido.estado}
                            </span>
                        </div>

                        <h2 className="font-bold text-lg mb-4">Productos</h2>
                        <div className="space-y-3">
                            {detalles.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-bold">{item.producto?.nombre}</p>
                                        <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Precio unitario</p>
                                        <p className="font-bold">S/ {item.precio}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Subtotal</p>
                                        <p className="font-bold text-[#5b4eff]">S/ {item.subtotal}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Total:</span>
                                <span className="text-2xl font-black text-[#5b4eff]">
                                    S/ {pedido.total}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}