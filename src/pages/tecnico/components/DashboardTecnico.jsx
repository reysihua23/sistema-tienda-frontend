// pages/tecnico/components/DashboardTecnico.jsx
import React, { useState, useEffect } from "react";
import { servicioTecnicoService } from "../../../services/api";

export default function DashboardTecnico() {
    const [stats, setStats] = useState({
        total: 0,
        recibidos: 0,
        enRevision: 0,
        enProceso: 0,
        finalizados: 0,
        entregados: 0,
        ingresosMes: 0,
        ingresosTotales: 0
    });
    const [loading, setLoading] = useState(true);

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

            const mesActual = new Date().getMonth();
            const anioActual = new Date().getFullYear();
            const ingresosMes = servicios
                .filter(s => {
                    const fecha = new Date(s.fecha);
                    return (s.estado === "FINALIZADO" || s.estado === "ENTREGADO") &&
                        fecha.getMonth() === mesActual &&
                        fecha.getFullYear() === anioActual;
                })
                .reduce((sum, s) => sum + (s.costo || 0), 0);

            setStats({
                total: servicios.length,
                recibidos,
                enRevision,
                enProceso,
                finalizados,
                entregados,
                ingresosMes,
                ingresosTotales
            });

        } catch (error) {
            console.error("Error cargando estadísticas:", error);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
                <p className="mt-4 text-gray-500">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con saludo */}
            <div className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-2xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Panel de Control</h2>
                        <p className="text-purple-200 mt-1">Resumen de servicios técnicos</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-purple-200 text-sm">Servicios Totales</p>
                    </div>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-3 text-center text-white shadow-sm">
                    <p className="text-xs text-blue-100 font-bold">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100 shadow-sm">
                    <p className="text-xs text-amber-600 font-bold">Recibidos</p>
                    <p className="text-2xl font-bold text-amber-700">{stats.recibidos}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100 shadow-sm">
                    <p className="text-xs text-blue-600 font-bold">En Revisión</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.enRevision}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100 shadow-sm">
                    <p className="text-xs text-purple-600 font-bold">En Proceso</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.enProceso}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100 shadow-sm">
                    <p className="text-xs text-green-600 font-bold">Finalizados</p>
                    <p className="text-2xl font-bold text-green-700">{stats.finalizados}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100 shadow-sm">
                    <p className="text-xs text-emerald-600 font-bold">Entregados</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats.entregados}</p>
                </div>
                <div className="bg-sky-100 rounded-xl p-3 text-center border border-sky-200 shadow-sm">
                    <p className="text-xs text-sky-600 font-bold">Activos</p>
                    <p className="text-2xl font-bold text-sky-700">
                        {stats.recibidos + stats.enRevision + stats.enProceso}
                    </p>
                </div>
            </div>

            {/* Ingresos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-sm">
                    <p className="text-sm opacity-90">Ingresos del Mes</p>
                    <p className="text-2xl font-bold mt-1">{formatPrice(stats.ingresosMes)}</p>
                </div>
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl p-5 text-white shadow-sm">
                    <p className="text-sm opacity-90">Ingresos Totales</p>
                    <p className="text-2xl font-bold mt-1">{formatPrice(stats.ingresosTotales)}</p>
                </div>
            </div>

            {/* Progreso de eficiencia */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="font-bold text-gray-800">Eficiencia del taller</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Servicios completados vs total</p>
                    </div>
                    <p className="text-2xl font-bold text-[#5b4eff]">
                        {stats.total > 0 ? Math.round(((stats.finalizados + stats.entregados) / stats.total) * 100) : 0}%
                    </p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-full transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? ((stats.finalizados + stats.entregados) / stats.total) * 100 : 0}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Completados: {stats.finalizados + stats.entregados}</span>
                    <span>Pendientes: {stats.recibidos + stats.enRevision + stats.enProceso}</span>
                </div>
            </div>
        </div>
    );
}