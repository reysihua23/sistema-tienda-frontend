import React, { useState } from "react";
import { useCarrito } from "../../../context/CarritoContext";
import { useProductoImagen } from "../hooks/useProductoImagen";

export default function ProductCard({ producto, onQuickView }) {
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [imgError, setImgError] = useState(false);
    
    const { imagenUrl, loading: loadingImage } = useProductoImagen(producto.id);
    const { agregarAlCarrito } = useCarrito();
    
    const isOutOfStock = producto.stock === 0;

    const handleAdd = () => {
        if (isOutOfStock) return;
        setAdding(true);
        
        const productoConImagen = {
            ...producto,
            imagenUrl: imagenUrl
        };
        
        agregarAlCarrito(productoConImagen, qty);
        
        setTimeout(() => {
            setAdding(false);
            setAdded(true);
            setQty(1);
            setTimeout(() => setAdded(false), 1500);
        }, 500);
    };

    const handleDecrement = () => {
        if (qty > 1) setQty(qty - 1);
    };

    const handleIncrement = () => {
        if (qty < producto.stock) setQty(qty + 1);
    };

    const handleQuantityChange = (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value)) value = 1;
        if (value < 1) value = 1;
        if (value > producto.stock) value = producto.stock;
        setQty(value);
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
        // ✅ Card con sombra y fondo blanco ligeramente diferenciado
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#5b4eff]/30 h-full flex flex-col group">
            {/* Contenedor de imagen con fondo suave */}
            <div 
                className="relative w-full pt-[100%] overflow-hidden cursor-pointer bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0"
                onClick={() => onQuickView(producto)}
            >
                {loadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b4eff]"></div>
                    </div>
                ) : (
                    <img
                        src={getImageSrc()}
                        alt={producto.nombre}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                )}
                
                {/* Badge de stock mejorado */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-md z-10 ${
                    isOutOfStock ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc]"
                }`}>
                    {isOutOfStock ? "AGOTADO" : `${producto.stock} disponibles`}
                </div>
                
                {/* Badge de oferta (opcional - puedes personalizar) */}
                {producto.precioAnterior && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-md z-10">
                        OFERTA
                    </div>
                )}
            </div>

            {/* Contenido con fondo sutilmente diferenciado */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 text-sm group-hover:text-[#5b4eff] transition-colors">
                    {producto.nombre}
                </h3>
                
                <div className="mb-3">
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 min-h-[32px]">
                        {producto.descripcion || "Sin descripción"}
                    </p>
                </div>
                
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-xl font-black text-[#5b4eff]">
                                {formatPrice(producto.precio)}
                            </span>
                            {producto.precioAnterior && (
                                <span className="ml-2 text-xs text-gray-400 line-through">
                                    {formatPrice(producto.precioAnterior)}
                                </span>
                            )}
                        </div>
                        
                        {!isOutOfStock && (
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={handleDecrement}
                                    disabled={qty <= 1}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition ${
                                        qty <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200 hover:text-[#5b4eff]"
                                    }`}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={qty}
                                    onChange={handleQuantityChange}
                                    className="w-8 text-center text-sm font-bold text-gray-700 bg-transparent focus:outline-none"
                                    min="1"
                                    max={producto.stock}
                                />
                                <button
                                    onClick={handleIncrement}
                                    disabled={qty >= producto.stock}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition ${
                                        qty >= producto.stock ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200 hover:text-[#5b4eff]"
                                    }`}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                            isOutOfStock
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : added
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                    : adding
                                        ? "bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white scale-95"
                                        : "bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white hover:from-[#5b4eff] hover:to-[#4a3dcc]"
                        }`}
                    >
                        {isOutOfStock
                            ? "No disponible"
                            : added
                                ? "✓ Añadido"
                                : adding
                                    ? "Agregando..."
                                    : "Añadir al carrito"}
                    </button>
                </div>
            </div>
        </div>
    );
}