// pages/tecnico/components/DashboardTecnico.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { servicioTecnicoService } from "../../../services/api";
import {
    ClipboardList, Search, Wrench, CheckCircle2, PackageCheck,
    Coins, TrendingUp, TrendingDown, Activity,
    AlertTriangle, Award, ArrowRight
} from "lucide-react";

// =====================================================
// Helpers de estado
// =====================================================
const getEstadoIcon = (estado, size = 16) => {
    const icons = {
        "RECIBIDO": <ClipboardList size={size} />,
        "EN_REVISION": <Search size={size} />,
        "EN_PROCESO": <Wrench size={size} />,
        "FINALIZADO": <CheckCircle2 size={size} />,
        "ENTREGADO": <PackageCheck size={size} />
    };
    return icons[estado] || <ClipboardList size={size} />;
};

const getEstadoLabel = (estado) => {
    return estado.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

// =====================================================
// Componente principal
// =====================================================
export default function DashboardTecnico({ user }) {
    const [stats, setStats] = useState({
        total: 0,
        recibidos: 0,
        enRevision: 0,
        enProceso: 0,
        finalizados: 0,
        entregados: 0,
        ingresosMes: 0,
        ingresosMesAnterior: 0,
        ingresosTotales: 0,
        serviciosUrgentes: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        setLoading(true);
        try {
            const data = await servicioTecnicoService.listar();
            const servicios = Array.isArray(data) ? data : [];

            const recibidos = servicios.filter(s => s.estado === "RECIBIDO").length;
            const enRevision = servicios.filter(s => s.estado === "EN_REVISION").length;
            const enProceso = servicios.filter(s => s.estado === "EN_PROCESO").length;
            const finalizados = servicios.filter(s => s.estado === "FINALIZADO").length;
            const entregados = servicios.filter(s => s.estado === "ENTREGADO").length;

            const ingresosTotales = servicios.reduce((sum, s) => sum + (s.costo || 0), 0);

            const hoy = new Date();
            const mesActual = hoy.getMonth();
            const anioActual = hoy.getFullYear();
            const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
            const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

            const ingresosMes = servicios
                .filter(s => {
                    const fecha = new Date(s.fecha);
                    return (s.estado === "FINALIZADO" || s.estado === "ENTREGADO") &&
                        fecha.getMonth() === mesActual &&
                        fecha.getFullYear() === anioActual;
                })
                .reduce((sum, s) => sum + (s.costo || 0), 0);

            const ingresosMesAnterior = servicios
                .filter(s => {
                    const fecha = new Date(s.fecha);
                    return (s.estado === "FINALIZADO" || s.estado === "ENTREGADO") &&
                        fecha.getMonth() === mesAnterior &&
                        fecha.getFullYear() === anioMesAnterior;
                })
                .reduce((sum, s) => sum + (s.costo || 0), 0);

            const serviciosUrgentes = servicios
                .filter(s => ["RECIBIDO", "EN_REVISION", "EN_PROCESO"].includes(s.estado))
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                .slice(0, 3);

            setStats({
                total: servicios.length,
                recibidos,
                enRevision,
                enProceso,
                finalizados,
                entregados,
                ingresosMes,
                ingresosMesAnterior,
                ingresosTotales,
                serviciosUrgentes
            });

        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(price);

    const { saludo, fechaHoy } = useMemo(() => {
        const hora = new Date().getHours();
        const saludoDinamico = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

        const fecha = new Date().toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

        return { saludo: saludoDinamico, fechaHoy: fechaCapitalizada };
    }, []);

    const tendencia = useMemo(() => {
        if (stats.ingresosMesAnterior === 0 && stats.ingresosMes === 0) {
            return { tipo: "neutral", porcentaje: 0 };
        }
        if (stats.ingresosMesAnterior === 0) {
            return { tipo: "up", porcentaje: 100 };
        }
        const diff = ((stats.ingresosMes - stats.ingresosMesAnterior) / stats.ingresosMesAnterior) * 100;
        return {
            tipo: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
            porcentaje: Math.abs(Math.round(diff))
        };
    }, [stats.ingresosMes, stats.ingresosMesAnterior]);

    const nombreCorto = useMemo(() => {
        if (user?.nombre && user.nombre.trim()) {
            const primerNombre = user.nombre.trim().split(" ")[0];
            return primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
        }
        if (user?.correo) {
            const parteCorreo = user.correo.split("@")[0];
            return parteCorreo.charAt(0).toUpperCase() + parteCorreo.slice(1);
        }
        return "Técnico";
    }, [user]);

    const tiempoRelativo = (fecha) => {
        const diff = Math.floor((new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "hoy";
        if (diff === 1) return "hace 1 día";
        return `hace ${diff} días`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
                <p className="mt-4 text-gray-500">Cargando dashboard...</p>
            </div>
        );
    }

    const eficiencia = stats.total > 0
        ? Math.round(((stats.finalizados + stats.entregados) / stats.total) * 100)
        : 0;

    // 🎯 Definición de tarjetas de estado (para no repetir código)
    const tarjetasEstado = [
        {
            key: "recibidos",
            label: "Recibidos",
            valor: stats.recibidos,
            icon: <ClipboardList size={14} />,
            bgIcono: "bg-amber-100",
            colorIcono: "text-amber-600",
            colorNumero: "text-amber-700"
        },
        {
            key: "enRevision",
            label: "En revisión",
            valor: stats.enRevision,
            icon: <Search size={14} />,
            bgIcono: "bg-blue-100",
            colorIcono: "text-blue-600",
            colorNumero: "text-blue-700"
        },
        {
            key: "enProceso",
            label: "En proceso",
            valor: stats.enProceso,
            icon: <Wrench size={14} />,
            bgIcono: "bg-purple-100",
            colorIcono: "text-purple-600",
            colorNumero: "text-purple-700"
        },
        {
            key: "finalizados",
            label: "Finalizados",
            valor: stats.finalizados,
            icon: <CheckCircle2 size={14} />,
            bgIcono: "bg-green-100",
            colorIcono: "text-green-600",
            colorNumero: "text-green-700"
        },
        {
            key: "entregados",
            label: "Entregados",
            valor: stats.entregados,
            icon: <PackageCheck size={14} />,
            bgIcono: "bg-emerald-100",
            colorIcono: "text-emerald-600",
            colorNumero: "text-emerald-700"
        }
    ];

    return (
        <div className="space-y-4">

            {/* ─────────── HEADER COMPACTO ─────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-4">

                {/* PANEL 1: Saludo + fecha (ancho natural, no crece) */}
                <div className="bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-2xl shadow-md px-4 sm:px-5 py-3 flex-shrink-0 flex flex-col justify-center relative overflow-hidden">
                    {/* Decoración circular */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative">
                        <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                            {saludo}, {nombreCorto}
                        </h2>
                        <p className="text-purple-200 mt-0.5 text-xs">
                            {fechaHoy}
                        </p>
                    </div>
                </div>

                {/* ESPACIADOR para empujar el Panel 2 a la derecha */}
                <div className="hidden lg:block flex-1" />

                {/* PANEL 2: Stats (contenedor con 2 cajas internas) */}
                <div className="bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-2xl shadow-md p-2 flex items-center gap-2 flex-shrink-0">
                    {/* Caja interna: Servicios */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 flex flex-col justify-center items-center min-w-[80px] sm:min-w-[95px]">
                        <p className="text-[10px] text-purple-100 uppercase tracking-wider font-semibold">Servicios</p>
                        <p className="text-xl sm:text-2xl font-bold text-white leading-tight mt-0.5">{stats.total}</p>
                    </div>

                    {/* Caja interna: Activos */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 flex flex-col justify-center items-center min-w-[80px] sm:min-w-[95px]">
                        <p className="text-[10px] text-purple-100 uppercase tracking-wider font-semibold">Activos</p>
                        <p className="text-xl sm:text-2xl font-bold text-white leading-tight mt-0.5">
                            {stats.recibidos + stats.enRevision + stats.enProceso}
                        </p>
                    </div>
                </div>
            </div>

            {/* ─────────── TARJETAS DE ESTADO (ultra compactas) ─────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {tarjetasEstado.map((t) => (
                    <div
                        key={t.key}
                        className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 ${t.bgIcono} rounded-lg flex items-center justify-center ${t.colorIcono} flex-shrink-0`}>
                                {t.icon}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-lg font-bold leading-none ${t.colorNumero}`}>{t.valor}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 leading-none truncate">{t.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─────────── INGRESOS + EFICIENCIA (3 columnas en desktop) ─────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Ingresos del Mes */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-start justify-between mb-1.5">
                        <p className="text-[10px] uppercase tracking-wider opacity-90 font-bold">Ingresos del Mes</p>
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <Coins size={14} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-1 leading-tight">{formatPrice(stats.ingresosMes)}</p>
                    {stats.ingresosMesAnterior > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 text-[11px]">
                            {tendencia.tipo === "up" && (
                                <>
                                    <TrendingUp size={12} />
                                    <span>+{tendencia.porcentaje}% vs mes anterior</span>
                                </>
                            )}
                            {tendencia.tipo === "down" && (
                                <>
                                    <TrendingDown size={12} />
                                    <span>-{tendencia.porcentaje}% vs mes anterior</span>
                                </>
                            )}
                            {tendencia.tipo === "neutral" && (
                                <span>Sin cambios vs mes anterior</span>
                            )}
                        </div>
                    )}
                    {stats.ingresosMesAnterior === 0 && stats.ingresosMes > 0 && (
                        <p className="text-[11px] mt-1.5 opacity-90">Primer mes con ingresos</p>
                    )}
                </div>

                {/* Ingresos Totales */}
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-start justify-between mb-1.5">
                        <p className="text-[10px] uppercase tracking-wider opacity-90 font-bold">Ingresos Totales</p>
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <Award size={14} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-1 leading-tight">{formatPrice(stats.ingresosTotales)}</p>
                    <p className="text-[11px] mt-1.5 opacity-75">Desde el inicio de operaciones</p>
                </div>

                {/* Eficiencia del taller */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#5b4eff]/10 rounded-lg flex items-center justify-center text-[#5b4eff] flex-shrink-0">
                                <Activity size={16} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-800 text-sm leading-tight">Eficiencia</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Completados vs total</p>
                            </div>
                        </div>
                        <p className="text-xl font-bold text-[#5b4eff]">{eficiencia}%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-full transition-all duration-500"
                            style={{ width: `${eficiencia}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                        <span>Completados: {stats.finalizados + stats.entregados}</span>
                        <span>Pendientes: {stats.recibidos + stats.enRevision + stats.enProceso}</span>
                    </div>
                </div>
            </div>

            {/* ─────────── ATENCIÓN REQUERIDA ─────────── */}
            {stats.serviciosUrgentes.length > 0 && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                    <button
                        type="button"
                        onClick={() => navigate("?tab=servicios")}
                        className="w-full bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 border-b border-amber-100 flex items-center gap-3 hover:from-amber-100 hover:to-orange-100 transition text-left group"
                    >
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                            <AlertTriangle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm">Atención requerida</h3>
                            <p className="text-[11px] text-gray-500">Los servicios más antiguos sin finalizar</p>
                        </div>
                        <span className="text-[11px] font-medium text-amber-600 group-hover:underline flex items-center gap-1 flex-shrink-0">
                            Ver todos
                            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </button>

                    <div className="divide-y divide-gray-100">
                        {stats.serviciosUrgentes.map((servicio) => (
                            <button
                                key={servicio.id}
                                type="button"
                                onClick={() => navigate(`?tab=servicios&highlight=${servicio.id}`)}
                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-amber-50/50 transition text-left group"
                            >
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0 group-hover:bg-amber-100 group-hover:text-amber-600 transition">
                                    {getEstadoIcon(servicio.estado, 14)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-medium text-gray-800 truncate">
                                        Servicio #{servicio.id} · {servicio.equipo || "Sin equipo"}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                        {getEstadoLabel(servicio.estado)} · {tiempoRelativo(servicio.fecha)}
                                    </p>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="text-gray-400 flex-shrink-0 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}