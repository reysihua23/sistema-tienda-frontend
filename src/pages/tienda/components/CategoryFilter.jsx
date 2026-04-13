// components/tienda/CategoryFilter.jsx
import React from "react";
import { 
  ShoppingBag, Smartphone, Tablet, Headphones, Package, 
} from "lucide-react";

const categorias = [
    { id: "todos", nombre: "Todos", icono: <ShoppingBag size={16} />, color: "from-gray-500 to-gray-600" },
    { id: "celulares", nombre: "Celulares", icono: <Smartphone size={16} />, color: "from-blue-500 to-indigo-600" },
    { id: "tablets", nombre: "Tablets", icono: <Tablet size={16} />, color: "from-purple-500 to-pink-600" },
    { id: "accesorios", nombre: "Accesorios", icono: <Headphones size={16} />, color: "from-amber-500 to-orange-600" },
    { id: "audifonos", nombre: "Audífonos", icono: <Headphones size={16} />, color: "from-green-500 to-lime-600" },
    { id: "otros", nombre: "Otros", icono: <Package size={16} />, color: "from-gray-500 to-gray-600" }
];

export default function CategoryFilter({ categoriaActual, onChange }) {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {categorias.map(cat => {
                const isActive = categoriaActual === cat.id;
                return (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={`group relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                            isActive
                                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-[#5b4eff]/30"
                        }`}
                    >
                        {/* Efecto de brillo en hover */}
                        {!isActive && (
                            <span className="absolute inset-0 bg-gradient-to-r from-[#5b4eff]/0 via-[#5b4eff]/10 to-[#5b4eff]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                        )}
                        
                        {/* Icono con animación */}
                        <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                            {cat.icono}
                        </span>
                        
                        {/* Nombre */}
                        <span>{cat.nombre}</span>
                        
                        {/* Indicador activo */}
                        {isActive && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}