import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { apiService } from "../../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  // ✅ Validación fuerte de contraseña (misma que en backend)
  const validarPassword = (pwd) => {
    if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "La contraseña debe tener al menos una mayúscula";
    if (!/[a-z]/.test(pwd)) return "La contraseña debe tener al menos una minúscula";
    if (!/\d/.test(pwd)) return "La contraseña debe tener al menos un número";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
      return "La contraseña debe tener al menos un símbolo (!@#$%...)";
    return null;
  };

  // ✅ Reglas individuales para el indicador visual
  const reglas = {
    length: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /\d/.test(password),
    simbolo: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Enlace inválido</h2>
          <p className="text-gray-500 text-sm">El enlace no contiene un token válido.</p>
          <Link
            to="/forgot-password"
            className="inline-block mt-4 text-[#5b4eff] font-medium hover:underline"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errorPwd = validarPassword(password);
    if (errorPwd) {
      setError(errorPwd);
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await apiService.post("/auth/reset-password", { token, nuevaPassword: password });
      setExito(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pantalla de éxito
  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Contraseña actualizada!</h2>
          <p className="text-gray-500 text-sm">
            Te enviamos un correo de confirmación. Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#5b4eff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-[#5b4eff]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-2">
            Elige una contraseña segura que cumpla los requisitos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5b4eff] focus:border-transparent outline-none pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* ✅ Indicador de requisitos en vivo */}
            {password.length > 0 && (
              <div className="text-xs space-y-1 mt-3 bg-gray-50 rounded-lg p-3">
                <p className={reglas.length ? "text-green-600" : "text-gray-500"}>
                  {reglas.length ? "✓" : "•"} Mínimo 8 caracteres
                </p>
                <p className={reglas.mayuscula ? "text-green-600" : "text-gray-500"}>
                  {reglas.mayuscula ? "✓" : "•"} Una mayúscula
                </p>
                <p className={reglas.minuscula ? "text-green-600" : "text-gray-500"}>
                  {reglas.minuscula ? "✓" : "•"} Una minúscula
                </p>
                <p className={reglas.numero ? "text-green-600" : "text-gray-500"}>
                  {reglas.numero ? "✓" : "•"} Un número
                </p>
                <p className={reglas.simbolo ? "text-green-600" : "text-gray-500"}>
                  {reglas.simbolo ? "✓" : "•"} Un símbolo (!@#$%...)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5b4eff] focus:border-transparent outline-none"
              placeholder="••••••••"
            />
            {confirmar.length > 0 && password !== confirmar && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
            {confirmar.length > 0 && password === confirmar && (
              <p className="text-xs text-green-600 mt-1">✓ Coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5b4eff] text-white py-3 rounded-xl font-bold hover:bg-[#4a3dcc] transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}