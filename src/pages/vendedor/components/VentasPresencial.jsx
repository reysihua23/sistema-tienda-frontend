// pages/vendedor/components/VentasPresencial.jsx
import React, { useState } from "react";
import {
    Search, User, Plus, Minus, Trash2,
    AlertCircle, CheckCircle, X,
    ShoppingBag, Package,
    Info, Loader2, AlertTriangle, CircleOff,
    ChevronUp, ChevronDown
} from "lucide-react";

export default function VentasPresencial({
    productos, carrito, selectedCliente, setSelectedCliente, clientes,
    metodoPago, setMetodoPago, loading, error, success,
    searchTerm, setSearchTerm, agregarAlCarrito, actualizarCantidad,
    eliminarDelCarrito, realizarVenta, showClienteModal, setShowClienteModal,
    nuevoCliente, setNuevoCliente, crearCliente, totalVenta, formatPrice,
    imagenesCache
}) {
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [modalError, setModalError] = useState({ show: false, message: "", campo: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrData, setQrData] = useState({ codigo: "", monto: 0, metodo: "" });
    // 👇 NUEVO: controla el panel del carrito en móvil
    const [showCartMobile, setShowCartMobile] = useState(false);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    };

    const getImagenProducto = (productoId) => {
        return imagenesCache?.[productoId] || "https://placehold.co/80x80?text=Producto";
    };

    const isProductoAgotado = (producto) => (producto.stock || 0) <= 0;

    const handleAgregarAlCarrito = (producto) => {
        if (isProductoAgotado(producto)) {
            showToast(`❌ "${producto.nombre}" está agotado`, "error");
            return;
        }
        agregarAlCarrito(producto);
    };

    const validarCliente = () => {
        if (!nuevoCliente.nombre.trim()) {
            setModalError({ show: true, message: "El nombre completo es obligatorio", campo: "nombre" });
            return false;
        }
        if (nuevoCliente.documento?.trim()) {
            const docRegex = /^[0-9]{8}$|^[0-9]{11}$/;
            if (!docRegex.test(nuevoCliente.documento)) {
                setModalError({ show: true, message: "El documento debe tener 8 (DNI) u 11 (RUC) dígitos", campo: "documento" });
                return false;
            }
        }
        if (nuevoCliente.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevoCliente.email)) {
                setModalError({ show: true, message: "Ingrese un correo válido", campo: "email" });
                return false;
            }
        }
        if (nuevoCliente.telefono?.trim()) {
            const telRegex = /^[0-9]{9}$/;
            if (!telRegex.test(nuevoCliente.telefono)) {
                setModalError({ show: true, message: "El teléfono debe tener 9 dígitos", campo: "telefono" });
                return false;
            }
        }
        return true;
    };

    const handlePagoConQR = () => {
        if (totalVenta <= 0) { showToast("El monto debe ser mayor a 0", "error"); return; }
        const empresaConfig = {
            yape: { numero: "912345678", nombre: "TIENDA JIMENEZ" },
            plin: { numero: "912345678", nombre: "TIENDA JIMENEZ" }
        };
        const config = metodoPago === "YAPE" ? empresaConfig.yape : empresaConfig.plin;
        setQrData({
            codigo: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${metodoPago}%20${config.numero}%20${config.nombre}%20${totalVenta.toFixed(2)}`,
            monto: totalVenta, metodo: metodoPago,
            numero: config.numero, nombre: config.nombre
        });
        setShowQRModal(true);
    };

    const confirmarPagoQR = () => { setShowQRModal(false); realizarVenta(); };

    const handlePagoTarjeta = () => {
        showToast("🔌 Conectando con datáfono...", "info");
        setTimeout(() => { showToast("💳 Pago con tarjeta procesado", "success"); realizarVenta(); }, 1500);
    };

    const handlePagoEfectivo = () => {
        if (totalVenta <= 0) { showToast("El monto debe ser mayor a 0", "error"); return; }
        realizarVenta();
    };

    const handlePagoTransferencia = () => {
        if (totalVenta <= 0) { showToast("El monto debe ser mayor a 0", "error"); return; }
        setQrData({
            codigo: "", monto: totalVenta, metodo: "TRANSFERENCIA",
            numero: "Cuenta: 123-456-789", nombre: "TIENDA JIMENEZ - BCP"
        });
        setShowQRModal(true);
    };

    const handlePago = () => {
        if (carrito.length === 0) { showToast("El carrito está vacío", "error"); return; }
        if (!selectedCliente) { showToast("Selecciona un cliente", "error"); return; }
        switch (metodoPago) {
            case "EFECTIVO": handlePagoEfectivo(); break;
            case "TARJETA": handlePagoTarjeta(); break;
            case "YAPE":
            case "PLIN": handlePagoConQR(); break;
            case "TRANSFERENCIA": handlePagoTransferencia(); break;
            default: realizarVenta();
        }
    };

    const extraerMensajeError = (err) => {
        let mensaje = "Error al crear el cliente";
        if (err.response?.data) {
            const data = err.response.data;
            if (data.error) mensaje = data.error;
            else if (data.message) mensaje = data.message;
        } else if (err.message) {
            if (err.message.includes("Error 400:")) {
                const match = err.message.match(/"error":"([^"]+)"/);
                mensaje = match ? match[1] : err.message.split("Error 400:")[1]?.trim() || err.message;
            } else mensaje = err.message;
        }
        return mensaje;
    };

    const handleCrearCliente = async () => {
        if (!validarCliente()) return;
        setIsSubmitting(true);
        setModalError({ show: false, message: "", campo: "" });
        try {
            await crearCliente();
            setModalError({ show: false, message: "", campo: "" });
            showToast("Cliente creado exitosamente", "success");
        } catch (err) {
            const errorMessage = extraerMensajeError(err);
            let errorCampo = "";
            if (errorMessage.includes("documento")) errorCampo = "documento";
            else if (errorMessage.includes("correo") || errorMessage.includes("email")) errorCampo = "email";
            else if (errorMessage.includes("nombre")) errorCampo = "nombre";
            else if (errorMessage.includes("teléfono")) errorCampo = "telefono";
            setModalError({ show: true, message: errorMessage, campo: errorCampo });
        } finally {
            setIsSubmitting(false);
        }
    };

    const limpiarErrorModal = () => setModalError({ show: false, message: "", campo: "" });

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    // 👇 Contenido del carrito (reutilizable en desktop y móvil)
    const ContenidoCarrito = () => (
        <>
            <div className="p-4 bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingBag size={18} />
                    <div>
                        <h3 className="font-bold">Carrito de Venta</h3>
                        <p className="text-xs opacity-80">{totalItems} {totalItems === 1 ? "producto" : "productos"}</p>
                    </div>
                </div>
                {/* Cerrar en móvil */}
                <button
                    onClick={() => setShowCartMobile(false)}
                    className="lg:hidden text-white/80 hover:text-white p-1"
                    aria-label="Cerrar carrito"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 border-b">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <User size={12} /> Cliente
                </label>
                <div className="flex gap-2">
                    <select
                        value={selectedCliente?.id || ""}
                        onChange={(e) => setSelectedCliente(clientes.find(c => c.id === parseInt(e.target.value)))}
                        className="flex-1 min-w-0 p-2 border border-gray-200 rounded-lg text-sm"
                    >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nombre} {cliente.documento && `- ${cliente.documento}`}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowClienteModal(true)}
                        className="px-3 py-2 bg-[#5b4eff] text-white rounded-lg text-sm hover:bg-[#4a3dcc] transition flex items-center gap-1 flex-shrink-0"
                    >
                        <Plus size={14} /> <span className="hidden sm:inline">Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {carrito.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Carrito vacío</p>
                    </div>
                ) : (
                    carrito.map(item => (
                        <div key={item.id} className="p-3 border-b flex items-center gap-2">
                            <img
                                src={item.imagenUrl || "https://placehold.co/40x40?text=Producto"}
                                alt={item.nombre}
                                className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Producto"; }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.nombre}</p>
                                <p className="text-[#5b4eff] text-xs font-bold">{formatPrice(item.precio)}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                    className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                                <button
                                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                    className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                                >
                                    <Plus size={12} />
                                </button>
                                <button
                                    onClick={() => eliminarDelCarrito(item.id)}
                                    className="ml-1 text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#5b4eff]">{formatPrice(totalVenta)}</span>
                </div>

                <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Método de pago</label>
                    <div className="grid grid-cols-2 gap-2">
                        {["EFECTIVO", "TARJETA", "YAPE", "PLIN", "TRANSFERENCIA"].map((metodo) => (
                            <button
                                key={metodo}
                                onClick={() => setMetodoPago(metodo)}
                                className={`p-2 text-xs rounded-lg border transition flex items-center justify-center gap-1 ${
                                    metodoPago === metodo
                                        ? "border-[#5b4eff] bg-[#5b4eff]/10 text-[#5b4eff] font-bold"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {metodo === "EFECTIVO" && "💵 Efectivo"}
                                {metodo === "TARJETA" && "💳 Tarjeta"}
                                {metodo === "YAPE" && "📱 Yape"}
                                {metodo === "PLIN" && "💙 Plin"}
                                {metodo === "TRANSFERENCIA" && "🏦 Transfer."}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handlePago}
                    disabled={loading || carrito.length === 0 || !selectedCliente}
                    className="w-full py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            {metodoPago === "EFECTIVO" && "💰 Pagar en Efectivo"}
                            {metodoPago === "TARJETA" && "💳 Pagar con Tarjeta"}
                            {metodoPago === "YAPE" && "📱 Pagar con Yape"}
                            {metodoPago === "PLIN" && "💙 Pagar con Plin"}
                            {metodoPago === "TRANSFERENCIA" && "🏦 Pagar con Transferencia"}
                        </>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Toast */}
            {toast.show && (
                <div className="fixed top-24 right-4 left-4 sm:left-auto z-[70] animate-slide-in">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 sm:min-w-[300px] ${
                        toast.type === "success" ? "bg-gradient-to-r from-emerald-500 to-green-600"
                        : toast.type === "error" ? "bg-gradient-to-r from-red-500 to-rose-600"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600"
                    } text-white`}>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            {toast.type === "success" && <CheckCircle size={16} />}
                            {toast.type === "error" && <AlertCircle size={16} />}
                            {toast.type === "info" && <Info size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">
                                {toast.type === "success" ? "Éxito" : toast.type === "error" ? "Error" : "Información"}
                            </p>
                            <p className="text-xs opacity-90 break-words">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast({ show: false, message: "", type: "" })} className="text-white/80 hover:text-white flex-shrink-0">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal QR */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-white font-bold text-lg">
                                        {metodoPago === "YAPE" && "📱 Yape"}
                                        {metodoPago === "PLIN" && "💙 Plin"}
                                        {metodoPago === "TRANSFERENCIA" && "🏦 Transferencia"}
                                    </h3>
                                    <p className="text-purple-200 text-sm">Monto: S/ {formatPrice(qrData.monto)}</p>
                                </div>
                                <button onClick={() => setShowQRModal(false)} className="text-white/70 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            {metodoPago === "TRANSFERENCIA" ? (
                                <div className="space-y-4 text-left">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-500">Cuenta:</p>
                                        <p className="font-bold text-gray-800">123-456-789</p>
                                        <p className="text-sm text-gray-500 mt-2">Titular:</p>
                                        <p className="font-bold text-gray-800">TIENDA JIMENEZ</p>
                                        <p className="text-sm text-gray-500 mt-2">Banco:</p>
                                        <p className="font-bold text-gray-800">BCP</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                                        <img src={qrData.codigo} alt={`QR ${metodoPago}`} className="w-48 h-48 mx-auto" />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-sm">
                                        <p><span className="font-bold">Número:</span> {qrData.numero}</p>
                                        <p><span className="font-bold">Titular:</span> {qrData.nombre}</p>
                                        <p><span className="font-bold">Monto:</span> S/ {formatPrice(qrData.monto)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={confirmarPagoQR}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                                >
                                    Confirmar Pago
                                </button>
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Panel principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Panel de productos */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none text-sm"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {productos.map(producto => {
                            const agotado = isProductoAgotado(producto);
                            return (
                                <div
                                    key={producto.id}
                                    onClick={() => !agotado && handleAgregarAlCarrito(producto)}
                                    className={`bg-white rounded-xl shadow-sm p-2.5 sm:p-3 transition-all ${
                                        agotado
                                            ? 'opacity-60 cursor-not-allowed grayscale'
                                            : 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={getImagenProducto(producto.id)}
                                            alt={producto.nombre}
                                            className="w-full h-20 sm:h-24 object-cover rounded-lg mb-2 bg-gray-100"
                                            onError={(e) => { e.target.src = "https://placehold.co/80x80?text=Producto"; }}
                                        />
                                        {agotado && (
                                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <CircleOff size={12} />
                                                    AGOTADO
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`font-bold text-xs sm:text-sm truncate ${agotado ? 'text-gray-400' : 'text-gray-800'}`}>
                                        {producto.nombre}
                                    </p>
                                    <p className={`font-bold text-xs sm:text-sm ${agotado ? 'text-gray-400' : 'text-[#5b4eff]'}`}>
                                        {formatPrice(producto.precio)}
                                    </p>
                                    <div className="flex justify-between items-center mt-1 gap-1">
                                        <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                                            Stock: {producto.stock}
                                        </p>
                                        {agotado ? (
                                            <span className="text-[9px] sm:text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                                                <CircleOff size={9} /> Sin stock
                                            </span>
                                        ) : producto.stock <= (producto.stockMinimo || 5) && (
                                            <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                                                <AlertTriangle size={9} /> Bajo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {productos.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <Package size={48} className="mx-auto mb-2 opacity-50" />
                                <p>No se encontraron productos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel del carrito - SOLO DESKTOP */}
                <div className="hidden lg:flex lg:flex-col bg-white rounded-xl shadow-sm overflow-hidden sticky top-24 h-[calc(100vh-120px)] max-h-[700px]">
                    <ContenidoCarrito />
                </div>
            </div>

            {/* 👇 BOTÓN FLOTANTE + PANEL MÓVIL (solo visible en móvil/tablet) */}
            <div className="lg:hidden">
                {/* Botón flotante */}
                {!showCartMobile && (
                    <button
                        onClick={() => setShowCartMobile(true)}
                        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-full shadow-2xl px-5 py-4 flex items-center gap-2 font-bold hover:scale-105 active:scale-95 transition-all"
                    >
                        <ShoppingBag size={20} />
                        <span className="text-sm">Ver carrito</span>
                        {totalItems > 0 && (
                            <span className="bg-white text-[#5b4eff] rounded-full min-w-[22px] h-[22px] flex items-center justify-center text-xs font-black px-1">
                                {totalItems}
                            </span>
                        )}
                        {totalVenta > 0 && (
                            <span className="text-xs font-normal opacity-90 hidden sm:inline">
                                {formatPrice(totalVenta)}
                            </span>
                        )}
                    </button>
                )}

                {/* Panel deslizable desde abajo */}
                {showCartMobile && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowCartMobile(false)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 flex-shrink-0" />
                            <ContenidoCarrito />
                        </div>
                    </>
                )}
            </div>

            {/* Modal Nuevo Cliente */}
            {showClienteModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                    onClick={() => {
                        setShowClienteModal(false);
                        setModalError({ show: false, message: "", campo: "" });
                        setNuevoCliente({ nombre: "", email: "", telefono: "", documento: "", direccion: "" });
                    }}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] px-6 py-4 rounded-t-2xl sticky top-0 z-10">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <User size={20} /> Nuevo Cliente
                            </h3>
                            <p className="text-purple-200 text-sm">Ingresa los datos (* obligatorios)</p>
                        </div>

                        <div className="p-6 space-y-3">
                            {modalError.show && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-red-700 text-sm font-medium">
                                                {modalError.campo === "documento" && "📄 Documento inválido"}
                                                {modalError.campo === "email" && "📧 Correo inválido"}
                                                {modalError.campo === "nombre" && "👤 Nombre requerido"}
                                                {modalError.campo === "telefono" && "📱 Teléfono inválido"}
                                                {!modalError.campo && "⚠️ Error"}
                                            </p>
                                            <p className="text-red-600 text-xs mt-0.5 break-words">{modalError.message}</p>
                                        </div>
                                        <button onClick={limpiarErrorModal} className="text-red-400 hover:text-red-600 flex-shrink-0">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Nombre completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    value={nuevoCliente.nombre}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                        setNuevoCliente({ ...nuevoCliente, nombre: value });
                                        if (modalError.show && modalError.campo === "nombre") limpiarErrorModal();
                                    }}
                                    className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                        modalError.campo === "nombre" ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo electrónico</label>
                                <input
                                    type="email"
                                    placeholder="Ej: cliente@email.com"
                                    value={nuevoCliente.email}
                                    onChange={(e) => {
                                        setNuevoCliente({ ...nuevoCliente, email: e.target.value });
                                        if (modalError.show && modalError.campo === "email") limpiarErrorModal();
                                    }}
                                    className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                        modalError.campo === "email" ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    placeholder="Ej: 912345678"
                                    value={nuevoCliente.telefono}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                        setNuevoCliente({ ...nuevoCliente, telefono: value });
                                        if (modalError.show && modalError.campo === "telefono") limpiarErrorModal();
                                    }}
                                    className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                        modalError.campo === "telefono" ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Documento</label>
                                <input
                                    type="text"
                                    placeholder="DNI: 8 | RUC: 11 dígitos"
                                    value={nuevoCliente.documento}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        setNuevoCliente({ ...nuevoCliente, documento: value });
                                        if (modalError.show && modalError.campo === "documento") limpiarErrorModal();
                                    }}
                                    className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                        modalError.campo === "documento" ? "border-red-500 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Av. Principal 123"
                                    value={nuevoCliente.direccion}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-2xl sticky bottom-0">
                            <button
                                onClick={handleCrearCliente}
                                disabled={isSubmitting}
                                className="flex-1 py-2 bg-[#5b4eff] text-white rounded-lg font-bold hover:bg-[#4a3dcc] transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Guardar
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowClienteModal(false);
                                    setModalError({ show: false, message: "", campo: "" });
                                    setNuevoCliente({ nombre: "", email: "", telefono: "", documento: "", direccion: "" });
                                }}
                                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
                .animate-slide-up { animation: slideUp 0.3s ease-out; }
            `}</style>
        </>
    );
}