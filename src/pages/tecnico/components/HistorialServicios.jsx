// pages/tecnico/components/HistorialServicios.jsx
import React, { useState, useMemo } from "react";
import { useServicios } from "../hooks/useServicios";
import DetalleServicioHistorial from "./DetalleServicioHistorial";

export default function HistorialServicios() {
    const { servicios, loading, error } = useServicios();
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);

    const verDetalle = (servicio) => {
        setServicioSeleccionado(servicio);
        setShowModal(true);
    };

    const cargarMas = () => setVisibleCount(prev => prev + 6);
    const mostrarMenos = () => setVisibleCount(6);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const getEstadoColor = (estado) => {
        const colores = {
            "RECIBIDO": "bg-amber-100 text-amber-700",
            "EN_REVISION": "bg-blue-100 text-blue-700",
            "EN_PROCESO": "bg-purple-100 text-purple-700",
            "FINALIZADO": "bg-green-100 text-green-700",
            "ENTREGADO": "bg-emerald-100 text-emerald-700"
        };
        return colores[estado] || "bg-gray-100 text-gray-700";
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            "RECIBIDO": "📋",
            "EN_REVISION": "🔍",
            "EN_PROCESO": "🔧",
            "FINALIZADO": "✅",
            "ENTREGADO": "🎉"
        };
        return icons[estado] || "📦";
    };

    const serviciosMostrados = servicios.slice(0, visibleCount);
    const hasMore = visibleCount < servicios.length;

    const totalIngresos = useMemo(() => {
        return servicios.reduce((sum, s) => sum + (s.costo || 0), 0);
    }, [servicios]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
                <p className="mt-4 text-gray-500">Cargando historial...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center">
                ⚠️ Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Historial de Servicios</h2>
                        <p className="text-sm text-gray-500 mt-1">Todos los servicios técnicos registrados</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total de servicios</p>
                        <p className="text-2xl font-bold text-[#5b4eff]">{servicios.length}</p>
                    </div>
                </div>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-90">Total Servicios</p>
                    <p className="text-2xl font-bold mt-1">{servicios.length}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-90">Ingresos Totales</p>
                    <p className="text-2xl font-bold mt-1">{formatPrice(totalIngresos)}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-90">Servicios Completados</p>
                    <p className="text-2xl font-bold mt-1">
                        {servicios.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length}
                    </p>
                </div>
            </div>

            {/* Lista de servicios - Grid simple */}
            {servicios.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                    <span className="text-5xl block mb-3">📋</span>
                    <p className="text-lg font-medium">No hay servicios registrados</p>
                    <p className="text-sm mt-1">Los servicios aparecerán aquí cuando se registren</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {serviciosMostrados.map(servicio => (
                            <div
                                key={servicio.id}
                                onClick={() => verDetalle(servicio)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 hover:border-[#5b4eff]/30"
                            >
                                <div className="relative p-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                                            {getEstadoIcon(servicio.estado)} {servicio.estado}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                                            style={{
                                                backgroundColor: servicio.estado === "RECIBIDO" ? "#FEF3C7" :
                                                               servicio.estado === "EN_REVISION" ? "#DBEAFE" :
                                                               servicio.estado === "EN_PROCESO" ? "#F3E8FF" :
                                                               servicio.estado === "FINALIZADO" ? "#D1FAE5" : "#D1FAE5"
                                            }}>
                                            <span className="text-lg">{getEstadoIcon(servicio.estado)}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Servicio #{servicio.id}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(servicio.fecha)}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Equipo</p>
                                        <p className="font-medium text-gray-800 text-sm">{servicio.equipo || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Cliente</p>
                                        <p className="text-sm text-gray-600">{servicio.clienteNombre || `Cliente #${servicio.clienteId}`}</p>
                                    </div>
                                    {servicio.diagnostico && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-400 font-semibold">Diagnóstico</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{servicio.diagnostico}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-[#5b4eff] text-sm">{formatPrice(servicio.costo || 0)}</span>
                                    <span className="text-[#5b4eff] text-sm font-medium group-hover:underline">Ver detalles →</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botones Ver más / Ver menos */}
                    {servicios.length > 6 && (
                        <div className="flex justify-center mt-8">
                            {hasMore ? (
                                <button
                                    onClick={cargarMas}
                                    className="px-6 py-3 bg-white border-2 border-[#5b4eff] text-[#5b4eff] rounded-xl font-bold text-sm hover:bg-[#5b4eff] hover:text-white transition-all duration-300 flex items-center gap-2"
                                >
                                    <span>📋</span> Ver más servicios
                                    <span className="text-xs">({visibleCount} de {servicios.length})</span>
                                </button>
                            ) : (
                                <button
                                    onClick={mostrarMenos}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                                >
                                    <span>⬆️</span> Mostrar menos
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal de detalle SOLO LECTURA */}
            {showModal && servicioSeleccionado && (
                <DetalleServicioHistorial
                    servicio={servicioSeleccionado}
                    onClose={() => {
                        setShowModal(false);
                        setServicioSeleccionado(null);
                    }}
                />
            )}
        </div>
    );
}