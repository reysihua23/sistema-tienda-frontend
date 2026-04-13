import React, { useState } from "react";
import { productoService } from "../../../services/api";
import ProductoForm from "./ProductoForm";

// Componente de confirmación personalizado
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{message}</p>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition"
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
                showMessage("success", ` "${productToDelete.nombre}" eliminado correctamente`);
                onRefresh();
            } catch (error) {
                showMessage("error", " Error al eliminar producto");
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
        <div>
            {/* Modal de confirmación */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setProductToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar producto?"
                message={`¿Estás seguro de que deseas eliminar "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestión de Productos</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-[#5b4eff] text-white rounded-lg text-sm font-bold hover:bg-[#4a3dcc]"
                >
                    + Nuevo Producto
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

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {productos.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{producto.id}</td>
                                <td className="px-6 py-4">
                                    <p className="font-medium">{producto.nombre}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{producto.descripcion}</p>
                                </td>
                                <td className="px-6 py-4 font-bold">S/ {producto.precio}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        (producto.stock || 0) <= (producto.stockMinimo || 5)
                                            ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                    }`}>
                                        {producto.stock || 0} unidades
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleEdit(producto)} className="text-blue-500 hover:text-blue-700 text-sm">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteClick(producto)} className="text-red-500 hover:text-red-700 text-sm">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}