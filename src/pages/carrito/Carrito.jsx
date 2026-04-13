// pages/carrito/Carrito.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import PayPalCheckout from "../../components/pagos/PayPalCheckout";
import {
  ShoppingBag, Trash2, Plus, Minus, CreditCard,
  Truck, Store, CheckCircle, Shield, Clock, Tag,
  AlertCircle, X, ArrowLeft, Loader, MapPin,
  Package, ChevronRight, Heart, Percent, Sparkles,
  Wallet, Zap, Gift, Lock  
} from "lucide-react";

export default function Carrito() {
  const navigate = useNavigate();
  const { cartItems, subtotal, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [metodoEnvio, setMetodoEnvio] = useState("RECOJO_EN_TIENDA");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [envioCosto, setEnvioCosto] = useState(0);
  const [tasaCambio, setTasaCambio] = useState(0.28);
  const [validandoStock, setValidandoStock] = useState(false);
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [aplicandoDescuento, setAplicandoDescuento] = useState(false);

  // Calcular total con envío y descuento
  const totalConEnvio = subtotal + envioCosto - descuento;
  const montoUSD = (totalConEnvio * tasaCambio).toFixed(2);

  // Actualizar costo de envío
  useEffect(() => {
    setEnvioCosto(metodoEnvio === "ENVIO_DOMICILIO" ? 15 : 0);
  }, [metodoEnvio]);

  // Obtener tasa de cambio
  useEffect(() => {
    const obtenerTasaCambio = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/PEN');
        const data = await response.json();
        if (data.rates && data.rates.USD) {
          setTasaCambio(data.rates.USD);
        }
      } catch (error) {
        console.error('Error obteniendo tasa:', error);
        setTasaCambio(0.28);
      }
    };
    obtenerTasaCambio();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Validar stock antes de proceder
  const validarStockProductos = async () => {
    setValidandoStock(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Debes iniciar sesión");
      }

      const response = await fetch("http://localhost:8080/api/productos/validar-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productos: cartItems.map(item => ({
            id: item.id,
            cantidad: item.cantidad
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error validando stock");
      }

      if (!result.success && result.productosSinStock && result.productosSinStock.length > 0) {
        const nombresProductos = result.productosSinStock.map(p => p.nombre).join(", ");
        throw new Error(`Stock insuficiente para: ${nombresProductos}`);
      }

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setValidandoStock(false);
    }
  };

  // Aplicar código de descuento
  const aplicarDescuento = async () => {
    if (!codigoDescuento.trim()) {
      setError("Ingresa un código de descuento");
      return;
    }

    setAplicandoDescuento(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/descuentos/validar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          codigo: codigoDescuento,
          monto: subtotal
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.valido) {
          setDescuento(result.montoDescuento);
          setError(null);
        } else {
          setError(result.message || "Código de descuento inválido");
          setDescuento(0);
        }
      } else {
        if (codigoDescuento.toUpperCase() === "BIENVENIDO10") {
          const descuentoCalculado = subtotal * 0.10;
          setDescuento(descuentoCalculado);
          setError(null);
        } else {
          setError("Código de descuento inválido");
          setDescuento(0);
        }
      }
    } catch (error) {
      console.error("Error aplicando descuento:", error);
      if (codigoDescuento.toUpperCase() === "BIENVENIDO10") {
        const descuentoCalculado = subtotal * 0.10;
        setDescuento(descuentoCalculado);
        setError(null);
      } else {
        setError("Error al validar el código");
        setDescuento(0);
      }
    } finally {
      setAplicandoDescuento(false);
    }
  };

  // Obtener información del usuario
  const obtenerUsuario = async () => {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
      throw new Error("Debes iniciar sesión para realizar un pedido");
    }

    const usuario = JSON.parse(usuarioStr);
    if (usuario.rol !== "CLIENTE") {
      throw new Error("Solo los clientes pueden realizar compras");
    }

    let clienteId = usuario.clienteId;

    if (!clienteId) {
      const perfilResponse = await fetch("http://localhost:8080/api/usuarios/perfil", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (!perfilResponse.ok) {
        throw new Error("Error al obtener perfil");
      }

      const perfil = await perfilResponse.json();
      clienteId = perfil.id;
      const usuarioActualizado = { ...usuario, clienteId: clienteId };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      usuario.clienteId = clienteId;
    }

    return usuario;
  };

  // Abrir PayPal con validaciones
  const handlePayPalPayment = async () => {
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    if (metodoEnvio === "ENVIO_DOMICILIO" && !direccionEnvio.trim()) {
      setError("Por favor, ingresa una dirección de envío válida");
      return;
    }

    if (cartItems.length === 0) {
      setError("Tu carrito está vacío");
      return;
    }

    const stockValido = await validarStockProductos();
    if (!stockValido) return;

    setLoading(true);
    setError(null);

    try {
      const usuario = await obtenerUsuario();
      setUsuarioActual(usuario);
      setShowPayPalModal(true);
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = () => {
    const token = localStorage.getItem("token");
    const usuarioStr = localStorage.getItem("usuario");

    if (!token || !usuarioStr) {
      localStorage.setItem("redirectAfterLogin", "/carrito");
      setShowLoginAlert(true);
      return;
    }

    setShowPaymentModal(true);
    setAceptaTerminos(false);
    setError(null);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setError(null);
    setAceptaTerminos(false);
  };

  const closeLoginAlert = () => {
    setShowLoginAlert(false);
  };

  const goToLogin = () => {
    setShowLoginAlert(false);
    navigate("/login");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={52} className="text-slate-400" />
            </div>
            <h2 className="text-3xl font-light text-slate-800 mb-2">Tu carrito está vacío</h2>
            <p className="text-slate-500 mb-8">Descubre nuestros productos y comienza a comprar</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
            >
              <ArrowLeft size={18} />
              Explorar productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-slate-400 hover:text-[#5b4eff] transition">Inicio</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-600 font-medium">Carrito de compras</span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center gap-3">
                <ShoppingBag size={32} className="text-[#5b4eff]" />
                Mi Carrito
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
            </div>
            <button
              onClick={() => vaciarCarrito()}
              className="text-sm text-slate-400 hover:text-red-500 transition flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={14} />
              Vaciar carrito
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
              <AlertCircle size={20} />
              <span className="flex-1 text-sm">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Productos */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex gap-5">
                    <div className="relative">
                      <img
                        src={item.imagenUrl || "https://placehold.co/120x120?text=Producto"}
                        alt={item.nombre}
                        className="w-28 h-28 object-cover rounded-xl bg-slate-50"
                        onError={(e) => { e.target.src = "https://placehold.co/120x120?text=Sin+Imagen"; }}
                      />
                      {item.stock && item.stock <= 5 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                          ¡Últimas!
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg">{item.nombre}</h3>
                          {item.descripcion && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{item.descripcion}</p>
                          )}
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-slate-300 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap justify-between items-end mt-4">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition text-slate-500"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 text-center text-sm font-semibold text-slate-700">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            disabled={item.cantidad >= item.stock}
                            className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition disabled:opacity-40 text-slate-500"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-[#5b4eff]">{formatPrice(item.precio * item.cantidad)}</p>
                          <p className="text-xs text-slate-400">{formatPrice(item.precio)} c/u</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de Compra */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 sticky top-28 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} />
                    <h3 className="font-bold text-lg">Resumen del pedido</h3>
                  </div>
                  <p className="text-xs text-white/80 mt-1">Detalles de tu compra</p>
                </div>

                <div className="p-5 space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-700">{formatPrice(subtotal)}</span>
                    </div>

                    {descuento > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Gift size={14} />
                          Descuento
                        </span>
                        <span>-{formatPrice(descuento)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Envío</span>
                      <span className={envioCosto === 0 ? "text-green-600 font-medium" : "text-slate-700"}>
                        {envioCosto > 0 ? formatPrice(envioCosto) : "Gratis"}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-800 text-lg">Total</span>
                        <span className="font-bold text-3xl text-[#5b4eff]">{formatPrice(totalConEnvio)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Equivalente en USD</span>
                        <span>${montoUSD}</span>
                      </div>
                    </div>
                  </div>

                  {/* Código de descuento */}
                  <div className="border-t border-slate-100 pt-4">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Percent size={12} />
                      Código de descuento
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej: BIENVENIDO10"
                        value={codigoDescuento}
                        onChange={(e) => setCodigoDescuento(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition"
                      />
                      <button
                        onClick={aplicarDescuento}
                        disabled={aplicandoDescuento || !codigoDescuento}
                        className="px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl text-sm font-medium hover:from-slate-700 hover:to-slate-600 transition disabled:opacity-50"
                      >
                        {aplicandoDescuento ? <Loader size={16} className="animate-spin" /> : "Aplicar"}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Sparkles size={10} />
                      Prueba con: BIENVENIDO10 (10% de descuento)
                    </p>
                  </div>

                  <button
                    onClick={openPaymentModal}
                    className="w-full py-3.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Proceder al pago
                  </button>

                  <Link to="/" className="flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-[#5b4eff] transition">
                    ← Seguir comprando
                  </Link>

                  {/* Métodos de pago */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 text-center mb-3">Métodos de pago aceptados</p>
                    <div className="flex items-center justify-center gap-4">
                      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
                      <img src="https://th.bing.com/th/id/R.56ceb6903ab489b3927f849e32bf6723?rik=91x917JPaDzwbA&pid=ImgRaw&r=0" alt="Visa" className="h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de seguridad 
              <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-[#5b4eff] mt-0.5" />
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-600 mb-1">Compra 100% segura</p>
                    <p>Tus datos están protegidos. Pagos procesados de forma segura con PayPal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <Clock size={18} className="text-[#5b4eff] mt-0.5" />
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-600 mb-1">Entrega rápida</p>
                    <p>Envíos a todo Lima. Recoge en tienda sin costo adicional.</p>
                  </div>
                </div>
              </div>*/}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de alerta - Usuario no logueado con diseño mejorado */}
      {showLoginAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <AlertCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">¡Atención!</h3>
                  <p className="text-white/80 text-sm">Acceso requerido</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-xl">
                <Lock size={18} className="text-amber-600" />
                <p className="text-slate-700 text-sm">
                  Para continuar con tu compra, necesitas <span className="font-bold text-amber-700">iniciar sesión</span> en tu cuenta.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={goToLogin}
                  className="flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={closeLoginAlert}
                  className="flex-1 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago con diseño mejorado */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closePaymentModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard size={24} />
                  <h3 className="text-xl font-bold">Finalizar compra</h3>
                </div>
                <button onClick={closePaymentModal} className="text-white/70 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-white/70 mt-1">Total a pagar: {formatPrice(totalConEnvio)}</p>
              <p className="text-xs text-white/50 mt-0.5">≈ ${montoUSD} USD</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Método de envío */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Método de envío</label>
                <div className="space-y-3">
                  <button
                    onClick={() => setMetodoEnvio("RECOJO_EN_TIENDA")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${metodoEnvio === "RECOJO_EN_TIENDA"
                        ? "border-[#5b4eff] bg-[#5b4eff]/5 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store size={20} className={metodoEnvio === "RECOJO_EN_TIENDA" ? "text-[#5b4eff]" : "text-slate-400"} />
                      <div className="text-left">
                        <p className="font-medium text-slate-700">Recoger en tienda</p>
                        <p className="text-xs text-slate-400">Sin costo adicional</p>
                      </div>
                    </div>
                    {metodoEnvio === "RECOJO_EN_TIENDA" && <CheckCircle size={18} className="text-green-500" />}
                  </button>

                  <button
                    onClick={() => setMetodoEnvio("ENVIO_DOMICILIO")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${metodoEnvio === "ENVIO_DOMICILIO"
                        ? "border-[#5b4eff] bg-[#5b4eff]/5 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck size={20} className={metodoEnvio === "ENVIO_DOMICILIO" ? "text-[#5b4eff]" : "text-slate-400"} />
                      <div className="text-left">
                        <p className="font-medium text-slate-700">Envío a domicilio</p>
                        {/*<p className="text-xs text-slate-400">Costo: S/ 15.00</p>*/}
                      </div>
                    </div>
                    {metodoEnvio === "ENVIO_DOMICILIO" && <CheckCircle size={18} className="text-green-500" />}
                  </button>
                </div>
              </div>

              {metodoEnvio === "ENVIO_DOMICILIO" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin size={12} />
                    Dirección de envío
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ingresa tu dirección completa"
                      value={direccionEnvio}
                      onChange={(e) => setDireccionEnvio(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-[#5b4eff] focus:outline-none focus:ring-2 focus:ring-[#5b4eff]/20 transition text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Resumen rápido */}
              <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium text-slate-700">{formatPrice(subtotal)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-600 flex items-center gap-1">
                      <Gift size={14} /> Descuento:
                    </span>
                    <span className="text-green-600">-{formatPrice(descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Envío:</span>
                  <span className={envioCosto === 0 ? "text-green-600" : "text-slate-700"}>
                    {envioCosto > 0 ? formatPrice(envioCosto) : "Gratis"}
                  </span>
                </div>
                <div className="border-t border-slate-200 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total:</span>
                    <span className="font-bold text-2xl text-[#5b4eff]">{formatPrice(totalConEnvio)}</span>
                  </div>
                </div>
              </div>

              {/* Términos y Condiciones */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#5b4eff] rounded border-slate-300 focus:ring-[#5b4eff] focus:ring-2"
                  />
                  <span className="text-sm text-slate-600">
                    He leído y acepto los{" "}
                    <Link to="/terminos-condiciones" className="text-[#5b4eff] hover:underline font-medium">
                      términos y condiciones
                    </Link>{" "}
                    y las{" "}
                    <Link to="/politicas-privacidad" className="text-[#5b4eff] hover:underline font-medium">
                      políticas de privacidad
                    </Link>
                  </span>
                </label>
              </div>

              <button
                onClick={handlePayPalPayment}
                disabled={loading || validandoStock || !aceptaTerminos}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${aceptaTerminos && !loading && !validandoStock
                    ? "bg-gradient-to-r from-[#0070ba] to-[#003087] hover:shadow-lg hover:scale-[1.02]"
                    : "bg-slate-300 cursor-not-allowed"
                  }`}
              >
                {(loading || validandoStock) ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    {validandoStock ? "Validando disponibilidad..." : "Procesando..."}
                  </>
                ) : (
                  <>
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-5" />
                    Pagar con PayPal
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <Shield size={12} />
                Al continuar, serás redirigido a PayPal para completar tu pago de forma segura.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de PayPal */}
      {showPayPalModal && usuarioActual && (
        <PayPalCheckout
          monto={montoUSD}
          montoPEN={totalConEnvio}
          clienteId={usuarioActual.clienteId}
          clienteNombre={usuarioActual.nombre || "Cliente"}
          clienteEmail={usuarioActual.correo || ""}
          metodoEnvio={metodoEnvio}
          direccionEnvio={direccionEnvio}
          cartItems={cartItems}
          onSuccess={(data) => {
            console.log("✅ Pago PayPal exitoso:", data);
            setShowPayPalModal(false);
            vaciarCarrito();
            setTimeout(() => {
              navigate(`/comprobante/${data.pedidoId}`, {
                state: {
                  mensaje: data.mensaje || "¡Pago completado exitosamente!",
                  pedido: data
                }
              });
            }, 1500);
          }}
          onError={(error) => {
            console.error("Error PayPal:", error);
            setError(typeof error === 'string' ? error : "Error al procesar el pago. Intenta nuevamente.");
            setShowPayPalModal(false);
            setShowPaymentModal(true);
          }}
          onClose={() => {
            setShowPayPalModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}

      <style>{`
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .zoom-in {
          animation: zoomIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}