// pages/tecnico/Tecnico.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";
import DashboardTecnico from "./components/DashboardTecnico";
import ListaServicios from "./components/ListaServicios";
import NuevoServicio from "./components/NuevoServicio";
import HistorialServicios from "./components/HistorialServicios";
import NotificationBell from "../../components/NotificationBell";

export default function Tecnico() {
    const navigate = useNavigate();
    const location = useLocation(); // ✅ NUEVO
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);

    // ✅ NUEVO: leer state.tab cuando llega desde una notificación
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    useEffect(() => {
        const usuario = authService.getCurrentUser();
        if (!usuario || (usuario.rol !== "TECNICO" && usuario.rol !== "ADMIN")) {
            navigate("/login");
            return;
        }
        setUser(usuario);
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-[#0d0c1e]">Panel de Técnico</h1>
                        <p className="text-sm text-gray-500 mt-1">Gestiona servicios técnicos y reparaciones</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">{user.nombre || user.correo}</p>
                            <p className="text-xs text-gray-400">Técnico</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === "dashboard"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab("servicios")}
                            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === "servicios"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            🔧 Servicios Activos
                        </button>
                        <button
                            onClick={() => setActiveTab("historial")}
                            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === "historial"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            📋 Historial
                        </button>
                        <button
                            onClick={() => setActiveTab("nuevo")}
                            className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === "nuevo"
                                    ? "text-[#5b4eff] border-b-2 border-[#5b4eff]"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            ➕ Nuevo Servicio
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === "dashboard" && <DashboardTecnico />}
                {activeTab === "servicios" && <ListaServicios />}
                {activeTab === "historial" && <HistorialServicios />}
                {activeTab === "nuevo" && <NuevoServicio onSuccess={() => setActiveTab("servicios")} />}
            </div>
        </div>
    );
}