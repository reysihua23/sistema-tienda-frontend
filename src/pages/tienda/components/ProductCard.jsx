// components/tienda/ProductCard.jsx
import React, { useState, useEffect  } from "react";
import { useCarrito } from "../../../context/CarritoContext";
import { useProductoImagen } from "../hooks/useProductoImagen";
import { Flame, ShoppingBag, Plus, Minus, Star } from "lucide-react";

export default function ProductCard({ producto, onQuickView }) {
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const { imagenUrl, loading: loadingImage } = useProductoImagen(producto.id);
    const { agregarAlCarrito } = useCarrito();

    const isOutOfStock = producto.stock === 0;

    // ✅ Reiniciar la cantidad cuando cambia el producto
    useEffect(() => {
        setQty(1);
        setAdded(false);
        setAdding(false);
    }, [producto.id]);

    // Precio actual con descuento
    const precioActual = producto.precioActual && producto.precioActual > 0
        ? producto.precioActual
        : producto.precio;

    // Descuento vigente solo si el precio cambió
    const tieneDescuento = producto.descuentoActivo &&
        producto.porcentajeDescuento > 0 &&
        precioActual < producto.precio;

    const handleAdd = () => {
        if (isOutOfStock) return;
        setAdding(true);
        const productoConImagen = { ...producto, imagenUrl, precio: precioActual };
        agregarAlCarrito(productoConImagen, qty);
        setTimeout(() => {
            setAdding(false);
            setAdded(true);
            setQty(1);
            setTimeout(() => setAdded(false), 1500);
        }, 500);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const getImageSrc = () => {
        if (imgError) return "https://placehold.co/300x300?text=Sin+Imagen";
        if (imagenUrl) return imagenUrl;
        return "https://placehold.co/300x300?text=Sin+Imagen";
    };


    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#5b4eff]/40 h-full flex flex-col relative">
            {/* Contenedor de imagen con overlay */}
            <div
                className="relative w-full pt-[100%] overflow-hidden cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100"
                onClick={() => onQuickView(producto)}
            >
                {loadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#5b4eff]/20 border-t-[#5b4eff]"></div>
                    </div>
                ) : (
                    <img
                        src={getImageSrc()}
                        alt={producto.nombre}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                    />
                )}

                {/* Badge de descuento */}
                {tieneDescuento && !isOutOfStock && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-orange-500/30 z-10 animate-pulse">
                        <Flame size={14} className="fill-white" />
                        <span>-{producto.porcentajeDescuento}%</span>
                    </div>
                )}

                {/* Badge de stock */}
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg z-10 ${isOutOfStock
                        ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30"
                        : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] shadow-[#5b4eff]/30"
                    }`}>
                    {isOutOfStock ? "Agotado" : `${producto.stock} disponibles`}
                </div>

                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-[#5b4eff]/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Contenido */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                {/* Título y descripción */}
                <div className="mb-2">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1 group-hover:text-[#5b4eff] transition-colors">
                        {producto.nombre}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1 min-h-[2.5rem]">
                        {producto.descripcion || "Sin descripción"}
                    </p>
                </div>

                {/* Precio y controles */}
                <div className="mt-auto">
                    <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xl font-black leading-none ${tieneDescuento ? "text-orange-500" : "text-[#5b4eff]"
                                    }`}>
                                    {formatPrice(precioActual)}
                                </span>
                                {tieneDescuento && (
                                    <span className="text-sm text-gray-400 line-through leading-none">
                                        {formatPrice(producto.precio)}
                                    </span>
                                )}
                            </div>
                            {tieneDescuento && (
                                <span className="text-xs text-green-600 font-medium mt-0.5">
                                    Ahorras {formatPrice(producto.precio - precioActual)}
                                </span>
                            )}
                        </div>

                        {!isOutOfStock && (
                            <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl border border-gray-200 p-0.5 shadow-inner">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    disabled={qty <= 1}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all ${qty <= 1 ? "opacity-30 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-700">
                                    {qty}
                                </span>
                                <button
                                    onClick={() => setQty(Math.min(producto.stock, qty + 1))}
                                    disabled={qty >= producto.stock}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all ${qty >= producto.stock ? "opacity-30 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botón de añadir al carrito */}
                    <button
                        onClick={handleAdd}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${isOutOfStock
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : added
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                                    : adding
                                        ? "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white scale-[0.98]"
                                        : "bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white hover:from-[#5b4eff] hover:to-[#4a3dcc] hover:shadow-lg hover:shadow-[#5b4eff]/30"
                            }`}
                    >
                        {isOutOfStock ? (
                            "No disponible"
                        ) : added ? (
                            "✓ Añadido"
                        ) : adding ? (
                            "Agregando…"
                        ) : (
                            <>
                                <ShoppingBag size={16} />
                                <span>Añadir al carrito</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}