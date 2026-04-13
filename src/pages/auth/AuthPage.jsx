
// pages/auth/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/api";
import {
  Mail, Lock, User, Phone, Eye, EyeOff,
  Shield, CheckCircle, AlertCircle, ArrowRight,
  X, UserPlus, LogIn, Sparkles
} from "lucide-react";

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  .animate-fade-in { animation: fadeIn 0.5s ease-out; }
  .animate-slide-in { animation: slideIn 0.4s ease-out; }
  .error-shake { animation: shake 0.4s ease-in-out; }
`;

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: "", color: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  // pages/auth/AuthPage.jsx
  // Agrega este useEffect al inicio, después de los useState

  useEffect(() => {
    // Limpiar formulario cuando se carga la página de login (al cerrar sesión)
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
    setFieldErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
    setPasswordStrength({ score: 0, message: "", color: "" });
    setError("");
    setSuccess("");
  }, []); // ← El array vacío hace que se ejecute solo al montar el componente

  useEffect(() => {
    setError("");
    setSuccess("");
    setFieldErrors({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    setPasswordStrength({ score: 0, message: "", color: "" });
  }, [isLogin]);

  // Función para extraer mensaje de error del JSON
  const extractErrorMessage = (errorMsg) => {
    if (typeof errorMsg === 'string') {
      // Limpiar prefijos como "Error 400: "
      let clean = errorMsg.replace(/^Error \d+:\s*/, '');

      // Intentar extraer el mensaje del JSON
      const jsonMatch = clean.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error) return parsed.error;
          if (parsed.message) return parsed.message;
        } catch (e) {
          // Si no se puede parsear, continuar
        }
      }
      return clean;
    }
    return errorMsg;
  };

  // Mostrar mensaje de error
  const showError = (message) => {
    const cleanMessage = extractErrorMessage(message);
    setError(cleanMessage);
    setSuccess("");
    setTimeout(() => setError(""), 5000);
  };

  // Mostrar mensaje de éxito
  const showSuccess = (message) => {
    const cleanMessage = extractErrorMessage(message);
    setSuccess(cleanMessage);
    setError("");
    setTimeout(() => setSuccess(""), 5000);
  };

  // Validación de nombre
  const validateName = (name) => {
    if (!name) return "El nombre es obligatorio";
    if (name.length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (name.length > 50) return "El nombre no puede tener más de 50 caracteres";
    if (!/^[a-zA-ZáéíóúñÑ\s]+$/.test(name)) return "El nombre solo puede contener letras y espacios";
    return "";
  };

  // Validación de email
  const validateEmail = (email) => {
    if (!email) return "El correo electrónico es obligatorio";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pe|net|org|edu|cl|mx|ar|co)$/i;
    if (!emailRegex.test(email)) return "Ingrese un correo electrónico válido (ej: usuario@dominio.com)";
    return "";
  };

  // Validación de teléfono
  const validatePhone = (phone) => {
    if (!phone) return "El teléfono es obligatorio";
    if (!/^\d+$/.test(phone)) return "El teléfono solo debe contener números";
    if (phone.length !== 9) return "El teléfono debe tener exactamente 9 dígitos";
    if (!phone.startsWith('9')) return "El teléfono debe comenzar con 9 (celular)";
    return "";
  };

  // Validación de contraseña segura
  const validatePassword = (password) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (password.length > 30) return "La contraseña no puede tener más de 30 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una mayúscula";
    if (!/[a-z]/.test(password)) return "Debe contener al menos una minúscula";
    if (!/[0-9]/.test(password)) return "Debe contener al menos un número";
    if (!/[!@#$%^&*]/.test(password)) return "Debe contener al menos un carácter especial (!@#$%^&*)";
    return "";
  };

  // Validación de confirmación de contraseña
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Confirma tu contraseña";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    return "";
  };

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    const strength = validatePasswordStrength(value);
    setPasswordStrength(strength);

    const passwordError = validatePassword(value);
    setFieldErrors(prev => ({ ...prev, password: passwordError }));

    if (formData.confirmPassword) {
      const confirmError = validateConfirmPassword(value, formData.confirmPassword);
      setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }

    if (error) setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    let fieldError = "";

    if (name === "name") {
      newValue = value.replace(/[^a-zA-ZáéíóúñÑ\s]/g, "");
      fieldError = validateName(newValue);
    } else if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 9);
      fieldError = validatePhone(newValue);
    } else if (name === "email") {
      newValue = value;
      fieldError = validateEmail(newValue);
    } else if (name === "confirmPassword") {
      newValue = value;
      fieldError = validateConfirmPassword(formData.password, newValue);
    } else {
      newValue = value;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleBlur = (field) => {
    let error = "";
    if (field === "name") error = validateName(formData.name);
    if (field === "email") error = validateEmail(formData.email);
    if (field === "phone") error = validatePhone(formData.phone);
    if (field === "password") error = validatePassword(formData.password);
    if (field === "confirmPassword") error = validateConfirmPassword(formData.password, formData.confirmPassword);

    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones finales
    const nameError = !isLogin ? validateName(formData.name) : "";
    const emailError = validateEmail(formData.email);
    const phoneError = !isLogin ? validatePhone(formData.phone) : "";
    const passwordError = validatePassword(formData.password);
    const confirmError = !isLogin ? validateConfirmPassword(formData.password, formData.confirmPassword) : "";

    if (!isLogin && nameError) {
      showError(nameError);
      return;
    }

    if (emailError) {
      showError(emailError);
      return;
    }

    if (!isLogin && phoneError) {
      showError(phoneError);
      return;
    }

    if (passwordError) {
      showError(passwordError);
      return;
    }

    if (!isLogin && confirmError) {
      showError(confirmError);
      return;
    }

    if (isLogin && formData.password.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const response = await authService.login(formData.email, formData.password);

        if (response && response.token) {
          localStorage.setItem("token", response.token);

          const usuario = {
            id: response.usuarioId,
            clienteId: response.clienteId,
            correo: response.correo,
            rol: response.rol,
            nombre: response.nombre || formData.email.split("@")[0]
          };

          localStorage.setItem("usuario", JSON.stringify(usuario));

          showSuccess(`¡Bienvenido ${usuario.nombre}! Has iniciado sesión correctamente.`);

          // ✅ VERIFICAR SI HAY UNA REDIRECCIÓN PENDIENTE (DESDE EL CARRITO)
          const redirectUrl = localStorage.getItem("redirectAfterLogin");

          setTimeout(() => {
            if (redirectUrl) {
              // Si hay una URL guardada, limpiar y redirigir a esa URL
              localStorage.removeItem("redirectAfterLogin");
              navigate(redirectUrl);
            } else {
              // Si no, redirigir según el rol
              if (response.rol === "ADMIN") {
                navigate("/admin");
              } else if (response.rol === "VENTAS") {
                navigate("/vendedor");
              } else if (response.rol === "TECNICO") {
                navigate("/tecnico");
              } else {
                navigate("/");
              }
            }
          }, 1500);
        }
      } else {
        const registerData = {
          correo: formData.email,
          password: formData.password,
          nombre: formData.name.trim(),
          telefono: formData.phone
        };

        await authService.register(registerData);

        showSuccess("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");

        setTimeout(() => {
          setIsLogin(true);
          setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
          setPasswordStrength({ score: 0, message: "", color: "" });
          setFieldErrors({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
        }, 2000);
      }
    } catch (err) {
      let errorMessage = "Error de conexión con el servidor";

      if (err.message) {
        errorMessage = err.message;

        // Limpiar prefijos
        if (errorMessage.includes("Error 400:")) {
          errorMessage = errorMessage.replace("Error 400:", "").trim();
        }

        // Intentar extraer solo el mensaje si es JSON
        try {
          const jsonMatch = errorMessage.match(/\{.*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error) {
              errorMessage = parsed.error;
            } else if (parsed.message) {
              errorMessage = parsed.message;
            }
          }
        } catch (e) {
          // Si no se puede parsear, mantener el mensaje original
        }

        // Limpiar mensajes
        if (errorMessage.includes("Duplicate entry") || errorMessage.includes("email")) {
          errorMessage = "Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.";
        }
      }

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-[480px] w-full animate-fade-in">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#5b4eff] to-[#4a3dcc] rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-black text-white">J</span>
          </div>
          <h1 className="text-3xl font-black text-gray-800">
            Jimenez<span className="text-[#5b4eff]"></span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-[#5b4eff]" />
            {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta para empezar a comprar"}
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-shake mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-start gap-3 animate-fade-in">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 flex-1">{success}</p>
            <button onClick={() => setSuccess("")} className="text-green-400 hover:text-green-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {/* Nombre completo */}
                <div>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "name" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                      <User size={18} />
                    </div>
                    <input
                      name="name"
                      type="text"
                      placeholder="Nombre completo (solo letras)"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                      required
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 ml-2">Solo letras, mínimo 3 caracteres</p>
                </div>

                {/* Teléfono */}
                <div>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "phone" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                      <Phone size={18} />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Teléfono (9 dígitos)"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                      required
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 ml-2">Ej: 912345678</p>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "email" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "password" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña (mínimo 8 caracteres)"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.password}</p>
              )}
            </div>

            {/* Indicador de fortaleza de contraseña */}
            {!isLogin && passwordStrength.message && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={12} className={`${passwordStrength.color.replace("bg-", "text-").replace("500", "600")}`} />
                  <p className={`text-xs font-medium ${passwordStrength.color.replace("bg-", "text-").replace("500", "600")}`}>
                    {passwordStrength.message}
                  </p>
                </div>
              </div>
            )}

            {/* Confirmar contraseña */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "confirmPassword" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                    <Lock size={18} />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 ml-2">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Olvidaste tu contraseña - solo en login */}
            {isLogin && (
              <div className="flex justify-end">
                <Link
                  to="/recuperar-password"
                  className="text-sm text-[#5b4eff] hover:text-[#4a3dcc] transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] hover:shadow-lg hover:scale-[1.02]"
                }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isLogin ? "Ingresando..." : "Creando cuenta..."}
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">o</span>
            </div>
          </div>

          {/* Cambiar entre login/registro */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
                setFieldErrors({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
              }}
              className="text-sm text-gray-500 hover:text-[#5b4eff] transition-colors"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Al continuar, aceptas nuestros{" "}
          <Link to="/terminos-condiciones" className="text-[#5b4eff] hover:underline">
            Términos y Condiciones
          </Link>{" "}
          y{" "}
          <Link to="/politicas-privacidad" className="text-[#5b4eff] hover:underline">
            Políticas de Privacidad
          </Link>
        </p>
      </div>

      <style>{styles}</style>
    </div>
  );
}