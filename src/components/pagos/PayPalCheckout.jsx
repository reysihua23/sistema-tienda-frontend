// components/pagos/PayPalCheckout.jsx
import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Shield, Lock, AlertCircle, X, CheckCircle, Loader } from 'lucide-react';

const API_BASE_URL = "http://localhost:8080/api";

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

      console.log("Orden creada - ID:", order);
      return order;

    } catch (err) {
      console.error("Error creando orden:", err);
      setError(err.message);
      throw err;
    }
  };

  // Capturar pago y crear pedido
  const onApprove = async (data, actions) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Pago aprobado, capturando...");

      const captureData = await actions.order.capture();

      console.log("Captura exitosa:", captureData);

      if (captureData.status !== "COMPLETED") {
        throw new Error(`Pago no completado. Estado: ${captureData.status}`);
      }

      const montoUSDCapturado = parseFloat(captureData.purchase_units[0].amount.value);
      const montoPENCalculado = montoPEN || (montoUSDCapturado / 0.28);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa. Por favor, inicia sesión nuevamente.");
      }

      const pedidoData = {
        clienteId: clienteId,
        metodoPago: "PAYPAL",
        metodoEnvio: metodoEnvio,
        direccionEnvio: metodoEnvio === "ENVIO_DOMICILIO" ? direccionEnvio : null,
        emailComprobante: emailCliente, 
        clienteEmail: clienteEmail,     
        productos: cartItems.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precio
        })),
        paypalData: {
          orderId: captureData.id,
          payerId: captureData.payer.payer_id,
          payerEmail: captureData.payer.email_address || clienteEmail,
          status: captureData.status,
          amount: montoUSDCapturado,
          currency: "USD"
        },
        montoUSD: montoUSDCapturado,
        montoPEN: montoPENCalculado
      };

      console.log("📦 Creando pedido en backend...", pedidoData);

      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al crear el pedido");
      }

      console.log("Pedido creado:", result);

      setPaymentCompleted(true);

      setTimeout(() => {
        onSuccess?.({
          ...result,
          pedidoId: result.pedidoId,
          captureData,
          mensaje: "¡Pago completado exitosamente! Redirigiendo..."
        });
      }, 1500);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      onError?.(err.message);
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error("PayPal error:", err);
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
                    console.log("Usuario canceló el pago");
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