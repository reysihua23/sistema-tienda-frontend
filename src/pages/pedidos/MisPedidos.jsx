// pages/pedidos/MisPedidos.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pedidoService, productoImagenService } from "../../services/api";
import {
  ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock,
  Eye, ChevronDown, ChevronUp, Copy, MapPin, CreditCard,
  Calendar, DollarSign, TrendingUp, Award, Shield,
  Search, Filter, Download, Printer, Star, Heart,
  AlertCircle, ArrowLeft, Loader, ExternalLink, Smartphone
} from "lucide-react";

export default function MisPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPedido, setExpandedPedido] = useState(null);
    const [trackingModal, setTrackingModal] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [imagenesCache, setImagenesCache] = useState({});
    const [filterEstado, setFilterEstado] = useState("todos");

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const usuarioStr = localStorage.getItem("usuario");
            if (!usuarioStr) throw new Error("No hay sesión");

            const usuario = JSON.parse(usuarioStr);
            let clienteId = usuario.clienteId;

            if (!clienteId) {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/api/usuarios/perfil", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const perfil = await response.json();
                clienteId = perfil.id;
                const usuarioActualizado = { ...usuario, clienteId };
                localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            }

            const data = await pedidoService.buscarPorCliente(clienteId);
            setPedidos(Array.isArray(data) ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : []);
            cargarImagenesProductos(data);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    const cargarImagenesProductos = async (pedidosData) => {
        const productosIds = new Set();
        pedidosData.forEach(pedido => {
            pedido.detalles?.forEach(detalle => {
                productosIds.add(detalle.productoId);
            });
        });

        for (const productoId of productosIds) {
            if (!imagenesCache[productoId]) {
                try {
                    const imagenes = await productoImagenService.buscarPorProducto(productoId);
                    const imagenPrincipal = imagenes?.find(img => img.principal) || imagenes?.[0];
                    setImagenesCache(prev => ({
                        ...prev,
                        [productoId]: imagenPrincipal?.urlImagen ? `http://localhost:8080${imagenPrincipal.urlImagen}` : null
                    }));
                } catch (error) {
                    console.error(`Error cargando imagen para producto ${productoId}:`, error);
                }
            }
        }
    };

    const getImagenProducto = (productoId) => {
        return imagenesCache[productoId] || "https://placehold.co/60x60?text=Producto";
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
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

    const getEstadoConfig = (estado) => {
        const estados = {
            "PENDIENTE": {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-l-amber-500",
                icon: Clock,
                iconColor: "text-amber-500",
                label: "Pendiente de pago",
                step: 1
            },
            "PAGADO": {
                bg: "bg-green-50",
                text: "text-green-700",
                border: "border-l-green-500",
                icon: CheckCircle,
                iconColor: "text-green-500",
                label: "Pago confirmado",
                step: 2
            },
            "ENVIADO": {
                bg: "bg-blue-50",
                text: "text-blue-700",
                border: "border-l-blue-500",
                icon: Truck,
                iconColor: "text-blue-500",
                label: "En camino",
                step: 3
            },
            "ENTREGADO": {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-l-emerald-500",
                icon: Award,
                iconColor: "text-emerald-500",
                label: "Entregado",
                step: 4
            },
            "CANCELADO": {
                bg: "bg-red-50",
                text: "text-red-700",
                border: "border-l-red-500",
                icon: XCircle,
                iconColor: "text-red-500",
                label: "Cancelado",
                step: 0
            }
        };
        return estados[estado] || estados["PENDIENTE"];
    };

    const getMetodoEnvioLabel = (metodo) => {
        const metodos = {
            "RECOJO_EN_TIENDA": { icon: Store, label: "Recojo en tienda" },
            "ENVIO_DOMICILIO": { icon: Truck, label: "Envío a domicilio" },
            "ENVIO_EXPRESS": { icon: Zap, label: "Envío express" }
        };
        return metodos[metodo] || { icon: Package, label: metodo };
    };

    const getMetodoPagoLabel = (metodo) => {
        const metodos = {
            "TARJETA": { icon: CreditCard, label: "Tarjeta de crédito" },
            "YAPE": { icon: Smartphone, label: "Yape" },
            "PLIN": { icon: Smartphone, label: "Plin" },
            "TRANSFERENCIA": { icon: DollarSign, label: "Transferencia bancaria" },
            "PAYPAL": { icon: Shield, label: "PayPal" }
        };
        return metodos[metodo] || { icon: DollarSign, label: metodo };
    };

    const pedidosFiltrados = filterEstado === "todos" 
        ? pedidos 
        : pedidos.filter(p => p.estado === filterEstado);

    const cargarMasPedidos = () => {
        setVisibleCount(prev => prev + 3);
    };

    const visiblePedidos = pedidosFiltrados.slice(0, visibleCount);
    const hasMore = visibleCount < pedidosFiltrados.length;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Loader size={48} className="animate-spin text-[#5b4eff] mb-4" />
                <p className="text-slate-500 font-medium">Cargando tus pedidos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-28 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    
                    {/* Estadísticas */}
                    {pedidos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-[#5b4eff]">{pedidos.length}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total pedidos</p>
                                    </div>
                                    <Package size={24} className="text-[#5b4eff]/30" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {pedidos.filter(p => p.estado === "ENTREGADO").length}
                                        </p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Entregados</p>
                                    </div>
                                    <Award size={24} className="text-emerald-600/30" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {pedidos.filter(p => p.estado === "ENVIADO").length}
                                        </p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">En camino</p>
                                    </div>
                                    <Truck size={24} className="text-blue-600/30" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xl font-bold text-[#5b4eff]">
                                            {formatPrice(pedidos.reduce((sum, p) => sum + p.total, 0))}
                                        </p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total gastado</p>
                                    </div>
                                    <TrendingUp size={24} className="text-[#5b4eff]/30" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filtros */}
                    {pedidos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                            <button
                                onClick={() => setFilterEstado("todos")}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterEstado === "todos"
                                    ? "bg-[#5b4eff] text-white shadow-md"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                }`}
                            >
                                Todos
                            </button>
                            {["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"].map(estado => {
                                const count = pedidos.filter(p => p.estado === estado).length;
                                if (count === 0) return null;
                                const config = getEstadoConfig(estado);
                                return (
                                    <button
                                        key={estado}
                                        onClick={() => setFilterEstado(estado)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${filterEstado === estado
                                            ? `${config.bg} ${config.text} shadow-md`
                                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                        }`}
                                    >
                                        <config.icon size={12} />
                                        {config.label} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Lista de pedidos */}
                {pedidosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {pedidos.length === 0 ? "Aún no tienes pedidos" : "No hay pedidos con este filtro"}
                        </h3>
                        <p className="text-slate-500 mb-8">
                            {pedidos.length === 0 
                                ? "¡Explora nuestros productos y realiza tu primera compra!" 
                                : "Prueba con otro filtro para ver más resultados"}
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            <ShoppingBag size={18} />
                            Comenzar a comprar
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {visiblePedidos.map((pedido) => {
                                const estadoConfig = getEstadoConfig(pedido.estado);
                                const EstadoIcon = estadoConfig.icon;
                                const metodoEnvio = getMetodoEnvioLabel(pedido.envio?.metodoEnvio);
                                const MetodoEnvioIcon = metodoEnvio.icon;
                                const metodoPago = getMetodoPagoLabel(pedido.pago?.metodo);
                                const MetodoPagoIcon = metodoPago.icon;
                                const isExpanded = expandedPedido === pedido.id;

                                return (
                                    <div
                                        key={pedido.id}
                                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${estadoConfig.border} overflow-hidden`}
                                    >
                                        {/* Header del pedido */}
                                        <div 
                                            className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors" 
                                            onClick={() => setExpandedPedido(isExpanded ? null : pedido.id)}
                                        >
                                            <div className="flex flex-wrap justify-between items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl ${estadoConfig.bg} flex items-center justify-center`}>
                                                        <EstadoIcon size={24} className={estadoConfig.iconColor} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-slate-800">Pedido #{pedido.id}</p>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text}`}>
                                                                {estadoConfig.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {formatDate(pedido.fecha)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-[#5b4eff]">{formatPrice(pedido.total)}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                        <span>{pedido.detalles?.length || 0} producto(s)</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <MetodoEnvioIcon size={10} />
                                                            {metodoEnvio.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Barra de progreso */}
                                            {estadoConfig.step > 0 && estadoConfig.step <= 4 && (
                                                <div className="mt-4">
                                                    <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-full transition-all duration-700"
                                                            style={{ width: `${(estadoConfig.step / 4) * 100}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between mt-2">
                                                        {[
                                                            { name: "Pedido", step: 1, icon: Package },
                                                            { name: "Pago", step: 2, icon: CreditCard },
                                                            { name: "Envío", step: 3, icon: Truck },
                                                            { name: "Entrega", step: 4, icon: Award }
                                                        ].map((etapa) => (
                                                            <div key={etapa.name} className="text-center">
                                                                <etapa.icon 
                                                                    size={12} 
                                                                    className={estadoConfig.step >= etapa.step ? "text-[#5b4eff]" : "text-slate-300"}
                                                                />
                                                                <span className={`text-xs ml-1 ${estadoConfig.step >= etapa.step ? "text-[#5b4eff]" : "text-slate-400"}`}>
                                                                    {etapa.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Indicador de expansión */}
                                            <div className="flex justify-center mt-3">
                                                {isExpanded ? (
                                                    <ChevronUp size={16} className="text-slate-400" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-slate-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Detalles expandidos */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100 bg-slate-50/50">
                                                <div className="p-5 space-y-4">
                                                    {/* Productos */}
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                                            <Package size={14} className="text-[#5b4eff]" />
                                                            Productos
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {pedido.detalles?.map((detalle, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                                                                    <img
                                                                        src={getImagenProducto(detalle.productoId)}
                                                                        alt={detalle.productoNombre}
                                                                        className="w-14 h-14 object-cover rounded-lg bg-slate-50"
                                                                        onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Producto"; }}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-slate-800 text-sm">{detalle.productoNombre}</p>
                                                                        <p className="text-xs text-slate-400">Cantidad: {detalle.cantidad}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-[#5b4eff] text-sm">{formatPrice(detalle.subtotal)}</p>
                                                                        <p className="text-xs text-slate-400">{formatPrice(detalle.precio)} c/u</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Envío y pago */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                                            <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                                                <Truck size={14} className="text-[#5b4eff]" />
                                                                Información de envío
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500">Método:</span>
                                                                    <span className="font-medium flex items-center gap-1">
                                                                        <MetodoEnvioIcon size={12} /> {metodoEnvio.label}
                                                                    </span>
                                                                </div>
                                                                {pedido.envio?.direccion && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500">Dirección:</span>
                                                                        <span className="font-medium text-right text-sm">{pedido.envio.direccion}</span>
                                                                    </div>
                                                                )}
                                                                {pedido.envio?.costoEnvio > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500">Costo envío:</span>
                                                                        <span className="font-medium">{formatPrice(pedido.envio.costoEnvio)}</span>
                                                                    </div>
                                                                )}
                                                                {pedido.envio?.codigoSeguimiento && (
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-slate-500">Seguimiento:</span>
                                                                        <button
                                                                            onClick={() => setTrackingModal(pedido.envio.codigoSeguimiento)}
                                                                            className="text-[#5b4eff] hover:underline font-mono text-xs flex items-center gap-1"
                                                                        >
                                                                            {pedido.envio.codigoSeguimiento}
                                                                            <ExternalLink size={10} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                                            <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                                                <CreditCard size={14} className="text-[#5b4eff]" />
                                                                Información de pago
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500">Método:</span>
                                                                    <span className="font-medium flex items-center gap-1">
                                                                        <MetodoPagoIcon size={12} /> {metodoPago.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500">Estado:</span>
                                                                    <span className={`font-medium ${pedido.pago?.estado === "APROBADO" ? "text-green-600" : "text-amber-600"}`}>
                                                                        {pedido.pago?.estado === "APROBADO" ? "Aprobado" : "Pendiente"}
                                                                    </span>
                                                                </div>
                                                                {pedido.pago?.referenciaPasarela && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500">Referencia:</span>
                                                                        <span className="font-mono text-xs">{pedido.pago.referenciaPasarela}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Total y acciones */}
                                                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-200">
                                                        <div>
                                                            <p className="text-xs text-slate-400">Total del pedido</p>
                                                            <p className="text-2xl font-bold text-[#5b4eff]">{formatPrice(pedido.total)}</p>
                                                        </div>
                                                        <Link
                                                            to={`/comprobante/${pedido.id}`}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                                                        >
                                                            <Eye size={16} />
                                                            Ver comprobante
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botón "Ver más" */}
                        {hasMore && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={cargarMasPedidos}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#5b4eff] text-[#5b4eff] rounded-xl font-bold text-sm hover:bg-[#5b4eff] hover:text-white transition-all shadow-sm"
                                >
                                    <Eye size={16} />
                                    Ver más pedidos
                                    <ChevronDown size={16} />
                                </button>
                                <p className="text-xs text-slate-400 mt-2">
                                    Mostrando {visiblePedidos.length} de {pedidosFiltrados.length} pedidos
                                </p>
                            </div>
                        )}

                        {/* Mensaje de fin */}
                        {!hasMore && pedidosFiltrados.length > 3 && (
                            <div className="mt-6 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
                                    <Award size={14} className="text-emerald-600" />
                                    <p className="text-sm text-emerald-600 font-medium">
                                        Has visto todos tus {pedidosFiltrados.length} pedidos
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de seguimiento */}
            {trackingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setTrackingModal(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Truck size={20} className="text-[#5b4eff]" />
                                Seguimiento del pedido
                            </h3>
                            <button onClick={() => setTrackingModal(null)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck size={32} className="text-blue-600" />
                            </div>
                            <p className="text-slate-600 text-sm mb-2">Tu pedido está en camino</p>
                            <p className="font-mono text-xs text-[#5b4eff] bg-slate-100 p-2 rounded-lg break-all">{trackingModal}</p>
                            <p className="text-xs text-slate-400 mt-3">Puedes rastrear tu pedido con este código en nuestra página de seguimiento</p>
                        </div>
                        <button
                            onClick={() => setTrackingModal(null)}
                            className="w-full py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-medium text-sm hover:shadow-lg transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componentes auxiliares que faltaban
function Store({ size, className }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

function Zap({ size, className }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}