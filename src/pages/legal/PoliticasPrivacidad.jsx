// pages/legal/PoliticasPrivacidad.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PoliticasPrivacidad() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Botón volver */}
        <Link
          to="/carrito"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5b4eff] transition mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al carrito
        </Link>

        {/* Documento tipo PDF */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header del documento */}
          <div className="bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] px-8 py-6 text-center border-b-4 border-[#5b4eff]">
            <h1 className="text-3xl font-bold text-white">Políticas de Privacidad</h1>
            <p className="text-gray-300 text-sm mt-2">Última actualización: 1 de abril de 2026</p>
          </div>

          {/* Contenido del documento */}
          <div className="p-8 space-y-6 text-gray-700">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500">Versión 1.0</p>
            </div>

            {/* Sección 1 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Información que Recopilamos</h2>
              <p className="text-sm leading-relaxed">
                Recopilamos la siguiente información personal cuando realizas una compra o te registras en nuestra tienda:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1 ml-4">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Documento de identidad (DNI/RUC)</li>
                <li>Dirección de envío</li>
                <li>Historial de compras</li>
              </ul>
            </div>

            {/* Sección 2 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Uso de la Información</h2>
              <p className="text-sm leading-relaxed">
                Utilizamos tu información personal para:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1 ml-4">
                <li>Procesar tus pedidos y pagos</li>
                <li>Enviar confirmaciones y actualizaciones de tus pedidos</li>
                <li>Mejorar nuestra atención al cliente</li>
                <li>Enviar promociones y ofertas especiales (solo con tu consentimiento)</li>
              </ul>
            </div>

            {/* Sección 3 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Protección de Datos</h2>
              <p className="text-sm leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información 
                personal contra accesos no autorizados, pérdida o alteración. Todos los pagos son procesados 
                a través de pasarelas de pago seguras con cifrado SSL (Secure Socket Layer).
              </p>
            </div>

            {/* Sección 4 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Compartición de Datos</h2>
              <p className="text-sm leading-relaxed">
                No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto cuando 
                sea necesario para procesar tu pedido (como empresas de envío) o cuando sea requerido por ley.
              </p>
            </div>

            {/* Sección 5 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Tus Derechos</h2>
              <p className="text-sm leading-relaxed">
                Tienes derecho a acceder, rectificar, cancelar u oponerte al uso de tus datos personales. 
                Para ejercer estos derechos, contáctanos a través de nuestro correo electrónico 
                <strong> privacidad@tienda.com</strong>.
              </p>
            </div>

            {/* Sección 6 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Cookies</h2>
              <p className="text-sm leading-relaxed">
                Utilizamos cookies para mejorar tu experiencia de navegación, recordar tus preferencias 
                y analizar el tráfico de nuestra tienda. Puedes configurar tu navegador para rechazar 
                las cookies, pero esto podría afectar algunas funcionalidades.
              </p>
            </div>

            {/* Sección 7 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">7. Cambios en la Política de Privacidad</h2>
              <p className="text-sm leading-relaxed">
                Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. 
                Los cambios serán publicados en esta página con la fecha de actualización correspondiente.
              </p>
            </div>

            {/* Sección 8 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">8. Contacto</h2>
              <p className="text-sm leading-relaxed">
                Para consultas sobre privacidad o para ejercer tus derechos, contáctanos:
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p>📧 Email: <a href="mailto:privacidad@tienda.com" className="text-[#5b4eff] hover:underline">jimenez@tienda.com</a></p>
                <p>📞 Teléfono: 997863112</p>
                <p>📍 Dirección: Amazonas, Písac 08106- Cusco - Perú</p>
              </div>
            </div>

            {/* Footer del documento */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                © 2026 Jimenez Tienda S.A.C. Todos los derechos reservados.
              </p>
              <Link
                to="/carrito"
                className="inline-block mt-4 px-6 py-2 bg-[#5b4eff] text-white rounded-lg font-bold text-sm hover:bg-[#4a3dcc] transition"
              >
                Aceptar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}