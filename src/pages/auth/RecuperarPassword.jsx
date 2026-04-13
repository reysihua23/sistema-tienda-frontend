// pages/auth/RecuperarPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/api";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      setLoading(false);
      return;
    }

    try {
      // Aquí iría la llamada al endpoint de recuperación
      // await authService.recuperarPassword(email);
      
      // Simulación de éxito
      setTimeout(() => {
        setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico.");
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      setError(err.message || "Error al enviar el enlace de recuperación");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5b4eff] transition-colors mb-4">
              <ArrowLeft size={16} /> Volver al login
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-500 mt-2">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "email" ? "text-[#5b4eff]" : "text-gray-400"}`}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] hover:shadow-lg"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </div>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}