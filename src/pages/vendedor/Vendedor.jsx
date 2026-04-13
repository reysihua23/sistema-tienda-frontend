// pages/vendedor/Vendedor.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, pedidoService, productoService, clienteService, stockService, detallePedidoService, productoImagenService } from "../../services/api";
import VentasPresencial from "./components/VentasPresencial";
import ListaPedidos from "./components/ListaPedidos";

export default function Vendedor() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("ventas");
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", email: "", telefono: "", documento: "", direccion: "" });
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [imagenesCache, setImagenesCache] = useState({});
    const [stats, setStats] = useState({ ventasHoy: 0, pedidosPendientes: 0, productosStockBajo: 0 });

    useEffect(() => {
        const usuario = authService.getCurrentUser();
        if (!usuario || (usuario.rol !== "VENTAS" && usuario.rol !== "ADMIN")) {
            navigate("/login");
            return;
        }
        setUser(usuario);
        cargarDatosIniciales();
    }, []);

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
            // Cargar imágenes de productos
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
                        [producto.id]: imagenPrincipal?.urlImagen ? `http://localhost:8080${imagenPrincipal.urlImagen}` : null
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
            const ventasHoy = pedidos.filter(p => new Date(p.fecha).toDateString() === hoy && p.estado === "PAGADO").reduce((sum, p) => sum + p.total, 0);
            const pendientes = pedidos.filter(p => p.estado === "PENDIENTE" || p.estado === "PAGADO").length;
            const productosBajo = productos.filter(p => p.stock <= (p.stockMinimo || 5)).length;
            setStats({ ventasHoy, pedidosPendientes: pendientes, productosStockBajo: productosBajo });
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        }
    };

    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

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

    // En Vendedor.jsx - Modificar la función crearCliente
    // En Vendedor.jsx - Modificar la función crearCliente para que lance el error correctamente
    const crearCliente = async () => {
        if (!nuevoCliente.nombre.trim()) {
            throw new Error("El nombre completo es obligatorio");
        }

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
            if (error.response && error.response.data) {
                if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    };

    // En Vendedor.jsx - Modifica realizarVenta
    const realizarVenta = async () => {
        if (!selectedCliente) {
            setError("Debes seleccionar o crear un cliente");
            return;
        }
        if (carrito.length === 0) {
            setError("Agrega productos al carrito");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Verificar stock
            for (const item of carrito) {
                const productoActual = productos.find(p => p.id === item.id);
                if (!productoActual || productoActual.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${productoActual?.stock || 0}`);
                }
            }

            // ✅ Crear pedido con todos los campos requeridos
            const pedidoData = {
                clienteId: selectedCliente.id,
                total: totalVenta,
                estado: "PAGADO",
                metodoPago: metodoPago,
                origen: "TIENDA_FISICA",           // ✅ Campo requerido
                metodoEnvio: "RECOJO_EN_TIENDA",    // ✅ Campo requerido
                productos: carrito.map(item => ({
                    productoId: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio
                }))
            };

            console.log("Enviando pedido (tienda física):", pedidoData);

            const response = await pedidoService.crear(pedidoData);

            console.log("Respuesta:", response);

            // Limpiar carrito y selección
            setCarrito([]);
            setSelectedCliente(null);
            setSuccess("✅ Venta realizada exitosamente");

            // Recargar datos actualizados
            await Promise.all([cargarProductos(), cargarEstadisticas()]);

            // Mostrar comprobante
            if (response && response.comprobanteId) {
                console.log("Comprobante ID:", response.comprobanteId);
                // Aquí puedes abrir el modal del comprobante
            }

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

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-[#0d0c1e]">Panel de Vendedor</h1>
                        <p className="text-sm text-gray-500 mt-1">Gestiona ventas presenciales y pedidos online</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/notificaciones")} className="relative p-2 hover:bg-gray-100 rounded-full">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                        </button>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">{user.nombre || user.correo}</p>
                            <p className="text-xs text-gray-400">Vendedor</p>
                        </div>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        <button onClick={() => setActiveTab("ventas")} className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "ventas" ? "text-[#5b4eff] border-b-2 border-[#5b4eff]" : "text-gray-500 hover:text-gray-700"}`}>
                            🛒 Venta Presencial
                        </button>
                        <button onClick={() => setActiveTab("pedidos")} className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "pedidos" ? "text-[#5b4eff] border-b-2 border-[#5b4eff]" : "text-gray-500 hover:text-gray-700"}`}>
                            📦 Pedidos Online
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Ventas de hoy</p>
                        <p className="text-2xl font-bold text-[#5b4eff]">{formatPrice(stats.ventasHoy)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Pedidos pendientes</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pedidosPendientes}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500">Productos con stock bajo</p>
                        <p className="text-2xl font-bold text-red-500">{stats.productosStockBajo}</p>
                    </div>
                </div>

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
                {activeTab === "pedidos" && <ListaPedidos onRefresh={cargarEstadisticas} />}
            </div>
        </div>
    );
}