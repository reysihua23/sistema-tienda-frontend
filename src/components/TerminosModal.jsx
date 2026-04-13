// components/TerminosModal.jsx
import React from "react";

export default function TerminosModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Contenido - Scroll */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 70px)" }}>
          {children}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#5b4eff] text-white rounded-lg font-bold text-sm hover:bg-[#4a3dcc] transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}