// admin/components/HistorialServiciosTecnicos.jsx
import React, { useState, useMemo } from "react";
import { useServicios } from "../../tecnico/hooks/useServicios";
import NuevoServicio from "../../tecnico/components/NuevoServicio"; // ✅ Importamos el formulario
import DetalleServicioHistorial from "../../tecnico/components/DetalleServicioHistorial";
import {
    ClipboardList, Wrench, CheckCircle2, PackageCheck,
    FileText, Coins, Activity, Eye, Plus, X, Search, Inbox,
    Trash2
} from "lucide-react";

// =====================================================
// Helpers
// =====================================================
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

const getEstadoIcon = (estado, size = 14) => {
    const icons = {
        "RECIBIDO": <ClipboardList size={size} />,
        "EN_REVISION": <Search size={size} />,
        "EN_PROCESO": <Wrench size={size} />,
        "FINALIZADO": <CheckCircle2 size={size} />,
        "ENTREGADO": <PackageCheck size={size} />
    };
    return icons[estado] || <FileText size={size} />;
};

export default function HistorialServiciosTecnicos() {
    // ✅ Obtenemos 'recargar' del hook para actualizar la tabla
    const { servicios, loading, error, recargar } = useServicios(); 
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModalDetalle, setShowModalDetalle] = useState(false);
    const [showModalNuevo, setShowModalNuevo] = useState(false); // ✅ Estado para el modal de creación
    const [busqueda, setBusqueda] = useState("");

    const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const formatPrice = (price) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(price || 0);

    const verDetalle = (s) => {
        setServicioSeleccionado(s);
        setShowModalDetalle(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Estás seguro de desactivar este servicio?")) {
            try {
                await servicioTecnicoService.eliminar(id);
                recargar(); // Recargamos la tabla
            } catch (error) {
                alert("Error al eliminar el servicio");
            }
        }
    };

    // Filtrar por búsqueda
    const serviciosFiltrados = useMemo(() => {
        if (!busqueda.trim()) return servicios;
        const term = busqueda.toLowerCase();
        return servicios.filter(s => 
            s.equipo?.toLowerCase().includes(term) || 
            s.clienteNombre?.toLowerCase().includes(term) ||
            s.id.toString().includes(term)
        );
    }, [servicios, busqueda]);

    // Totales para las tarjetas
    const totalIngresos = servicios.reduce((sum, s) => sum + (s.costo || 0), 0);
    const completados = servicios.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length;

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
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center flex items-center justify-center gap-2">
                <Activity size={20} />
                <span>Error: {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ─── HEADER CON BOTÓN ─── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Historial Técnico</h1>
                    <p className="text-sm text-gray-500">Gestiona los servicios de reparación</p>
                </div>
                <button
                    onClick={() => setShowModalNuevo(true)}
                    className="px-5 py-2.5 bg-[#5b4eff] text-white rounded-xl font-bold text-sm hover:bg-[#4a3dcc] transition flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Nuevo Servicio
                </button>
            </div>

            

            {/* ─── BUSCADOR Y TABLA ─── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Buscador */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por equipo, cliente o ID..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] text-sm"
                        />
                    </div>
                </div>

                {/* Tabla */}
                {serviciosFiltrados.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Inbox size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-medium text-gray-600">No hay servicios registrados</p>
                        <p className="text-sm">Haz clic en "Nuevo Servicio" para comenzar</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Equipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Técnico</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Costo</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {serviciosFiltrados.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-600">#{s.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-[150px]">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{s.equipo}</p>
                                                <p className="text-xs text-gray-400">{formatDate(s.fecha)}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-700 truncate max-w-[150px]">{s.clienteNombre}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-700 truncate max-w-[120px]">{s.tecnicoNombre || "Sin asignar"}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getEstadoColor(s.estado)}`}>
                                                {getEstadoIcon(s.estado, 10)}
                                                {s.estado.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                                            {formatPrice(s.costo)}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => verDetalle(s)}
                                                className="text-[#5b4eff] hover:text-[#4a3dcc] text-sm font-medium"
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(s.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                title="Desactivar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ✅ MODAL PARA CREAR NUEVO SERVICIO */}
            {showModalNuevo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowModalNuevo(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        >
                            <X size={18} />
                        </button>
                        <div className="p-6">
                            <NuevoServicio 
                                onSuccess={() => {
                                    setShowModalNuevo(false);
                                    recargar(); // Recargamos la tabla al crear
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE DETALLE */}
            {showModalDetalle && servicioSeleccionado && (
                <DetalleServicioHistorial
                    servicio={servicioSeleccionado}
                    onClose={() => {
                        setShowModalDetalle(false);
                        setServicioSeleccionado(null);
                    }}
                />
            )}
        </div>
    );
}