import React from "react";

export default function EmptyState({ onLimpiarFiltros, busqueda }) {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No encontramos productos</h3>
            {busqueda ? (
                <p className="text-gray-500 mb-6">
                    No hay resultados para "<span className="font-bold text-[#5b4eff]">{busqueda}</span>"
                </p>
            ) : (
                <p className="text-gray-500 mb-6">No hay productos en esta categoría</p>
            )}
            <button
                onClick={onLimpiarFiltros}
                className="px-6 py-3 bg-[#0d0c1e] text-white rounded-xl font-bold text-sm hover:bg-[#5b4eff] transition"
            >
                Ver todos los productos
            </button>
        </div>
    );
}