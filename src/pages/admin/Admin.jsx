import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Package, TrendingDown, ShoppingBag, Users, 
  BarChart3, LogOut, RefreshCw, ShoppingCart, CheckCircle, AlertCircle,
  Home, Database, Truck, FileText, Clock, DollarSign, User, Settings
} from "lucide-react";
import { authService, productoService, stockService, pedidoService, usuarioService, rolService } from "../../services/api";
import AdminDashboard from "./AdminDashboard";
import ProductosList from "./components/ProductosList";
import StockList from "./components/StockList";
import PedidosList from "./components/PedidosList";
import UsuariosList from "./components/UsuariosList";
import Reportes from "./components/Reportes";

export default function Admin({ user: propUser }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(propUser || null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalUsuarios: 0,
        totalPedidos: 0,
        ventasTotales: 0,
        pedidosPendientes: 0,
        stockBajo: 0
    });
    const [productos, setProductos] = useState([]);
    const [stock, setStock] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "productos", label: "Productos", icon: Package },
        { id: "stock", label: "Stock", icon: TrendingDown },
        { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
        { id: "usuarios", label: "Usuarios", icon: Users },
        { id: "reportes", label: "Reportes", icon: BarChart3 }
    ];

    useEffect(() => {
        const initAdmin = () => {
            const currentUser = propUser || authService.getCurrentUser();
            
            if (!currentUser) {
                navigate("/login");
                return;
            }

            if (currentUser.rol !== "ADMIN") {
                navigate("/");
                return;
            }

            setUser(currentUser);
            cargarDatos();
        };

        initAdmin();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        
        try {
            const [
                productosResponse,
                stockResponse,
                pedidosResponse,
                usuariosResponse,
                rolesResponse
            ] = await Promise.allSettled([
                productoService.listar(),
                stockService.listar(),
                pedidoService.listar(),
                usuarioService.listar(),
                rolService.listar()
            ]);

            const productosData = productosResponse.status === "fulfilled" 
                ? (Array.isArray(productosResponse.value) ? productosResponse.value : [])
                : [];
            setProductos(productosData);

            const stockData = stockResponse.status === "fulfilled" 
                ? (Array.isArray(stockResponse.value) ? stockResponse.value : [])
                : [];
            setStock(stockData);

            const pedidosData = pedidosResponse.status === "fulfilled" 
                ? (Array.isArray(pedidosResponse.value) ? pedidosResponse.value : [])
                : [];
            setPedidos(pedidosData);

            const usuariosData = usuariosResponse.status === "fulfilled" 
                ? (Array.isArray(usuariosResponse.value) ? usuariosResponse.value : [])
                : [];
            setUsuarios(usuariosData);

            const rolesData = rolesResponse.status === "fulfilled" 
                ? (Array.isArray(rolesResponse.value) ? rolesResponse.value : [])
                : [];
            setRoles(rolesData);

            const totalVentas = pedidosData
                .filter(p => p.estado === "PAGADO" || p.estado === "ENTREGADO")
                .reduce((sum, p) => sum + (p.total || 0), 0);

            const pedidosPendientes = pedidosData.filter(p => p.estado === "PENDIENTE").length;

            const stockBajo = stockData.filter(s => {
                const producto = productosData.find(p => p.id === s.producto?.id);
                return s.cantidad <= (producto?.stockMinimo || 5);
            }).length;

            setStats({
                totalProductos: productosData.length,
                totalUsuarios: usuariosData.length,
                totalPedidos: pedidosData.length,
                ventasTotales: totalVentas,
                pedidosPendientes: pedidosPendientes,
                stockBajo: stockBajo
            });

            const errores = [];
            if (productosResponse.status === "rejected") errores.push("productos");
            if (stockResponse.status === "rejected") errores.push("stock");
            if (pedidosResponse.status === "rejected") errores.push("pedidos");
            if (usuariosResponse.status === "rejected") errores.push("usuarios");
            if (rolesResponse.status === "rejected") errores.push("roles");

            if (errores.length > 0 && errores.length < 5) {
                showMessage("warning", `Algunos datos no se pudieron cargar: ${errores.join(", ")}`);
            } else if (errores.length === 5) {
                showMessage("error", "Error al cargar los datos. Verifica tu conexión.");
            }

        } catch (error) {
            showMessage("error", "Error al cargar los datos del panel");
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    };

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const handleRefresh = () => {
        cargarDatos();
        showMessage("success", "Datos actualizados correctamente");
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff] mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7fe]">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-xl flex items-center justify-center shadow-md">
                            <ShoppingCart size={20} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-[#0d0c1e] to-[#5b4eff] bg-clip-text text-transparent">
                            Panel Administrador
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleRefresh}
                            className="p-2 text-gray-400 hover:text-[#5b4eff] hover:bg-gray-100 rounded-lg transition-all"
                            title="Actualizar datos"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-full flex items-center justify-center">
                                <User size={14} className="text-white" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs text-gray-400 font-medium">Administrador</p>
                                <p className="text-sm font-bold text-gray-700">{user.correo?.split('@')[0]}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs con Lucide Icons */}
            <div className="border-b bg-white sticky top-[73px] z-10 overflow-x-auto shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 text-sm font-bold transition-all whitespace-nowrap rounded-t-xl flex items-center gap-2 ${
                                        isActive
                                            ? "bg-[#f4f7fe] text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Mensaje de notificación */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl shadow-sm border-l-4 animate-in fade-in slide-in-from-top-2 ${
                        message.type === "success" 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                            : message.type === "warning"
                            ? "bg-amber-50 border-amber-500 text-amber-700"
                            : "bg-rose-50 border-rose-500 text-rose-700"
                    }`}>
                        <div className="flex items-center gap-2">
                            {message.type === "success" && <CheckCircle size={18} />}
                            {message.type === "warning" && <AlertCircle size={18} />}
                            {message.type === "error" && <AlertCircle size={18} />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="relative w-16 h-16 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-[#5b4eff] border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-gray-500 font-medium mt-4">Cargando datos...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === "dashboard" && (
                            <AdminDashboard 
                                stats={stats} 
                                user={user} 
                                onRefresh={handleRefresh}
                            />
                        )}

                        {activeTab === "productos" && (
                            <ProductosList
                                productos={productos}
                                stock={stock}
                                onRefresh={cargarDatos}
                                showMessage={showMessage}
                            />
                        )}

                        {activeTab === "stock" && (
                            <StockList
                                productos={productos}
                                onRefresh={cargarDatos}
                                showMessage={showMessage}
                            />
                        )}

                        {activeTab === "pedidos" && (
                            <PedidosList
                                pedidos={pedidos}
                                onRefresh={cargarDatos}
                                showMessage={showMessage}
                            />
                        )}

                        {activeTab === "usuarios" && (
                            <UsuariosList
                                usuarios={usuarios}
                                roles={roles}
                                onRefresh={cargarDatos}
                                showMessage={showMessage}
                            />
                        )}

                        {activeTab === "reportes" && (
                            <Reportes />
                        )}
                    </>
                )}
            </div>

            {/* Estilos adicionales */}
            <style>{`
                .animate-in {
                    animation: fadeIn 0.3s ease-out;
                }
                .slide-in-from-top-2 {
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}