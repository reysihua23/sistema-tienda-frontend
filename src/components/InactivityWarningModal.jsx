// components/InactivityWarningModal.jsx
import React from "react";
import { AlertTriangle, Clock, LogOut, RefreshCw } from "lucide-react";

export default function InactivityWarningModal({
    remainingTime,
    warningMs = 20000,
    onExtend,
    onLogout,
}) {
    // 🚫 Nunca mostramos 0 (siempre mínimo 1)
    const tiempoMostrado = Math.max(1, remainingTime);

    // 🎯 Total de segundos del aviso (dinámico, no hardcodeado)
    const totalSegundos = Math.max(1, Math.round(warningMs / 1000));

    // 🎨 Nivel de urgencia según el tiempo restante
    //  - critico: ≤ 5s (rojo, urgente)
    //  - alto:    ≤ 10s (naranja intenso)
    //  - medio:   resto (naranja/ámbar)
    const nivelUrgencia =
        tiempoMostrado <= 5 ? "critico" :
        tiempoMostrado <= 10 ? "alto" :
        "medio";

    // 🎨 Colores según urgencia
    const colores = {
        medio: {
            header: "from-amber-500 via-orange-500 to-orange-600",
            contador: "text-amber-600",
            anillo: "#f59e0b",
        },
        alto: {
            header: "from-orange-500 via-red-500 to-red-600",
            contador: "text-orange-600",
            anillo: "#ea580c",
        },
        critico: {
            header: "from-red-500 via-red-600 to-rose-700",
            contador: "text-red-600",
            anillo: "#dc2626",
        },
    };
    const color = colores[nivelUrgencia];

    // 🎯 Textos dinámicos según urgencia
    const mensaje = {
        medio: "Tu sesión está a punto de cerrarse",
        alto: "Tu sesión se cerrará pronto",
        critico: "¡Últimos segundos!",
    };

    const subtitulo = {
        medio: "Por inactividad, cerraremos tu sesión en:",
        alto: "Haz clic en continuar para mantenerte conectado",
        critico: "Tu sesión se cerrará automáticamente",
    };

    // 🎨 Anillo de progreso circular (proporcional al warningMs)
    const porcentaje = Math.min(100, (tiempoMostrado / totalSegundos) * 100);
    const radio = 42;
    const circunferencia = 2 * Math.PI * radio;
    const offset = circunferencia - (porcentaje / 100) * circunferencia;

    return (
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="inactivity-title"
            aria-describedby="inactivity-desc"
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in"
        >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-zoom-in">

                {/* ═══════════════ HEADER ═══════════════ */}
                <div className={`relative bg-gradient-to-br ${color.header} p-5 sm:p-6 text-white overflow-hidden`}>
                    {/* Patrón decorativo de fondo */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white"></div>
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white"></div>
                    </div>

                    <div className="relative flex items-center gap-4">
                        {/* Icono con animación pulse */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-white/30 rounded-2xl animate-ping"></div>
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <AlertTriangle size={24} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2
                                id="inactivity-title"
                                className="text-lg sm:text-xl font-black tracking-tight"
                            >
                                Sesión por expirar
                            </h2>
                            <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                                {mensaje[nivelUrgencia]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ═══════════════ CONTENIDO ═══════════════ */}
                <div className="p-5 sm:p-6">

                    {/* Texto descriptivo */}
                    <p
                        id="inactivity-desc"
                        className="text-center text-gray-600 text-sm mb-5"
                    >
                        {subtitulo[nivelUrgencia]}
                    </p>

                    {/* Contador circular con anillo */}
                    <div className="flex justify-center mb-5">
                        <div className="relative w-28 h-28">
                            {/* Anillo SVG */}
                            <svg
                                className="w-full h-full -rotate-90"
                                viewBox="0 0 100 100"
                                aria-hidden="true"
                            >
                                {/* Anillo de fondo */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={radio}
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                {/* Anillo de progreso */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={radio}
                                    fill="none"
                                    stroke={color.anillo}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circunferencia}
                                    strokeDashoffset={offset}
                                    style={{ transition: "stroke-dashoffset 1s linear" }}
                                />
                            </svg>

                            {/* Número central */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span
                                    className={`text-4xl font-black tabular-nums leading-none ${color.contador}`}
                                >
                                    {tiempoMostrado}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                                    segundos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progreso lineal */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-linear"
                            style={{
                                width: `${porcentaje}%`,
                                background: `linear-gradient(to right, ${color.anillo}, ${color.anillo}dd)`,
                            }}
                        />
                    </div>

                    {/* Botones (vertical en móvil, horizontal en desktop) */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            onClick={onLogout}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <LogOut size={16} />
                            Cerrar ahora
                        </button>
                        <button
                            onClick={onExtend}
                            className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-2xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <RefreshCw size={16} />
                            Continuar sesión
                        </button>
                    </div>

                    {/* Nota de seguridad */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 justify-center">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>Por tu seguridad, cerramos las sesiones inactivas</span>
                    </div>
                </div>
            </div>

            {/* Estilos de animación */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fadeIn 0.2s ease-out; }
                .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
                @keyframes ping {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
}