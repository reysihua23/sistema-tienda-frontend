// pages/admin/components/PedidosList.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pedidoService, detallePedidoService, productoImagenService } from "../../../services/api";
import { buildImageUrl } from "../../../config/apiConfig";
import {
    X, User, Mail, Phone, FileText, Package, Truck,
    Store, CreditCard, MapPin, Calendar, DollarSign,
    Eye, RefreshCw, CheckCircle, Clock, Send,
    XCircle, Gift, Image as ImageIcon, ShoppingBag,
    Filter, ArrowUpDown, SlidersHorizontal,
    ArrowUp, ArrowDown, Layers, AlertCircle, Circle, Hourglass
} from "lucide-react";

// =====================================================
// Dropdown custom reutilizable con iconos Lucide
// =====================================================
const CustomDropdown = ({ valor, onChange, opciones, iconoPrincipal, ancho = "w-48" }) => {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);
    const opcionActual = opciones.find(o => o.value === valor);

    useEffect(() => {
        const cerrar = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setAbierto(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative flex-1 sm:flex-initial" ref={ref}>
            <button
                type="button"
                onClick={() => setAbierto(!abierto)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 pl-8 pr-8 py-1.5 text-sm border rounded-lg bg-white transition relative ${abierto
                    ? "border-[#5b4eff] ring-2 ring-[#5b4eff]/20"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
            >
                {iconoPrincipal && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {iconoPrincipal}
                    </span>
                )}

                <span className="flex items-center gap-2 min-w-0">
                    <span className={opcionActual?.color || "text-gray-500"}>
                        {opcionActual?.icon}
                    </span>
                    <span className="text-gray-700 truncate">{opcionActual?.label}</span>
                </span>

                <svg
                    className={`w-3 h-3 text-gray-400 absolute right-3 transition-transform flex-shrink-0 ${abierto ? "rotate-180" : ""
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {abierto && (
                <div className={`absolute z-30 mt-1 ${ancho} bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto`}>
                    {opciones.map((op) => (
                        <button
                            key={op.value}
                            type="button"
                            onClick={() => { onChange(op.value); setAbierto(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition text-left ${valor === op.value ? "bg-[#5b4eff]/5 font-medium" : ""
                                }`}
                        >
                            <span className={op.color || "text-gray-500"}>{op.icon}</span>
                            <span className="text-gray-700 flex-1">{op.label}</span>
                            {valor === op.value && (
                                <CheckCircle size={14} className="text-[#5b4eff] flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// =====================================================
// Modal de detalle del pedido (SIN CAMBIOS)
// =====================================================
const DetallePedidoModal = ({ pedido, isOpen, onClose }) => {
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagenesCache, setImagenesCache] = useState({});

    React.useEffect(() => {
        if (isOpen && pedido) cargarDetalles();
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
            const url = buildImageUrl(imagenPrincipal?.urlImagen);
            setImagenesCache(prev => ({ ...prev, [productoId]: url }));
            return url;
        } catch { return null; }
    };

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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
    const clienteNombre = pedido.clienteNombre || pedido.cliente?.nombre || `Cliente #${pedido.clienteId}`;
    const clienteEmail = pedido.clienteEmail || pedido.cliente?.email || "No especificado";
    const clienteTelefono = pedido.clienteTelefono || pedido.cliente?.telefono || "No especificado";
    const clienteDocumento = pedido.clienteDocumento || pedido.cliente?.documento || "No especificado";
    const esRecogidaTienda = pedido.envio?.metodoEnvio === "RECOJO_EN_TIENDA";
    const esTiendaVirtual = pedido.origen !== "TIENDA_FISICA";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100001] p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold">Pedido Nº:{pedido.id}</h3>
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
                    {/* Cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <User size={18} className="text-[#5b4eff]" /> Información del Cliente
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                                <User size={16} className="text-gray-400 mt-0.5" />
                                <div><p className="text-xs text-gray-500">Nombre</p><p className="font-medium">{clienteNombre}</p></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Mail size={16} className="text-gray-400 mt-0.5" />
                                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{clienteEmail}</p></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone size={16} className="text-gray-400 mt-0.5" />
                                <div><p className="text-xs text-gray-500">Teléfono</p><p className="font-medium">{clienteTelefono}</p></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText size={16} className="text-gray-400 mt-0.5" />
                                <div><p className="text-xs text-gray-500">Documento</p><p className="font-medium">{clienteDocumento}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1"><DollarSign size={12} /> Total</p>
                            <p className="font-bold text-xl text-[#5b4eff]">{formatPrice(pedido.total)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1"><CreditCard size={12} /> Estado</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getEstadoColor(pedido.estado)}`}>
                                {getEstadoIcon(pedido.estado)} {pedido.estado}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1"><CreditCard size={12} /> Método de pago</p>
                            <p className="font-medium">{pedido.metodoPago || "No especificado"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1"><Package size={12} /> Productos</p>
                            <p className="font-medium">{detalles.length}</p>
                        </div>
                    </div>

                    {/* Envío */}
                    {esTiendaVirtual && !esRecogidaTienda && pedido.envio && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><Truck size={18} /> Información de Envío a Domicilio</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2"><Truck size={16} className="text-blue-400 mt-0.5" /><div><p className="text-xs text-blue-600 uppercase">Método</p><p className="font-medium text-blue-900">Envío a domicilio</p></div></div>
                                <div className="flex items-start gap-2"><MapPin size={16} className="text-blue-400 mt-0.5" /><div><p className="text-xs text-blue-600 uppercase">Dirección</p><p className="font-medium text-blue-900">{pedido.envio.direccion || "No especificada"}</p></div></div>
                                <div className="flex items-start gap-2"><DollarSign size={16} className="text-blue-400 mt-0.5" /><div><p className="text-xs text-blue-600 uppercase">Costo de envío</p><p className="font-medium text-blue-900">{formatPrice(pedido.envio.costoEnvio || 0)}</p></div></div>
                                <div className="flex items-start gap-2"><Package size={16} className="text-blue-400 mt-0.5" /><div><p className="text-xs text-blue-600 uppercase">Tracking</p><p className="font-medium text-blue-900">{pedido.envio.codigoSeguimiento || "No disponible"}</p></div></div>
                            </div>
                        </div>
                    )}

                    {/* Recogida */}
                    {esTiendaVirtual && esRecogidaTienda && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Store size={18} /> Información de Recogida en Tienda</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2"><Store size={16} className="text-green-400 mt-0.5" /><div><p className="text-xs text-green-600 uppercase">Método</p><p className="font-medium text-green-900">Recojo en tienda</p></div></div>
                                <div className="flex items-start gap-2"><MapPin size={16} className="text-green-400 mt-0.5" /><div><p className="text-xs text-green-600 uppercase">Dirección</p><p className="font-medium text-green-900">Amazonas, Písac 08106- Cusco - Perú</p></div></div>
                                <div className="flex items-start gap-2"><Package size={16} className="text-green-400 mt-0.5" /><div><p className="text-xs text-green-600 uppercase">Tracking</p><p className="font-medium text-green-900">{pedido.envio?.codigoSeguimiento || "No disponible"}</p></div></div>
                            </div>
                        </div>
                    )}

                    {/* Presencial */}
                    {!esTiendaVirtual && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><Store size={18} /> Información de Venta Presencial</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-2"><CreditCard size={16} className="text-purple-400 mt-0.5" /><div><p className="text-xs text-purple-600 uppercase">Método de pago</p><p className="font-medium text-purple-900">{pedido.metodoPago || "Efectivo"}</p></div></div>
                                <div className="flex items-start gap-2"><Store size={16} className="text-purple-400 mt-0.5" /><div><p className="text-xs text-purple-600 uppercase">Tipo</p><p className="font-medium text-purple-900">Venta en tienda física</p></div></div>
                            </div>
                        </div>
                    )}

                    {/* Productos */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Package size={18} /> Productos</h4>
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
                                                <img src={detalle.imagenUrl} alt={detalle.productoNombre} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Producto"; }} />
                                            ) : (
                                                <ImageIcon size={24} className="text-gray-300" />
                                            )}
                                        </div>
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

// =====================================================
// Componente principal
// =====================================================
export default function PedidosList({ pedidos, onRefresh, showMessage }) {
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // 🎯 Estados para filtros/orden
    const [filtro, setFiltro] = useState("todos");
    const [orden, setOrden] = useState("id-asc");

    const rowRefs = useRef({});
    const location = useLocation();
    const navigate = useNavigate();

    // 🎯 Opciones del dropdown de FILTRO
    const opcionesFiltro = [
        { value: "todos", label: "Todos", icon: <Layers size={14} />, color: "text-gray-500" },
        { value: "pendiente", label: "Pendientes", icon: <Clock size={14} />, color: "text-amber-500" },
        { value: "pagado", label: "Pagados", icon: <CheckCircle size={14} />, color: "text-green-500" },
        { value: "enviado", label: "Enviados", icon: <Send size={14} />, color: "text-blue-500" },
        { value: "entregado", label: "Entregados", icon: <Gift size={14} />, color: "text-emerald-500" },
        { value: "cancelado", label: "Cancelados", icon: <XCircle size={14} />, color: "text-red-500" },
    ];

    // 🎯 Opciones del dropdown de ORDEN
    const opcionesOrden = [
        { value: "id-asc", label: "ID ↑", icon: <ArrowUp size={14} />, color: "text-gray-500" },
        { value: "id-desc", label: "ID ↓", icon: <ArrowDown size={14} />, color: "text-gray-500" },
        { value: "fecha-desc", label: "Más recientes", icon: <Clock size={14} />, color: "text-[#5b4eff]" },
        { value: "monto-desc", label: "Mayor monto", icon: <DollarSign size={14} />, color: "text-emerald-500" },
    ];

    // 🎯 Efecto del highlight al venir desde notif
    // 🎯 Efecto del highlight al venir desde notif
    // Si el pedido no está en la lista (race condition con WebSocket),
    // recarga automáticamente hasta 3 veces antes de mostrar error.
    useEffect(() => {
        const { highlightId, openDetailModal } = location.state || {};
        if (!highlightId) return;
        if (!pedidos || pedidos.length === 0) return;

        const pedido = pedidos.find(p => p.id === highlightId);

        if (!pedido) {
            // 🎯 El pedido no está en la lista actual.
            // Puede ser una race condition: la notificación llegó
            // antes de que se recargara la lista de pedidos.
            // Estrategia: recargar la lista y reintentar (máx 3 veces).
            const intentos = (window.__highlightRetries = (window.__highlightRetries || 0) + 1);

            if (intentos <= 3) {
                console.log(`⚠️ Pedido #${highlightId} no está en la lista. Recargando... (intento ${intentos}/3)`);
                if (onRefresh) {
                    onRefresh();   // ← recarga la lista desde el padre
                }
                return;   // ← NO muestra error, solo recarga
            }

            // Después de 3 intentos, sí mostrar error
            console.warn(`❌ Pedido #${highlightId} no encontrado tras 3 intentos`);
            showMessage?.("warning", "El pedido ya no existe");
            navigate(location.pathname, { replace: true, state: {} });
            window.__highlightRetries = 0;   // reset
            return;
        }

        // ✅ Pedido encontrado: resetear contador de intentos
        window.__highlightRetries = 0;

        const row = rowRefs.current[highlightId];
        if (!row) return;

        const pedidoCapturado = pedido;

        // Scroll al centro
        const rowTop = row.getBoundingClientRect().top + window.pageYOffset;
        const offset = window.innerHeight / 2 - row.offsetHeight / 2;
        window.scrollTo({ top: rowTop - offset, behavior: "smooth" });

        // Highlight azul con pulso
        const celdas = row.querySelectorAll("td");
        const pintar = (color, sombra) => {
            row.style.transition = "background-color 0.3s ease, box-shadow 0.3s ease";
            row.style.backgroundColor = color;
            row.style.boxShadow = sombra;
            celdas.forEach(td => {
                td.style.transition = "background-color 0.3s ease";
                td.style.backgroundColor = color;
            });
        };

        pintar("#0a64fa", "inset 0 0 0 2px #5b4eff");

        let contador = 0;
        const intervalo = setInterval(() => {
            contador++;
            if (contador % 2 === 0) {
                pintar("#0a64fa", "inset 0 0 0 2px #4a3dcc");
            } else {
                pintar("#0a64fa", "inset 0 0 0 2px #5b4eff");
            }
        }, 500);

        setTimeout(() => {
            clearInterval(intervalo);
            row.style.backgroundColor = "";
            row.style.boxShadow = "";
            row.style.transition = "background-color 0.5s ease";
            celdas.forEach(td => {
                td.style.backgroundColor = "";
                td.style.transition = "background-color 0.5s ease";
            });
        }, 2500);

        navigate(location.pathname, { replace: true, state: {} });

        if (openDetailModal) {
            setTimeout(() => {
                setSelectedPedido(pedidoCapturado);
                setShowDetailModal(true);
            }, 1800);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, pedidos]);

    // 🎯 Aplicar filtros + orden
    const pedidosFiltrados = useMemo(() => {
        let lista = [...(pedidos || [])];

        // 1. Filtro por estado
        if (filtro !== "todos") {
            lista = lista.filter(p => (p.estado || "").toLowerCase() === filtro);
        }

        // 2. Ordenamiento
        lista.sort((a, b) => {
            if (orden === "id-asc") return a.id - b.id;
            if (orden === "id-desc") return b.id - a.id;
            if (orden === "fecha-desc") return new Date(b.fecha) - new Date(a.fecha);
            if (orden === "monto-desc") return (b.total || 0) - (a.total || 0);
            return 0;
        });

        return lista;
    }, [pedidos, filtro, orden]);

    const handleUpdateEstado = async (pedidoId, nuevoEstado) => {
        try {
            await pedidoService.cambiarEstado(pedidoId, nuevoEstado);
            showMessage("success", `Pedido actualizado a ${nuevoEstado}`);
            onRefresh();
        } catch (error) {
            showMessage("error", "Error al actualizar pedido");
        }
    };

    const handleVerDetalle = (pedido) => {
        setSelectedPedido(pedido);
        setShowDetailModal(true);
    };

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });

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

            {/* ─────────── HEADER CON 3 PANELES COMPACTOS ─────────── */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-2 lg:gap-3 mb-4">

                {/* PANEL 1: Título + subtítulo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3 flex-shrink-0 flex flex-col justify-center min-h-[64px]">
                    <h2 className="text-base font-bold text-gray-800 leading-tight">Gestión de Pedidos</h2>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">Administra y gestiona los pedidos</p>
                </div>

                {/* PANEL 2: Controles */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex flex-col sm:flex-row gap-2 flex-shrink-0 items-center min-h-[64px]">
                    <CustomDropdown
                        valor={filtro}
                        onChange={setFiltro}
                        opciones={opcionesFiltro}
                        iconoPrincipal={<Filter size={13} />}
                        ancho="w-full sm:w-48"
                    />

                    <CustomDropdown
                        valor={orden}
                        onChange={setOrden}
                        opciones={opcionesOrden}
                        iconoPrincipal={<ArrowUpDown size={13} />}
                        ancho="w-full sm:w-52"
                    />

                    <div className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-md whitespace-nowrap h-[34px]">
                        <SlidersHorizontal size={11} className="mr-1" />
                        {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? "pedido" : "pedidos"}
                    </div>
                </div>

                {/* ESPACIADOR FLEXIBLE */}
                <div className="hidden lg:block flex-1" />

                {/* PANEL 3: Leyenda */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-3 flex-shrink-0 flex items-center min-h-[64px]">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">Pendiente</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Enviado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-gray-600">Entregado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                            <span className="text-gray-600">Cancelado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────── TABLA ─────────── */}
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Nº</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Origen</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pedidosFiltrados.map((pedido) => {
                                const origenBadge = getOrigenBadge(pedido.origen);
                                const clienteNombre = pedido.clienteNombre || pedido.cliente?.nombre || `Cliente #${pedido.clienteId}`;
                                return (
                                    <tr
                                        key={pedido.id}
                                        ref={el => rowRefs.current[pedido.id] = el}
                                        className="hover:bg-gray-50 transition group"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{pedido.id}</td>
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

                {pedidosFiltrados.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">
                            {pedidos.length === 0
                                ? "No hay pedidos registrados"
                                : "No se encontraron pedidos con estos filtros"}
                        </p>
                        {pedidos.length > 0 && (
                            <button
                                onClick={() => { setFiltro("todos"); setOrden("id-asc"); }}
                                className="mt-3 text-sm text-[#5b4eff] hover:underline font-medium"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}