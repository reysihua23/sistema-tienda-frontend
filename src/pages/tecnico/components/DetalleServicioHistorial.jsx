// pages/tecnico/components/DetalleServicioHistorial.jsx
import React from "react";

export default function DetalleServicioHistorial({ servicio, onClose }) {

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="sticky top-0 bg-white pt-6 px-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-white text-lg">📋</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Servicio #{servicio.id}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(servicio.fecha)}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Información del cliente */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-lg">👤</span> Información del Cliente
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400">Nombre</p>
                                <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.clienteNombre || `Cliente #${servicio.clienteId}`}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Teléfono</p>
                                <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.clienteTelefono || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.clienteEmail || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Documento</p>
                                <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.clienteDocumento || "—"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información del equipo */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-lg">💻</span> Información del Equipo
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400">Equipo</p>
                                <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.equipo || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Problema reportado</p>
                                <p className="text-gray-600 text-sm mt-0.5">{servicio.problema || "—"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Diagnóstico */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-lg">🔧</span> Diagnóstico
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {servicio.diagnostico || "No se ha registrado diagnóstico"}
                        </p>
                    </div>

                    {/* Estado y costo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span className="text-lg">📊</span> Estado Final
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{getEstadoIcon(servicio.estado)}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(servicio.estado)}`}>
                                    {servicio.estado}
                                </span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-xl p-5 text-white">
                            <h4 className="font-semibold mb-2 text-sm opacity-90">Costo Total</h4>
                            <p className="text-2xl font-bold">{formatPrice(servicio.costo || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}