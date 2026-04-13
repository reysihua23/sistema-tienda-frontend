// pages/perfil/Perfil.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService, usuarioService } from "../../services/api";
import MisPedidos from "../pedidos/MisPedidos";
import MisServicios from "../servicios/MisServicios";
//import MisDevoluciones from "../devoluciones/MisDevoluciones";
import MisReclamos from "../reclamos/MisReclamos";
import { User, Phone, FileText, MapPin, Mail, AlertCircle, CheckCircle, Lock, Eye, EyeOff, Shield, Key } from "lucide-react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("datos");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordData, setPasswordData] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: "", color: "" });
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    documento: "",
    direccion: ""
  });
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    nombre: "",
    telefono: "",
    documento: "",
    direccion: ""
  });

  // Validación de fuerza de contraseña
  const validatePasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "";

    if (password.length === 0) {
      return { score: 0, message: "", color: "" };
    }

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) {
      message = "Muy débil - Usa mayúsculas, números y caracteres especiales";
      color = "bg-red-500";
    } else if (score <= 4) {
      message = "Débil - Añade más caracteres y variedad";
      color = "bg-orange-500";
    } else if (score <= 6) {
      message = "Buena - Sigue así";
      color = "bg-blue-500";
    } else {
      message = "Fuerte - Contraseña segura";
      color = "bg-green-500";
    }

    return { score, message, color, strength: score };
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    cargarPerfil();
  }, [navigate]);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const perfil = await usuarioService.getPerfil();
      setUserData(perfil);
      setUser(perfil);
      setFormData({
        nombre: perfil.nombre || "",
        telefono: perfil.telefono || "",
        documento: perfil.documento || "",
        direccion: perfil.direccion || ""
      });
    } catch (error) {
      console.error("Error cargando perfil:", error);
      if (error.message?.includes("401")) {
        authService.logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    let hasError = false;
    const newErrors = { nombre: "", telefono: "", documento: "", direccion: "" };

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
      hasError = true;
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
      hasError = true;
    }

    if (!formData.telefono) {
      newErrors.telefono = "El teléfono es obligatorio";
      hasError = true;
    } else if (formData.telefono.length !== 9) {
      newErrors.telefono = "El teléfono debe tener exactamente 9 dígitos";
      hasError = true;
    } else if (!formData.telefono.startsWith("9")) {
      newErrors.telefono = "El teléfono debe comenzar con 9";
      hasError = true;
    }

    // Dentro de handleUpdateProfile, reemplaza la validación del documento:

    if (!formData.documento) {
      newErrors.documento = "El documento es obligatorio";
      hasError = true;
    } else if (formData.documento.length === 8) {
      if (!/^\d{8}$/.test(formData.documento)) {
        newErrors.documento = "DNI debe tener 8 dígitos numéricos";
        hasError = true;
      }
    } else if (formData.documento.length === 11) {
      if (!/^\d{11}$/.test(formData.documento)) {
        newErrors.documento = "RUC debe tener 11 dígitos numéricos";
        hasError = true;
      }
    } else if (formData.documento.length === 9 || formData.documento.length === 10) {
      newErrors.documento = `El documento tiene ${formData.documento.length} dígitos. Debe ser DNI (8 dígitos) o RUC (11 dígitos)`;
      hasError = true;
    } else {
      newErrors.documento = "DNI (8 dígitos) o RUC (11 dígitos)";
      hasError = true;
    }

    if (formData.direccion && formData.direccion.length < 10) {
      newErrors.direccion = "La dirección debe tener al menos 10 caracteres";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "fixed top-20 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2";
      errorMsg.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Por favor corrige los errores del formulario';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/clientes/" + userData.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          documento: formData.documento,
          direccion: formData.direccion,
          email: userData.correo
        })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar datos");
      }

      setUserData({ ...userData, ...formData });
      setEditing(false);

      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2";
      successMsg.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Datos actualizados correctamente';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg = document.createElement("div");
      errorMsg.className = "fixed top-20 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2";
      errorMsg.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Error al actualizar datos';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setCambiandoPassword(true);

    // Validaciones de contraseña
    if (!passwordData.actual) {
      setPasswordError("Ingresa tu contraseña actual");
      setCambiandoPassword(false);
      return;
    }

    if (!passwordData.nueva) {
      setPasswordError("Ingresa una nueva contraseña");
      setCambiandoPassword(false);
      return;
    }

    if (passwordData.nueva.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres");
      setCambiandoPassword(false);
      return;
    }

    if (!/[A-Z]/.test(passwordData.nueva)) {
      setPasswordError("La nueva contraseña debe contener al menos una mayúscula");
      setCambiandoPassword(false);
      return;
    }

    if (!/[a-z]/.test(passwordData.nueva)) {
      setPasswordError("La nueva contraseña debe contener al menos una minúscula");
      setCambiandoPassword(false);
      return;
    }

    if (!/[0-9]/.test(passwordData.nueva)) {
      setPasswordError("La nueva contraseña debe contener al menos un número");
      setCambiandoPassword(false);
      return;
    }

    if (passwordData.nueva !== passwordData.confirmar) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      setCambiandoPassword(false);
      return;
    }

    if (passwordData.nueva === passwordData.actual) {
      setPasswordError("La nueva contraseña debe ser diferente a la actual");
      setCambiandoPassword(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/cambiar-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          usuarioId: user.id,
          passwordActual: passwordData.actual,
          passwordNueva: passwordData.nueva
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al cambiar contraseña");
      }

      setPasswordSuccess("✅ Contraseña actualizada exitosamente");
      setPasswordData({ actual: "", nueva: "", confirmar: "" });
      setPasswordStrength({ score: 0, message: "", color: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      setPasswordError(error.message || "❌ Error al cambiar contraseña. Verifica tu contraseña actual.");
    } finally {
      setCambiandoPassword(false);
    }
  };

  const handlePasswordChangeWithStrength = (e) => {
    const value = e.target.value;
    setPasswordData({ ...passwordData, nueva: value });
    const strength = validatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  const getTabConfig = () => {
    switch (activeTab) {
      case "datos":
        return {
          title: "Datos Personales",
          subtitle: "Mantén tus datos actualizados para una mejor experiencia"
        };
      case "seguridad":
        return {
          title: "Seguridad de la Cuenta",
          subtitle: "Protege tu cuenta actualizando tu contraseña regularmente"
        };
      case "pedidos":
        return {
          title: "Mis Pedidos",
          subtitle: "Historial de tus compras realizadas"
        };
      case "servicios":
        return {
          title: "Mis Servicios Técnicos",
          subtitle: "Seguimiento de tus servicios de reparación"
        };
      case "reclamos":
        return {
          title: "Mis Reclamos",
          subtitle: "Seguimiento de tus reclamos y solicitudes"
        };
      default:
        return {
          title: "Mi Perfil",
          subtitle: "Gestiona tu información personal"
        };
    }
  };

  const tabConfig = getTabConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff] mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar Izquierdo */}
      <div className="w-80 flex-shrink-0 bg-[#0d0c1e] flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-black italic text-white">
            Jimenez<span className="text-[#5b4eff]">.</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2">Tu tienda de confianza</p>
        </div>

        <div className="p-5 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {userData?.nombre?.substring(0, 2).toUpperCase() || userData?.correo?.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <h3 className="font-bold text-white mt-3 text-lg">{userData?.nombre || "Usuario"}</h3>
          <p className="text-xs text-gray-400 mt-1 truncate">{userData?.correo}</p>
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
              <CheckCircle size={12} />
              Cliente
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          <button
            onClick={() => setActiveTab("datos")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "datos"
              ? "bg-[#5b4eff] text-white shadow-lg"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <User size={18} />
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab("seguridad")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "seguridad"
              ? "bg-[#5b4eff] text-white shadow-lg"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Lock size={18} />
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "pedidos"
              ? "bg-[#5b4eff] text-white shadow-lg"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Mis Pedidos
          </button>
          <button
            onClick={() => setActiveTab("servicios")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "servicios"
              ? "bg-[#5b4eff] text-white shadow-lg"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Mis Servicios
          </button>
          <button
            onClick={() => setActiveTab("reclamos")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "reclamos"
              ? "bg-[#5b4eff] text-white shadow-lg"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mis Reclamos
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M9 4l-7 7 7 7M15 4l7 7-7 7" />
            </svg>
            Volver a la tienda
          </Link>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 z-10 flex-shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{tabConfig.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{tabConfig.subtitle}</p>
          </div>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Datos Personales */}
          {activeTab === "datos" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-3">
                  <h3 className="font-semibold text-gray-700">Mis Datos</h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-3 py-1.5 text-sm font-medium text-[#5b4eff] border border-[#5b4eff] rounded-lg hover:bg-[#5b4eff] hover:text-white transition-all flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <User size={12} />
                        Nombre completo
                      </label>
                      {editing ? (
                        <div>
                          <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => {
                              const value = e.target.value;
                              const isValid = /^[a-zA-ZáéíóúñÑÁÉÍÓÚ\s]*$/.test(value);
                              if (isValid) {
                                setFormData({ ...formData, nombre: value });
                                setErrors({ ...errors, nombre: "" });
                              }
                            }}
                            onBlur={() => {
                              if (!formData.nombre.trim()) {
                                setErrors({ ...errors, nombre: "El nombre es obligatorio" });
                              } else if (formData.nombre.trim().length < 3) {
                                setErrors({ ...errors, nombre: "El nombre debe tener al menos 3 caracteres" });
                              } else {
                                setErrors({ ...errors, nombre: "" });
                              }
                            }}
                            className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:border-[#5b4eff] focus:outline-none transition ${errors.nombre ? "border-red-400" : "border-gray-200"
                              }`}
                            placeholder="Ej: Juan Pérez"
                          />
                          {errors.nombre && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} />
                              {errors.nombre}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">Solo letras y espacios (mínimo 3 caracteres)</p>
                        </div>
                      ) : (
                        <p className="text-gray-800 font-medium p-2.5 bg-gray-50 rounded-lg">
                          {formData.nombre || "No especificado"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Mail size={12} />
                        Correo electrónico
                      </label>
                      <p className="text-gray-800 font-medium p-2.5 bg-gray-50 rounded-lg">{userData?.correo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Phone size={12} />
                        Teléfono
                      </label>
                      {editing ? (
                        <div>
                          <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                              setFormData({ ...formData, telefono: value });
                              setErrors({ ...errors, telefono: "" });
                            }}
                            onBlur={() => {
                              if (!formData.telefono) {
                                setErrors({ ...errors, telefono: "El teléfono es obligatorio" });
                              } else if (formData.telefono.length !== 9) {
                                setErrors({ ...errors, telefono: "El teléfono debe tener exactamente 9 dígitos" });
                              } else if (!formData.telefono.startsWith("9")) {
                                setErrors({ ...errors, telefono: "El teléfono debe comenzar con 9" });
                              } else {
                                setErrors({ ...errors, telefono: "" });
                              }
                            }}
                            className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:border-[#5b4eff] focus:outline-none transition ${errors.telefono ? "border-red-400" : "border-gray-200"
                              }`}
                            placeholder="9 9999 9999"
                          />
                          {errors.telefono && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} />
                              {errors.telefono}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">9 dígitos, debe comenzar con 9 (ej: 987654321)</p>
                        </div>
                      ) : (
                        <p className="text-gray-800 font-medium p-2.5 bg-gray-50 rounded-lg">
                          {formData.telefono || "No especificado"}
                        </p>
                      )}
                    </div>

                    {/* Documento (DNI/RUC) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <FileText size={12} />
                        Documento (DNI/RUC)
                      </label>
                      {editing ? (
                        <div>
                          <input
                            type="text"
                            value={formData.documento}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Validación: solo números, máximo 11 dígitos
                              if (/^\d*$/.test(value) && value.length <= 11) {
                                setFormData({ ...formData, documento: value });
                                setErrors({ ...errors, documento: "" });
                              }
                            }}
                            onBlur={() => {
                              const doc = formData.documento;
                              if (!doc) {
                                setErrors({ ...errors, documento: "El documento es obligatorio" });
                              } else if (doc.length === 8) {
                                // DNI válido
                                if (!/^\d{8}$/.test(doc)) {
                                  setErrors({ ...errors, documento: "DNI debe tener 8 dígitos numéricos" });
                                } else {
                                  setErrors({ ...errors, documento: "" });
                                }
                              } else if (doc.length === 11) {
                                // RUC válido
                                if (!/^\d{11}$/.test(doc)) {
                                  setErrors({ ...errors, documento: "RUC debe tener 11 dígitos numéricos" });
                                } else {
                                  setErrors({ ...errors, documento: "" });
                                }
                              } else if (doc.length === 9 || doc.length === 10) {
                                // Longitud inválida (ni DNI ni RUC)
                                setErrors({ ...errors, documento: `El documento ingresado tiene ${doc.length} dígitos. Debe ser DNI (8 dígitos) o RUC (11 dígitos)` });
                              } else {
                                setErrors({ ...errors, documento: "DNI (8 dígitos) o RUC (11 dígitos)" });
                              }
                            }}
                            className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:border-[#5b4eff] focus:outline-none transition ${errors.documento ? "border-red-400" : "border-gray-200"
                              }`}
                            placeholder="DNI: 12345678 | RUC: 12345678901"
                            maxLength={11}
                          />
                          {errors.documento && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} />
                              {errors.documento}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">DNI (8 dígitos) o RUC (11 dígitos)</p>
                        </div>
                      ) : (
                        <p className="text-gray-800 font-medium p-2.5 bg-gray-50 rounded-lg">
                          {formData.documento || "No especificado"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      Dirección
                    </label>
                    {editing ? (
                      <div>
                        <textarea
                          value={formData.direccion}
                          onChange={(e) => {
                            setFormData({ ...formData, direccion: e.target.value });
                            setErrors({ ...errors, direccion: "" });
                          }}
                          onBlur={() => {
                            if (formData.direccion && formData.direccion.length < 10) {
                              setErrors({ ...errors, direccion: "La dirección debe tener al menos 10 caracteres" });
                            } else {
                              setErrors({ ...errors, direccion: "" });
                            }
                          }}
                          rows="2"
                          className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:border-[#5b4eff] focus:outline-none transition resize-none ${errors.direccion ? "border-red-400" : "border-gray-200"
                            }`}
                          placeholder="Av. Principal 123, Lima, Perú"
                        />
                        {errors.direccion && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {errors.direccion}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Mínimo 10 caracteres</p>
                      </div>
                    ) : (
                      <p className="text-gray-800 font-medium p-2.5 bg-gray-50 rounded-lg">
                        {formData.direccion || "No especificada"}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updating || Object.values(errors).some(e => e !== "") || !formData.nombre.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Guardando...
                          </>
                        ) : (
                          "Guardar cambios"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            nombre: userData?.nombre || "",
                            telefono: userData?.telefono || "",
                            documento: userData?.documento || "",
                            direccion: userData?.direccion || ""
                          });
                          setErrors({ nombre: "", telefono: "", documento: "", direccion: "" });
                        }}
                        className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Seguridad - Mejorada con validaciones como login */}
          {activeTab === "seguridad" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6">
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                      <CheckCircle size={16} />
                      {passwordSuccess}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Lock size={12} />
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.actual ? "text" : "password"}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none transition pr-10"
                          value={passwordData.actual}
                          onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                          required
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, actual: !showPassword.actual })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.actual ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                          <Key size={12} />
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.nueva ? "text" : "password"}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none transition pr-10"
                            value={passwordData.nueva}
                            onChange={handlePasswordChangeWithStrength}
                            required
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, nueva: !showPassword.nueva })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {passwordData.nueva && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                  style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{passwordStrength.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                          <Shield size={12} />
                          Confirmar contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirmar ? "text" : "password"}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none transition pr-10"
                            value={passwordData.confirmar}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                            required
                            placeholder="Repite tu nueva contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, confirmar: !showPassword.confirmar })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {passwordData.confirmar && passwordData.nueva !== passwordData.confirmar && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} />
                            Las contraseñas no coinciden
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-2">
                        <Shield size={14} />
                        Recomendaciones de seguridad:
                      </p>
                      <ul className="text-xs text-amber-600 space-y-1 ml-6 list-disc">
                        <li>Usa al menos 8 caracteres</li>
                        <li>Combina letras mayúsculas, minúsculas y números</li>
                        <li>Incluye al menos un carácter especial (!@#$%^&*)</li>
                        <li>No uses contraseñas obvias como "12345678" o tu nombre</li>
                        <li>No compartas tu contraseña con nadie</li>
                        <li>Cambia tu contraseña regularmente</li>
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={cambiandoPassword}
                        className="px-5 py-2 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {cambiandoPassword ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Actualizar contraseña
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordData({ actual: "", nueva: "", confirmar: "" });
                          setPasswordError("");
                          setPasswordSuccess("");
                          setPasswordStrength({ score: 0, message: "", color: "" });
                        }}
                        className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Mis Pedidos */}
          {activeTab === "pedidos" && (
            <MisPedidos embedded={true} />
          )}

          {/* Mis Servicios Técnicos */}
          {activeTab === "servicios" && (
            <MisServicios embedded={true} />
          )}

          {/* Mis Reclamos */}
          {activeTab === "reclamos" && <MisReclamos embedded={true} />}
        </div>
      </div>
    </div>
  );
}