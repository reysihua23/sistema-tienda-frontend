// pages/vendedor/components/VentasPresencial.jsx
import React, { useState } from "react";
import {
    Search, User, Plus, Minus, Trash2,
    AlertCircle, CheckCircle, X,
    ShoppingBag, Package,
    Info, Loader2, AlertTriangle, CircleOff,
    Banknote, CreditCard, Smartphone, Building2, Calculator
} from "lucide-react";
import ModalNuevoCliente from "./ModalNuevoCliente";

export default function VentasPresencial({
    productos, carrito, selectedCliente, setSelectedCliente, clientes,
    metodoPago, setMetodoPago, loading, error, success,
    searchTerm, setSearchTerm, agregarAlCarrito, actualizarCantidad,
    eliminarDelCarrito, realizarVenta, showClienteModal, setShowClienteModal,
    nuevoCliente, setNuevoCliente, crearCliente, totalVenta, formatPrice,
    imagenesCache
}) {
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrData, setQrData] = useState({ codigo: "", monto: 0, metodo: "" });
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [efectivoRecibido, setEfectivoRecibido] = useState("");

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
            showToast(`"${producto.nombre}" está agotado`, "error");
            return;
        }
        agregarAlCarrito(producto);
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
            monto: totalVenta, metodo: metodoPago, numero: config.numero, nombre: config.nombre
        });
        setShowQRModal(true);
    };

    const confirmarPagoQR = () => { setShowQRModal(false); realizarVenta(); };

    const handlePagoTarjeta = () => {
        showToast("Conectando con datáfono...", "info");
        setTimeout(() => { showToast("Pago con tarjeta procesado", "success"); realizarVenta(); }, 1500);
    };

    const handlePagoEfectivo = () => {
        if (totalVenta <= 0) { showToast("El monto debe ser mayor a 0", "error"); return; }
        if (efectivoRecibido && parseFloat(efectivoRecibido) < totalVenta) {
            showToast("El efectivo recibido es menor al total", "error");
            return;
        }
        realizarVenta();
        setEfectivoRecibido(""); 
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

    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const vuelto = parseFloat(efectivoRecibido) > 0 ? parseFloat(efectivoRecibido) - totalVenta : 0;

    // ✅ SOLUCIÓN: Convertimos la función en un renderizado que no pierde el foco
    const renderContenidoCarrito = () => (
        <>
            {/* 1. Header del Carrito (Fijo) */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#5b4eff]/10 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={16} className="text-[#5b4eff]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Resumen de Venta</h3>
                        <p className="text-xs text-gray-500 font-medium">{totalItems} {totalItems === 1 ? "artículo" : "artículos"}</p>
                    </div>
                </div>
                <button onClick={() => setShowCartMobile(false)} className="lg:hidden text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full shadow-sm">
                    <X size={18} />
                </button>
            </div>

            {/* 2. Selector de Cliente (Fijo) */}
            <div className="p-4 border-b border-gray-100 bg-white flex-shrink-0">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cliente</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={selectedCliente?.id || ""}
                            onChange={(e) => setSelectedCliente(clientes.find(c => c.id === parseInt(e.target.value)))}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 outline-none transition appearance-none font-medium text-gray-700"
                        >
                            <option value="">Buscar cliente...</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre} {cliente.documento && `- ${cliente.documento}`}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</div>
                    </div>
                    <button
                        onClick={() => setShowClienteModal(true)}
                        className="px-3.5 py-2.5 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] transition flex items-center justify-center flex-shrink-0 shadow-sm"
                        title="Registrar nuevo cliente"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                
                {selectedCliente?.id === 3 && (
                    <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in">
                        <CheckCircle size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                            Venta Rápida (Consumidor Final)
                        </span>
                    </div>
                )}
            </div>

            {/* 3. Lista de Productos (CON SCROLL INTERNO) */}
            <div className="flex-1 overflow-y-auto min-h-[120px] bg-white custom-scrollbar">
                {carrito.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-600">El carrito está vacío</p>
                        <p className="text-xs text-center mt-1 text-gray-400">Haz clic en los productos para agregarlos a la venta.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {carrito.map(item => (
                            <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition group">
                                <div className="w-14 h-14 bg-gray-50 rounded-lg p-1 flex-shrink-0 border border-gray-100">
                                    <img
                                        src={item.imagenUrl || "https://placehold.co/40x40?text=Producto"}
                                        alt={item.nombre}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-800 truncate leading-tight">{item.nombre}</p>
                                    <p className="text-[#5b4eff] text-sm font-black mt-0.5">{formatPrice(item.precio)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 transition">
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-6 text-center text-xs font-black text-gray-800">{item.cantidad}</span>
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 transition">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <button onClick={() => eliminarDelCarrito(item.id)} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 font-bold uppercase tracking-wide transition">
                                        <Trash2 size={10} /> Quitar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Totales, Pago y Vuelto (Fijo al fondo) */}
            <div className="p-4 bg-white flex-shrink-0 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 max-h-[55%] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-end mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">Total a pagar</span>
                    <span className="text-3xl font-black text-[#0d0c1e]">{formatPrice(totalVenta)}</span>
                </div>

                <div className="mb-3">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Método de pago</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: "EFECTIVO", label: "Efectivo", icon: Banknote },
                            { id: "TARJETA", label: "Tarjeta", icon: CreditCard },
                            { id: "YAPE", label: "Yape", icon: Smartphone },
                            { id: "PLIN", label: "Plin", icon: Smartphone },
                            { id: "TRANSFERENCIA", label: "Transf.", icon: Building2 }
                        ].map((metodo) => {
                            const Icon = metodo.icon;
                            return (
                                <button
                                    key={metodo.id}
                                    onClick={() => setMetodoPago(metodo.id)}
                                    className={`py-1.5 px-1 rounded-lg border font-bold text-[10px] transition-all flex flex-col items-center justify-center gap-1 ${
                                        metodoPago === metodo.id
                                            ? "border-[#5b4eff] bg-[#5b4eff]/5 text-[#5b4eff] shadow-sm ring-1 ring-[#5b4eff]"
                                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <Icon size={14} className={metodoPago === metodo.id ? "text-[#5b4eff]" : "text-gray-400"} />
                                    {metodo.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ✅ Input de efectivo optimizado */}
                {metodoPago === "EFECTIVO" && (
                    <div className="mb-3 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 animate-in fade-in">
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">S/</span>
                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="¿Con cuánto paga?"
                                    value={efectivoRecibido}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            setEfectivoRecibido(val);
                                        }
                                    }}
                                    className="w-full pl-7 pr-2 py-1.5 bg-white border border-emerald-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-bold text-emerald-800 text-sm"
                                />
                            </div>
                            {efectivoRecibido && parseFloat(efectivoRecibido) >= totalVenta && (
                                <div className="flex-1 bg-white border border-emerald-200 rounded-md p-1 text-center">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Vuelto</p>
                                    <p className="text-sm font-black text-emerald-600">{formatPrice(vuelto)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={handlePago}
                    disabled={loading || carrito.length === 0 || !selectedCliente}
                    className={`w-full py-3.5 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] active:scale-95 ${
                        metodoPago === "EFECTIVO" ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30" :
                        metodoPago === "TARJETA" ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30" :
                        "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] shadow-[#5b4eff]/30" 
                    }`}
                >
                    {loading ? (
                        <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                    ) : (
                        <>
                            <CheckCircle size={18} /> 
                            Cobrar {formatPrice(totalVenta)}
                        </>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Toast de Notificaciones */}
            {toast.show && (
                <div className="fixed top-20 right-4 z-[110] animate-slide-in">
                    <div className={`rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[300px] border-l-4 bg-white ${
                        toast.type === "success" ? "border-emerald-500"
                        : toast.type === "error" ? "border-red-500"
                        : "border-blue-500"
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            toast.type === "success" ? "bg-emerald-100 text-emerald-600"
                            : toast.type === "error" ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}>
                            {toast.type === "success" && <CheckCircle size={16} />}
                            {toast.type === "error" && <AlertCircle size={16} />}
                            {toast.type === "info" && <Info size={16} />}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-gray-800">
                                {toast.type === "success" ? "Operación Exitosa" : toast.type === "error" ? "Atención" : "Información"}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast({ show: false, message: "", type: "" })} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal QR / Transferencia */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in">
                        <div className="bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        {metodoPago === "YAPE" && <><Smartphone size={18}/> Pago con Yape</>}
                                        {metodoPago === "PLIN" && <><Smartphone size={18}/> Pago con Plin</>}
                                        {metodoPago === "TRANSFERENCIA" && <><Building2 size={18}/> Transferencia</>}
                                    </h3>
                                    <p className="text-gray-400 font-medium text-sm mt-0.5">Monto: S/ {formatPrice(qrData.monto)}</p>
                                </div>
                                <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-white bg-white/10 p-1.5 rounded-full transition">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            {metodoPago === "TRANSFERENCIA" ? (
                                <div className="space-y-4 text-left bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cuenta</p><p className="font-black text-gray-800 text-lg">123-456-789</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Titular</p><p className="font-bold text-gray-800">TIENDA JIMENEZ</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Banco</p><p className="font-bold text-gray-800">BCP</p></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm inline-block">
                                        <img src={qrData.codigo} alt={`QR ${metodoPago}`} className="w-48 h-48 mx-auto" />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-left space-y-1.5 border border-gray-100">
                                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Número:</span> <span className="font-bold text-gray-800">{qrData.numero}</span></p>
                                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Titular:</span> <span className="font-bold text-gray-800">{qrData.nombre}</span></p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 mt-6">
                                <button onClick={confirmarPagoQR} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md transition">
                                    Confirmar Pago
                                </button>
                                <button onClick={() => setShowQRModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nuevo Cliente */}
            <ModalNuevoCliente 
                isOpen={showClienteModal} 
                onClose={() => setShowClienteModal(false)}
                nuevoCliente={nuevoCliente}
                setNuevoCliente={setNuevoCliente}
                crearCliente={crearCliente}
                showToast={showToast}
            />

            {/* Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Catálogo de Productos */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-2 border border-gray-100 sticky top-20 z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/10 outline-none text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                        {productos.map(producto => {
                            const agotado = isProductoAgotado(producto);
                            const stockBajo = producto.stock <= (producto.stockMinimo || 5);
                            return (
                                <div
                                    key={producto.id}
                                    onClick={() => !agotado && handleAgregarAlCarrito(producto)}
                                    className={`group bg-white rounded-2xl shadow-sm border border-gray-100 p-3 transition-all duration-300 flex flex-col active:scale-95 ${
                                        agotado
                                            ? 'opacity-60 cursor-not-allowed grayscale'
                                            : 'cursor-pointer hover:shadow-xl hover:border-[#5b4eff]/30 hover:-translate-y-1'
                                    }`}
                                >
                                    <div className="relative w-full aspect-square mb-3 bg-gray-50 rounded-xl overflow-hidden p-2">
                                        <img
                                            src={getImagenProducto(producto.id)}
                                            alt={producto.nombre}
                                            className={`w-full h-full object-contain transition-transform duration-300 ${!agotado && 'group-hover:scale-110'}`}
                                            onError={(e) => { e.target.src = "https://placehold.co/80x80?text=Producto"; }}
                                        />
                                        {agotado && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                                <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg uppercase tracking-wide">
                                                    <CircleOff size={12} /> Agotado
                                                </span>
                                            </div>
                                        )}
                                        {!agotado && (
                                            <div className="absolute top-2 right-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm ${
                                                    stockBajo ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-gray-600 border border-gray-100'
                                                }`}>
                                                    Stock: {producto.stock}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={`font-bold text-sm leading-tight line-clamp-2 mb-1 flex-1 ${agotado ? 'text-gray-400' : 'text-gray-800'}`}>
                                        {producto.nombre}
                                    </h3>
                                    <p className={`font-black text-lg ${agotado ? 'text-gray-400' : 'text-[#5b4eff]'}`}>
                                        {formatPrice(producto.precio)}
                                    </p>
                                </div>
                            );
                        })}
                        {productos.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Package size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="font-bold text-gray-500">No se encontraron productos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Carrito Desktop */}
                <div className="hidden lg:flex lg:flex-col bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-24 h-[calc(100vh-120px)] max-h-[850px] overflow-hidden">
                    {/* ✅ SOLUCIÓN: Llamamos a la función de renderizado en lugar del componente */}
                    {renderContenidoCarrito()}
                </div>
            </div>

            {/* Vista Móvil (Botón flotante + Panel deslizable) */}
            <div className="lg:hidden">
                {!showCartMobile && (
                    <button onClick={() => setShowCartMobile(true)}
                        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 font-bold hover:scale-105 active:scale-95 transition-all">
                        <ShoppingBag size={22} />
                        <span className="text-base">Ver Carrito</span>
                        {totalItems > 0 && (
                            <span className="bg-white text-[#5b4eff] rounded-full min-w-[24px] h-[24px] flex items-center justify-center text-sm font-black px-1.5 shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </button>
                )}

                {showCartMobile && (
                    <>
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowCartMobile(false)} />
                        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 flex-shrink-0" />
                            {/* ✅ SOLUCIÓN: Llamamos a la función de renderizado en lugar del componente */}
                            {renderContenidoCarrito()}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
                .animate-slide-up { animation: slideUp 0.3s ease-out; }
                .animate-in { animation-duration: 0.2s; animation-fill-mode: both; }
                .zoom-in { animation-name: zoomIn; }
                .fade-in { animation-name: fadeIn; }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
        </>
    );
}