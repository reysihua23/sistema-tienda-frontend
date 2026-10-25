import React, { useState } from "react";
import { productoService } from "../../../services/api";
import ProductoForm from "./ProductoForm";
import { Edit2, Trash2, Package, AlertCircle } from "lucide-react";

// Componente de confirmación personalizado (SIN CAMBIOS)
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductosList({ productos, onRefresh, showMessage }) {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const handleDeleteClick = (producto) => {
        setProductToDelete(producto);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete) {
            try {
                await productoService.eliminar(productToDelete.id);
                showMessage("success", `"${productToDelete.nombre}" ha sido desactivado del catálogo`);
                onRefresh();
            } catch (error) {
                showMessage("error", "Error al eliminar producto");
            } finally {
                setShowConfirm(false);
                setProductToDelete(null);
            }
        }
    };

    const handleEdit = (producto) => {
        setEditingProduct(producto);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    return (
        <div className="w-full">
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setProductToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="¿Desactivar producto?"
                message={`¿Estás seguro de que deseas desactivar "${productToDelete?.nombre}"? Ya no se mostrará en la tienda, pero conservarás su historial de ventas.`}
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
            />

            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Gestión de Productos</h2>
                    <p className="text-sm text-gray-500 mt-1">Administra el catálogo y stock de tu tienda</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] transition-all shadow-md shadow-[#5b4eff]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Package size={18} />
                    Nuevo Producto
                </button>
            </div>

            {showForm && (
                <ProductoForm
                    editingProduct={editingProduct}
                    onClose={handleCloseForm}
                    onRefresh={onRefresh}
                    showMessage={showMessage}
                />
            )}

            {/* ======================================================== */}
            {/* ✅ VISTA ESCRITORIO (Tabla Clásica)                      */}
            {/* ======================================================== */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nº</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {productos.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-400 font-medium">#{producto.id}</td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-800 text-sm">{producto.nombre}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">{producto.descripcion}</p>
                                </td>
                                <td className="px-6 py-4 font-black text-gray-700">S/ {producto.precio}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                        (producto.stock || 0) <= (producto.stockMinimo || 5)
                                            ? "bg-red-50 text-red-600 border-red-100" 
                                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    }`}>
                                        {producto.stock || 0} und.
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {producto.activo !== false ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Activo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button onClick={() => handleEdit(producto)} className="text-[#5b4eff] hover:text-[#4a3dcc] text-sm font-bold transition-colors">
                                        Editar
                                    </button>
                                    {producto.activo !== false && (
                                        <button onClick={() => handleDeleteClick(producto)} className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors">
                                            Desactivar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ======================================================== */}
            {/* ✅ VISTA MÓVIL (Cards dinámicos con borde y contraste)   */}
            {/* ======================================================== */}
            <div className="md:hidden space-y-4">
                {productos.map((producto) => {
                    // ✅ Lógica para aplicar estilos condicionales
                    const esActivo = producto.activo !== false;

                    return (
                        <div 
                            key={producto.id} 
                            className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                                esActivo 
                                    ? "bg-white border-indigo-300 shadow-md shadow-indigo-100/50" // Borde más notorio, fondo blanco puro, sombra
                                    : "bg-gray-50/50 border-gray-200 opacity-70 grayscale-[0.5]" // Fondo apagado, borde claro, opacidad reducida
                            }`}
                        >
                            <div className="p-4">
                                {/* Fila 1: Imagen, Título y Estado */}
                                <div className="flex gap-3 items-start mb-4">
                                    
                                    {/* Imagen */}
                                    <div className={`w-16 h-16 rounded-xl border flex items-center justify-center flex-shrink-0 p-1 ${
                                        esActivo ? "bg-gray-50 border-gray-200" : "bg-gray-100 border-gray-200"
                                    }`}>
                                        {producto.imagenUrl ? (
                                            <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-contain" />
                                        ) : (
                                            <Package size={24} className={esActivo ? "text-gray-400" : "text-gray-300"} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                                    esActivo ? "text-gray-500" : "text-gray-400"
                                                }`}>ID: {producto.id}</p>
                                                
                                                {/* ✅ Título en Negrita si está activo, más suave si está inactivo */}
                                                <h3 className={`text-sm leading-tight truncate ${
                                                    esActivo ? "font-black text-gray-900" : "font-semibold text-gray-500"
                                                }`}>
                                                    {producto.nombre}
                                                </h3>
                                            </div>
                                            
                                            {/* Badge de Estado */}
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-md flex-shrink-0 border ${
                                                esActivo 
                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                                                    : "bg-gray-200 text-gray-600 border-gray-300"
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${esActivo ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></div>
                                                {esActivo ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                        <p className={`text-xs line-clamp-2 mt-1 leading-snug ${
                                            esActivo ? "text-gray-600" : "text-gray-400"
                                        }`}>
                                            {producto.descripcion}
                                        </p>
                                    </div>
                                </div>

                                {/* Fila 2: Datos (Precio y Stock) */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`flex-1 rounded-xl p-3 border ${
                                        esActivo ? "bg-slate-50 border-slate-200" : "bg-gray-100/50 border-gray-200"
                                    }`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${
                                            esActivo ? "text-gray-500" : "text-gray-400"
                                        }`}>Precio</p>
                                        {/* ✅ Precio resaltado en negro si está activo */}
                                        <p className={`text-base ${
                                            esActivo ? "font-black text-slate-900" : "font-semibold text-gray-500"
                                        }`}>
                                            S/ {producto.precio}
                                        </p>
                                    </div>
                                    <div className={`flex-1 rounded-xl p-3 border ${
                                        esActivo ? "bg-slate-50 border-slate-200" : "bg-gray-100/50 border-gray-200"
                                    }`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${
                                            esActivo ? "text-gray-500" : "text-gray-400"
                                        }`}>Stock</p>
                                        <p className={`text-base flex items-center gap-1 ${
                                            (producto.stock || 0) <= (producto.stockMinimo || 5) 
                                                ? (esActivo ? "text-red-500 font-black" : "text-red-400 font-semibold")
                                                : (esActivo ? "text-emerald-600 font-black" : "text-emerald-500/70 font-semibold")
                                        }`}>
                                            {producto.stock || 0} <span className="text-[11px] font-semibold">und.</span>
                                            {(producto.stock || 0) <= (producto.stockMinimo || 5) && <AlertCircle size={14} className="ml-auto" />}
                                        </p>
                                    </div>
                                </div>

                                {/* Fila 3: Botones de Acción */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(producto)} 
                                        className={`flex-1 py-3 rounded-xl text-xs font-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                                            esActivo 
                                                ? "bg-[#5b4eff]/10 text-[#5b4eff] hover:bg-[#5b4eff]/20"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }`}
                                    >
                                        <Edit2 size={16} /> Editar
                                    </button>
                                    {esActivo && (
                                        <button 
                                            onClick={() => handleDeleteClick(producto)} 
                                            className="flex-1 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Trash2 size={16} /> Desactivar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State Global */}
            {productos.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 mt-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={36} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">No hay productos registrados</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Comienza agregando tu primer producto para verlo en la tienda virtual.</p>
                </div>
            )}
        </div>
    );
}