/**import React from "react";
import { stockService } from "../../../services/api";

export default function StockList({ productos, onRefresh, showMessage }) {

    const actualizarStock = async (productoId, stockActual) => {
        const nuevaCantidad = prompt("Ingrese la nueva cantidad de stock:", stockActual);
        if (nuevaCantidad !== null && !isNaN(nuevaCantidad)) {
            try {
                console.log("=== ACTUALIZANDO STOCK ===");
                console.log("Producto ID:", productoId);
                console.log("Nueva cantidad:", nuevaCantidad);
                
                // 1. Obtener el registro de stock
                const stockData = await stockService.buscarPorProducto(productoId);
                console.log("Stock actual antes:", stockData);
                
                if (!stockData || !stockData.id) {
                    throw new Error("No se encontró el registro de stock");
                }
                
                // 2. Actualizar stock
                const resultado = await stockService.actualizar(stockData.id, {
                    id: stockData.id,
                    producto: { id: productoId },
                    cantidad: parseInt(nuevaCantidad)
                });
                
                console.log("Resultado de actualización:", resultado);
                
                // ✅ Verificar si la actualización fue exitosa
                // El backend puede devolver el stock actualizado o un mensaje
                if (resultado) {
                    showMessage("success", ` Stock actualizado de ${stockActual} a ${nuevaCantidad} unidades`);
                    // ✅ Recargar datos
                    await onRefresh();
                } else {
                    throw new Error("No se recibió confirmación del servidor");
                }
                
            } catch (error) {
                console.error("❌ Error completo:", error);
                
                // ✅ Mostrar mensaje más amigable
                let mensajeError = "Error al actualizar stock";
                if (error.message) {
                    mensajeError = error.message;
                }
                if (error.response?.data) {
                    mensajeError = error.response.data;
                }
                
                showMessage("error", `❌ ${mensajeError}`);
            }
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Gestión de Stock</h2>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Stock Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Stock Mínimo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Disponibilidad</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {productos.map((producto) => {
                            const stockActual = producto.stock || 0;
                            const stockMinimo = producto.stockMinimo || 5;
                            
                            return (
                                <tr key={producto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{producto.nombre}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${
                                            stockActual <= stockMinimo ? "text-red-600" : "text-green-600"
                                        }`}>
                                            {stockActual} unidades
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{stockMinimo} unidades</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            stockActual > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                        }`}>
                                            {stockActual > 0 ? " Disponible" : "❌ Agotado"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => actualizarStock(producto.id, stockActual)} 
                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                        >
                                            📦 Actualizar Stock
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
*/

// pages/admin/components/StockList.jsx
import React, { useState } from "react";
import { stockService } from "../../../services/api";
import { Package, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Edit3, X } from "lucide-react";

// Modal para actualizar stock
const StockModal = ({ isOpen, onClose, producto, stockActual, onSave, loading }) => {
    const [nuevoStock, setNuevoStock] = useState(stockActual);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validaciones
        if (nuevoStock === "") {
            setError("La cantidad de stock es obligatoria");
            return;
        }
        if (isNaN(nuevoStock) || !/^\d+$/.test(nuevoStock)) {
            setError("Ingrese un número válido (solo dígitos)");
            return;
        }
        if (parseInt(nuevoStock) < 0) {
            setError("El stock no puede ser negativo");
            return;
        }
        
        setError("");
        onSave(parseInt(nuevoStock));
    };

    const handleIncrement = () => {
        setNuevoStock(prev => parseInt(prev) + 1);
        setError("");
    };

    const handleDecrement = () => {
        if (parseInt(nuevoStock) > 0) {
            setNuevoStock(prev => parseInt(prev) - 1);
            setError("");
        }
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-PE').format(value);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
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

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Stock actual */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Stock actual</span>
                            <span className={`text-2xl font-bold ${
                                stockActual <= (producto?.stockMinimo || 5) ? "text-red-500" : "text-green-600"
                            }`}>
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

                    {/* Nuevo stock */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nueva cantidad <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleDecrement}
                                disabled={parseInt(nuevoStock) <= 0}
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition"
                            >
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
                                className={`w-full text-center text-2xl font-bold py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                    error ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"
                                }`}
                                placeholder="0"
                            />
                            <button
                                type="button"
                                onClick={handleIncrement}
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                            >
                                <TrendingUp size={18} />
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 mt-2">{error}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Ingrese solo números (ej: 150)</p>
                    </div>

                    {/* Resumen del cambio */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Cambio</span>
                            <span className={`font-bold ${
                                parseInt(nuevoStock) > stockActual ? "text-green-600" : 
                                parseInt(nuevoStock) < stockActual ? "text-red-600" : "text-gray-600"
                            }`}>
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

                    {/* Botones */}
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
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function StockList({ productos, onRefresh, showMessage }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const abrirModal = (producto, stockActual) => {
        setSelectedProduct(producto);
        setSelectedStock(stockActual);
        setShowModal(true);
    };

    const actualizarStock = async (nuevaCantidad) => {
        setLoading(true);
        
        try {
            // Obtener el registro de stock
            const stockData = await stockService.buscarPorProducto(selectedProduct.id);
            
            if (!stockData || !stockData.id) {
                throw new Error("No se encontró el registro de stock");
            }
            
            // Actualizar stock
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
            if (error.message) {
                mensajeError = error.message;
            }
            if (error.response?.data) {
                mensajeError = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || error.response.data.error;
            }
            
            showMessage("error", `❌ ${mensajeError}`);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (stockActual, stockMinimo) => {
        if (stockActual <= 0) {
            return { text: "Agotado", color: "bg-red-100 text-red-700", icon: <XCircle size={14} className="inline mr-1" /> };
        }
        if (stockActual <= stockMinimo) {
            return { text: "Stock Bajo", color: "bg-amber-100 text-amber-700", icon: <AlertTriangle size={14} className="inline mr-1" /> };
        }
        return { text: "Disponible", color: "bg-green-100 text-green-700", icon: <CheckCircle size={14} className="inline mr-1" /> };
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-PE').format(value);
    };

    return (
        <div>
            {/* Modal de actualización de stock */}
            <StockModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                producto={selectedProduct}
                stockActual={selectedStock}
                onSave={actualizarStock}
                loading={loading}
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Gestión de Stock</h2>
                    <p className="text-sm text-gray-500 mt-1">Controla el inventario de tus productos</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">Stock bajo</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-gray-600">Agotado</span>
                        </div>
                    </div>
                </div>
            </div>

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
                            {productos.map((producto) => {
                                const stockActual = producto.stock || 0;
                                const stockMinimo = producto.stockMinimo || 5;
                                const status = getStockStatus(stockActual, stockMinimo);
                                const porcentaje = Math.min(100, (stockActual / (stockMinimo * 2)) * 100);
                                
                                return (
                                    <tr key={producto.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                    <Package size={18} className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{producto.nombre}</p>
                                                    <p className="text-xs text-gray-400">ID: #{producto.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xl font-bold ${
                                                        stockActual <= stockMinimo ? "text-red-600" : "text-green-600"
                                                    }`}>
                                                        {formatNumber(stockActual)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">unidades</span>
                                                </div>
                                                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            stockActual <= 0 ? "bg-red-500" :
                                                            stockActual <= stockMinimo ? "bg-amber-500" : "bg-green-500"
                                                        }`}
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
                
                {productos.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No hay productos registrados</p>
                    </div>
                )}
            </div>
        </div>
    );
}
