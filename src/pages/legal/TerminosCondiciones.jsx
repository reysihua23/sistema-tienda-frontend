// pages/legal/TerminosCondiciones.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TerminosCondiciones() {
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
            <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
            <p className="text-gray-300 text-sm mt-2">Última actualización: 1 de abril de 2026</p>
          </div>

          {/* Contenido del documento */}
          <div className="p-8 space-y-6 text-gray-700">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500">Versión 1.0</p>
            </div>

            {/* Sección 1 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Información General</h2>
              <p className="text-sm leading-relaxed">
                Esta tienda virtual es operada por <strong>Reydi Tienda S.A.C.</strong>, con RUC 20601234567, 
                ubicada en Av. Principal 123, Lima - Perú. Al realizar una compra en nuestra plataforma, 
                aceptas los siguientes términos y condiciones en su totalidad.
              </p>
            </div>

            {/* Sección 2 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. Privacidad de Datos</h2>
              <p className="text-sm leading-relaxed">
                Tus datos personales serán tratados de acuerdo con nuestra política de privacidad. 
                No compartiremos tu información con terceros sin tu consentimiento expreso.
              </p>
            </div>

            {/* Sección 3 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Política de Envíos</h2>
              <p className="text-sm leading-relaxed">
                Los envíos se realizan dentro de Lima Metropolitana en un plazo de 2-3 días hábiles 
                después de confirmado el pago. El costo de envío se calcula automáticamente al momento 
                de la compra según la ubicación y el método seleccionado.
              </p>
            </div>

            {/* Sección 4 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Garantía y Devoluciones</h2>
              <p className="text-sm leading-relaxed">
                Los productos tienen garantía de <strong>7 días</strong> contra defectos de fabricación 
                a partir de la fecha de entrega. Para hacer efectiva la garantía, el producto debe estar 
                en su empaque original y presentar el comprobante de compra.
              </p>
            </div>

            {/* Sección 5 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Métodos de Pago</h2>
              <p className="text-sm leading-relaxed">
                Aceptamos los siguientes métodos de pago:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1 ml-4">
                <li>💳 Tarjeta de crédito/débito (Visa, Mastercard, American Express)</li>
                <li>📱 Yape</li>
                <li>💙 Plin</li>
                <li>🏦 Transferencia bancaria</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">
                Todos los pagos son procesados de forma segura a través de nuestra pasarela de pagos 
                certificada. No almacenamos información de tarjetas de crédito en nuestros servidores.
              </p>
            </div>

            {/* Sección 6 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Precios y Promociones</h2>
              <p className="text-sm leading-relaxed">
                Los precios mostrados en la tienda incluyen IGV (18%). Nos reservamos el derecho de 
                modificar los precios en cualquier momento sin previo aviso. Las promociones y descuentos 
                tienen una vigencia específica indicada en la página.
              </p>
            </div>

            {/* Sección 7 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">7. Cancelación de Pedidos</h2>
              <p className="text-sm leading-relaxed">
                El cliente puede cancelar un pedido dentro de las <strong>2 horas</strong> después de 
                realizada la compra, siempre que el pedido no haya sido procesado o enviado. 
                Para cancelar, debe contactar a nuestro servicio al cliente.
              </p>
            </div>

            {/* Sección 8 */}
            <div className="border-l-4 border-[#5b4eff] pl-4">
              <h2 className="text-xl font-bold text-gray-800 mb-3">8. Contacto</h2>
              <p className="text-sm leading-relaxed">
                Para cualquier consulta, reclamo o sugerencia, puedes contactarnos a través de:
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p>📧 Email: <a href="mailto:soporte@tienda.com" className="text-[#5b4eff] hover:underline">soporte@tienda.com</a></p>
                <p>📞 Teléfono: 997863112</p>
                <p>📍 Dirección: Amazonas, Písac 08106- Cusco - Perú</p>
                <p>⏰ Horario de atención: Lun a Sab: 9am - 8pm</p>
              </div>
            </div>

            {/* Footer del documento */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                © 2026 Reydi Tienda S.A.C. Todos los derechos reservados.
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