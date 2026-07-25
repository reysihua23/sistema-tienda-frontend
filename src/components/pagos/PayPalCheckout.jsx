// components/pagos/PayPalCheckout.jsx
import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Shield, Lock, AlertCircle, X, CheckCircle, Loader } from 'lucide-react';

const API_BASE_URL = "http://localhost:8080/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("usuario") || "{}");

if (!token) {
    throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
}

// Opcional: verificar si el token está expirado
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    if (Date.now() >= exp) {
        throw new Error("Token expirado. Inicia sesión nuevamente.");
    }
} catch (error) {
    throw new Error("Token inválido. Inicia sesión nuevamente.");
}

export default function PayPalCheckout({
  monto,
  montoPEN,
  clienteId,
  clienteNombre,
  clienteEmail,
  emailCliente,
  metodoEnvio,
  direccionEnvio,
  cartItems,
  onSuccess,
  onError,
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();

  const montoUSD = parseFloat(monto);
  const montoPENValue = parseFloat(montoPEN);

  // Crear orden en PayPal
  const createOrder = async (data, actions) => {
    try {
      if (isNaN(montoUSD) || montoUSD <= 0) {
        throw new Error(`Monto inválido: ${monto}`);
      }

      console.log("💰 Creando orden PayPal - Monto USD:", montoUSD);

      const order = await actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: montoUSD.toFixed(2)
          },
          description: `Compra en Jimenez - ${cartItems?.length || 0} productos`,
          custom_id: `cliente_${clienteId}_${Date.now()}`
        }],
        application_context: {
          brand_name: "Jimenez",
          locale: "es-PE",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW"
        }
      });

      console.log("✅ Orden creada - ID:", order);
      return order;

    } catch (err) {
      console.error("❌ Error creando orden:", err);
      setError(err.message);
      throw err;
    }
  };

  // Capturar pago y crear pedido
  const onApprove = async (data, actions) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Pago aprobado, capturando...");

      const captureData = await actions.order.capture();

      console.log("✅ Captura exitosa:", captureData);

      if (captureData.status !== "COMPLETED") {
        throw new Error(`Pago no completado. Estado: ${captureData.status}`);
      }

      const montoUSDCapturado = parseFloat(captureData.purchase_units[0].amount.value);
      const montoPENCalculado = montoPEN || (montoUSDCapturado / 0.28);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa. Por favor, inicia sesión nuevamente.");
      }

      // ✅ LOGS DE VALIDACIÓN DE DATOS
      console.log("═══════════════════════════════════════");
      console.log("📋 VALIDANDO DATOS DEL PEDIDO");
      console.log("═══════════════════════════════════════");
      console.log("clienteId:", clienteId, "| Tipo:", typeof clienteId);
      console.log("clienteNombre:", clienteNombre);
      console.log("clienteEmail:", clienteEmail);
      console.log("metodoEnvio:", metodoEnvio);
      console.log("direccionEnvio:", direccionEnvio);
      console.log("cartItems:", cartItems);
      console.log("montoUSD:", montoUSDCapturado);
      console.log("montoPEN:", montoPENCalculado);
      console.log("───────────────────────────────────────");

      // ✅ VALIDAR CAMPOS OBLIGATORIOS
      const errores = [];
      if (!clienteId) errores.push("clienteId es requerido");
      if (!cartItems || cartItems.length === 0) errores.push("No hay productos en el carrito");
      if (isNaN(montoUSDCapturado) || montoUSDCapturado <= 0) errores.push("Monto inválido");

      if (errores.length > 0) {
        console.error("❌ Errores de validación:", errores);
        throw new Error(`Datos inválidos: ${errores.join(", ")}`);
      }

      // ✅ CONSTRUIR DATOS DEL PEDIDO
      const pedidoData = {
        clienteId: clienteId,
        metodoPago: "PAYPAL",
        metodoEnvio: metodoEnvio || "RECOJO_EN_TIENDA",
        direccionEnvio: metodoEnvio === "ENVIO_DOMICILIO" ? direccionEnvio : null,
        emailComprobante: emailCliente || clienteEmail,
        clienteEmail: clienteEmail || emailCliente,
        clienteNombre: clienteNombre || "Cliente",
        productos: cartItems.map(item => ({
          productoId: parseInt(item.id) || item.id,
          cantidad: parseInt(item.cantidad) || item.cantidad,
          precioUnitario: parseFloat(item.precio) || item.precio
        })),
        paypalData: {
          orderId: captureData.id,
          payerId: captureData.payer.payer_id,
          payerEmail: captureData.payer.email_address || clienteEmail,
          status: captureData.status,
          amount: montoUSDCapturado,
          currency: "USD",
          captureId: captureData.id
        },
        montoUSD: montoUSDCapturado,
        montoPEN: montoPENCalculado,
        estado: "PENDIENTE",
        fechaPedido: new Date().toISOString()
      };

      console.log("📦 Datos a enviar al backend:");
      console.log(JSON.stringify(pedidoData, null, 2));

      // ✅ ENVIAR AL BACKEND CON MANEJO DE ERRORES DETALLADO
      console.log("🚀 Enviando petición al backend...");
      
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
      });

      // ✅ LEER LA RESPUESTA COMPLETA
      console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

      // Leer la respuesta como texto primero
      const responseText = await response.text();
      console.log("📄 Texto de respuesta:", responseText);

      // Intentar parsear como JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("✅ JSON parseado:", result);
      } catch (parseError) {
        console.error("❌ Error parseando JSON:", parseError);
        throw new Error(`Error del servidor: ${response.status} - ${responseText || response.statusText}`);
      }

      // ✅ VERIFICAR SI HAY ERROR EN LA RESPUESTA
      if (!response.ok) {
        const errorMsg = result.error || result.message || result.detail || JSON.stringify(result);
        console.error("❌ Error del backend:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          fullResponse: result
        });
        throw new Error(`Error del servidor (${response.status}): ${errorMsg}`);
      }

      console.log("✅ Pedido creado exitosamente:", result);

      setPaymentCompleted(true);

      setTimeout(() => {
        onSuccess?.({
          ...result,
          pedidoId: result.pedidoId || result.id,
          captureData,
          mensaje: "¡Pago completado exitosamente! Redirigiendo..."
        });
      }, 1500);

    } catch (err) {
      // ✅ LOG DE ERROR COMPLETO
      console.error("═══════════════════════════════════════");
      console.error("❌ ERROR EN EL PROCESO DE PAGO");
      console.error("═══════════════════════════════════════");
      console.error("Mensaje:", err.message);
      console.error("Stack trace:", err.stack);
      console.error("Nombre del error:", err.name);
      
      // Si hay respuesta del servidor
      if (err.response) {
        console.error("Respuesta del servidor:", err.response);
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
        console.error("Data:", err.response.data);
      }
      
      console.error("═══════════════════════════════════════");

      // ✅ MOSTRAR ERROR EN EL FRONTEND
      let errorMessage = err.message || "Ocurrió un error al procesar el pago";
      
      // Limpiar mensajes de error si son demasiado técnicos
      if (errorMessage.includes("could not execute statement")) {
        errorMessage = "Error en la base de datos al crear el pedido. Por favor, intenta nuevamente.";
      } else if (errorMessage.includes("Unknown column")) {
        errorMessage = "Error en la estructura de la base de datos. Contacta al administrador.";
      } else if (errorMessage.includes("clienteId")) {
        errorMessage = "No se pudo identificar al cliente. Por favor, inicia sesión nuevamente.";
      } else if (errorMessage.includes("stock")) {
        errorMessage = "Stock insuficiente para algunos productos. Por favor, revisa tu carrito.";
      }

      setError(errorMessage);
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error("❌ PayPal error:", err);
    setError("Ocurrió un error con PayPal. Intenta nuevamente.");
    onError?.(err);
  };

  if (isPending) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader size={48} className="animate-spin text-[#0070ba]" />
            <p className="mt-4 text-gray-600">Cargando PayPal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#0070ba] to-[#003087] px-5 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">
              {paymentCompleted ? "¡Pago Exitoso!" : "Pagar con PayPal"}
            </h3>
            <p className="text-gray-200 text-sm">
              Total: S/ {montoPENValue?.toFixed(2) || '0.00'} PEN
              <span className="text-xs opacity-75 ml-1">(~${montoUSD?.toFixed(2) || '0.00'} USD)</span>
            </p>
          </div>
          {!paymentCompleted && (
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" disabled={loading}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-5">
          {paymentCompleted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">¡Pago Completado!</h4>
              <p className="text-gray-600">Procesando tu pedido...</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h4 className="font-medium text-gray-800 mb-2">Resumen del pedido</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Cliente</span>
                    <span className="font-medium text-gray-700">{clienteNombre || 'Cliente'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Productos</span>
                    <span className="font-medium text-gray-700">{cartItems?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Envío</span>
                    <span className="font-medium text-gray-700">
                      {metodoEnvio === "ENVIO_DOMICILIO" ? "🚚 A domicilio (+S/15)" : "🏪 Recogo en tienda"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">Total a pagar</span>
                      <span className="font-bold text-xl text-[#0070ba]">
                        S/ {montoPENValue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-5 text-xs text-gray-400">
                <div className="flex items-center gap-1"><Lock size={12} /> Pago seguro</div>
                <div className="flex items-center gap-1"><Shield size={12} /> Protegido por PayPal</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} /> Sin compartir datos</div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={handleError}
                  onCancel={() => {
                    console.log("👤 Usuario canceló el pago");
                    onClose?.();
                  }}
                  style={{
                    layout: "vertical",
                    color: "blue",
                    shape: "rect",
                    label: "pay",
                    height: 48
                  }}
                  disabled={loading || !!error}
                />

                {loading && (
                  <div className="text-center py-3">
                    <Loader size={20} className="animate-spin text-[#0070ba] inline-block mr-2" />
                    <span className="text-sm text-gray-600">Procesando tu pago...</span>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}