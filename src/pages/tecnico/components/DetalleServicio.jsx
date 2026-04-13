// pages/tecnico/components/DetalleServicio.jsx
import React, { useState } from "react";
import { servicioTecnicoService } from "../../../services/api";

export default function DetalleServicio({ servicio, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [diagnostico, setDiagnostico] = useState(servicio.diagnostico || "");
    const [costo, setCosto] = useState(servicio.costo || 0);
    const [nuevoEstado, setNuevoEstado] = useState(servicio.estado);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 4000);
    };

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

    const estadosDisponibles = [
        { value: "RECIBIDO", label: "RECIBIDO", icon: "📋" },
        { value: "EN_REVISION", label: "EN REVISIÓN", icon: "🔍" },
        { value: "EN_PROCESO", label: "EN PROCESO", icon: "🔧" },
        { value: "FINALIZADO", label: "FINALIZADO", icon: "✅" },
        { value: "ENTREGADO", label: "ENTREGADO", icon: "🎉" }
    ];

    const handleGuardarDiagnostico = async () => {
        if (!diagnostico.trim()) {
            showToast("El diagnóstico es obligatorio. Por favor, ingrese un diagnóstico.", "error");
            return;
        }
        
        setLoading(true);
        try {
            await servicioTecnicoService.agregarDiagnostico(servicio.id, diagnostico, costo);
            showToast("Diagnóstico guardado correctamente", "success");
            if (onUpdate) onUpdate();
        } catch (error) {
            showToast(error.message || "Error al guardar el diagnóstico", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async () => {
        if (nuevoEstado === servicio.estado) {
            showToast(`El servicio ya se encuentra en estado ${nuevoEstado}`, "info");
            return;
        }
        
        setLoading(true);
        try {
            await servicioTecnicoService.cambiarEstado(servicio.id, nuevoEstado);
            showToast(`Estado cambiado a ${nuevoEstado} correctamente`, "success");
            servicio.estado = nuevoEstado;
            if (onUpdate) onUpdate();
        } catch (error) {
            showToast(error.message || "Error al cambiar el estado", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Toast Notification - Elegante y formal */}
                {toast.show && (
                    <div className="sticky top-0 z-20 px-6 pt-4">
                        <div className={`
                            relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-300 animate-slide-down
                            ${toast.type === "success" ? "bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500" : ""}
                            ${toast.type === "error" ? "bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500" : ""}
                            ${toast.type === "info" ? "bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-500" : ""}
                        `}>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Icono circular */}
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shadow-md
                                        ${toast.type === "success" ? "bg-emerald-500" : ""}
                                        ${toast.type === "error" ? "bg-red-500" : ""}
                                        ${toast.type === "info" ? "bg-blue-500" : ""}
                                    `}>
                                        {toast.type === "success" && (
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        )}
                                        {toast.type === "error" && (
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        )}
                                        {toast.type === "info" && (
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        )}
                                    </div>
                                    {/* Texto del mensaje */}
                                    <div>
                                        <p className={`font-bold text-sm ${
                                            toast.type === "success" ? "text-emerald-800" : 
                                            toast.type === "error" ? "text-red-800" : "text-blue-800"
                                        }`}>
                                            {toast.type === "success" ? "Operación exitosa" : 
                                             toast.type === "error" ? "Error" : "Información"}
                                        </p>
                                        <p className={`text-sm ${
                                            toast.type === "success" ? "text-emerald-700" : 
                                            toast.type === "error" ? "text-red-700" : "text-blue-700"
                                        }`}>
                                            {toast.message}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setToast({ show: false, message: "", type: "" })}
                                    className={`transition-colors ${
                                        toast.type === "success" ? "text-emerald-400 hover:text-emerald-600" : 
                                        toast.type === "error" ? "text-red-400 hover:text-red-600" : "text-blue-400 hover:text-blue-600"
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            {/* Barra de progreso */}
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200">
                                <div className={`
                                    h-full rounded-full transition-all duration-[4000ms] linear
                                    ${toast.type === "success" ? "bg-emerald-500" : ""}
                                    ${toast.type === "error" ? "bg-red-500" : ""}
                                    ${toast.type === "info" ? "bg-blue-500" : ""}
                                `} style={{ width: "100%" }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="sticky top-0 bg-white pt-6 px-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-white text-lg">🔧</span>
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
                        <div>
                            <p className="text-xs text-gray-400">Equipo</p>
                            <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.equipo || "—"}</p>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs text-gray-400">Problema reportado</p>
                            <p className="text-gray-600 text-sm mt-0.5">{servicio.problema || "—"}</p>
                        </div>
                    </div>

                    {/* Diagnóstico y Costo */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-lg">🔧</span> Diagnóstico y Costo
                        </h4>
                        <textarea
                            value={diagnostico}
                            onChange={(e) => setDiagnostico(e.target.value)}
                            rows="3"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                            placeholder="Ingrese el diagnóstico del equipo..."
                        />
                        <div className="flex gap-3 mt-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">S/</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={costo}
                                    onChange={(e) => setCosto(parseFloat(e.target.value))}
                                    className="w-full pl-8 p-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                                    placeholder="Costo"
                                />
                            </div>
                            <button
                                onClick={handleGuardarDiagnostico}
                                disabled={loading}
                                className="px-5 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl text-sm font-medium hover:shadow-md transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando
                                    </>
                                ) : (
                                    "Guardar Diagnóstico"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Estado del servicio */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="text-lg">📊</span> Estado del Servicio
                        </h4>
                        
                        {/* Estado actual */}
                        <div className="mb-4 p-3 bg-white rounded-xl border border-gray-200">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Estado Actual</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xl">{getEstadoIcon(servicio.estado)}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(servicio.estado)}`}>
                                    {servicio.estado}
                                </span>
                            </div>
                        </div>
                        
                        {/* Cambiar estado */}
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Cambiar estado:</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {estadosDisponibles.map(estado => (
                                    <button
                                        key={estado.value}
                                        onClick={() => setNuevoEstado(estado.value)}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                                            nuevoEstado === estado.value
                                                ? "bg-[#5b4eff] text-white shadow-md"
                                                : "bg-white border border-gray-200 text-gray-600 hover:border-[#5b4eff] hover:text-[#5b4eff]"
                                        }`}
                                    >
                                        <span>{estado.icon}</span>
                                        <span>{estado.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleCambiarEstado}
                                disabled={loading || nuevoEstado === servicio.estado}
                                className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl text-sm font-medium hover:shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Actualizando
                                    </>
                                ) : (
                                    <>Cambiar a {nuevoEstado}</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Resumen final */}
                    <div className={`rounded-xl p-5 text-white ${servicio.estado === "ENTREGADO" ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc]"}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-80">Costo Total</p>
                                <p className="text-2xl font-bold">{formatPrice(servicio.costo || costo)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-80">Estado Actual</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span>{getEstadoIcon(servicio.estado)}</span>
                                    <span className="font-medium">{servicio.estado}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilos de animación */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-down {
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 4s linear forwards;
                }
            `}</style>
        </div>
    );
}