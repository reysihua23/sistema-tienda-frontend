// pages/tecnico/components/NuevoServicio.jsx
import React, { useState, useEffect, useMemo } from "react";
import { servicioTecnicoService, clienteService } from "../../../services/api";
import {
    Search, Plus, User, Mail, Phone, FileText, MapPin,
    Wrench, ClipboardList, X, CheckCircle, XCircle,
    Info, ChevronLeft, CheckCircle2, AlertCircle,
    Save, Users, 
} from "lucide-react";

// =====================================================
// Validaciones (helpers reutilizables)
// =====================================================
const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

const validateTelefono = (telefono) => {
    if (!telefono) return true;
    return /^[0-9]{9}$/.test(telefono.trim());
};

const validateDocumento = (documento) => {
    if (!documento) return true;
    const doc = documento.trim();
    return /^[0-9]{8}$/.test(doc) || /^[0-9]{11}$/.test(doc);
};

const validateNombre = (nombre) => {
    if (!nombre) return false;
    const limpio = nombre.trim();
    if (limpio.length < 3) return false;
    if (limpio.length > 100) return false;
    // Debe contener al menos 2 letras
    const letras = limpio.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g);
    if (!letras || letras.length < 2) return false;
    // Solo letras, espacios, guiones y apóstrofes
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(limpio);
};

