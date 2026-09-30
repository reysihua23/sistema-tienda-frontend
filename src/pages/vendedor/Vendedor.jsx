// pages/vendedor/Vendedor.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LogOut, Store, ShoppingBag,
    Package, TrendingUp, AlertTriangle,
    User, Calendar, CircleOff, FileText,
    RefreshCw, CheckCircle, AlertCircle, X
} from "lucide-react";

import { authService, pedidoService, productoService, clienteService, productoImagenService } from "../../services/api";
import { buildImageUrl } from "../../config/apiConfig";
import VentasPresencial from "./components/VentasPresencial";
import ListaPedidos from "./components/ListaPedidos";
import ListaVentasPresencial from "./components/ListaVentasPresencial";
import NotificationBell from "../../components/NotificationBell";
import Reclamos from "../../components/reclamos/Reclamos";

export default function Vendedor({ childrenOverride }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("ventas");
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: "", email: "", telefono: "", documento: "", direccion: ""
    });

    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [imagenesCache, setImagenesCache] = useState({});
    const [stats, setStats] = useState({
        ventasHoy: 0,
        ventasTotales: 0,
        pedidosPendientes: 0,
        productosStockBajo: 0,
        productosAgotados: 0
    });

    const [ventaActual, setVentaActual] = useState(null);

    const [message, setMessage] = useState({ type: "", text: "" });
    const [refreshKey, setRefreshKey] = useState(0);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (location.state?.tab) setActiveTab(location.state.tab);
    }, [location.state]);

    useEffect(() => {
        const usuario = authService.getCurrentUser();
        if (!usuario || (usuario.rol !== "VENTAS" && usuario.rol !== "ADMIN")) {
            navigate("/login");
            return;
        }
        setUser(usuario);
        if (!childrenOverride && !initialLoadDone.current) {
            initialLoadDone.current = true;
            cargarDatosIniciales();
        }
    }, [childrenOverride]);

    const nombreCorto = useMemo(() => {
        if (!user) return 'Vendedor';

        if (user.nombre && user.nombre.trim()) {
            const primerNombre = user.nombre.trim().split(' ')[0];
            return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
        }

        if (user.correo) {
            const parte = user.correo.split('@')[0];
            return parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase();
        }

        return 'Vendedor';
    }, [user]);

    const cargarDatosIniciales = async () => {
        setLoading(true);
        try {
            await Promise.all([cargarProductos(), cargarClientes(), cargarEstadisticas()]);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const cargarProductos = async () => {
        try {
            const data = await productoService.listar();
            const productosActivos = data.filter(p => p.activo);
            setProductos(productosActivos);
            cargarImagenesProductos(productosActivos);
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    };

    const cargarImagenesProductos = async (productosLista) => {
        for (const producto of productosLista) {
            if (!imagenesCache[producto.id]) {
                try {
                    const imagenes = await productoImagenService.buscarPorProducto(producto.id);
                    const imagenPrincipal = imagenes?.find(img => img.principal) || imagenes?.[0];
                    setImagenesCache(prev => ({
                        ...prev,
                        [producto.id]: buildImageUrl(imagenPrincipal?.urlImagen)
                    }));
                } catch (error) {
                    console.error(`Error cargando imagen para producto ${producto.id}:`, error);
                }
            }
        }
    };

    const cargarClientes = async () => {
        try {
            const data = await clienteService.listar();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando clientes:", error);
            setClientes([]);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const pedidosData = await pedidoService.listar();
            const pedidos = Array.isArray(pedidosData) ? pedidosData : [];
            const hoy = new Date().toDateString();

            const ventasHoy = pedidos
                .filter(p => new Date(p.fecha).toDateString() === hoy && p.estado === "PAGADO")
                .reduce((sum, p) => sum + (p.total || 0), 0);

            const ventasTotales = pedidos
                .filter(p => p.estado === "PAGADO" || p.estado === "ENTREGADO")
                .reduce((sum, p) => sum + (p.total || 0), 0);

            const pendientes = pedidos
                .filter(p => p.estado === "PENDIENTE" || p.estado === "PAGADO").length;

            const productosActualizados = await productoService.listar();
            const productosActivos = productosActualizados.filter(p => p.activo);

            const productosBajo = productosActivos.filter(p => {
                const stock = p.stock || 0;
                const minimo = p.stockMinimo || 5;
                return stock <= minimo && stock > 0;
            }).length;

            const productosAgotados = productosActivos.filter(p => (p.stock || 0) === 0).length;

            setStats({
                ventasHoy, ventasTotales,
                pedidosPendientes: pendientes,
                productosStockBajo: productosBajo,
                productosAgotados
            });

            setProductos(productosActivos);
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        }
    };

    const agregarAlCarrito = (producto) => {
        setCarrito(prev => {
            const existe = prev.find(item => item.id === producto.id);
            if (existe) {
                if (existe.cantidad + 1 > producto.stock) {
                    setError(`Stock insuficiente para ${producto.nombre}`);
                    return prev;
                }
                return prev.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
                        : item
                );
            }
            if (1 > producto.stock) {
                setError(`Stock insuficiente para ${producto.nombre}`);
                return prev;
            }
            setError(null);
            return [...prev, {
                ...producto,
                imagenUrl: imagenesCache[producto.id],
                cantidad: 1,
                subtotal: producto.precio
            }];
        });
    };

    const actualizarCantidad = (id, nuevaCantidad) => {
        const producto = productos.find(p => p.id === id);
        if (nuevaCantidad > producto.stock) {
            setError(`Stock insuficiente. Solo hay ${producto.stock} unidades.`);
            return;
        }
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id);
            return;
        }
        setCarrito(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
                    : item
            )
        );
        setError(null);
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(prev => prev.filter(item => item.id !== id));
    };

    const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);

    const crearCliente = async () => {
        if (!nuevoCliente.nombre.trim()) throw new Error("El nombre completo es obligatorio");
        try {
            const response = await clienteService.crear(nuevoCliente);
            setClientes(prev => [...prev, response]);
            setSelectedCliente(response);
            setShowClienteModal(false);
            setNuevoCliente({ nombre: "", email: "", telefono: "", documento: "", direccion: "" });
            setSuccess("Cliente creado exitosamente");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            let errorMessage = "Error al crear el cliente";
            if (error.response?.data?.error) errorMessage = error.response.data.error;
            else if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.message) errorMessage = error.message;
            throw new Error(errorMessage);
        }
    };

    const realizarVenta = async () => {
        if (!selectedCliente) { setError("Debes seleccionar o crear un cliente"); return; }
        if (carrito.length === 0) { setError("Agrega productos al carrito"); return; }
        setLoading(true);
        setError(null);
        try {
            for (const item of carrito) {
                const productoActual = productos.find(p => p.id === item.id);
                if (!productoActual || productoActual.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${productoActual?.stock || 0}`);
                }
            }

            const pedidoData = {
                clienteId: selectedCliente.id,
                total: totalVenta,
                estado: "PAGADO",
                metodoPago,
                origen: "TIENDA_FISICA",
                metodoEnvio: "RECOJO_EN_TIENDA",
                productos: carrito.map(item => ({
                    productoId: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio
                }))
            };

            const response = await pedidoService.crear(pedidoData);

            setVentaActual({
                pedidoId: response.pedidoId,
                comprobanteId: response.comprobanteId,
                total: response.total,
                metodoPago,
                clienteNombre: selectedCliente.nombre,
                numeroComprobante: response.numeroComprobante,
                codigoSeguimiento: response.codigoSeguimiento,
                fecha: response.fecha,
                estado: response.estado
            });

            if (response?.comprobanteId) {
                navigate(`/comprobante/${response.comprobanteId}`, {
                    state: {
                        comprobanteId: response.comprobanteId,
                        pedidoId: response.pedidoId,
                        numeroComprobante: response.numeroComprobante,
                        total: response.total,
                        subtotal: response.subtotal,
                        igv: response.igv,
                        costoEnvio: response.costoEnvio,
                        fecha: response.fecha,
                        estado: response.estado,
                        codigoSeguimiento: response.codigoSeguimiento,
                        clienteNombre: selectedCliente.nombre || 'Cliente',
                        clienteDocumento: selectedCliente.documento || 'Sin documento',
                        clienteTelefono: selectedCliente.telefono || 'No especificado',
                        clienteDireccion: selectedCliente.direccion || 'No especificada',
                        clienteEmail: selectedCliente.email || 'No especificado',
                        metodoPago,
                        fromVentas: true,
                        productos: carrito.map(item => ({
                            productoNombre: item.nombre,
                            cantidad: item.cantidad,
                            precioUnitario: item.precio,
                            totalItem: item.cantidad * item.precio
                        }))
                    }
                });
            }

            setCarrito([]);
            setSelectedCliente(null);
            setSuccess("✅ Venta realizada exitosamente");
            await Promise.all([cargarProductos(), cargarEstadisticas()]);
            return { success: true, venta: response };
        } catch (error) {
            console.error("Error al realizar la venta:", error);
            setError(error.message || "Error al realizar la venta");
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleRefresh = async () => {
        await cargarDatosIniciales();
        setRefreshKey(prev => prev + 1);
        showMessage("success", "Datos actualizados correctamente");
    };

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    if (!user) return null;

    const productosFiltrados = productos
        .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aAgotado = (a.stock || 0) === 0;
            const bAgotado = (b.stock || 0) === 0;
            if (aAgotado && !bAgotado) return 1;
            if (!aAgotado && bAgotado) return -1;
            return 0;
        });

    const statCards = [
        {
            label: "Ventas totales",
            value: formatPrice(stats.ventasTotales),
            icon: TrendingUp,
            color: "text-[#5b4eff]",
            bg: "bg-[#5b4eff]/10"
        },
        {
            label: "Ventas de hoy",
            value: formatPrice(stats.ventasHoy),
            icon: Calendar,
            color: "text-[#5b4eff]",
            bg: "bg-[#5b4eff]/10"
        },
        {
            label: "Pedidos pendientes",
            value: stats.pedidosPendientes,
            icon: Package,
            color: "text-amber-600",
            bg: "bg-amber-500/10"
        },
        {
            label: "Stock bajo",
            value: stats.productosStockBajo,
            icon: AlertTriangle,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            label: "Productos agotados",
            value: stats.productosAgotados || 0,
            icon: CircleOff,
            color: "text-red-500",
            bg: "bg-red-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-24 lg:pb-0">
            {/* HEADER */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                        <div className="hidden sm:flex w-10 h-10 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-xl items-center justify-center shadow-md flex-shrink-0">
                            <Store size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-black text-[#0d0c1e] truncate">
                                Panel de Vendedor
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                                Gestiona ventas presenciales y pedidos online
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <NotificationBell />

                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-400 hover:text-[#5b4eff] hover:bg-gray-100 rounded-lg transition-all"
                            title="Actualizar datos"
                        >
                            <RefreshCw size={18} />
                        </button>

                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                    {user?.nombre?.substring(0, 2).toUpperCase() ||
                                        user?.correo?.substring(0, 2).toUpperCase() ||
                                        'VD'}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                                    {nombreCorto}
                                </p>
                                <p className="text-xs text-gray-400">Vendedor</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 active:scale-95 transition-all"
                            aria-label="Cerrar sesión"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-10 overflow-x-auto">
                <div className="max-w-7xl mx-auto px-2 sm:px-6">
                    <div className="flex gap-1 whitespace-nowrap">
                        <button
                            onClick={() => setActiveTab("ventas")}
                            className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${activeTab === "ventas"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <ShoppingBag size={16} />
                            <span className="hidden sm:inline">Venta Presencial</span>
                            <span className="sm:hidden">Venta</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("pedidos")}
                            className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${activeTab === "pedidos"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Package size={16} />
                            <span className="hidden sm:inline">Pedidos Online</span>
                            <span className="sm:hidden">Pedidos</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("reclamos")}
                            className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${activeTab === "reclamos"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <FileText size={16} />
                            Reclamos
                        </button>
                        <button
                            onClick={() => setActiveTab("historial")}
                            className={`px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${activeTab === "historial"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Store size={16} />
                            <span className="hidden sm:inline">Ventas Presenciales</span>
                            <span className="sm:hidden">Historial</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                {childrenOverride ? (
                    childrenOverride
                ) : (
                    <>
                        {activeTab === "ventas" && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6">
                                {statCards.map((card, idx) => {
                                    const Icon = card.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 min-w-0"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                                                        {card.label}
                                                    </p>
                                                    <p className={`text-base sm:text-xl lg:text-2xl font-bold truncate ${card.color}`}>
                                                        {card.value}
                                                    </p>
                                                </div>
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${card.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                    <Icon size={16} className={card.color} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === "ventas" && (
                            <VentasPresencial
                                productos={productosFiltrados}
                                carrito={carrito}
                                selectedCliente={selectedCliente}
                                setSelectedCliente={setSelectedCliente}
                                clientes={clientes}
                                metodoPago={metodoPago}
                                setMetodoPago={setMetodoPago}
                                loading={loading}
                                error={error}
                                success={success}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                agregarAlCarrito={agregarAlCarrito}
                                actualizarCantidad={actualizarCantidad}
                                eliminarDelCarrito={eliminarDelCarrito}
                                realizarVenta={realizarVenta}
                                showClienteModal={showClienteModal}
                                setShowClienteModal={setShowClienteModal}
                                nuevoCliente={nuevoCliente}
                                setNuevoCliente={setNuevoCliente}
                                crearCliente={crearCliente}
                                totalVenta={totalVenta}
                                formatPrice={formatPrice}
                                imagenesCache={imagenesCache}
                                
                            />
                        )}

                        {activeTab === "pedidos" && (
                            <ListaPedidos
                                key={`pedidos-${refreshKey}`}
                                onRefresh={cargarEstadisticas}
                            />
                        )}
                        {activeTab === "reclamos" && (
                            <Reclamos
                                key={`reclamos-${refreshKey}`}
                                onRefresh={cargarEstadisticas}
                            />
                        )}
                        {activeTab === "historial" && (
                            <ListaVentasPresencial
                                key={`historial-${refreshKey}`}
                                onRefresh={cargarEstadisticas}
                            />
                        )}
                    </>
                )}
            </div>

            {/* 👇 TOAST FLOTANTE (mismo estilo que Técnico) */}
            {message.text && !childrenOverride && (
                <div className="fixed top-20 right-4 left-4 sm:left-auto z-[100] animate-in fade-in slide-in-from-top-2">
                    <div className={`rounded-xl shadow-2xl p-4 flex items-center gap-3 sm:min-w-[320px] ${
                        message.type === "success"
                            ? "bg-gradient-to-r from-emerald-500 to-green-600"
                            : message.type === "warning"
                            ? "bg-gradient-to-r from-amber-500 to-orange-600"
                            : "bg-gradient-to-r from-red-500 to-rose-600"
                    } text-white`}>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            {message.type === "success" && <CheckCircle size={16} />}
                            {message.type === "warning" && <AlertCircle size={16} />}
                            {message.type === "error" && <AlertCircle size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">
                                {message.type === "success" ? "Éxito" : message.type === "warning" ? "Advertencia" : "Error"}
                            </p>
                            <p className="text-xs opacity-90 break-words">{message.text}</p>
                        </div>
                        <button
                            onClick={() => setMessage({ type: "", text: "" })}
                            className="text-white/80 hover:text-white flex-shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .animate-in { animation: fadeIn 0.3s ease-out; }
                .slide-in-from-top-2 { animation: slideDown 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}