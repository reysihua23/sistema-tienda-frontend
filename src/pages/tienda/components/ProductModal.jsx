// components/tienda/ProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { productoImagenService } from "../../../services/api";

export default function ProductModal({ producto, isOpen, onClose, onAddToCart }) {
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [imagenes, setImagenes] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

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
            
            // ✅ FILTRAR imágenes válidas
            const imagenesValidas = imagenesLista.filter(img => {
                return img.urlImagen && 
                       img.urlImagen.trim() !== "" && 
                       !img.urlImagen.includes("null");
            });
            
            // Ordenar: primero las principales
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

    // Navegación de imágenes
    const nextImage = () => {
        if (imagenes.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
    };

    const prevImage = () => {
        if (imagenes.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
    };

    // Manejo de touch/drag para deslizar
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
            if (diff > 0) {
                prevImage();
            } else {
                nextImage();
            }
        }
    };

    const handleAdd = () => {
        if (isOutOfStock) return;
        setAdding(true);
        
        // Pasar la imagen principal al carrito
        const imagenPrincipal = imagenes.find(img => img.principal) || imagenes[0];
        const productoConImagen = {
            ...producto,
            imagenUrl: imagenPrincipal && imagenPrincipal.urlImagen ? `http://localhost:8080${imagenPrincipal.urlImagen}` : null
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
        if (!currentImage?.urlImagen) return null;
        return `http://localhost:8080${currentImage.urlImagen}`;
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-600 transition"
                    >
                        ✕
                    </button>
                    
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Sección de imágenes con carrusel */}
                            <div className="md:w-1/2">
                                <div className="relative">
                                    {/* Contenedor de imagen con carrusel */}
                                    <div 
                                        className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden"
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                        onMouseDown={handleTouchStart}
                                        onMouseUp={handleTouchEnd}
                                        onMouseLeave={() => setIsDragging(false)}
                                    >
                                        {loadingImages ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div>
                                            </div>
                                        ) : currentImageUrl ? (
                                            <>
                                                {/* ✅ CAMBIO IMPORTANTE: object-contain en lugar de object-cover */}
                                                <img
                                                    src={currentImageUrl}
                                                    alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-contain"
                                                    draggable="false"
                                                    onError={(e) => {
                                                        console.error("Error cargando imagen:", currentImageUrl);
                                                        e.target.src = "https://placehold.co/600x600?text=Error+Imagen";
                                                    }}
                                                />
                                                
                                                {/* Botón anterior */}
                                                {hasMultipleImages && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            prevImage();
                                                        }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                                
                                                {/* Botón siguiente */}
                                                {hasMultipleImages && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            nextImage();
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Indicadores (dots) */}
                                    {hasMultipleImages && !loadingImages && imagenes.length > 0 && (
                                        <div className="flex justify-center gap-2 mt-3">
                                            {imagenes.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                        currentImageIndex === idx
                                                            ? "bg-[#5b4eff] w-4"
                                                            : "bg-gray-300 hover:bg-gray-400"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Contador de imágenes */}
                                    {hasMultipleImages && !loadingImages && imagenes.length > 0 && (
                                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium">
                                            {currentImageIndex + 1} / {imagenes.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Información del producto */}
                            <div className="md:w-1/2">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{producto.nombre}</h2>
                                <p className="text-gray-500 text-sm mb-4">{producto.descripcion}</p>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        !isOutOfStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                        {!isOutOfStock ? `${producto.stock} unidades disponibles` : "Agotado"}
                                    </span>
                                </div>
                                
                                <div className="text-3xl font-black text-[#5b4eff] mb-4">
                                    {formatPrice(producto.precio)}
                                </div>
                                
                                {!isOutOfStock && (
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-2">
                                            <button
                                                onClick={() => setQty(Math.max(1, qty - 1))}
                                                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center font-bold transition"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-bold">{qty}</span>
                                            <button
                                                onClick={() => setQty(Math.min(producto.stock, qty + 1))}
                                                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center font-bold transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={handleAdd}
                                    disabled={isOutOfStock}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                                        isOutOfStock
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : adding
                                                ? "bg-[#5b4eff] text-white opacity-70"
                                                : "bg-[#0d0c1e] text-white hover:bg-[#5b4eff]"
                                    }`}
                                >
                                    {isOutOfStock
                                        ? "No disponible"
                                        : adding
                                            ? "Agregando..."
                                            : "Añadir al carrito"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}