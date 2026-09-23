// components/tienda/ProductModal.jsx
import React, { useState, useEffect } from "react";
import { productoImagenService } from "../../../services/api";
import { buildImageUrl } from "../../../config/apiConfig";
import {
    X, ChevronLeft, ChevronRight, Flame,
    ShoppingBag, Minus, Plus, Package,
    CheckCircle, AlertCircle, Image as ImageIcon,
    Star, Shield, Truck
} from "lucide-react";

export default function ProductModal({ producto, isOpen, onClose, onAddToCart }) {
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [imagenes, setImagenes] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    // ✅ Reiniciar cantidad cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setQty(1);
            setAdding(false);
        }
    }, [isOpen]);

    // ✅ Reiniciar cantidad cuando cambia el producto
    useEffect(() => {
        setQty(1);
        setAdding(false);
        setCurrentImageIndex(0);
    }, [producto?.id]);

    useEffect(() => {
        if (isOpen && producto) {
            cargarImagenes();
        }
    }, [isOpen, producto]);

    const cargarImagenes = async () => {
        if (!producto?.id) return;
        setLoadingImages(true);
        try {
            const data = await productoImagenService.buscarPorProducto(producto.id);
            const imagenesLista = Array.isArray(data) ? data : [];

            const imagenesValidas = imagenesLista.filter(img => {
                return img.urlImagen &&
                    img.urlImagen.trim() !== "" &&
                    !img.urlImagen.includes("null");
            });

            const imagenesOrdenadas = [...imagenesValidas].sort((a, b) => {
                if (a.principal && !b.principal) return -1;
                if (!a.principal && b.principal) return 1;
                return 0;
            });
            setImagenes(imagenesOrdenadas);
            setCurrentImageIndex(0);
        } catch (error) {
            console.error("Error cargando imágenes:", error);
            setImagenes([]);
        } finally {
            setLoadingImages(false);
        }
    };

    if (!isOpen || !producto) return null;

    const isOutOfStock = producto.stock === 0;
    const hasMultipleImages = imagenes.length > 1;

    const precioActual = producto.precioActual && producto.precioActual > 0
        ? producto.precioActual
        : producto.precio;

    const tieneDescuento = producto.descuentoActivo &&
        producto.porcentajeDescuento > 0 &&
        precioActual < producto.precio;

    const nextImage = () => {
        if (imagenes.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
    };

    const prevImage = () => {
        if (imagenes.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
    };

    const handleTouchStart = (e) => {
        if (imagenes.length <= 1) return;
        setIsDragging(true);
        setStartX(e.touches ? e.touches[0].clientX : e.clientX);
    };

    const handleTouchEnd = (e) => {
        if (!isDragging || imagenes.length <= 1) return;
        setIsDragging(false);
        const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const diff = endX - startX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) prevImage();
            else nextImage();
        }
    };

    const handleAdd = () => {
        if (isOutOfStock) return;
        setAdding(true);

        const imagenPrincipal = imagenes.find(img => img.principal) || imagenes[0];
        const productoConImagen = {
            ...producto,
            imagenUrl: buildImageUrl(imagenPrincipal?.urlImagen),
            precio: precioActual
        };

        setTimeout(() => {
            onAddToCart(productoConImagen, qty);
            setAdding(false);
            onClose();
        }, 500);
    };

    const getCurrentImageUrl = () => {
        if (imagenes.length === 0 || !imagenes[currentImageIndex]) return null;
        const currentImage = imagenes[currentImageIndex];
        return buildImageUrl(currentImage?.urlImagen) || null;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price);
    };

    const currentImageUrl = getCurrentImageUrl();

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header con gradiente sutil */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5b4eff]/10 rounded-full">
                            <Package size={18} className="text-[#5b4eff]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 truncate max-w-[200px]">
                                {producto.nombre}
                            </h2>
                            <p className="text-xs text-gray-400">Detalle del producto</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sección de imágenes */}
                        <div className="md:w-1/2">
                            <div className="relative">
                                <div
                                    className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden"
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    onMouseDown={handleTouchStart}
                                    onMouseUp={handleTouchEnd}
                                    onMouseLeave={() => setIsDragging(false)}
                                >
                                    {loadingImages ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5b4eff]/20 border-t-[#5b4eff]"></div>
                                        </div>
                                    ) : currentImageUrl ? (
                                        <>
                                            <img
                                                src={currentImageUrl}
                                                alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                                                className="w-full h-full object-contain p-6"
                                                draggable="false"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/600x600?text=Sin+Imagen";
                                                }}
                                            />

                                            {hasMultipleImages && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <ImageIcon size={48} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Indicadores de imágenes */}
                                {hasMultipleImages && !loadingImages && imagenes.length > 0 && (
                                    <div className="flex justify-center gap-1.5 mt-4">
                                        {imagenes.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`transition-all duration-300 rounded-full ${currentImageIndex === idx
                                                    ? "w-8 h-1.5 bg-[#5b4eff]"
                                                    : "w-2 h-1.5 bg-gray-300 hover:bg-gray-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {hasMultipleImages && !loadingImages && imagenes.length > 0 && (
                                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
                                        <ImageIcon size={12} />
                                        {currentImageIndex + 1} / {imagenes.length}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información del producto */}
                        <div className="md:w-1/2 flex flex-col">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {tieneDescuento && !isOutOfStock && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20">
                                        <Flame size={12} className="fill-white" />
                                        -{producto.porcentajeDescuento}%
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-500/20">
                                        <AlertCircle size={12} />
                                        Agotado
                                    </div>
                                )}
                                {!isOutOfStock && producto.stock <= 5 && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20">
                                        <AlertCircle size={12} />
                                        Últimas unidades
                                    </div>
                                )}
                            </div>

                            {/* Título y descripción */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                                {producto.nombre}
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                {producto.descripcion || "Sin descripción"}
                            </p>

                            {/* Stock */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${!isOutOfStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                    }`}>
                                    {!isOutOfStock ? (
                                        <>
                                            <CheckCircle size={12} />
                                            {producto.stock} unidades disponibles
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={12} />
                                            Sin stock
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* Precio */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-3xl font-black ${tieneDescuento ? "text-orange-500" : "text-[#5b4eff]"}`}>
                                        {formatPrice(precioActual)}
                                    </span>
                                    {tieneDescuento && (
                                        <>
                                            <span className="text-sm text-gray-400 line-through">
                                                {formatPrice(producto.precio)}
                                            </span>
                                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                                Ahorras {formatPrice(producto.precio - precioActual)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Beneficios rápidos */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                    <Shield size={14} className="text-[#5b4eff]" />
                                    <span>Garantía incluida</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                    <Truck size={14} className="text-[#5b4eff]" />
                                    <span>Envío seguro</span>
                                </div>
                            </div>

                            {/* Controles de cantidad */}
                            {!isOutOfStock && (
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cantidad
                                    </span>
                                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl border border-gray-200 p-1">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            disabled={qty <= 1}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${qty <= 1
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-gray-600 hover:bg-white hover:shadow-sm"
                                                }`}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center text-sm font-semibold text-gray-700">
                                            {qty}
                                        </span>
                                        <button
                                            onClick={() => setQty(Math.min(producto.stock, qty + 1))}
                                            disabled={qty >= producto.stock}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${qty >= producto.stock
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-gray-600 hover:bg-white hover:shadow-sm"
                                                }`}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        Máx. {producto.stock} unidades
                                    </span>
                                </div>
                            )}

                            {/* Botón de añadir al carrito */}
                            <button
                                onClick={handleAdd}
                                disabled={isOutOfStock}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${isOutOfStock
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : adding
                                        ? "bg-[#5b4eff] text-white scale-[0.98]"
                                        : "bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white hover:from-[#5b4eff] hover:to-[#4a3dcc] hover:shadow-lg hover:shadow-[#5b4eff]/30"
                                    }`}
                            >
                                {isOutOfStock ? (
                                    "No disponible"
                                ) : adding ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent"></div>
                                        Agregando…
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag size={18} />
                                        Añadir al carrito
                                    </>
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}