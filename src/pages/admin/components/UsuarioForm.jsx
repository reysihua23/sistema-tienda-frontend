// pages/admin/components/UsuarioForm.jsx
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, MapPin, Shield, AlertCircle } from "lucide-react";
import { usuarioService } from "../../../services/api";

export default function UsuarioForm({ editingUser, roles, onClose, onRefresh, showMessage }) {
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        correo: "",
        password: "",
        nombre: "",
        telefono: "",
        documento: ""
    });
    
    const [userForm, setUserForm] = useState({
        correo: editingUser?.correo || "",
        password: "",
        nombre: editingUser?.nombre || editingUser?.cliente?.nombre || "",
        telefono: editingUser?.cliente?.telefono || "",
        documento: editingUser?.cliente?.documento || "",
        direccion: editingUser?.cliente?.direccion || "",
        rolId: editingUser?.rol?.id || "",
        activo: editingUser?.activo !== undefined ? editingUser.activo : true
    });
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Validación de email
    const validateEmail = (email) => {
        if (!email) return "El correo electrónico es obligatorio";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pe|net|org|edu|cl|mx|ar|co)$/i;
        if (!emailRegex.test(email)) return "Ingrese un correo electrónico válido";
        return "";
    };

    // Validación de nombre
    const validateName = (name) => {
        if (!name) return "El nombre es obligatorio";
        if (name.length < 3) return "El nombre debe tener al menos 3 caracteres";
        if (name.length > 50) return "El nombre no puede tener más de 50 caracteres";
        if (!/^[a-zA-ZáéíóúñÑ\s]+$/.test(name)) return "El nombre solo puede contener letras y espacios";
        return "";
    };

    // Validación de teléfono
    const validatePhone = (phone) => {
        if (!phone) return "";
        if (!/^\d+$/.test(phone)) return "El teléfono solo debe contener números";
        if (phone.length !== 9) return "El teléfono debe tener exactamente 9 dígitos";
        if (!phone.startsWith('9')) return "El teléfono debe comenzar con 9 (celular)";
        return "";
    };

    // Validación de documento
    const validateDocument = (documento) => {
        if (!documento) return "";
        if (!/^\d+$/.test(documento)) return "El documento solo debe contener números";
        if (documento.length !== 8 && documento.length !== 11) {
            return "El documento debe tener 8 dígitos (DNI) o 11 dígitos (RUC)";
        }
        return "";
    };

    // Validación de contraseña
    const validatePassword = (password) => {
        if (!password && !editingUser) return "La contraseña es obligatoria";
        if (password && password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
        if (password && password.length > 30) return "La contraseña no puede tener más de 30 caracteres";
        return "";
    };

    const handleBlur = (field) => {
        let error = "";
        if (field === "correo") error = validateEmail(userForm.correo);
        if (field === "nombre") error = validateName(userForm.nombre);
        if (field === "telefono") error = validatePhone(userForm.telefono);
        if (field === "documento") error = validateDocument(userForm.documento);
        if (field === "password" && !editingUser) error = validatePassword(userForm.password);
        
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        let fieldError = "";
        
        if (name === "nombre") {
            newValue = value.replace(/[^a-zA-ZáéíóúñÑ\s]/g, "");
            fieldError = validateName(newValue);
        } else if (name === "telefono") {
            newValue = value.replace(/\D/g, "").slice(0, 9);
            fieldError = validatePhone(newValue);
        } else if (name === "documento") {
            newValue = value.replace(/\D/g, "").slice(0, 11);
            fieldError = validateDocument(newValue);
        } else if (name === "correo") {
            newValue = value;
            fieldError = validateEmail(newValue);
        } else if (name === "password") {
            newValue = value;
            fieldError = validatePassword(newValue);
        } else {
            newValue = value;
        }
        
        setUserForm(prev => ({ ...prev, [name]: newValue }));
        setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones finales
        const emailError = validateEmail(userForm.correo);
        const nameError = validateName(userForm.nombre);
        const phoneError = validatePhone(userForm.telefono);
        const docError = validateDocument(userForm.documento);
        const passwordError = !editingUser ? validatePassword(userForm.password) : "";
        
        if (emailError) {
            showMessage("error", emailError);
            return;
        }
        if (nameError) {
            showMessage("error", nameError);
            return;
        }
        if (phoneError) {
            showMessage("error", phoneError);
            return;
        }
        if (docError) {
            showMessage("error", docError);
            return;
        }
        if (passwordError) {
            showMessage("error", passwordError);
            return;
        }
        
        setLoading(true);
        
        try {
            const rolSeleccionado = roles.find(r => r.id === parseInt(userForm.rolId));
            const esCliente = rolSeleccionado?.nombre === "CLIENTE";
            
            if (editingUser) {
                await usuarioService.actualizar(editingUser.id, {
                    correo: userForm.correo,
                    nombre: userForm.nombre,
                    rolId: parseInt(userForm.rolId),
                    activo: userForm.activo
                });
                showMessage("success", "Usuario actualizado correctamente");
            } else {
                const usuarioData = {
                    correo: userForm.correo,
                    password: userForm.password,
                    nombre: userForm.nombre,
                    rolId: parseInt(userForm.rolId),
                    activo: userForm.activo
                };
                
                if (esCliente) {
                    usuarioData.telefono = userForm.telefono;
                    usuarioData.documento = userForm.documento;
                    usuarioData.direccion = userForm.direccion;
                }
                
                console.log("Enviando datos:", usuarioData);
                await usuarioService.crear(usuarioData);
                showMessage("success", "Usuario creado correctamente");
            }
            
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error:", error);
            let errorMsg = error.message || "Error al guardar usuario";
            if (errorMsg.includes("Duplicate entry") || errorMsg.includes("email")) {
                errorMsg = "Este correo electrónico ya está registrado";
            }
            showMessage("error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const rolSeleccionado = roles.find(r => r.id === parseInt(userForm.rolId));
    const esCliente = rolSeleccionado?.nombre === "CLIENTE";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center">
                        <Shield size={20} className="text-[#5b4eff]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                        </h3>
                        <p className="text-xs text-gray-500">Complete los datos del usuario</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Correo */}
                    <div>
                        <div className="relative">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "correo" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                                <Mail size={18} />
                            </div>
                            <input 
                                name="correo"
                                type="email" 
                                placeholder="Correo electrónico"
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                    fieldErrors.correo 
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                        : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"
                                }`}
                                value={userForm.correo} 
                                onChange={handleChange}
                                onFocus={() => setFocusedField("correo")}
                                onBlur={() => { setFocusedField(null); handleBlur("correo"); }}
                                required
                            />
                        </div>
                        {fieldErrors.correo && (
                            <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.correo}</p>
                        )}
                    </div>
                    
                    {/* Contraseña (solo para nuevo usuario) */}
                    {!editingUser && (
                        <div>
                            <div className="relative">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "password" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                                    <Lock size={18} />
                                </div>
                                <input 
                                    name="password"
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Contraseña (mínimo 6 caracteres)"
                                    className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                        fieldErrors.password 
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                            : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"
                                    }`}
                                    value={userForm.password} 
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => { setFocusedField(null); handleBlur("password"); }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.password}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1 ml-2">Mínimo 6 caracteres</p>
                        </div>
                    )}
                    
                    {/* Nombre */}
                    <div>
                        <div className="relative">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "nombre" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                                <User size={18} />
                            </div>
                            <input 
                                name="nombre"
                                type="text" 
                                placeholder="Nombre completo"
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                    fieldErrors.nombre 
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                        : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"
                                }`}
                                value={userForm.nombre} 
                                onChange={handleChange}
                                onFocus={() => setFocusedField("nombre")}
                                onBlur={() => { setFocusedField(null); handleBlur("nombre"); }}
                                required
                            />
                        </div>
                        {fieldErrors.nombre && (
                            <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.nombre}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 ml-2">Solo letras, mínimo 3 caracteres</p>
                    </div>
                    
                    {/* Campos de cliente (solo si el rol es CLIENTE) */}
                    {esCliente && (
                        <>
                            {/* Teléfono */}
                            <div>
                                <div className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "telefono" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                                        <Phone size={18} />
                                    </div>
                                    <input 
                                        name="telefono"
                                        type="tel" 
                                        placeholder="Teléfono (9 dígitos)"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                            fieldErrors.telefono 
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"
                                        }`}
                                        value={userForm.telefono} 
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("telefono")}
                                        onBlur={() => { setFocusedField(null); handleBlur("telefono"); }}
                                    />
                                </div>
                                {fieldErrors.telefono && (
                                    <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.telefono}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1 ml-2">Ej: 912345678</p>
                            </div>
                            
                            {/* Documento */}
                            <div>
                                <div className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "documento" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                                        <FileText size={18} />
                                    </div>
                                    <input 
                                        name="documento"
                                        type="text" 
                                        placeholder="Documento (DNI: 8, RUC: 11)"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                            fieldErrors.documento 
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                                                : "border-gray-200 focus:border-[#5b4eff] focus:ring-[#5b4eff]/20"
                                        }`}
                                        value={userForm.documento} 
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("documento")}
                                        onBlur={() => { setFocusedField(null); handleBlur("documento"); }}
                                    />
                                </div>
                                {fieldErrors.documento && (
                                    <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.documento}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1 ml-2">DNI: 8 dígitos | RUC: 11 dígitos</p>
                            </div>
                            
                            {/* Dirección */}
                            <div>
                                <div className="relative">
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "direccion" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                                        <MapPin size={18} />
                                    </div>
                                    <input 
                                        name="direccion"
                                        type="text" 
                                        placeholder="Dirección"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                                        value={userForm.direccion} 
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("direccion")}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* Rol */}
                    <div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Shield size={18} />
                            </div>
                            <select 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 appearance-none cursor-pointer"
                                value={userForm.rolId} 
                                onChange={(e) => setUserForm({...userForm, rolId: e.target.value})}
                            >
                                <option value="">Seleccionar Rol</option>
                                {roles.map(rol => (
                                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                ▼
                            </div>
                        </div>
                    </div>
                    
                    {/* Activo */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <input 
                            type="checkbox" 
                            id="activo"
                            checked={userForm.activo}
                            onChange={(e) => setUserForm({...userForm, activo: e.target.checked})}
                            className="w-5 h-5 text-[#5b4eff] rounded focus:ring-[#5b4eff] cursor-pointer"
                        />
                        <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Usuario activo
                        </label>
                    </div>
                    
                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="flex-1 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : (editingUser ? "Actualizar" : "Crear Usuario")}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}