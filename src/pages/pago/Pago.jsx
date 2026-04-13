// pages/pago/Pago.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import { pedidoService, detallePedidoService, stockService, usuarioService } from "../../services/api";

export default function Pago() {
    const navigate = useNavigate();
    const { cartItems, subtotal, vaciarCarrito } = useCarrito();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("TARJETA");  // ← Cambiar a mayúsculas
    const [metodoEnvio, setMetodoEnvio] = useState("RECOJO_EN_TIENDA");
    const [direccionEnvio, setDireccionEnvio] = useState("");
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: ""
    });
    const [step, setStep] = useState("form");

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate("/carrito");
        }
    }, [cartItems, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    const formatCardNumber = (value) => {
        const clean = value.replace(/\s/g, '');
        const groups = clean.match(/.{1,4}/g);
        return groups ? groups.join(' ') : clean;
    };

    const formatExpiryDate = (value) => {
        const clean = value.replace(/\D/g, '');
        if (clean.length >= 2) {
            return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
        }
        return clean;
    };

    const validateForm = () => {
        if (paymentMethod === "TARJETA") {
            const cardNumberClean = paymentData.cardNumber.replace(/\s/g, '');
            if (cardNumberClean.length !== 16) {
                setError("Número de tarjeta inválido (debe tener 16 dígitos)");
                return false;
            }
            if (!paymentData.cardName.trim()) {
                setError("Ingresa el nombre del titular");
                return false;
            }
            if (paymentData.expiryDate.length !== 5) {
                setError("Fecha de expiración inválida (MM/AA)");
                return false;
            }
            if (paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
                setError("CVV inválido (3 o 4 dígitos)");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setStep("processing");
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No hay sesión activa. Por favor inicia sesión.");
            }

            const usuarioStr = localStorage.getItem("usuario");
            if (!usuarioStr) {
                throw new Error("No se encontraron datos de usuario");
            }

            const usuario = JSON.parse(usuarioStr);

            if (usuario.rol !== "CLIENTE") {
                throw new Error("Solo los clientes pueden realizar compras");
            }

            // ✅ Obtener el clienteId correcto
            let clienteId = usuario.clienteId;
            
            if (!clienteId) {
                // Si no tiene clienteId, obtener del perfil
                const perfil = await usuarioService.getPerfil();
                clienteId = perfil.id;
                
                // Actualizar localStorage
                const usuarioActualizado = { ...usuario, clienteId: clienteId };
                localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            }

            console.log("🏷️ Cliente ID:", clienteId);
            console.log("💳 Método de pago:", paymentMethod);
            console.log("🚚 Método de envío:", metodoEnvio);

            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 1500));

            // ✅ CORREGIDO: Construir pedido en el formato correcto
            const pedidoData = {
                clienteId: clienteId,  // ← Usar clienteId, no usuario.id
                metodoPago: paymentMethod,  // ← "TARJETA", "YAPE", "PLIN"
                metodoEnvio: metodoEnvio,   // ← "RECOJO_EN_TIENDA", "ENVIO_DOMICILIO"
                direccionEnvio: metodoEnvio === "ENVIO_DOMICILIO" ? direccionEnvio : null,
                productos: cartItems.map(item => ({
                    productoId: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio
                }))
            };

            console.log("📦 Enviando pedido:", pedidoData);

            const pedidoResponse = await pedidoService.crear(pedidoData);
            const pedidoId = pedidoResponse.pedidoId || pedidoResponse.id;

            if (!pedidoId) {
                throw new Error("No se pudo crear el pedido");
            }

            // Vaciar carrito
            vaciarCarrito();

            setStep("success");

            setTimeout(() => {
                navigate("/mis-pedidos");
            }, 2000);

        } catch (error) {
            console.error("Error al procesar pago:", error);
            setError(error.message || "Error al procesar el pago. Intenta nuevamente.");
            setStep("form");
        }
    };

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#0d0c1e]">
                        Finalizar Compra
                        <span className="text-[#5b4eff]">.</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Completa los datos de pago para finalizar tu pedido</p>
                </div>

                {step === "form" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Resumen del pedido */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-black text-lg mb-4">📦 Resumen del Pedido</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {cartItems.map((item, idx) => (
                                    <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100">
                                        <img
                                            src={item.imagenUrl || "https://placehold.co/60x60?text=Producto"}
                                            alt={item.nombre}
                                            className="w-14 h-14 object-cover rounded-lg"
                                            onError={(e) => e.target.src = "https://placehold.co/60x60?text=Sin+Imagen"}
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{item.nombre}</p>
                                            <p className="text-xs text-gray-400">Cantidad: {item.cantidad}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#5b4eff]">{formatPrice(item.precio * item.cantidad)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-2xl text-[#5b4eff]">{formatPrice(subtotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de pago */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-black text-lg mb-4">💳 Datos de Pago</h3>

                            {/* Método de pago */}
                            <div className="mb-6">
                                <label className="block text-xs font-black text-gray-500 uppercase mb-3">Método de pago</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("TARJETA")}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === "TARJETA"
                                                ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff]"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        💳 Tarjeta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("YAPE")}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === "YAPE"
                                                ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff]"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        📱 Yape
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("PLIN")}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === "PLIN"
                                                ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff]"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        💙 Plin
                                    </button>
                                </div>
                            </div>

                            {/* Método de envío */}
                            <div className="mb-6">
                                <label className="block text-xs font-black text-gray-500 uppercase mb-3">Método de envío</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMetodoEnvio("RECOJO_EN_TIENDA")}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${metodoEnvio === "RECOJO_EN_TIENDA"
                                                ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff]"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        📦 Recoger en tienda
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMetodoEnvio("ENVIO_DOMICILIO")}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${metodoEnvio === "ENVIO_DOMICILIO"
                                                ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff]"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        🚚 Envío a domicilio (+S/15)
                                    </button>
                                </div>
                            </div>

                            {metodoEnvio === "ENVIO_DOMICILIO" && (
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección de envío</label>
                                    <input
                                        type="text"
                                        placeholder="Ingresa tu dirección completa"
                                        value={direccionEnvio}
                                        onChange={(e) => setDireccionEnvio(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                                        required
                                    />
                                </div>
                            )}

                            {paymentMethod === "TARJETA" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Número de tarjeta</label>
                                        <input
                                            type="text"
                                            placeholder="**** **** **** ****"
                                            value={formatCardNumber(paymentData.cardNumber)}
                                            onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
                                            maxLength="19"
                                            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#5b4eff] focus:outline-none transition font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del titular</label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            placeholder="Como aparece en la tarjeta"
                                            value={paymentData.cardName}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#5b4eff] focus:outline-none transition uppercase"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha expiración</label>
                                            <input
                                                type="text"
                                                placeholder="MM/AA"
                                                value={formatExpiryDate(paymentData.expiryDate)}
                                                onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value.replace(/\D/g, '') }))}
                                                maxLength="5"
                                                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">CVV</label>
                                            <input
                                                type="password"
                                                name="cvv"
                                                placeholder="***"
                                                value={paymentData.cvv}
                                                onChange={handleInputChange}
                                                maxLength="4"
                                                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(paymentMethod === "YAPE" || paymentMethod === "PLIN") && (
                                <div className="text-center py-6">
                                    <div className="text-6xl mb-4 animate-pulse">📱</div>
                                    <p className="text-gray-600 mb-4">Escanea el código QR o paga con {paymentMethod}</p>
                                    <div className="bg-gray-100 p-4 rounded-xl">
                                        <p className="font-mono text-xl font-bold text-[#5b4eff]">+51 999 999 999</p>
                                        <p className="text-xs text-gray-500 mt-1">Número de cuenta</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-rose-50 rounded-xl text-rose-600 text-sm flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                💰 Pagar {formatPrice(subtotal)}
                            </button>

                            <button
                                onClick={() => navigate("/carrito")}
                                className="w-full mt-3 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                ← Volver al carrito
                            </button>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5b4eff] mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold mb-2">Procesando pago...</h3>
                        <p className="text-gray-500">Por favor no cierres esta ventana</p>
                    </div>
                )}

                {step === "success" && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-7xl mb-6 animate-bounce">🎉</div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pago Exitoso!</h3>
                        <p className="text-gray-500">Tu pedido ha sido registrado correctamente</p>
                        <p className="text-xs text-gray-400 mt-4">Redirigiendo a mis pedidos...</p>
                    </div>
                )}
            </div>
        </div>
    );
}