import React from "react";

function Search({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative w-full group">
      {/* Contenedor con estilo Jimenez. (Oscuro/Azul) */}
      <div className="flex h-10 md:h-11 w-full bg-white rounded-xl overflow-hidden shadow-lg border-2 border-transparent focus-within:border-[#5b4eff] transition-all">
        
        {/* Icono de Lupa Visual */}
        <div className="flex items-center justify-center pl-4 pr-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input de Búsqueda Real */}
        <input
          type="text"
          placeholder="¿Qué producto buscas hoy?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Esto actualiza el filtro en el Home
          className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[#0d0c1e] placeholder:text-gray-400 pr-4"
        />

        {/* Botón de Acción (Opcional, estilo Amazon) */}
        <button className="bg-[#5b4eff] text-white px-4 text-xs font-black uppercase tracking-tighter hover:bg-[#4435e8] transition-colors">
          BUSCAR
        </button>
      </div>
    </div>
  );
}

export default Search;