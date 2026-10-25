// pages/admin/components/UsuariosList.jsx
import React, { useState } from "react";
import { usuarioService } from "../../../services/api";
import UsuarioForm from "./UsuarioForm";
import { Edit2, Trash2, Shield, User } from "lucide-react";

// Componente de confirmación (Reutilizable)
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDanger ? 'bg-red-100' : 'bg-[#5b4eff]/10'}`}>
                            {isDanger ? (
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            ) : (
                                <Shield className="w-6 h-6 text-[#5b4eff]" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    
                    <div className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-2.5 text-white rounded-xl font-bold transition shadow-sm ${
                                isDanger 
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" 
                                    : "bg-[#5b4eff] hover:bg-[#4a3dcc] shadow-[#5b4eff]/30"
                            }`}
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
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
    const [userToEdit, setUserToEdit] = useState(null);
    
    // ✅ Estado para la confirmación del cambio de rol
    const [roleChangeData, setRoleChangeData] = useState(null);

    const handleDeleteClick = (usuario) => {
        setUserToDelete(usuario);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await usuarioService.eliminar(userToDelete.id);
                showMessage("success", `Usuario "${userToDelete.correo}" desactivado correctamente`);
                onRefresh();
            } catch (error) {
                showMessage("error", "Error al desactivar usuario");
            } finally {
                setShowConfirm(false);
                setUserToDelete(null);
            }
        }
    };

    // ✅ 1. Función que intercepta el guardado desde el formulario
    const handleBeforeUpdate = (nuevoRolId) => {
        return new Promise((resolve) => {
            setRoleChangeData({
                nuevoRolId: parseInt(nuevoRolId),
                nuevoRolNombre: roles.find(r => r.id === parseInt(nuevoRolId))?.nombre,
                resolve: resolve // Guardamos la promesa
            });
        });
    };

    // ✅ 2. Confirmar cambio
    const handleConfirmRoleChange = () => {
        if (roleChangeData?.resolve) {
            roleChangeData.resolve(true); // Resolvemos la promesa a true para que el form guarde
            setRoleChangeData(null); // Cerramos el modal
        }
    };

    // ✅ 3. Cancelar cambio
    const handleCancelRoleChange = () => {
        if (roleChangeData?.resolve) {
            roleChangeData.resolve(false); // Resolvemos la promesa a false para que el form no guarde
            setRoleChangeData(null);
        }
    };

    const getRolId = (usuario) => {
        if (!usuario || !usuario.rol) return "";
        if (typeof usuario.rol === 'object' && usuario.rol.id) return usuario.rol.id;
        if (typeof usuario.rol === 'string') {
            const rol = roles.find(r => r.nombre === usuario.rol);
            return rol ? rol.id : "";
        }
        return "";
    };

    const getNombreRol = (usuario) => {
        if (!usuario || !usuario.rol) return "SIN ROL";
        if (typeof usuario.rol === 'object' && usuario.rol.nombre) return usuario.rol.nombre;
        if (typeof usuario.rol === 'string') return usuario.rol;
        return "SIN ROL";
    };

    return (
        <div className="w-full">
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => { setShowConfirm(false); setUserToDelete(null); }}
                onConfirm={handleConfirmDelete}
                title="¿Desactivar usuario?"
                message={`¿Estás seguro de que deseas desactivar al usuario "${userToDelete?.correo}"? El usuario ya no podrá iniciar sesión.`}
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                isDanger={true}
            />

            {/* ✅ Modal de Confirmación desde el Formulario */}
            <ConfirmModal
                isOpen={!!roleChangeData}
                onClose={handleCancelRoleChange}
                onConfirm={handleConfirmRoleChange}
                title="Confirmar cambio de rol"
                message={
                    <div className="space-y-3">
                        <p>Estás a punto de cambiar los permisos de acceso de un usuario.</p>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Rol a asignar:</span>
                                <span className="text-sm font-black text-[#5b4eff] uppercase">
                                    {roleChangeData?.nuevoRolNombre}
                                </span>
                            </div>
                        </div>
                    </div>
                }
                confirmText="Sí, confirmar cambio"
                cancelText="Cancelar"
                isDanger={false}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
                    <p className="text-sm text-gray-500 mt-1">Administra los accesos y roles del personal</p>
                </div>
                <button
                    onClick={() => { setUserToEdit(null); setShowForm(true); }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] transition-all shadow-md shadow-[#5b4eff]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <User size={18} /> Nuevo Usuario
                </button>
            </div>

            {showForm && (
                <UsuarioForm
                    editingUser={userToEdit}
                    roles={roles}
                    onBeforeUpdate={handleBeforeUpdate} // ✅ Pasamos la función de confirmación
                    onClose={() => { setShowForm(false); setUserToEdit(null); }}
                    onRefresh={onRefresh}
                    showMessage={showMessage}
                />
            )}

            {/* ======================================================== */}
            {/* ✅ VISTA ESCRITORIO (Tabla Clásica SIN SELECT)           */}
            {/* ======================================================== */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nº</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Correo</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-400 font-medium">#{usuario.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 text-sm">{usuario.correo}</td>
                                {/* ✅ AHORA ES SOLO TEXTO */}
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                                        {getNombreRol(usuario)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {usuario.activo ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Activo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button 
                                        onClick={() => { setUserToEdit(usuario); setShowForm(true); }} 
                                        className="text-[#5b4eff] hover:text-[#4a3dcc] text-sm font-bold transition-colors"
                                    >
                                        Editar
                                    </button>
                                    {usuario.activo && (
                                        <button 
                                            onClick={() => handleDeleteClick(usuario)} 
                                            className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                                        >
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
            {/* ✅ VISTA MÓVIL (Cards Premium)                           */}
            {/* ======================================================== */}
            <div className="md:hidden space-y-4">
                {usuarios.map((usuario) => {
                    const esActivo = usuario.activo;
                    const nombreRol = getNombreRol(usuario);

                    return (
                        <div 
                            key={usuario.id} 
                            className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                                esActivo 
                                    ? "bg-white border-indigo-300 shadow-md shadow-indigo-100/50" 
                                    : "bg-gray-50/50 border-gray-200 opacity-70 grayscale-[0.5]" 
                            }`}
                        >
                            <div className="p-4">
                                <div className="flex gap-3 items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                                        esActivo ? "bg-indigo-50 border-indigo-300 text-indigo-600" : "bg-gray-100 border-gray-200 text-gray-400"
                                    }`}>
                                        <Shield size={22} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">ID: {usuario.id}</p>
                                                <h3 className={`text-sm leading-tight truncate ${esActivo ? "font-black text-gray-900" : "font-semibold text-gray-500"}`}>
                                                    {usuario.correo}
                                                </h3>
                                            </div>
                                            
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-md flex-shrink-0 border ${
                                                esActivo 
                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                                                    : "bg-gray-200 text-gray-600 border-gray-300"
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${esActivo ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></div>
                                                {esActivo ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Rol asignado</p>
                                        <p className={`text-sm font-black ${esActivo ? "text-slate-800" : "text-gray-500"}`}>
                                            {nombreRol}
                                        </p>
                                    </div>
                                    <Shield size={16} className="text-slate-300" />
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setUserToEdit(usuario); setShowForm(true); }} 
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
                                            onClick={() => handleDeleteClick(usuario)} 
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
        </div>
    );
}