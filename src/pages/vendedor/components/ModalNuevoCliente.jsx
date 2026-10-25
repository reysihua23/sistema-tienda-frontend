import React, { useState } from "react";
import { 
    User, AlertCircle, X, Loader2, CheckCircle, 
    Mail, Phone, CreditCard, MapPin 
} from "lucide-react";

export default function ModalNuevoCliente({ isOpen, onClose, nuevoCliente, setNuevoCliente, crearCliente, showToast }) {
    const [modalError, setModalError] = useState({ show: false, message: "", campo: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    if (!isOpen) return null;

    const validarCliente = () => {
        if (!nuevoCliente.nombre.trim()) {
            setModalError({ show: true, message: "El nombre completo es obligatorio", campo: "nombre" });
            return false;
        }
        if (nuevoCliente.nombre.trim().length < 3) {
            setModalError({ show: true, message: "El nombre debe tener al menos 3 letras", campo: "nombre" });
            return false;
        }
        if (nuevoCliente.documento?.trim()) {
            const docRegex = /^[0-9]{8}$|^[0-9]{11}$/;
            if (!docRegex.test(nuevoCliente.documento)) {
                setModalError({ show: true, message: "El documento debe tener 8 (DNI) u 11 (RUC) dígitos", campo: "documento" });
                return false;
            }
        }
        if (nuevoCliente.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevoCliente.email)) {
                setModalError({ show: true, message: "Ingrese un correo válido", campo: "email" });
                return false;
            }
        }
        if (nuevoCliente.telefono?.trim()) {
            const telRegex = /^[0-9]{9}$/;
            if (!telRegex.test(nuevoCliente.telefono)) {
                setModalError({ show: true, message: "El teléfono debe tener 9 dígitos", campo: "telefono" });
                return false;
            }
        }
        return true;
    };

    const extraerMensajeError = (err) => {
        let mensaje = "Error al procesar el cliente";
        if (err.response?.data) {
            const data = err.response.data;
            if (data.error) mensaje = data.error;
            else if (data.message) mensaje = data.message;
        } else if (err.message) {
            if (err.message.includes("Error 400:")) {
                const match = err.message.match(/"error":"([^"]+)"/);
                mensaje = match ? match[1] : err.message.split("Error 400:")[1]?.trim() || err.message;
            } else mensaje = err.message;
        }
        return mensaje;
    };

    const handleCrearCliente = async (e) => {
        e.preventDefault();
        if (!validarCliente()) return;
        
        setIsSubmitting(true);
        setModalError({ show: false, message: "", campo: "" });
        
        try {
            await crearCliente();
            setNuevoCliente({ nombre: "", email: "", telefono: "", documento: "", direccion: "" });
            showToast("Cliente agregado a la venta", "success");
            onClose(); 
        } catch (err) {
            const errorMessage = extraerMensajeError(err);
            let errorCampo = "";
            if (errorMessage.includes("documento")) errorCampo = "documento";
            else if (errorMessage.includes("correo") || errorMessage.includes("email")) errorCampo = "email";
            else if (errorMessage.includes("nombre")) errorCampo = "nombre";
            else if (errorMessage.includes("teléfono")) errorCampo = "telefono";
            setModalError({ show: true, message: errorMessage, campo: errorCampo });
        } finally {
            setIsSubmitting(false);
        }
    };

    const limpiarErrorModal = () => setModalError({ show: false, message: "", campo: "" });

    const handleClose = () => {
        onClose();
        setModalError({ show: false, message: "", campo: "" });
        setNuevoCliente({ nombre: "", email: "", telefono: "", documento: "", direccion: "" });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={handleClose}>
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] px-6 py-5 rounded-t-3xl sticky top-0 z-10 flex justify-between items-center shadow-md">
                    <div>
                        <h3 className="text-white font-black text-xl flex items-center gap-2 tracking-tight">
                            <User size={22} className="text-[#5b4eff]" /> Nuevo Cliente
                        </h3>
                        <p className="text-gray-400 text-xs mt-1 font-medium">
                            Completa los datos para la venta
                        </p>
                    </div>
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-full transition-all hover:rotate-90">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleCrearCliente}>
                    <div className="p-6 space-y-5">
                        
                        {/* Alerta de Error Global */}
                        {modalError.show && (
                            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-red-700 text-sm font-bold">
                                        Revisa los datos ingresados
                                    </p>
                                    <p className="text-red-600 text-xs mt-0.5 break-words font-medium">{modalError.message}</p>
                                </div>
                            </div>
                        )}

                        {/* Campo: Nombre */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                Nombre completo <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'nombre' ? 'text-[#5b4eff]' : 'text-gray-400'}`}>
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Juan Pérez" 
                                    required
                                    value={nuevoCliente.nombre}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                        setNuevoCliente({ ...nuevoCliente, nombre: value });
                                        if (modalError.campo === "nombre") limpiarErrorModal();
                                    }}
                                    onFocus={() => setFocusedField('nombre')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl outline-none transition-all font-medium text-gray-800 ${
                                        modalError.campo === "nombre" 
                                            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                                            : "border-transparent focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/10"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Fila: Correo y Teléfono */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Campo: Correo */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Correo electrónico</label>
                                <div className="relative group">
                                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-[#5b4eff]' : 'text-gray-400'}`}>
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="cliente@email.com"
                                        value={nuevoCliente.email}
                                        onChange={(e) => {
                                            setNuevoCliente({ ...nuevoCliente, email: e.target.value });
                                            if (modalError.campo === "email") limpiarErrorModal();
                                        }}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl outline-none transition-all font-medium text-gray-800 ${
                                            modalError.campo === "email" 
                                                ? "border-red-300 bg-red-50/50 focus:border-red-500" 
                                                : "border-transparent focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/10"
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Campo: Teléfono */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Teléfono</label>
                                <div className="relative group">
                                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'telefono' ? 'text-[#5b4eff]' : 'text-gray-400'}`}>
                                        <Phone size={18} />
                                    </div>
                                    <input 
                                        type="tel" 
                                        placeholder="912345678"
                                        value={nuevoCliente.telefono}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            setNuevoCliente({ ...nuevoCliente, telefono: value });
                                            if (modalError.campo === "telefono") limpiarErrorModal();
                                        }}
                                        onFocus={() => setFocusedField('telefono')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl outline-none transition-all font-medium text-gray-800 ${
                                            modalError.campo === "telefono" 
                                                ? "border-red-300 bg-red-50/50 focus:border-red-500" 
                                                : "border-transparent focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/10"
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Campo: Documento */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Documento (DNI / RUC)</label>
                            <div className="relative group">
                                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'documento' ? 'text-[#5b4eff]' : 'text-gray-400'}`}>
                                    <CreditCard size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="8 u 11 dígitos"
                                    value={nuevoCliente.documento}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        setNuevoCliente({ ...nuevoCliente, documento: value });
                                        if (modalError.campo === "documento") limpiarErrorModal();
                                    }}
                                    onFocus={() => setFocusedField('documento')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border-2 rounded-xl outline-none transition-all font-medium text-gray-800 ${
                                        modalError.campo === "documento" 
                                            ? "border-red-300 bg-red-50/50 focus:border-red-500" 
                                            : "border-transparent focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/10"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Campo: Dirección */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dirección</label>
                            <div className="relative group">
                                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'direccion' ? 'text-[#5b4eff]' : 'text-gray-400'}`}>
                                    <MapPin size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Av. Principal 123"
                                    value={nuevoCliente.direccion}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                                    onFocus={() => setFocusedField('direccion')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none transition-all font-medium text-gray-800 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Botones */}
                    <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-3xl sticky bottom-0">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition shadow-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-[2] py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#5b4eff]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Agregando...</> : <><CheckCircle size={18} /> Agregar a la Venta</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}