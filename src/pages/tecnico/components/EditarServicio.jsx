// pages/tecnico/components/EditarServicio.jsx
import React, { useState } from "react";
import { servicioTecnicoService, clienteService } from "../../../services/api";
import { 
    Wrench, ClipboardList, Save, X, AlertCircle, 
    User, Mail, Phone, FileText 
} from "lucide-react";

export default function EditarServicio({ servicio, onSuccess, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Precargamos los datos del servicio y del cliente
    const [formData, setFormData] = useState({
        equipo: servicio.equipo || "",
        problema: servicio.problema || "",
        clienteNombre: servicio.clienteNombre || "",
        clienteTelefono: servicio.clienteTelefono || "",
        clienteEmail: servicio.clienteEmail || "",
        clienteDocumento: servicio.clienteDocumento || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.equipo.trim()) return setError("El equipo es obligatorio");
        if (!formData.problema.trim()) return setError("El problema es obligatorio");
        if (!formData.clienteNombre.trim()) return setError("El nombre del cliente es obligatorio");

        setLoading(true);
        setError(null);

        try {
            // 1. Actualizamos el servicio
            await servicioTecnicoService.actualizar(servicio.id, {
                equipo: formData.equipo.trim(),
                problema: formData.problema.trim()
            });

            // 2. Actualizamos el cliente (asumiendo que tienes este método en tu API)
            // Si tu backend no tiene esto, avísame y lo ajustamos.
            if (servicio.clienteId) {
                await clienteService.actualizar(servicio.clienteId, {
                    nombre: formData.clienteNombre.trim(),
                    telefono: formData.clienteTelefono.trim(),
                    email: formData.clienteEmail.trim(),
                    documento: formData.clienteDocumento.trim()
                });
            }
            
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error al editar:", err);
            setError(err?.message || "Error al actualizar los datos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-sm">
                        <Wrench size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Editar Servicio y Cliente</h2>
                        <p className="text-xs text-gray-500">Servicio #{servicio.id}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* SECCIÓN: Datos del Servicio */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <Wrench size={16} className="text-[#5b4eff]" /> Datos del Servicio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Equipo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="equipo"
                                value={formData.equipo}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Problema reportado <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="problema"
                                value={formData.problema}
                                onChange={handleChange}
                                rows="2"
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] transition text-sm resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN: Datos del Cliente */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} className="text-[#5b4eff]" /> Datos del Cliente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Nombre completo <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="clienteNombre"
                                    value={formData.clienteNombre}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="clienteTelefono"
                                    value={formData.clienteTelefono}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Documento (DNI/RUC)</label>
                            <div className="relative">
                                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="clienteDocumento"
                                    value={formData.clienteDocumento}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="clienteEmail"
                                    value={formData.clienteEmail}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-1 focus:ring-[#5b4eff] transition text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 flex gap-3 border-t border-gray-100 sticky bottom-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={16} /> Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}