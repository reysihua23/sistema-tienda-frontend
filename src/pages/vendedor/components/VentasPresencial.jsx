// pages/vendedor/components/VentasPresencial.jsx
import React, { useState, useEffect } from "react";

export default function VentasPresencial({
    productos,
    carrito,
    selectedCliente,
    setSelectedCliente,
    clientes,
    metodoPago,
    setMetodoPago,
    loading,
    error,
    success,
    searchTerm,
    setSearchTerm,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    realizarVenta,
    showClienteModal,
    setShowClienteModal,
    nuevoCliente,
    setNuevoCliente,
    crearCliente,
    totalVenta,
    formatPrice,
    imagenesCache
}) {
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [modalError, setModalError] = useState({ show: false, message: "", campo: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    };

    const getImagenProducto = (productoId) => {
        return imagenesCache?.[productoId] || "https://placehold.co/80x80?text=Producto";
    };

    // Función para extraer el mensaje de error limpio
    const extraerMensajeError = (err) => {
        let mensaje = "Error al crear el cliente";
        
        if (err.response && err.response.data) {
            const data = err.response.data;
            if (data.error) {
                mensaje = data.error;
            } else if (data.message) {
                mensaje = data.message;
            }
        } else if (err.message) {
            // Limpiar mensajes que contengan JSON
            if (err.message.includes("Error 400:")) {
                const match = err.message.match(/"error":"([^"]+)"/);
                if (match) {
                    mensaje = match[1];
                } else {
                    mensaje = err.message.split("Error 400:")[1]?.trim() || err.message;
                }
            } else {
                mensaje = err.message;
            }
        }
        
        return mensaje;
    };

    const handleCrearCliente = async () => {
        // Validaciones del frontend
        if (!nuevoCliente.nombre.trim()) {
            setModalError({
                show: true,
                message: "El nombre completo es obligatorio",
                campo: "nombre"
            });
            return;
        }

        if (nuevoCliente.documento && nuevoCliente.documento.trim()) {
            const documentoRegex = /^[0-9]{8}$|^[0-9]{11}$/;
            if (!documentoRegex.test(nuevoCliente.documento)) {
                setModalError({
                    show: true,
                    message: "El documento debe tener 8 dígitos (DNI) o 11 dígitos (RUC)",
                    campo: "documento"
                });
                return;
            }
        }

        if (nuevoCliente.email && nuevoCliente.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevoCliente.email)) {
                setModalError({
                    show: true,
                    message: "Ingrese un correo electrónico válido",
                    campo: "email"
                });
                return;
            }
        }

        if (nuevoCliente.telefono && nuevoCliente.telefono.trim()) {
            const telefonoRegex = /^[0-9]{9}$/;
            if (!telefonoRegex.test(nuevoCliente.telefono)) {
                setModalError({
                    show: true,
                    message: "El teléfono debe tener 9 dígitos",
                    campo: "telefono"
                });
                return;
            }
        }

        setIsSubmitting(true);
        setModalError({ show: false, message: "", campo: "" });

        try {
            await crearCliente();
            setModalError({ show: false, message: "", campo: "" });
        } catch (err) {
            const errorMessage = extraerMensajeError(err);
            let errorCampo = "";
            
            if (errorMessage.includes("documento")) {
                errorCampo = "documento";
            } else if (errorMessage.includes("correo") || errorMessage.includes("email")) {
                errorCampo = "email";
            } else if (errorMessage.includes("nombre")) {
                errorCampo = "nombre";
            } else if (errorMessage.includes("teléfono")) {
                errorCampo = "telefono";
            }
            
            setModalError({
                show: true,
                message: errorMessage,
                campo: errorCampo
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const limpiarErrorModal = () => {
        setModalError({ show: false, message: "", campo: "" });
    };

    return (
        <>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-24 right-6 z-50 animate-slide-in">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px] ${
                        toast.type === "success" ? "bg-gradient-to-r from-emerald-500 to-green-600" : 
                        toast.type === "error" ? "bg-gradient-to-r from-red-500 to-rose-600" : 
                        "bg-gradient-to-r from-blue-500 to-indigo-600"
                    } text-white`}>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            {toast.type === "success" && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                </svg>
                            )}
                            {toast.type === "error" && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{toast.type === "success" ? "Éxito" : "Error"}</p>
                            <p className="text-xs opacity-90">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast({ show: false, message: "", type: "" })} className="text-white/80 hover:text-white">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de productos */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none"
                            />
                            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {productos.map(producto => (
                            <div
                                key={producto.id}
                                onClick={() => agregarAlCarrito(producto)}
                                className="bg-white rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-md transition-all hover:scale-105"
                            >
                                <img
                                    src={getImagenProducto(producto.id)}
                                    alt={producto.nombre}
                                    className="w-full h-24 object-cover rounded-lg mb-2 bg-gray-100"
                                    onError={(e) => { e.target.src = "https://placehold.co/80x80?text=Producto"; }}
                                />
                                <p className="font-bold text-sm truncate">{producto.nombre}</p>
                                <p className="text-[#5b4eff] font-bold text-sm">{formatPrice(producto.precio)}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-400">Stock: {producto.stock}</p>
                                    {producto.stock <= (producto.stockMinimo || 5) && (
                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">⚠️ Bajo</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {productos.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <span className="text-4xl block mb-2">🔍</span>
                                <p>No se encontraron productos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel del carrito */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24 h-fit">
                    <div className="p-4 bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white">
                        <h3 className="font-bold">Carrito de Venta</h3>
                        <p className="text-xs opacity-80">Productos agregados</p>
                    </div>

                    <div className="p-4 border-b">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedCliente?.id || ""}
                                onChange={(e) => setSelectedCliente(clientes.find(c => c.id === parseInt(e.target.value)))}
                                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
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
                                className="px-3 py-2 bg-[#5b4eff] text-white rounded-lg text-sm hover:bg-[#4a3dcc] transition"
                            >
                                + Nuevo
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {carrito.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <span className="text-4xl block mb-2">🛒</span>
                                <p className="text-sm">Carrito vacío</p>
                            </div>
                        ) : (
                            carrito.map(item => (
                                <div key={item.id} className="p-3 border-b flex items-center gap-3">
                                    <img
                                        src={item.imagenUrl || "https://placehold.co/40x40?text=Producto"}
                                        alt={item.nombre}
                                        className="w-10 h-10 object-cover rounded-lg"
                                        onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Producto"; }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm truncate">{item.nombre}</p>
                                        <p className="text-[#5b4eff] text-xs font-bold">{formatPrice(item.precio)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200">-</button>
                                        <span className="w-8 text-center text-sm">{item.cantidad}</span>
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
                                        <button onClick={() => eliminarDelCarrito(item.id)} className="ml-1 text-red-500">🗑️</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-between mb-3">
                            <span className="text-gray-600">Total:</span>
                            <span className="text-2xl font-bold text-[#5b4eff]">{formatPrice(totalVenta)}</span>
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Método de pago</label>
                            <select
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="EFECTIVO">💵 Efectivo</option>
                                <option value="TARJETA">💳 Tarjeta</option>
                                <option value="YAPE">📱 Yape</option>
                                <option value="PLIN">💙 Plin</option>
                                <option value="TRANSFERENCIA">🏦 Transferencia</option>
                            </select>
                        </div>

                        <button
                            onClick={realizarVenta}
                            disabled={loading || carrito.length === 0 || !selectedCliente}
                            className="w-full py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? "Procesando..." : "✅ Realizar Venta"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Nuevo Cliente CON ERROR DENTRO */}
            {showClienteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
                    setShowClienteModal(false);
                    setModalError({ show: false, message: "", campo: "" });
                }}>
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] px-6 py-4 rounded-t-2xl">
                            <h3 className="text-white font-bold text-lg">Nuevo Cliente</h3>
                            <p className="text-purple-200 text-sm">Ingresa los datos del cliente</p>
                        </div>

                        <div className="p-6 space-y-3">
                            {/* Mensaje de error dentro del modal - VERSIÓN CORREGIDA */}
                            {modalError.show && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <span className="text-red-500 text-lg">⚠️</span>
                                        <div className="flex-1">
                                            <p className="text-red-700 text-sm font-medium">
                                                {modalError.campo === "documento" && "Documento duplicado"}
                                                {modalError.campo === "email" && "Correo duplicado"}
                                                {modalError.campo === "nombre" && "Nombre requerido"}
                                                {modalError.campo === "telefono" && "Teléfono inválido"}
                                                {!modalError.campo && "Error de validación"}
                                            </p>
                                            <p className="text-red-600 text-xs mt-0.5">{modalError.message}</p>
                                        </div>
                                        <button onClick={limpiarErrorModal} className="text-red-400 hover:text-red-600">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            <input 
                                type="text" 
                                placeholder="Nombre completo *" 
                                value={nuevoCliente.nombre} 
                                onChange={(e) => {
                                    setNuevoCliente({...nuevoCliente, nombre: e.target.value});
                                    if (modalError.show) limpiarErrorModal();
                                }}
                                className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                    modalError.campo === "nombre" ? "border-red-500 bg-red-50" : "border-gray-200"
                                }`}
                            />
                            <input 
                                type="email" 
                                placeholder="Correo electrónico" 
                                value={nuevoCliente.email} 
                                onChange={(e) => {
                                    setNuevoCliente({...nuevoCliente, email: e.target.value});
                                    if (modalError.show) limpiarErrorModal();
                                }}
                                className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                    modalError.campo === "email" ? "border-red-500 bg-red-50" : "border-gray-200"
                                }`}
                            />
                            <input 
                                type="tel" 
                                placeholder="Teléfono (9 dígitos)" 
                                value={nuevoCliente.telefono} 
                                onChange={(e) => {
                                    setNuevoCliente({...nuevoCliente, telefono: e.target.value});
                                    if (modalError.show) limpiarErrorModal();
                                }}
                                className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                    modalError.campo === "telefono" ? "border-red-500 bg-red-50" : "border-gray-200"
                                }`}
                            />
                            <input 
                                type="text" 
                                placeholder="Documento (DNI: 8, RUC: 11)" 
                                value={nuevoCliente.documento} 
                                onChange={(e) => {
                                    setNuevoCliente({...nuevoCliente, documento: e.target.value});
                                    if (modalError.show) limpiarErrorModal();
                                }}
                                className={`w-full p-3 border rounded-xl focus:border-[#5b4eff] focus:outline-none transition ${
                                    modalError.campo === "documento" ? "border-red-500 bg-red-50" : "border-gray-200"
                                }`}
                            />
                            <input 
                                type="text" 
                                placeholder="Dirección" 
                                value={nuevoCliente.direccion} 
                                onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:outline-none transition"
                            />
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-2xl">
                            <button 
                                onClick={handleCrearCliente} 
                                disabled={isSubmitting}
                                className="flex-1 py-2 bg-[#5b4eff] text-white rounded-lg font-bold hover:bg-[#4a3dcc] transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar"
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

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </>
    );
}