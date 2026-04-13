import React, { useState } from "react";
import { usuarioService } from "../../../services/api";
import UsuarioForm from "./UsuarioForm";

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

export default function UsuariosList({ usuarios, roles, onRefresh, showMessage }) {
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteClick = (usuario) => {
        setUserToDelete(usuario);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await usuarioService.eliminar(userToDelete.id);
                showMessage("success", `✅ Usuario "${userToDelete.correo}" eliminado correctamente`);
                onRefresh();
            } catch (error) {
                showMessage("error", "❌ Error al eliminar usuario");
            } finally {
                setShowConfirm(false);
                setUserToDelete(null);
            }
        }
    };

    // ✅ CORREGIDO: handleUpdateRole - enviar el ID del rol seleccionado
    const handleUpdateRole = async (userId, rolId) => {
        try {
            // Buscar el rol seleccionado
            const rolSeleccionado = roles.find(r => r.id === parseInt(rolId));
            
            if (!rolSeleccionado) {
                showMessage("error", "Rol no encontrado");
                return;
            }
            
            // ✅ Actualizar solo el rol del usuario
            await usuarioService.actualizar(userId, {
                rolId: parseInt(rolId)
            });
            
            showMessage("success", `✅ Rol actualizado a ${rolSeleccionado.nombre} correctamente`);
            onRefresh();
        } catch (error) {
            console.error("Error al actualizar rol:", error);
            showMessage("error", "❌ Error al actualizar rol");
        }
    };

    // ✅ Función para obtener el nombre del rol para mostrar
    const getRolNombre = (usuario) => {
        // Si el rol es un objeto con nombre
        if (usuario.rol && typeof usuario.rol === 'object' && usuario.rol.nombre) {
            return usuario.rol.nombre;
        }
        // Si el rol es un string (ej: "ADMIN")
        if (typeof usuario.rol === 'string') {
            return usuario.rol;
        }
        return "SIN ROL";
    };

    // ✅ Función para obtener el ID del rol para el select
    const getRolId = (usuario) => {
        if (usuario.rol && typeof usuario.rol === 'object' && usuario.rol.id) {
            return usuario.rol.id;
        }
        // Buscar el ID del rol por nombre
        const rolNombre = typeof usuario.rol === 'string' ? usuario.rol : null;
        if (rolNombre) {
            const rol = roles.find(r => r.nombre === rolNombre);
            return rol ? rol.id : "";
        }
        return "";
    };

    return (
        <div>
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setUserToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar usuario?"
                message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.correo}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-[#5b4eff] text-white rounded-lg text-sm font-bold hover:bg-[#4a3dcc]"
                >
                    + Nuevo Usuario
                </button>
            </div>

            {showForm && (
                <UsuarioForm
                    roles={roles}
                    onClose={() => setShowForm(false)}
                    onRefresh={onRefresh}
                    showMessage={showMessage}
                />
            )}

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Correo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{usuario.id}</td>
                                <td className="px-6 py-4">{usuario.correo}</td>
                                <td className="px-6 py-4">
                                    {/* ✅ Mostrar el nombre del rol correctamente */}
                                    <select
                                        value={getRolId(usuario)}
                                        onChange={(e) => handleUpdateRole(usuario.id, e.target.value)}
                                        className="px-2 py-1 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#5b4eff]"
                                    >
                                        {roles.map(rol => (
                                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        usuario.activo ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                    }`}>
                                        {usuario.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleDeleteClick(usuario)} 
                                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                    >
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