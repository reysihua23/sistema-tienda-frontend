// components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, X, Circle, BellRing } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { notificaciones, notificacionesNoLeidas, marcarComoLeida, eliminarNotificacion } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notificacion) => {
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id);
    }
    setIsOpen(false);
    // Redirigir según el tipo de notificación
    if (notificacion.url) {
      navigate(notificacion.url);
    }
  };

  const getIconColor = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return 'text-blue-500';
      case 'STOCK': return 'text-red-500';
      case 'SERVICIO': return 'text-purple-500';
      case 'PAGO': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return 'Pedido';
      case 'STOCK': return 'Stock';
      case 'SERVICIO': return 'Servicio Técnico';
      case 'PAGO': return 'Pago';
      default: return 'General';
    }
  };

  const formatTiempo = (fecha) => {
    const diff = new Date() - new Date(fecha);
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    
    if (minutos < 1) return "Hace unos segundos";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    return `Hace ${dias} d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        {notificacionesNoLeidas > 0 ? (
          <BellRing size={20} className="text-[#5b4eff]" />
        ) : (
          <Bell size={20} className="text-gray-600" />
        )}
        {notificacionesNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Notificaciones</h3>
            <button
              onClick={() => navigate("/notificaciones")}
              className="text-xs text-[#5b4eff] hover:underline"
            >
              Ver todas
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                    !notif.leida ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {!notif.leida && <Circle size={8} className="text-blue-500 fill-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${getIconColor(notif.tipo)}`}>
                          {getTipoLabel(notif.tipo)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatTiempo(notif.fecha)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{notif.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.mensaje}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}