// pages/admin/components/PedidosList.jsx
import React, { useState } from "react";
import { pedidoService, detallePedidoService, productoImagenService } from "../../../services/api";
import { 
  X, User, Mail, Phone, FileText, Package, Truck, 
  Store, CreditCard, MapPin, Calendar, DollarSign,
  Eye, RefreshCw, CheckCircle, Clock, Send, 
  XCircle, Gift, Image as ImageIcon, ShoppingBag
} from "lucide-react";

// Modal de detalle del pedido
const DetallePedidoModal = ({ pedido, isOpen, onClose }) => {
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagenesCache, setImagenesCache] = useState({});

    React.useEffect(() => {
        if (isOpen && pedido) {
            cargarDetalles();
        }
    }, [isOpen, pedido]);

    const cargarDetalles = async () => {
        setLoading(true);
        try {
            const data = await detallePedidoService.buscarPorPedido(pedido.id);
            const detallesConImagenes = await Promise.all(data.map(async (detalle) => ({
                ...detalle,
                imagenUrl: await cargarImagenProducto(detalle.productoId)
            })));
            setDetalles(detallesConImagenes);
        } catch (error) {
            console.error("Error cargando detalles:", error);
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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoColor = (estado) => {
        const colores = {
            "PENDIENTE": "bg-amber-100 text-amber-700",
            "PAGADO": "bg-green-100 text-green-700",
            "ENVIADO": "bg-blue-100 text-blue-700",
            "ENTREGADO": "bg-emerald-100 text-emerald-700",
            "CANCELADO": "bg-red-100 text-red-700"
        };
        return colores[estado] || "bg-gray-100 text-gray-700";
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            "PENDIENTE": <Clock size={16} className="inline mr-1" />,
            "PAGADO": <CheckCircle size={16} className="inline mr-1" />,
            "ENVIADO": <Send size={16} className="inline mr-1" />,
            "ENTREGADO": <Gift size={16} className="inline mr-1" />,
            "CANCELADO": <XCircle size={16} className="inline mr-1" />
        };
        return icons[estado] || <FileText size={16} className="inline mr-1" />;
    };

    const getOrigenBadge = (origen) => {
        if (origen === "TIENDA_FISICA") {
            return { bg: "bg-purple-100 text-purple-700", icon: <Store size={14} className="inline mr-1" />, label: "Venta Presencial" };
        }
        return { bg: "bg-cyan-100 text-cyan-700", icon: <ShoppingBag size={14} className="inline mr-1" />, label: "Tienda Virtual" };
    };

    if (!isOpen || !pedido) return null;

    const origenBadge = getOrigenBadge(pedido.origen);
    
    // Extraer datos del cliente correctamente
    const clienteNombre = pedido.clienteNombre || pedido.cliente?.nombre || `Cliente #${pedido.clienteId}`;
    const clienteEmail = pedido.clienteEmail || pedido.cliente?.email || "No especificado";
    const clienteTelefono = pedido.clienteTelefono || pedido.cliente?.telefono || "No especificado";
    const clienteDocumento = pedido.clienteDocumento || pedido.cliente?.documento || "No especificado";

    // Verificar si es recogida en tienda (no mostrar sección de envío)
    const esRecogidaTienda = pedido.envio?.metodoEnvio === "RECOJO_EN_TIENDA";
    const esTiendaVirtual = pedido.origen !== "TIENDA_FISICA";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold">Pedido #{pedido.id}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${origenBadge.bg}`}>
                                {origenBadge.icon} {origenBadge.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar size={14} className="inline" /> {formatDate(pedido.fecha)}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información del cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <User size={18} className="text-[#5b4eff]" /> Información del Cliente
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                                <User size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Nombre</p>
                                    <p className="font-medium">{clienteNombre}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Mail size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium">{clienteEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Teléfono</p>
                                    <p className="font-medium">{clienteTelefono}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Documento</p>
                                    <p className="font-medium">{clienteDocumento}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                <DollarSign size={12} /> Total
                            </p>
                            <p className="font-bold text-xl text-[#5b4eff]">{formatPrice(pedido.total)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                <CreditCard size={12} /> Estado
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getEstadoColor(pedido.estado)}`}>
                                {getEstadoIcon(pedido.estado)} {pedido.estado}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                <CreditCard size={12} /> Método de pago
                            </p>
                            <p className="font-medium">{pedido.metodoPago || "No especificado"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                <Package size={12} /> Productos
                            </p>
                            <p className="font-medium">{detalles.length} items</p>
                        </div>
                    </div>

                    {/* Información de envío (solo para tienda virtual y NO es recogida en tienda) */}
                    {esTiendaVirtual && !esRecogidaTienda && pedido.envio && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <Truck size={18} /> Información de Envío a Domicilio
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <Truck size={16} className="text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-600 uppercase">Método de envío</p>
                                        <p className="font-medium text-blue-900">Envío a domicilio</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-600 uppercase">Dirección</p>
                                        <p className="font-medium text-blue-900">{pedido.envio.direccion || "No especificada"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <DollarSign size={16} className="text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-600 uppercase">Costo de envío</p>
                                        <p className="font-medium text-blue-900">{formatPrice(pedido.envio.costoEnvio || 0)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Package size={16} className="text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-blue-600 uppercase">Código de seguimiento</p>
                                        <p className="font-medium text-blue-900">{pedido.envio.codigoSeguimiento || "No disponible"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información de recogida en tienda */}
                    {esTiendaVirtual && esRecogidaTienda && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <Store size={18} /> Información de Recogida en Tienda
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <Store size={16} className="text-green-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-green-600 uppercase">Método de retiro</p>
                                        <p className="font-medium text-green-900">Recojo en tienda</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-green-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-green-600 uppercase">Dirección de tienda</p>
                                        <p className="font-medium text-green-900">Av. Principal 123, Lima - Perú</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Package size={16} className="text-green-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-green-600 uppercase">Código de seguimiento</p>
                                        <p className="font-medium text-green-900">{pedido.envio?.codigoSeguimiento || "No disponible"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información de venta presencial */}
                    {!esTiendaVirtual && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                                <Store size={18} /> Información de Venta Presencial
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <CreditCard size={16} className="text-purple-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-purple-600 uppercase">Método de pago</p>
                                        <p className="font-medium text-purple-900">{pedido.metodoPago || "Efectivo"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Store size={16} className="text-purple-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-purple-600 uppercase">Tipo de venta</p>
                                        <p className="font-medium text-purple-900">Venta en tienda física</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Productos */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Package size={18} /> Productos
                        </h4>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b4eff] mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Cargando productos...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {detalles.map((detalle, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:shadow-md transition">
                                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                            {detalle.imagenUrl ? (
                                                <img
                                                    src={detalle.imagenUrl}
                                                    alt={detalle.productoNombre}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Producto"; }}
                                                />
                                            ) : (
                                                <ImageIcon size={24} className="text-gray-300" />
                                            )}
                                        </div>
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
                                {detalles.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <Package size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No hay productos en este pedido</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PedidosList({ pedidos, onRefresh, showMessage }) {
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleUpdateEstado = async (pedidoId, nuevoEstado) => {
        try {
            await pedidoService.cambiarEstado(pedidoId, nuevoEstado);
            showMessage("success", ` Pedido actualizado a ${nuevoEstado}`);
            onRefresh();
        } catch (error) {
            showMessage("error", " Error al actualizar pedido");
        }
    };

    const handleVerDetalle = (pedido) => {
        setSelectedPedido(pedido);
        setShowDetailModal(true);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getEstadoColor = (estado) => {
        const colores = {
            "PENDIENTE": "bg-amber-100 text-amber-700",
            "PAGADO": "bg-green-100 text-green-700",
            "ENVIADO": "bg-blue-100 text-blue-700",
            "ENTREGADO": "bg-emerald-100 text-emerald-700",
            "CANCELADO": "bg-red-100 text-red-700"
        };
        return colores[estado] || "bg-gray-100 text-gray-700";
    };

    const getOrigenBadge = (origen) => {
        if (origen === "TIENDA_FISICA") {
            return { bg: "bg-purple-100 text-purple-700", icon: <Store size={12} className="inline mr-1" />, label: "Presencial" };
        }
        return { bg: "bg-cyan-100 text-cyan-700", icon: <ShoppingBag size={12} className="inline mr-1" />, label: "Virtual" };
    };

    return (
        <div>
            <DetallePedidoModal
                pedido={selectedPedido}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedPedido(null);
                }}
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestión de Pedidos</h2>
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
                >
                    <RefreshCw size={16} /> Actualizar
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Origen</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pedidos.map((pedido) => {
                            const origenBadge = getOrigenBadge(pedido.origen);
                            const clienteNombre = pedido.clienteNombre || pedido.cliente?.nombre || `Cliente #${pedido.clienteId}`;
                            return (
                                <tr key={pedido.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{pedido.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${origenBadge.bg}`}>
                                            {origenBadge.icon} {origenBadge.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{clienteNombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(pedido.fecha)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#5b4eff]">{formatPrice(pedido.total)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={pedido.estado}
                                            onChange={(e) => handleUpdateEstado(pedido.id, e.target.value)}
                                            className={`px-2 py-1 border rounded-lg text-sm font-medium ${getEstadoColor(pedido.estado)} focus:outline-none focus:border-[#5b4eff]`}
                                        >
                                            <option value="PENDIENTE">Pendiente</option>
                                            <option value="PAGADO">Pagado</option>
                                            <option value="ENVIADO">Enviado</option>
                                            <option value="ENTREGADO">Entregado</option>
                                            <option value="CANCELADO">Cancelado</option>
                                        </select>
                                        
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleVerDetalle(pedido)}
                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1"
                                        >
                                            <Eye size={16} /> Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {pedidos.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl">
                    <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No hay pedidos registrados</p>
                </div>
            )}
        </div>
    );
}