// =====================================================
// Toast elegante con Lucide
// =====================================================
const Toast = ({ toast, onClose }) => {
    if (!toast.show) return null;

    const config = {
        success: {
            bg: "from-emerald-500 to-green-600",
            icon: <CheckCircle size={20} className="text-white" />,
            title: "¡Éxito!"
        },
        error: {
            bg: "from-red-500 to-rose-600",
            icon: <XCircle size={20} className="text-white" />,
            title: "¡Error!"
        },
        info: {
            bg: "from-blue-500 to-indigo-600",
            icon: <Info size={20} className="text-white" />,
            title: "Información"
        }
    };

    const c = config[toast.type] || config.info;

    return (
        <div className="fixed top-24 right-4 sm:right-6 z-50 animate-slide-in max-w-[calc(100vw-2rem)] sm:max-w-md">
            <div className={`rounded-xl shadow-lg p-4 flex items-start gap-3 bg-gradient-to-r ${c.bg} text-white`}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{c.title}</p>
                    <p className="text-xs opacity-90 break-words mt-0.5">{toast.message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition flex-shrink-0 p-1 rounded-lg hover:bg-white/10"
                    aria-label="Cerrar notificación"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// =====================================================
// Componente principal
// =====================================================
export default function NuevoServicio({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [searchCliente, setSearchCliente] = useState("");
    const [showNewCliente, setShowNewCliente] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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
        setLoadingClientes(true);
        try {
            const data = await clienteService.listar();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando clientes:", error);
            showToast("No se pudieron cargar los clientes", "error");
        } finally {
            setLoadingClientes(false);
        }
    };

    const verificarClienteExistente = async (clienteData) => {
        const errores = {};

        if (clienteData.email && validateEmail(clienteData.email)) {
            try {
                const existeEmail = await clienteService.buscarPorEmail(clienteData.email);
                if (existeEmail && existeEmail.id) {
                    errores.email = `El correo ya está registrado por: ${existeEmail.nombre}`;
                }
            } catch (error) {
                if (error.message !== "Error 404") {
                    console.error("Error verificando email:", error);
                }
            }
        }

        if (clienteData.documento && validateDocumento(clienteData.documento)) {
            try {
                const existeDocumento = await clienteService.buscarPorDocumento(clienteData.documento);
                if (existeDocumento && existeDocumento.id) {
                    errores.documento = `El documento ya está registrado por: ${existeDocumento.nombre}`;
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

    const handleClienteSelect = (cliente) => {
        setFormData(prev => ({
            ...prev,
            clienteId: cliente.id,
            cliente: {
                nombre: cliente.nombre || "",
                email: cliente.email || "",
                telefono: cliente.telefono || "",
                documento: cliente.documento || "",
                direccion: cliente.direccion || ""
            }
        }));
        setClienteSeleccionado(cliente);
        setSearchCliente(cliente.nombre);
        setValidationErrors({});
    };

    const handleLimpiarCliente = () => {
        setClienteSeleccionado(null);
        setSearchCliente("");
        setFormData(prev => ({
            ...prev,
            clienteId: "",
            cliente: { nombre: "", email: "", telefono: "", documento: "", direccion: "" }
        }));
    };

    const validarFormulario = async () => {
        const errors = {};

        // Cliente
        if (!showNewCliente && !formData.clienteId) {
            errors.cliente = "Debe seleccionar un cliente";
        }

        // Nuevo cliente
        if (showNewCliente) {
            if (!validateNombre(formData.cliente.nombre)) {
                errors.nombre = "Ingrese un nombre válido (mín. 3 letras, sin números)";
            }

            if (formData.cliente.email && !validateEmail(formData.cliente.email)) {
                errors.email = "Ingrese un correo electrónico válido";
            }

            if (formData.cliente.telefono && !validateTelefono(formData.cliente.telefono)) {
                errors.telefono = "Ingrese un teléfono válido de 9 dígitos";
            }

            if (formData.cliente.documento && !validateDocumento(formData.cliente.documento)) {
                errors.documento = "Documento inválido (DNI: 8 dígitos, RUC: 11 dígitos)";
            }

            // Verificar duplicados
            if ((formData.cliente.email && validateEmail(formData.cliente.email)) ||
                (formData.cliente.documento && validateDocumento(formData.cliente.documento))) {
                const existentes = await verificarClienteExistente(formData.cliente);
                if (existentes.email) errors.email = existentes.email;
                if (existentes.documento) errors.documento = existentes.documento;
            }
        }

        // Equipo
        if (!formData.equipo.trim()) {
            errors.equipo = "El equipo es obligatorio";
        } else if (formData.equipo.trim().length < 3) {
            errors.equipo = "El nombre del equipo es muy corto";
        }

        // Problema
        if (!formData.problema.trim()) {
            errors.problema = "El problema reportado es obligatorio";
        } else if (formData.problema.trim().length < 10) {
            errors.problema = "Describa el problema con más detalle (mín. 10 caracteres)";
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
                    nombre: formData.cliente.nombre.trim(),
                    email: formData.cliente.email.trim() || null,
                    telefono: formData.cliente.telefono.trim() || null,
                    documento: formData.cliente.documento.trim() || null,
                    direccion: formData.cliente.direccion.trim() || null
                };

                const nuevoCliente = await clienteService.crear(nuevoClienteData);
                clienteId = nuevoCliente.id;
            }

            if (!clienteId) {
                throw new Error("Debe seleccionar o crear un cliente");
            }

            const servicioData = {
                clienteId,
                equipo: formData.equipo.trim(),
                problema: formData.problema.trim()
            };

            await servicioTecnicoService.crear(servicioData);

            showToast("Servicio técnico creado exitosamente", "success");

            // Limpiar formulario
            setFormData({
                clienteId: "",
                cliente: { nombre: "", email: "", telefono: "", documento: "", direccion: "" },
                equipo: "",
                problema: ""
            });
            setSearchCliente("");
            setClienteSeleccionado(null);
            setShowNewCliente(false);
            setValidationErrors({});

            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1800);

        } catch (error) {
            console.error("Error:", error);

            let errorMessage = "Error al crear el servicio";

            if (error.message) {
                if (error.message.includes("Email") || error.message.includes("correo")) {
                    errorMessage = "Ya existe un cliente con este correo electrónico";
                } else if (error.message.includes("Documento") || error.message.includes("documento")) {
                    errorMessage = "Ya existe un cliente con este documento";
                } else if (error.message.includes("400")) {
                    if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else {
                        errorMessage = "Datos inválidos. Verifique el formulario.";
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

    // 🎯 Filtrar clientes (con useMemo para performance)
    const clientesFiltrados = useMemo(() => {
        if (!searchCliente.trim()) return [];
        const query = searchCliente.toLowerCase().trim();
        return clientes.filter(c =>
            (c.nombre || "").toLowerCase().includes(query) ||
            (c.documento || "").includes(query) ||
            (c.email || "").toLowerCase().includes(query)
        ).slice(0, 8);   // máximo 8 resultados
    }, [clientes, searchCliente]);

    const hayBusquedaActiva = searchCliente.trim() && !clienteSeleccionado;

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
            <Toast toast={toast} onClose={() => setToast({ show: false, message: "", type: "" })} />

            {/* ─────────── HEADER ─────────── */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Wrench size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                        Nuevo Servicio Técnico
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Registra un nuevo servicio de reparación
                    </p>
                </div>
            </div>

            {/* ─────────── FORMULARIO ─────────── */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">

                {/* ═══════════ CLIENTE ═══════════ */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <User size={14} className="text-[#5b4eff]" />
                        Cliente <span className="text-red-500">*</span>
                    </label>

                    {!showNewCliente ? (
                        <div className="space-y-3">

                            {/* Input búsqueda */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, documento o correo..."
                                    value={searchCliente}
                                    onChange={(e) => {
                                        setSearchCliente(e.target.value);
                                        if (clienteSeleccionado) setClienteSeleccionado(null);
                                    }}
                                    className={`w-full p-3 pl-10 pr-10 border rounded-xl focus:outline-none transition text-sm ${validationErrors.cliente
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                        }`}
                                />
                                {searchCliente && (
                                    <button
                                        type="button"
                                        onClick={handleLimpiarCliente}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Error */}
                            {validationErrors.cliente && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.cliente}
                                </p>
                            )}

                            {/* Cliente seleccionado */}
                            {clienteSeleccionado && (
                                <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-800 truncate">
                                            {clienteSeleccionado.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {clienteSeleccionado.documento && `Doc: ${clienteSeleccionado.documento}`}
                                            {clienteSeleccionado.documento && clienteSeleccionado.telefono && " • "}
                                            {clienteSeleccionado.telefono && `Tel: ${clienteSeleccionado.telefono}`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLimpiarCliente}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition flex-shrink-0"
                                        aria-label="Quitar cliente"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Resultados de búsqueda */}
                            {hayBusquedaActiva && (
                                <>
                                    {loadingClientes ? (
                                        <div className="p-4 text-center text-sm text-gray-400">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff] mx-auto mb-2"></div>
                                            Cargando clientes...
                                        </div>
                                    ) : clientesFiltrados.length > 0 ? (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto shadow-sm">
                                            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                            {clientesFiltrados.map(cliente => (
                                                <button
                                                    key={cliente.id}
                                                    type="button"
                                                    onClick={() => handleClienteSelect(cliente)}
                                                    className="w-full text-left p-3 hover:bg-[#5b4eff]/5 cursor-pointer border-b border-gray-100 last:border-0 transition flex items-center gap-3"
                                                >
                                                    <div className="w-9 h-9 bg-[#5b4eff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User size={16} className="text-[#5b4eff]" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-sm text-gray-800 truncate">
                                                            {cliente.nombre}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {cliente.documento && `Doc: ${cliente.documento}`}
                                                            {cliente.documento && cliente.telefono && " • "}
                                                            {cliente.telefono && `Tel: ${cliente.telefono}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl">
                                            <p className="text-sm text-gray-500">
                                                No se encontró "<span className="font-medium">{searchCliente}</span>"
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Prueba con otro nombre o crea un cliente nuevo
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Botón crear nuevo cliente */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewCliente(true);
                                    setValidationErrors({});
                                    setSearchCliente("");
                                    setClienteSeleccionado(null);
                                }}
                                className="inline-flex items-center gap-1.5 text-[#5b4eff] text-sm font-medium hover:underline"
                            >
                                <Plus size={14} />
                                Crear nuevo cliente
                            </button>
                        </div>
                    ) : (
                        // ═══════════ FORMULARIO NUEVO CLIENTE ═══════════
                        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-[#5b4eff] uppercase tracking-wide">
                                    Cliente nuevo
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Nombre */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Nombre completo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="cliente.nombre"
                                            placeholder="Ej: Juan Pérez García"
                                            value={formData.cliente.nombre}
                                            onChange={(e) => {
                                                // 🎯 Filtro en tiempo real: solo letras (con acentos), espacios y guiones
                                                const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "");
                                                setFormData(prev => ({
                                                    ...prev,
                                                    cliente: { ...prev.cliente, nombre: val }
                                                }));
                                                if (validationErrors.nombre) {
                                                    setValidationErrors(prev => ({ ...prev, nombre: "" }));
                                                }
                                            }}
                                            autoComplete="name"
                                            maxLength={100}
                                            className={`w-full p-2.5 pl-9 border rounded-lg focus:outline-none transition text-sm ${validationErrors.nombre
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                                }`}
                                        />
                                    </div>
                                    {validationErrors.nombre && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={11} /> {validationErrors.nombre}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Correo electrónico
                                    </label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="email"
                                            name="cliente.email"
                                            placeholder="correo@ejemplo.com"
                                            value={formData.cliente.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            className={`w-full p-2.5 pl-9 border rounded-lg focus:outline-none transition text-sm ${validationErrors.email
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                                }`}
                                        />
                                    </div>
                                    {validationErrors.email && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={11} /> {validationErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Teléfono
                                    </label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="tel"
                                            name="cliente.telefono"
                                            placeholder="9 dígitos"
                                            value={formData.cliente.telefono}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    cliente: { ...prev.cliente, telefono: val }
                                                }));
                                                if (validationErrors.telefono) {
                                                    setValidationErrors(prev => ({ ...prev, telefono: "" }));
                                                }
                                            }}
                                            autoComplete="tel"
                                            maxLength={9}
                                            className={`w-full p-2.5 pl-9 border rounded-lg focus:outline-none transition text-sm ${validationErrors.telefono
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                                }`}
                                        />
                                    </div>
                                    {validationErrors.telefono && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={11} /> {validationErrors.telefono}
                                        </p>
                                    )}
                                </div>

                                {/* Documento */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Documento
                                    </label>
                                    <div className="relative">
                                        <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="cliente.documento"
                                            placeholder="DNI (8) o RUC (11)"
                                            value={formData.cliente.documento}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    cliente: { ...prev.cliente, documento: val }
                                                }));
                                                if (validationErrors.documento) {
                                                    setValidationErrors(prev => ({ ...prev, documento: "" }));
                                                }
                                            }}
                                            maxLength={11}
                                            className={`w-full p-2.5 pl-9 border rounded-lg focus:outline-none transition text-sm ${validationErrors.documento
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                                }`}
                                        />
                                    </div>
                                    {validationErrors.documento && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={11} /> {validationErrors.documento}
                                        </p>
                                    )}
                                </div>

                                {/* Dirección */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Dirección
                                    </label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="cliente.direccion"
                                            placeholder="Dirección completa"
                                            value={formData.cliente.direccion}
                                            onChange={handleChange}
                                            autoComplete="street-address"
                                            className="w-full p-2.5 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 transition text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Volver */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewCliente(false);
                                    setValidationErrors({});
                                }}
                                className="inline-flex items-center gap-1 text-gray-500 text-sm hover:text-gray-700 transition"
                            >
                                <ChevronLeft size={14} />
                                Seleccionar cliente existente
                            </button>
                        </div>
                    )}
                </div>

                {/* ═══════════ EQUIPO Y PROBLEMA ═══════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Equipo */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Wrench size={14} className="text-[#5b4eff]" />
                            Equipo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="equipo"
                            placeholder="Ej: Laptop HP Pavilion, iPhone 12"
                            value={formData.equipo}
                            onChange={handleChange}
                            maxLength={100}
                            className={`w-full p-3 border rounded-xl focus:outline-none transition text-sm ${validationErrors.equipo
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                }`}
                        />
                        {validationErrors.equipo && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={11} /> {validationErrors.equipo}
                            </p>
                        )}
                    </div>

                    {/* Problema */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <ClipboardList size={14} className="text-[#5b4eff]" />
                            Problema reportado <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="problema"
                            placeholder="Describe el problema del equipo..."
                            value={formData.problema}
                            onChange={handleChange}
                            rows="3"
                            maxLength={500}
                            className={`w-full p-3 border rounded-xl focus:outline-none transition text-sm resize-none ${validationErrors.problema
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200 focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20"
                                }`}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {validationErrors.problema ? (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={11} /> {validationErrors.problema}
                                </p>
                            ) : (
                                <span></span>
                            )}
                            <span className="text-xs text-gray-400">
                                {formData.problema.length}/500
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══════════ BOTONES ═══════════ */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Registrar Servicio
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                clienteId: "",
                                cliente: { nombre: "", email: "", telefono: "", documento: "", direccion: "" },
                                equipo: "",
                                problema: ""
                            });
                            setSearchCliente("");
                            setClienteSeleccionado(null);
                            setShowNewCliente(false);
                            setValidationErrors({});
                        }}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 active:scale-[0.98] transition disabled:opacity-50"
                    >
                        Limpiar
                    </button>
                </div>
            </form>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}