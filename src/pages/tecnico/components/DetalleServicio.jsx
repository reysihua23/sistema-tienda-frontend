// pages/tecnico/components/DetalleServicio.jsx
import React, { useState } from "react";
import { servicioTecnicoService } from "../../../services/api";
import {
    X, User, Mail, Phone, FileText, Laptop, Wrench,
    ClipboardList, Search, CheckCircle2, PackageCheck,
    Coins, Save, AlertCircle, Info, CheckCircle, XCircle,
    Activity
} from "lucide-react";

// =====================================================
// Helpers
// =====================================================
const getEstadoIcon = (estado, size = 16) => {
    const icons = {
        "RECIBIDO": <ClipboardList size={size} />,
        "EN_REVISION": <Search size={size} />,
        "EN_PROCESO": <Wrench size={size} />,
        "FINALIZADO": <CheckCircle2 size={size} />,
        "ENTREGADO": <PackageCheck size={size} />
    };
    return icons[estado] || <FileText size={size} />;
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

const formatEstadoLabel = (estado) => {
    return estado.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

// =====================================================
// Toast
// =====================================================
const Toast = ({ toast, onClose }) => {
    if (!toast.show) return null;

    const config = {
        success: {
            bg: "bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500",
            iconBg: "bg-emerald-500",
            icon: <CheckCircle size={20} className="text-white" />,
            titleColor: "text-emerald-800",
            textColor: "text-emerald-700",
            title: "Operación exitosa",
            progressBar: "bg-emerald-500"
        },
        error: {
            bg: "bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500",
            iconBg: "bg-red-500",
            icon: <XCircle size={20} className="text-white" />,
            titleColor: "text-red-800",
            textColor: "text-red-700",
            title: "Error",
            progressBar: "bg-red-500"
        },
        info: {
            bg: "bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-500",
            iconBg: "bg-blue-500",
            icon: <Info size={20} className="text-white" />,
            titleColor: "text-blue-800",
            textColor: "text-blue-700",
            title: "Información",
            progressBar: "bg-blue-500"
        }
    };

    const c = config[toast.type] || config.info;

    return (
        <div className="sticky top-0 z-20 px-6 pt-4">
            <div className={`relative overflow-hidden rounded-xl shadow-lg animate-slide-down ${c.bg}`}>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${c.iconBg}`}>
                            {c.icon}
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${c.titleColor}`}>{c.title}</p>
                            <p className={`text-sm ${c.textColor}`}>{toast.message}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-white/50">
                        <X size={18} />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200">
                    <div className={`h-full rounded-full animate-progress ${c.progressBar}`}></div>
                </div>
            </div>
        </div>
    );
};

// =====================================================
// Componente principal
// =====================================================
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

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(price);

    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const estadosDisponibles = [
        { value: "RECIBIDO", label: "Recibido", icon: <ClipboardList size={14} /> },
        { value: "EN_REVISION", label: "En revisión", icon: <Search size={14} /> },
        { value: "EN_PROCESO", label: "En proceso", icon: <Wrench size={14} /> },
        { value: "FINALIZADO", label: "Finalizado", icon: <CheckCircle2 size={14} /> },
        { value: "ENTREGADO", label: "Entregado", icon: <PackageCheck size={14} /> }
    ];

    // 🎯 Detectar cambios reales
    const hayCambios = 
        diagnostico !== (servicio.diagnostico || "") || 
        costo !== (servicio.costo || 0) || 
        nuevoEstado !== servicio.estado;

    // 🎯 Guardar TODO en un solo botón
    const handleGuardarCambios = async () => {
        if (!hayCambios) {
            showToast("No hay cambios para guardar", "info");
            return;
        }

        // Si hay cambios en el diagnóstico, debe estar lleno
        const cambioDiagnostico = 
            diagnostico !== (servicio.diagnostico || "") || 
            costo !== (servicio.costo || 0);

        if (cambioDiagnostico && !diagnostico.trim()) {
            showToast("El diagnóstico no puede estar vacío si se modificó.", "error");
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ Guardar diagnóstico + costo (si hay cambios)
            if (cambioDiagnostico) {
                await servicioTecnicoService.agregarDiagnostico(servicio.id, diagnostico, costo);
            }

            // 2️⃣ Cambiar estado (si hay cambios)
            if (nuevoEstado !== servicio.estado) {
                await servicioTecnicoService.cambiarEstado(servicio.id, nuevoEstado);
            }

            showToast("Cambios guardados correctamente", "success");

            // Actualizar objeto local
            servicio.diagnostico = diagnostico;
            servicio.costo = costo;
            servicio.estado = nuevoEstado;

            // Refrescar lista del padre
            if (onUpdate) await onUpdate();

            // 🎯 Cerrar el modal después de un pequeño delay
            setTimeout(() => {
                onClose();
            }, 900);

        } catch (error) {
            showToast(error.message || "Error al guardar los cambios", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100001] p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Toast toast={toast} onClose={() => setToast({ show: false, message: "", type: "" })} />

                {/* Header */}
                <div className="sticky top-0 bg-white pt-6 px-6 pb-4 border-b border-gray-100 z-10">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <Wrench size={22} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-bold text-gray-800 truncate">Servicio #{servicio.id}</h3>
                                <p className="text-sm text-gray-500 mt-0.5 truncate">{formatDate(servicio.fecha)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-500 hover:text-gray-700 flex-shrink-0"
                            aria-label="Cerrar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Estado actual + costo (resumen superior) */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getEstadoColor(nuevoEstado)}`}>
                            {getEstadoIcon(nuevoEstado, 20)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Estado {hayCambios && nuevoEstado !== servicio.estado ? "(sin guardar)" : "actual"}</p>
                            <p className="font-bold text-gray-800">{formatEstadoLabel(nuevoEstado)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Costo</p>
                            <p className="font-bold text-[#5b4eff] text-lg">{formatPrice(costo || servicio.costo || 0)}</p>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <User size={16} className="text-[#5b4eff]" /> Información del Cliente
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400">Nombre</p>
                                    <p className="font-medium text-gray-800 text-sm mt-0.5 truncate">{servicio.clienteNombre || `Cliente #${servicio.clienteId}`}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400">Teléfono</p>
                                    <p className="font-medium text-gray-800 text-sm mt-0.5 truncate">{servicio.clienteTelefono || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="font-medium text-gray-800 text-sm mt-0.5 truncate">{servicio.clienteEmail || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400">Documento</p>
                                    <p className="font-medium text-gray-800 text-sm mt-0.5 truncate">{servicio.clienteDocumento || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equipo */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Laptop size={16} className="text-[#5b4eff]" /> Información del Equipo
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Laptop size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-400">Equipo</p>
                                    <p className="font-medium text-gray-800 text-sm mt-0.5">{servicio.equipo || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-400">Problema reportado</p>
                                    <p className="text-gray-600 text-sm mt-0.5">{servicio.problema || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Diagnóstico + costo (editable) */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Wrench size={16} className="text-[#5b4eff]" /> Diagnóstico y Costo
                        </h4>
                        <textarea
                            value={diagnostico}
                            onChange={(e) => setDiagnostico(e.target.value)}
                            rows="3"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition text-sm resize-none"
                            placeholder="Ingrese el diagnóstico del equipo..."
                        />
                        <div className="relative mt-3">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">S/</span>
                            <input
                                type="number"
                                step="0.01"
                                value={costo}
                                onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
                                className="w-full pl-9 pr-3 p-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Estado (solo selección) */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Activity size={16} className="text-[#5b4eff]" /> Estado del Servicio
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {estadosDisponibles.map(estado => (
                                <button
                                    key={estado.value}
                                    onClick={() => setNuevoEstado(estado.value)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                                        nuevoEstado === estado.value
                                            ? "bg-[#5b4eff] text-white shadow-md scale-105"
                                            : "bg-white border border-gray-200 text-gray-600 hover:border-[#5b4eff] hover:text-[#5b4eff]"
                                    }`}
                                >
                                    {estado.icon}
                                    <span className="text-center leading-tight">{estado.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 🎯 BOTÓN ÚNICO "Guardar cambios" */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={handleGuardarCambios}
                            disabled={loading || !hayCambios}
                            className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {hayCambios ? "Guardar cambios" : "Sin cambios"}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                    </div>

                    {/* Resumen final */}
                    <div className={`rounded-xl p-5 text-white ${
                        nuevoEstado === "ENTREGADO"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                            : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc]"
                    }`}>
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Coins size={20} />
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">Costo Total</p>
                                    <p className="text-2xl font-bold">{formatPrice(costo || servicio.costo || 0)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-80">Estado</p>
                                <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                                    {getEstadoIcon(nuevoEstado, 16)}
                                    <span className="font-medium">{formatEstadoLabel(nuevoEstado)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down { animation: slideDown 0.3s ease-out; }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress { animation: progress 4s linear forwards; }
            `}</style>
        </div>
    );
}