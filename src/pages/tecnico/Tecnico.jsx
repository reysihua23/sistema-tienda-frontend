// pages/tecnico/Tecnico.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { authService } from "../../services/api";
import DashboardTecnico from "./components/DashboardTecnico";
import ListaServicios from "./components/ListaServicios";
import NuevoServicio from "./components/NuevoServicio";
import HistorialServicios from "./components/HistorialServicios";
import NotificationBell from "../../components/NotificationBell";
import {
    BarChart3, Wrench, ClipboardList, Plus, LogOut, User
} from "lucide-react";

export default function Tecnico() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard");
    const [loading, setLoading] = useState(true);

    // 🎯 Leer state.tab cuando llega desde una notificación
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // 🎯 NUEVO: Escuchar cambios en searchParams (para navegación desde el dashboard)
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // 🎯 Cargar usuario
    useEffect(() => {
        const usuario = authService.getCurrentUser();
        if (!usuario || usuario.rol !== "TECNICO") {
            navigate("/login");
            return;
        }
        setUser(usuario);
        setLoading(false);
    }, [navigate]);

    // 🎯 Persistir tab activo en la URL
    useEffect(() => {
        // Preservar otros parámetros (?highlight=, etc.)
        const nuevosParams = new URLSearchParams(searchParams);
        nuevosParams.set("tab", activeTab);
        setSearchParams(nuevosParams, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    // 🎯 Nombre corto del usuario
    const nombreHeader = useMemo(() => {
        if (!user) return "";
        const texto = user.nombre || user.correo || "";
        const base = texto.includes("@") ? texto.split("@")[0] : texto;
        const primerNombre = base.trim().split(" ")[0];
        return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
            </div>
        );
    }

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
        { id: "servicios", label: "Servicios Activos", icon: <Wrench size={16} /> },
        { id: "historial", label: "Historial", icon: <ClipboardList size={16} /> },
        { id: "nuevo", label: "Nuevo Servicio", icon: <Plus size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* HEADER */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                        <div className="hidden sm:flex w-10 h-10 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-xl items-center justify-center shadow-md flex-shrink-0">
                            <Wrench size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-black text-[#0d0c1e] truncate">
                                Panel de Técnico
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                                Gestiona servicios técnicos y reparaciones
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <NotificationBell />
                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#5b4eff]/20 to-[#4a3dcc]/20 rounded-full flex items-center justify-center">
                                <User size={18} className="text-[#5b4eff]" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                                    {nombreHeader}
                                </p>
                                <p className="text-xs text-gray-400">Técnico</p>
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

            {/* TABS */}
            <div className="bg-white border-b sticky top-[68px] sm:top-[76px] z-[9]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        // Limpiar highlight al cambiar de tab manual
                                        const nuevosParams = new URLSearchParams();
                                        nuevosParams.set("tab", tab.id);
                                        setSearchParams(nuevosParams, { replace: true });
                                    }}
                                    className={`relative inline-flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b4eff]/40 ${
                                        isActive
                                            ? "text-[#5b4eff] border-[#5b4eff]"
                                            : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div key={activeTab} className="animate-fade-in">
                    {activeTab === "dashboard" && <DashboardTecnico user={user} />}
                    {activeTab === "servicios" && <ListaServicios />}
                    {activeTab === "historial" && <HistorialServicios />}
                    {activeTab === "nuevo" && (
                        <NuevoServicio onSuccess={() => setActiveTab("servicios")} />
                    )}
                </div>
            </div>

        </div>
    );
}