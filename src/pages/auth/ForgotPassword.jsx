import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { apiService } from "../../services/api";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiService.post("/auth/forgot-password", { correo });
      setEnviado(true);
    } catch (err) {
      // ✅ Mostrar mensaje real del backend (rate limit, etc.)
      setError(err?.response?.data?.error || "Debes esperar antes de solicitar otro enlace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5b4eff] mb-6"
        >
          <ArrowLeft size={16} /> Volver al login
        </Link>

        {!enviado ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#5b4eff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-[#5b4eff]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">¿Olvidaste tu contraseña?</h1>
              <p className="text-sm text-gray-500 mt-2">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
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
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5b4eff] focus:border-transparent outline-none"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5b4eff] text-white py-3 rounded-xl font-bold hover:bg-[#4a3dcc] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Enviando..." : (<><Send size={18} /> Enviar enlace</>)}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Revisa tu correo</h2>
            <p className="text-sm text-gray-500">
              Si <b>{correo}</b> está registrado, recibirás un enlace para restablecer tu contraseña.
              No olvides revisar la carpeta de <b>spam</b>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 text-[#5b4eff] font-medium hover:underline"
            >
              Volver al login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}