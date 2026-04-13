// pages/tecnico/components/NuevoServicio.jsx
import React, { useState, useEffect } from "react";
import { servicioTecnicoService, clienteService } from "../../../services/api";

export default function NuevoServicio({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [showNewCliente, setShowNewCliente] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const [formData, setFormData] = useState({
        clienteId: "",
        cliente: {
            nombre: "",
            email: "",
            telefono: "",
            documento: "",
            direccion: ""
        },
        equipo: "",
        problema: ""
    });

    useEffect(() => {
        cargarClientes();
    }, []);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 4000);
    };

    const cargarClientes = async () => {
        try {
            const data = await clienteService.listar();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando clientes:", error);
        }
    };

    const validateEmail = (email) => {
        if (!email) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateTelefono = (telefono) => {
        if (!telefono) return true;
        const telefonoRegex = /^[0-9]{9}$/;
        return telefonoRegex.test(telefono);
    };

    const validateDocumento = (documento) => {
        if (!documento) return true;
        const dniRegex = /^[0-9]{8}$/;
        const rucRegex = /^[0-9]{11}$/;
        return dniRegex.test(documento) || rucRegex.test(documento);
    };

    const verificarClienteExistente = async (clienteData) => {
        const errores = {};
        
        if (clienteData.email) {
            try {
                const existeEmail = await clienteService.buscarPorEmail(clienteData.email);
                if (existeEmail && existeEmail.id) {
                    errores.email = `⚠️ El correo "${clienteData.email}" ya está registrado por el cliente: ${existeEmail.nombre}`;
                }
            } catch (error) {
                if (error.message !== "Error 404") {
                    console.error("Error verificando email:", error);
                }
            }
        }
        
        if (clienteData.documento) {
            try {
                const existeDocumento = await clienteService.buscarPorDocumento(clienteData.documento);
                if (existeDocumento && existeDocumento.id) {
                    errores.documento = `⚠️ El documento "${clienteData.documento}" ya está registrado por el cliente: ${existeDocumento.nombre}`;
                }
            } catch (error) {
                if (error.message !== "Error 404") {
                    console.error("Error verificando documento:", error);
                }
            }
        }
        
        return errores;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes("cliente.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                cliente: { ...prev.cliente, [field]: value }
            }));
            if (validationErrors[field]) {
                setValidationErrors(prev => ({ ...prev, [field]: "" }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (validationErrors[name]) {
                setValidationErrors(prev => ({ ...prev, [name]: "" }));
            }
        }
    };

    const handleClienteSelect = (clienteId) => {
        const cliente = clientes.find(c => c.id === parseInt(clienteId));
        if (cliente) {
            setFormData(prev => ({
                ...prev,
                clienteId: cliente.id,
                cliente: {
                    nombre: cliente.nombre,
                    email: cliente.email || "",
                    telefono: cliente.telefono || "",
                    documento: cliente.documento || "",
                    direccion: cliente.direccion || ""
                }
            }));
            setSearchCliente(cliente.nombre);
            setValidationErrors({});
        }
    };

    const validarFormulario = async () => {
        const errors = {};
        
        if (!showNewCliente && !formData.clienteId) {
            errors.cliente = "Debe seleccionar un cliente";
        }
        
        if (showNewCliente) {
            if (!formData.cliente.nombre.trim()) {
                errors.nombre = "El nombre completo es obligatorio";
            }
            
            if (formData.cliente.email && !validateEmail(formData.cliente.email)) {
                errors.email = "Ingrese un correo electrónico válido";
            }
            
            if (formData.cliente.telefono && !validateTelefono(formData.cliente.telefono)) {
                errors.telefono = "Ingrese un teléfono válido de 9 dígitos";
            }
            
            if (formData.cliente.documento && !validateDocumento(formData.cliente.documento)) {
                errors.documento = "Ingrese un documento válido (DNI: 8 dígitos, RUC: 11 dígitos)";
            }
            
            if (formData.cliente.email || formData.cliente.documento) {
                const existentes = await verificarClienteExistente(formData.cliente);
                if (existentes.email) errors.email = existentes.email;
                if (existentes.documento) errors.documento = existentes.documento;
            }
        }
        
        if (!formData.equipo.trim()) {
            errors.equipo = "El equipo es obligatorio";
        }
        
        if (!formData.problema.trim()) {
            errors.problema = "El problema reportado es obligatorio";
        }
        
        setValidationErrors(errors);
        
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            showToast(firstError, "error");
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isValid = await validarFormulario();
        if (!isValid) return;
        
        setLoading(true);
        
        try {
            let clienteId = formData.clienteId;
            
            if (!clienteId && showNewCliente) {
                const nuevoClienteData = {
                    nombre: formData.cliente.nombre,
                    email: formData.cliente.email || null,
                    telefono: formData.cliente.telefono || null,
                    documento: formData.cliente.documento || null,
                    direccion: formData.cliente.direccion || null
                };
                
                const nuevoCliente = await clienteService.crear(nuevoClienteData);
                clienteId = nuevoCliente.id;
                showToast("Cliente creado exitosamente", "success");
            }
            
            if (!clienteId) {
                throw new Error("Debe seleccionar o crear un cliente");
            }
            
            const servicioData = {
                clienteId: clienteId,
                equipo: formData.equipo,
                problema: formData.problema
            };
            
            await servicioTecnicoService.crear(servicioData);
            
            showToast("✅ Servicio técnico creado exitosamente", "success");
            
            setFormData({
                clienteId: "",
                cliente: { nombre: "", email: "", telefono: "", documento: "", direccion: "" },
                equipo: "",
                problema: ""
            });
            setSearchCliente("");
            setShowNewCliente(false);
            setValidationErrors({});
            
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 2000);
            
        } catch (error) {
            console.error("Error:", error);
            
            // Intentar extraer el mensaje del error del backend
            let errorMessage = "Error al crear el servicio";
            
            if (error.message) {
                // Si el error contiene un mensaje específico del backend
                if (error.message.includes("Email") || error.message.includes("correo")) {
                    errorMessage = "⚠️ Ya existe un cliente registrado con este correo electrónico";
                } else if (error.message.includes("Documento") || error.message.includes("documento")) {
                    errorMessage = "⚠️ Ya existe un cliente registrado con este documento";
                } else if (error.message.includes("400")) {
                    // Intentar obtener el body del error
                    if (error.response && error.response.data) {
                        if (error.response.data.error) {
                            errorMessage = error.response.data.error;
                        } else if (error.response.data.message) {
                            errorMessage = error.response.data.message;
                        }
                    } else {
                        errorMessage = "⚠️ Ya existe un cliente registrado con este correo o documento";
                    }
                } else {
                    errorMessage = error.message;
                }
            }
            
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
        c.documento?.includes(searchCliente)
    );

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-24 right-6 z-50 animate-slide-in">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[320px] max-w-md ${
                        toast.type === "success" ? "bg-gradient-to-r from-emerald-500 to-green-600" : 
                        toast.type === "error" ? "bg-gradient-to-r from-red-500 to-rose-600" : 
                        "bg-gradient-to-r from-blue-500 to-indigo-600"
                    } text-white`}>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            {toast.type === "success" && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                </svg>
                            )}
                            {toast.type === "error" && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">
                                {toast.type === "success" ? "¡Éxito!" : toast.type === "error" ? "¡Error!" : "Información"}
                            </p>
                            <p className="text-xs opacity-90 break-words">{toast.message}</p>
                        </div>
                        <button 
                            onClick={() => setToast({ show: false, message: "", type: "" })}
                            className="text-white/80 hover:text-white transition flex-shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Nuevo Servicio Técnico</h2>
                <p className="text-sm text-gray-500 mt-1">Registra un nuevo servicio de reparación</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Selección de cliente */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cliente <span className="text-red-500">*</span>
                    </label>
                    
                    {!showNewCliente ? (
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar cliente por nombre o documento..."
                                    value={searchCliente}
                                    onChange={(e) => setSearchCliente(e.target.value)}
                                    className={`w-full p-3 pl-10 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                        validationErrors.cliente ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            
                            {validationErrors.cliente && (
                                <p className="text-xs text-red-500">{validationErrors.cliente}</p>
                            )}
                            
                            {searchCliente && clientesFiltrados.length > 0 && (
                                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                    {clientesFiltrados.map(cliente => (
                                        <div
                                            key={cliente.id}
                                            onClick={() => handleClienteSelect(cliente.id)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition"
                                        >
                                            <p className="font-medium text-gray-800">{cliente.nombre}</p>
                                            <p className="text-xs text-gray-400">
                                                {cliente.documento && `📄 ${cliente.documento} • `}
                                                {cliente.telefono && `📞 ${cliente.telefono}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewCliente(true);
                                    setValidationErrors({});
                                }}
                                className="text-[#5b4eff] text-sm font-medium hover:underline"
                            >
                                + Crear nuevo cliente
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        name="cliente.nombre"
                                        placeholder="Nombre completo *"
                                        value={formData.cliente.nombre}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg focus:border-[#5b4eff] focus:outline-none ${
                                            validationErrors.nombre ? "border-red-500 bg-red-50" : "border-gray-200"
                                        }`}
                                    />
                                    {validationErrors.nombre && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.nombre}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="cliente.email"
                                        placeholder="Correo electrónico"
                                        value={formData.cliente.email}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg focus:border-[#5b4eff] focus:outline-none ${
                                            validationErrors.email ? "border-red-500 bg-red-50" : "border-gray-200"
                                        }`}
                                    />
                                    {validationErrors.email && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        name="cliente.telefono"
                                        placeholder="Teléfono (9 dígitos)"
                                        value={formData.cliente.telefono}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg focus:border-[#5b4eff] focus:outline-none ${
                                            validationErrors.telefono ? "border-red-500 bg-red-50" : "border-gray-200"
                                        }`}
                                    />
                                    {validationErrors.telefono && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.telefono}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="cliente.documento"
                                        placeholder="Documento (DNI: 8, RUC: 11)"
                                        value={formData.cliente.documento}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg focus:border-[#5b4eff] focus:outline-none ${
                                            validationErrors.documento ? "border-red-500 bg-red-50" : "border-gray-200"
                                        }`}
                                    />
                                    {validationErrors.documento && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.documento}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        name="cliente.direccion"
                                        placeholder="Dirección"
                                        value={formData.cliente.direccion}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewCliente(false);
                                    setValidationErrors({});
                                }}
                                className="text-gray-500 text-sm hover:text-gray-700"
                            >
                                ← Seleccionar cliente existente
                            </button>
                        </div>
                    )}
                </div>

                {/* Equipo y problema */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Equipo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="equipo"
                            placeholder="Ej: Laptop HP Pavilion, iPhone 12, etc."
                            value={formData.equipo}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                validationErrors.equipo ? "border-red-500 bg-red-50" : "border-gray-200"
                            }`}
                        />
                        {validationErrors.equipo && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.equipo}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Problema reportado <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="problema"
                            placeholder="Describe el problema del equipo..."
                            value={formData.problema}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                validationErrors.problema ? "border-red-500 bg-red-50" : "border-gray-200"
                            }`}
                        />
                        {validationErrors.problema && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.problema}</p>
                        )}
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </>
                        ) : (
                            "✅ Registrar Servicio"
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}