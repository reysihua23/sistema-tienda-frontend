// pages/admin/components/StockList.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { stockService } from "../../../services/api";
import {
    Package, AlertTriangle, CheckCircle, XCircle,
    TrendingUp, TrendingDown, Edit3, X,
    Search, Filter, ArrowUpDown, SlidersHorizontal,
    ArrowUp, ArrowDown, Clock, SortAsc, Layers
} from "lucide-react";

// =====================================================
// Dropdown custom reutilizable con iconos Lucide
// =====================================================
const CustomDropdown = ({ valor, onChange, opciones, iconoPrincipal, ancho = "w-48" }) => {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);
    const opcionActual = opciones.find(o => o.value === valor);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const cerrar = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);

    // Cerrar con Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") setAbierto(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative flex-1 sm:flex-initial" ref={ref}>
            <button
                type="button"
                onClick={() => setAbierto(!abierto)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 pl-8 pr-8 py-2.5 text-sm border rounded-lg bg-white transition relative ${abierto
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
                    className={`w-3 h-3 text-gray-400 absolute right-3 transition-transform flex-shrink-0 ${abierto ? "rotate-180" : ""
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
                <div
                    className={`absolute z-30 mt-1 ${ancho} bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto`}
                >
                    {opciones.map((op) => (
                        <button
                            key={op.value}
                            type="button"
                            onClick={() => {
                                onChange(op.value);
                                setAbierto(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition text-left ${valor === op.value ? "bg-[#5b4eff]/5 font-medium" : ""
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
// Modal para actualizar stock
// =====================================================
const StockModal = ({ isOpen, onClose, producto, stockActual, onSave, loading }) => {
    const [nuevoStock, setNuevoStock] = useState(stockActual);
    const [error, setError] = useState("");

    useEffect(() => {
        setNuevoStock(stockActual);
        setError("");
    }, [stockActual, producto?.id]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nuevoStock === "") return setError("La cantidad de stock es obligatoria");
        if (isNaN(nuevoStock) || !/^\d+$/.test(nuevoStock)) return setError("Ingrese un número válido (solo dígitos)");
        if (parseInt(nuevoStock) < 0) return setError("El stock no puede ser negativo");
        setError("");
        onSave(parseInt(nuevoStock));
    };

    const handleIncrement = () => { setNuevoStock(prev => parseInt(prev) + 1); setError(""); };
    const handleDecrement = () => {
        if (parseInt(nuevoStock) > 0) { setNuevoStock(prev => parseInt(prev) - 1); setError(""); }
    };

    const formatNumber = (value) => new Intl.NumberFormat('es-PE').format(value);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100001] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Package size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Actualizar Stock</h3>
                                <p className="text-blue-100 text-sm">{producto?.nombre}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Stock actual</span>
                            <span className={`text-2xl font-bold ${stockActual <= (producto?.stockMinimo || 5) ? "text-red-500" : "text-green-600"}`}>
                                {formatNumber(stockActual)} unidades
                            </span>
                        </div>
                        {stockActual <= (producto?.stockMinimo || 5) && (
                            <div className="mt-2 flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                                <AlertTriangle size={14} />
                                <span className="text-xs">Stock bajo, mínimo recomendado: {producto?.stockMinimo || 5} unidades</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nueva cantidad <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleDecrement} disabled={parseInt(nuevoStock) <= 0} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition">
                                <TrendingDown size={18} />
                            </button>
                            <input
                                type="text"
                                value={nuevoStock}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^\d]/g, "");
                                    setNuevoStock(val);
                                    setError("");
                                }}
                                className={`w-full text-center text-2xl font-bold py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${error ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"}`}
                                placeholder="0"
                            />
                            <button type="button" onClick={handleIncrement} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                                <TrendingUp size={18} />
                            </button>
                        </div>
                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                        <p className="text-xs text-gray-400 mt-2">Ingrese solo números (ej: 150)</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Cambio</span>
                            <span className={`font-bold ${parseInt(nuevoStock) > stockActual ? "text-green-600" :
                                parseInt(nuevoStock) < stockActual ? "text-red-600" : "text-gray-600"}`}>
                                {parseInt(nuevoStock) > stockActual ? `+${formatNumber(parseInt(nuevoStock) - stockActual)}` :
                                    parseInt(nuevoStock) < stockActual ? `-${formatNumber(stockActual - parseInt(nuevoStock))}` :
                                        "Sin cambios"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-blue-100">
                            <span className="text-gray-600">Nuevo stock</span>
                            <span className="font-bold text-[#5b4eff] text-lg">
                                {formatNumber(nuevoStock || 0)} unidades
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading || nuevoStock === "" || parseInt(nuevoStock) === stockActual}
                            className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Edit3 size={16} />
                                    Actualizar Stock
                                </>
                            )}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =====================================================
// Componente principal
// =====================================================
export default function StockList({ productos, onRefresh, showMessage }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🎯 Estados para filtros/orden/búsqueda
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todos");
    const [orden, setOrden] = useState("id-asc");

    const rowRefs = useRef({});
    const location = useLocation();
    const navigate = useNavigate();

    const abrirModal = (producto, stockActual) => {
        setSelectedProduct(producto);
        setSelectedStock(stockActual);
        setShowModal(true);
    };

    // 🎯 Opciones del dropdown de FILTRO
    const opcionesFiltro = [
        { value: "todos", label: "Todos", icon: <Layers size={14} />, color: "text-gray-500" },
        { value: "agotados", label: "Agotados", icon: <XCircle size={14} />, color: "text-red-500" },
        { value: "bajo", label: "Stock bajo", icon: <AlertTriangle size={14} />, color: "text-amber-500" },
        { value: "disponibles", label: "Disponibles", icon: <CheckCircle size={14} />, color: "text-green-500" },
    ];

    // 🎯 Opciones del dropdown de ORDEN
    const opcionesOrden = [
        { value: "id-asc", label: "Nº", icon: <ArrowUp size={14} />, color: "text-gray-500" },
        { value: "id-desc", label: "Nº", icon: <ArrowDown size={14} />, color: "text-gray-500" },
        { value: "urgencia", label: "Urgencia", icon: <Clock size={14} />, color: "text-[#5b4eff]" },
        { value: "nombre", label: "A-Z", icon: <SortAsc size={14} />, color: "text-gray-500" },
    ];

    // 🎯 Efecto del highlight
    useEffect(() => {
        const { highlightId, openEditModal } = location.state || {};
        if (!highlightId) return;
        if (!productos || productos.length === 0) return;

        const producto = productos.find(p => p.id === highlightId);
        if (!producto) {
            showMessage?.("warning", "El producto ya no existe");
            navigate(location.pathname, { replace: true, state: {} });
            return;
        }

        const row = rowRefs.current[highlightId];
        if (!row) return;

        const productoCapturado = producto;
        const stockActualCapturado = producto.stock || 0;

        const rowTop = row.getBoundingClientRect().top + window.pageYOffset;
        const offset = window.innerHeight / 2 - row.offsetHeight / 2;
        window.scrollTo({ top: rowTop - offset, behavior: "smooth" });

        const celdas = row.querySelectorAll("td");
        const pintar = (color, sombra) => {
            row.style.transition = "background-color 0.3s ease, box-shadow 0.3s ease";
            row.style.backgroundColor = color;
            row.style.boxShadow = sombra;
            celdas.forEach(td => {
                td.style.transition = "background-color 0.3s ease";
                td.style.backgroundColor = color;
            });
        };

        pintar("#0a64fa", "inset 0 0 0 2px #5b4eff");

        let contador = 0;
        const intervalo = setInterval(() => {
            contador++;
            if (contador % 2 === 0) {
                pintar("#0a64fa", "inset 0 0 0 2px #4a3dcc");
            } else {
                pintar("#0a64fa", "inset 0 0 0 2px #5b4eff");
            }
        }, 500);

        setTimeout(() => {
            clearInterval(intervalo);
            row.style.backgroundColor = "";
            row.style.boxShadow = "";
            row.style.transition = "background-color 0.5s ease";
            celdas.forEach(td => {
                td.style.backgroundColor = "";
                td.style.transition = "background-color 0.5s ease";
            });
        }, 2500);

        navigate(location.pathname, { replace: true, state: {} });

        if (openEditModal) {
            setTimeout(() => {
                abrirModal(productoCapturado, stockActualCapturado);
            }, 1800);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, productos]);

    // 🎯 Aplicar filtros + orden
    const productosFiltrados = useMemo(() => {
        let lista = [...(productos || [])];

        if (filtro !== "todos") {
            lista = lista.filter(p => {
                const s = p.stock || 0;
                const m = p.stockMinimo || 5;
                if (filtro === "agotados") return s === 0;
                if (filtro === "bajo") return s > 0 && s <= m;
                if (filtro === "disponibles") return s > m;
                return true;
            });
        }

        const prioridad = (p) => {
            const s = p.stock || 0;
            const m = p.stockMinimo || 5;
            if (s === 0) return 0;
            if (s <= m) return 1;
            return 2;
        };

        lista.sort((a, b) => {
            if (orden === "id-asc") return a.id - b.id;
            if (orden === "id-desc") return b.id - a.id;
            if (orden === "nombre") return (a.nombre || "").localeCompare(b.nombre || "");
            if (orden === "urgencia") {
                const prioA = prioridad(a);
                const prioB = prioridad(b);
                if (prioA !== prioB) return prioA - prioB;
                const faltanA = (a.stockMinimo || 5) - (a.stock || 0);
                const faltanB = (b.stockMinimo || 5) - (b.stock || 0);
                if (faltanA !== faltanB) return faltanB - faltanA;
                return a.id - b.id;
            }
            return 0;
        });

        return lista;
    }, [productos, filtro, orden]);

    const actualizarStock = async (nuevaCantidad) => {
        setLoading(true);
        try {
            const stockData = await stockService.buscarPorProducto(selectedProduct.id);
            if (!stockData || !stockData.id) throw new Error("No se encontró el registro de stock");

            const resultado = await stockService.actualizar(stockData.id, {
                id: stockData.id,
                producto: { id: selectedProduct.id },
                cantidad: nuevaCantidad
            });

            if (resultado) {
                showMessage("success", `Stock de "${selectedProduct.nombre}" actualizado a ${new Intl.NumberFormat('es-PE').format(nuevaCantidad)} unidades`);
                setShowModal(false);
                await onRefresh();
            } else {
                throw new Error("No se recibió confirmación del servidor");
            }
        } catch (error) {
            let mensajeError = "Error al actualizar stock";
            if (error.message) mensajeError = error.message;
            if (error.response?.data) {
                mensajeError = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || error.response.data.error;
            }
            showMessage("error", `❌ ${mensajeError}`);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (stockActual, stockMinimo) => {
        if (stockActual <= 0) return { text: "Agotado", color: "bg-red-100 text-red-700", icon: <XCircle size={14} className="inline mr-1" /> };
        if (stockActual <= stockMinimo) return { text: "Stock Bajo", color: "bg-amber-100 text-amber-700", icon: <AlertTriangle size={14} className="inline mr-1" /> };
        return { text: "Disponible", color: "bg-green-100 text-green-700", icon: <CheckCircle size={14} className="inline mr-1" /> };
    };

    const formatNumber = (value) => new Intl.NumberFormat('es-PE').format(value);

    return (
        <div>
            <StockModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                producto={selectedProduct}
                stockActual={selectedStock}
                onSave={actualizarStock}
                loading={loading}
            />

            {/* ─────────── HEADER CON 3 PANELES SEPARADOS (COMPACTO) ─────────── */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-2 lg:gap-3 mb-4">

                {/* PANEL 1: Título + subtítulo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3 flex-shrink-0 flex flex-col justify-center min-h-[64px]">
                    <h2 className="text-base font-bold text-gray-800 leading-tight">Gestión de Stock</h2>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">Controla el inventario de tus productos</p>
                </div>

                {/* PANEL 2: Controles */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex flex-col sm:flex-row gap-2 flex-1 lg:flex-initial items-center min-h-[64px]">
                    <CustomDropdown
                        valor={filtro}
                        onChange={setFiltro}
                        opciones={opcionesFiltro}
                        iconoPrincipal={<Filter size={13} />}
                        ancho="w-full sm:w-44"
                    />

                    <CustomDropdown
                        valor={orden}
                        onChange={setOrden}
                        opciones={opcionesOrden}
                        iconoPrincipal={<ArrowUpDown size={13} />}
                        ancho="w-full sm:w-48"
                    />

                    <div className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-md whitespace-nowrap h-[34px]">
                        <SlidersHorizontal size={11} className="mr-1" />
                        {productosFiltrados.length} {productosFiltrados.length === 1 ? "producto" : "productos"}
                    </div>
                </div>

                <div className="hidden lg:block flex-1" />
                {/* PANEL 3: Leyenda */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-3 flex-shrink-0 flex items-center min-h-[64px]">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">Stock bajo</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                            <span className="text-gray-600">Agotado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────── TABLA ─────────── */}
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock Actual</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock Mínimo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {productosFiltrados.map((producto) => {
                                const stockActual = producto.stock || 0;
                                const stockMinimo = producto.stockMinimo || 5;
                                const status = getStockStatus(stockActual, stockMinimo);
                                const porcentaje = Math.min(100, (stockActual / (stockMinimo * 2)) * 100);

                                return (
                                    <tr
                                        key={producto.id}
                                        ref={el => rowRefs.current[producto.id] = el}
                                        className="hover:bg-gray-50 transition group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Package size={18} className="text-gray-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">{producto.nombre}</p>
                                                    <p className="text-xs text-gray-400">
                                                        Código: PROD-{String(producto.id).padStart(4, '0')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xl font-bold ${stockActual <= stockMinimo ? "text-red-600" : "text-green-600"}`}>
                                                        {formatNumber(stockActual)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">unidades</span>
                                                </div>
                                                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${stockActual <= 0 ? "bg-red-500" :
                                                            stockActual <= stockMinimo ? "bg-amber-500" : "bg-green-500"}`}
                                                        style={{ width: `${porcentaje}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className="font-medium text-gray-700">{formatNumber(stockMinimo)}</span>
                                                <span className="text-xs text-gray-400 block">unidades</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.icon} {status.text}
                                            </span>
                                            {stockActual <= stockMinimo && stockActual > 0 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    Faltan {formatNumber(stockMinimo - stockActual)} para mínimo
                                                </p>
                                            )}
                                            {stockActual === 0 && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    ¡Requiere reposición urgente!
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => abrirModal(producto, stockActual)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all group-hover:scale-105"
                                            >
                                                <Edit3 size={14} />
                                                Actualizar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {productosFiltrados.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">
                            {productos.length === 0
                                ? "No hay productos registrados"
                                : "No se encontraron productos con estos filtros"}
                        </p>
                        {productos.length > 0 && (
                            <button
                                onClick={() => { setFiltro("todos"); setOrden("id-asc"); }}
                                className="mt-3 text-sm text-[#5b4eff] hover:underline font-medium"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}