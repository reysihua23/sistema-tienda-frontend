// pages/tecnico/components/ListaServicios.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useServicios } from "../hooks/useServicios";
import DetalleServicio from "./DetalleServicio";
import {
    Filter, ArrowUpDown, SlidersHorizontal, Search,
    ArrowUp, ArrowDown, Clock, DollarSign, Layers,
    CheckCircle, CheckCircle2, XCircle, FileText,
    Wrench, ClipboardList, PackageCheck, Eye, X
} from "lucide-react";

// =====================================================
// Dropdown custom reutilizable con iconos Lucide
// =====================================================
const CustomDropdown = ({ valor, onChange, opciones, iconoPrincipal, ancho = "w-48" }) => {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);
    const opcionActual = opciones.find(o => o.value === valor);

    useEffect(() => {
        const cerrar = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setAbierto(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative flex-1 sm:flex-initial" ref={ref}>
            <button
                type="button"
                onClick={() => setAbierto(!abierto)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 pl-8 pr-8 py-1.5 text-sm border rounded-lg bg-white transition relative ${
                    abierto
                        ? "border-[#5b4eff] ring-2 ring-[#5b4eff]/20"
                        : "border-gray-200 hover:border-gray-300"
                }`}
            >
                {iconoPrincipal && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {iconoPrincipal}
                    </span>
                )}

                <span className="flex items-center gap-2 min-w-0">
                    <span className={opcionActual?.color || "text-gray-500"}>
                        {opcionActual?.icon}
                    </span>
                    <span className="text-gray-700 truncate">{opcionActual?.label}</span>
                </span>

                <svg
                    className={`w-3 h-3 text-gray-400 absolute right-3 transition-transform flex-shrink-0 ${
                        abierto ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {abierto && (
                <div className={`absolute z-30 mt-1 ${ancho} bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto`}>
                    {opciones.map((op) => (
                        <button
                            key={op.value}
                            type="button"
                            onClick={() => { onChange(op.value); setAbierto(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition text-left ${
                                valor === op.value ? "bg-[#5b4eff]/5 font-medium" : ""
                            }`}
                        >
                            <span className={op.color || "text-gray-500"}>{op.icon}</span>
                            <span className="text-gray-700 flex-1">{op.label}</span>
                            {valor === op.value && (
                                <CheckCircle size={14} className="text-[#5b4eff] flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// =====================================================
// Helper: iconos Lucide por estado
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

// =====================================================
// Componente principal
// =====================================================
export default function ListaServicios() {
    const { servicios, loading, error, cargarServicios } = useServicios();
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [searchCliente, setSearchCliente] = useState("");
    const [orden, setOrden] = useState("id-asc");
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const cardRefs = useRef({});
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const handleFiltroChange = (estado) => {
        setFiltroEstado(estado);
        setVisibleCount(6);
    };

    const handleSearchChange = (e) => {
        setSearchCliente(e.target.value);
        setVisibleCount(6);
    };

    const verDetalle = (servicio) => {
        setServicioSeleccionado(servicio);
        setShowModal(true);
    };

    const handleUpdate = async () => {
        await cargarServicios();
    };

    const cargarMas = () => setVisibleCount(prev => prev + 6);
    const mostrarMenos = () => setVisibleCount(6);

    // 🎯 Opciones del dropdown de FILTRO
    const opcionesFiltro = [
        { value: "todos", label: "Todos", icon: <Layers size={14} />, color: "text-gray-500" },
        { value: "RECIBIDO", label: "Recibido", icon: <ClipboardList size={14} />, color: "text-amber-500" },
        { value: "EN_REVISION", label: "En revisión", icon: <Search size={14} />, color: "text-blue-500" },
        { value: "EN_PROCESO", label: "En proceso", icon: <Wrench size={14} />, color: "text-purple-500" },
        { value: "FINALIZADO", label: "Finalizado", icon: <CheckCircle2 size={14} />, color: "text-green-500" },
        { value: "ENTREGADO", label: "Entregado", icon: <PackageCheck size={14} />, color: "text-emerald-500" },
    ];

    // 🎯 Opciones del dropdown de ORDEN
    const opcionesOrden = [
        { value: "id-asc", label: "Nº ↑", icon: <ArrowUp size={14} />, color: "text-gray-500" },
        { value: "id-desc", label: "Nº ↓", icon: <ArrowDown size={14} />, color: "text-gray-500" },
        { value: "recientes", label: "Recientes", icon: <Clock size={14} />, color: "text-[#5b4eff]" },
        { value: "mayor-costo", label: "Mayor costo", icon: <DollarSign size={14} />, color: "text-emerald-500" },
    ];

    // ═════════════════════════════════════════════════════════
    // 🎯 FILTRAR + ORDENAR (declarado ANTES del useEffect para evitar TDZ)
    // ═════════════════════════════════════════════════════════
    const serviciosFiltrados = useMemo(() => {
        let lista = servicios.filter(s => {
            const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado;
            const matchCliente = searchCliente === "" ||
                (s.clienteNombre && s.clienteNombre.toLowerCase().includes(searchCliente.toLowerCase()));
            return matchEstado && matchCliente;
        });

        lista.sort((a, b) => {
            if (orden === "id-asc") return a.id - b.id;
            if (orden === "id-desc") return b.id - a.id;
            if (orden === "recientes") return new Date(b.fecha) - new Date(a.fecha);
            if (orden === "mayor-costo") return (b.costo || 0) - (a.costo || 0);
            return 0;
        });

        return lista;
    }, [servicios, filtroEstado, searchCliente, orden]);

    const serviciosMostrados = serviciosFiltrados.slice(0, visibleCount);
    const hasMore = visibleCount < serviciosFiltrados.length;

    // ═════════════════════════════════════════════════════════
    // 🎯 EFECTO DEL HIGHLIGHT (usa serviciosFiltrados ya declarado)
    // ═════════════════════════════════════════════════════════
    useEffect(() => {
        // Leer de dos fuentes: state (notificación) o URL (dashboard)
        const highlightFromUrl = searchParams.get("highlight");
        const { highlightId, openDetailModal } = location.state || {};

        const idFinal = highlightFromUrl ? parseInt(highlightFromUrl) : highlightId;

        if (!idFinal) return;
        if (!servicios || servicios.length === 0) return;

        const servicio = servicios.find(s => s.id === idFinal);
        if (!servicio) {
            showToast("El servicio ya no existe", "error");
            const nuevosParams = new URLSearchParams(searchParams);
            nuevosParams.delete("highlight");
            setSearchParams(nuevosParams, { replace: true });
            navigate(location.pathname, { replace: true, state: {} });
            return;
        }

        // 🎯 PASO 0: Verificar que el servicio NO esté oculto por filtros
        const servicioEstaEnListaFiltrada = serviciosFiltrados.some(s => s.id === idFinal);

        if (!servicioEstaEnListaFiltrada) {
            // El servicio está oculto por el filtro actual → limpiar filtros
            setFiltroEstado("todos");
            setSearchCliente("");
            return;
        }

        // 🎯 PASO 1: Buscar el índice en la lista filtrada
        const indiceEnLista = serviciosFiltrados.findIndex(s => s.id === idFinal);

        // 🎯 PASO 2: Si está fuera del rango visible, expandir visibleCount
        if (indiceEnLista >= visibleCount) {
            setVisibleCount(indiceEnLista + 6);
            return; // esperar al re-render
        }

        // 🎯 PASO 3: Ya está visible → scroll + highlight + modal
        setTimeout(() => {
            const card = cardRefs.current[idFinal];
            if (!card) {
                console.warn("⚠️ No se encontró la tarjeta para highlightId:", idFinal);
                return;
            }

            // Scroll al centro
            const cardTop = card.getBoundingClientRect().top + window.pageYOffset;
            const offset = window.innerHeight / 2 - card.offsetHeight / 2;
            window.scrollTo({ top: cardTop - offset, behavior: "smooth" });

            const servicioCapturado = servicio;

            // Highlight azul pulsante
            const pintar = (color, borde) => {
                card.style.transition = "background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease";
                card.style.backgroundColor = color;
                card.style.boxShadow = `0 0 0 3px ${borde}`;
                card.style.borderColor = borde;
            };

            pintar("#eff6ff", "#5b4eff");

            let contador = 0;
            const intervalo = setInterval(() => {
                contador++;
                if (contador % 2 === 0) {
                    pintar("#dbeafe", "#4a3dcc");
                } else {
                    pintar("#eff6ff", "#5b4eff");
                }
            }, 500);

            setTimeout(() => {
                clearInterval(intervalo);
                card.style.backgroundColor = "";
                card.style.boxShadow = "";
                card.style.borderColor = "";
                card.style.transition = "background-color 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease";
            }, 2500);

            // Limpiar params de URL + state
            const nuevosParams = new URLSearchParams(searchParams);
            nuevosParams.delete("highlight");
            setSearchParams(nuevosParams, { replace: true });
            navigate(location.pathname, { replace: true, state: {} });

            // Abrir modal
            if (openDetailModal || highlightFromUrl) {
                setTimeout(() => {
                    setServicioSeleccionado(servicioCapturado);
                    setShowModal(true);
                }, 1800);
            }
        }, 150);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, searchParams, servicios, visibleCount, orden, serviciosFiltrados]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric', month: 'short', day: 'numeric'
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff]"></div>
                <p className="mt-4 text-gray-500">Cargando servicios...</p>
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
        <div>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-24 right-6 z-50 animate-slide-in">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                        {toast.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button onClick={() => setToast({ show: false, message: "", type: "" })} className="ml-2">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─────────── HEADER CON 3 PANELES COMPACTOS ─────────── */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-2 lg:gap-3 mb-4">

                {/* PANEL 1: Título + subtítulo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3 flex-shrink-0 flex flex-col justify-center min-h-[64px]">
                    <h2 className="text-base font-bold text-gray-800 leading-tight">Servicios Activos</h2>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">Gestiona las reparaciones en curso</p>
                </div>

                {/* PANEL 2: Controles */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex flex-col sm:flex-row gap-2 flex-shrink-0 items-center min-h-[64px]">
                    {/* Buscador por cliente */}
                    <div className="relative flex-1 sm:flex-initial sm:w-56">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchCliente}
                            onChange={handleSearchChange}
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 focus:border-[#5b4eff] transition"
                        />
                    </div>

                    <CustomDropdown
                        valor={filtroEstado}
                        onChange={handleFiltroChange}
                        opciones={opcionesFiltro}
                        iconoPrincipal={<Filter size={13} />}
                        ancho="w-full sm:w-48"
                    />

                    <CustomDropdown
                        valor={orden}
                        onChange={setOrden}
                        opciones={opcionesOrden}
                        iconoPrincipal={<ArrowUpDown size={13} />}
                        ancho="w-full sm:w-52"
                    />

                    <div className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-md whitespace-nowrap h-[34px]">
                        <SlidersHorizontal size={11} className="mr-1" />
                        {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? "servicio" : "servicios"}
                    </div>
                </div>

                {/* ESPACIADOR FLEXIBLE */}
                <div className="hidden lg:block flex-1" />

                {/* PANEL 3: Leyenda */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-3 flex-shrink-0 flex items-center min-h-[64px]">
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">Recibido</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Revisión</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-600">Proceso</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Finalizado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-gray-600">Entregado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de servicios - 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {serviciosMostrados.map(servicio => (
                    <div
                        key={servicio.id}
                        ref={el => cardRefs.current[servicio.id] = el}
                        onClick={() => verDetalle(servicio)}
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 hover:border-[#5b4eff]/30"
                    >
                        <div className="relative p-4 pb-3 border-b border-gray-100">
                            <div className="absolute top-3 right-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                                    {getEstadoIcon(servicio.estado, 12)}
                                    {servicio.estado}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#5b4eff]/20 to-[#4a3dcc]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-[#5b4eff]">
                                    {getEstadoIcon(servicio.estado, 24)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">#{servicio.id}</p>
                                    <p className="text-xs text-gray-400">{formatDate(servicio.fecha)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Equipo</p>
                                <p className="font-medium text-gray-800 truncate">{servicio.equipo || "Equipo no especificado"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Cliente</p>
                                <p className="text-sm text-gray-600 truncate">{servicio.clienteNombre || `Cliente #${servicio.clienteId}`}</p>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <button className="text-[#5b4eff] text-sm font-medium group-hover:underline flex items-center gap-1">
                                <Eye size={14} />
                                Ver detalles
                            </button>
                            <span className="text-xs text-gray-400">→</span>
                        </div>
                    </div>
                ))}
            </div>

            {serviciosFiltrados.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                    <Wrench size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No hay servicios que coincidan con los filtros</p>
                    <p className="text-sm mt-1">Intenta cambiar el estado o buscar otro cliente</p>
                    {(filtroEstado !== "todos" || searchCliente) && (
                        <button
                            onClick={() => { setFiltroEstado("todos"); setSearchCliente(""); setOrden("id-asc"); }}
                            className="mt-3 text-sm text-[#5b4eff] hover:underline font-medium"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {serviciosFiltrados.length > 6 && (
                <div className="flex justify-center mt-8">
                    {hasMore ? (
                        <button onClick={cargarMas} className="px-6 py-3 bg-white border-2 border-[#5b4eff] text-[#5b4eff] rounded-xl font-bold text-sm hover:bg-[#5b4eff] hover:text-white transition-all duration-300 flex items-center gap-2">
                            Ver más servicios
                            <span className="text-xs">({visibleCount} de {serviciosFiltrados.length})</span>
                        </button>
                    ) : (
                        <button onClick={mostrarMenos} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
                            Mostrar menos
                        </button>
                    )}
                </div>
            )}

            {showModal && servicioSeleccionado && (
                <DetalleServicio
                    servicio={servicioSeleccionado}
                    onClose={() => {
                        setShowModal(false);
                        setServicioSeleccionado(null);
                    }}
                    onUpdate={handleUpdate}
                />
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}