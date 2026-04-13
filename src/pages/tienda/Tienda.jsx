import React, { useState, useEffect } from "react";
import { useCarrito } from "../../context/CarritoContext"; // ✅ Importar contexto
import { useProductos } from "./hooks/useProductos";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import CategoryFilter from "./components/CategoryFilter";
import EmptyState from "./components/EmptyState";

export default function Tienda({ searchQuery, setSearchQuery }) { // ✅ Eliminar onAddToCart
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    
    // ✅ Obtener función del contexto
    const { agregarAlCarrito } = useCarrito();
    
    const {
        productosFiltrados,
        loading,
        error,
        filtros,
        actualizarFiltros,
        limpiarFiltros,
        recargar
    } = useProductos();

    useEffect(() => {
        actualizarFiltros({ busqueda: searchQuery });
    }, [searchQuery]);

    const handleCategoryChange = (categoria) => {
        actualizarFiltros({ categoria });
    };

    const handleQuickView = (producto) => {
        setSelectedProduct(producto);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleLimpiarFiltros = () => {
        limpiarFiltros();
        if (setSearchQuery) setSearchQuery("");
    };

    // ✅ Función para agregar al carrito usando el contexto
    const handleAddToCart = (producto, cantidad) => {
        agregarAlCarrito(producto, cantidad);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Cargando productos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={recargar}
                        className="px-6 py-2 bg-[#5b4eff] text-white rounded-lg hover:bg-[#4a3dcc] transition"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-[#0d0c1e] mb-2">
                        Nuestra Tienda
                    </h1>
                    <p className="text-gray-500">Los mejores productos tecnológicos</p>
                </div>

                {/* Filtros */}
                <div className="mb-8">
                    <CategoryFilter
                        categoriaActual={filtros.categoria}
                        onChange={handleCategoryChange}
                    />
                </div>

                {/* Contador */}
                <div className="mb-4 text-right">
                    <p className="text-sm text-gray-500">
                        {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Grid de productos */}
                {productosFiltrados.length === 0 ? (
                    <EmptyState
                        onLimpiarFiltros={handleLimpiarFiltros}
                        busqueda={filtros.busqueda}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                        {productosFiltrados.map(producto => (
                            <ProductCard
                                key={producto.id}
                                producto={producto}
                                onAddToCart={handleAddToCart}  // ✅ Pasar la función local
                                onQuickView={handleQuickView}
                            />
                        ))}
                    </div>
                )}

                {/* Modal */}
                <ProductModal
                    producto={selectedProduct}
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    onAddToCart={handleAddToCart}  // ✅ Pasar la función local
                />
            </div>
        </div>
    );
}