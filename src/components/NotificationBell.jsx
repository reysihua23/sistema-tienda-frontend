// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Bell, Circle, BellRing, Check, Trash2, Eye, CheckCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import NotificationDetailModal from "./NotificationDetailModal";

export default function NotificationBell() {
  const {
    notificaciones,
    notificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [selectedNotif, setSelectedNotif] = useState(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Calcular posición del dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: 16 // ✅ siempre alineado al botón
      });
    }
  }, [isOpen]);

  // cerrar modal al hacer clic fuera del dropdown o del modal de detalle
 // Cerrar al hacer clic fuera (solo si NO hay modal abierto)
useEffect(() => {
  const handleClickOutside = (event) => {
    if (selectedNotif) return;   // ✅ modal abierto → no cerrar dropdown

    if (
      dropdownRef.current && !dropdownRef.current.contains(event.target) &&
      buttonRef.current && !buttonRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [selectedNotif]);

  const handleNotificationClick = (notif) => {
    if (!notif.leido) marcarComoLeida(notif.id);
  };

  const verDetalle = (notif) => {
    setSelectedNotif(notif);
    if (!notif.leido) marcarComoLeida(notif.id);
  };

  const getColorTipo = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PEDIDO': return 'text-blue-500';
      case 'STOCK': return 'text-red-500';
      case 'SERVICIO': return 'text-purple-500';
      case 'PAGO': return 'text-green-500';
      case 'ENVIO': return 'text-amber-500';
      case 'PRODUCTO': return 'text-indigo-500';
      case 'RECLAMO': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PEDIDO': return 'Pedido';
      case 'STOCK': return 'Stock bajo';
      case 'SERVICIO': return 'Servicio Técnico';
      case 'PAGO': return 'Pago';
      case 'ENVIO': return 'Envío';
      case 'PRODUCTO': return 'Producto';
      case 'RECLAMO': return 'Reclamo';
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

  // ✅ Dropdown renderizado como PORTAL al body
  const dropdownContent = isOpen && (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 99998 }}
        onClick={() => setIsOpen(false)}
      />
      <div
        ref={dropdownRef}
        className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        style={{
          zIndex: 99999,
          top: dropdownPos.top,
          right: dropdownPos.right,
          width: '460px',
          maxHeight: `calc(100vh - ${dropdownPos.top + 16}px)`,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-lg">Notificaciones</h3>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/notificaciones");
            }}
            className="text-xs text-[#5b4eff] hover:underline font-medium"
          >
            Ver todas
          </button>
        </div>

        {/* Lista scrolleable */}
        <div
          className="overflow-y-auto flex-1"
          onWheel={(e) => e.stopPropagation()}
        >
          {notificaciones.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition ${!notif.leido ? 'bg-blue-50/40' : ''
                  }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1.5">
                    {!notif.leido && (
                      <Circle size={8} className="text-blue-500 fill-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className={`text-xs font-bold ${getColorTipo(notif.tipo)}`}>
                        {getTipoLabel(notif.tipo)}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatTiempo(notif.fecha)}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${!notif.leido ? 'font-semibold text-gray-800' : 'text-gray-600'} leading-snug line-clamp-2 cursor-pointer`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {notif.mensaje}
                    </p>

                    <div className="flex items-center gap-1 mt-2">
                      {!notif.leido && (
                        <button
                          onClick={(e) => { e.stopPropagation(); marcarComoLeida(notif.id); }}
                          className="p-1.5 text-green-500 hover:bg-green-50 rounded transition"
                          title="Marcar como leída"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notif.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); verDetalle(notif); }}
                        className="p-1.5 text-[#5b4eff] hover:bg-[#5b4eff]/10 rounded transition flex items-center gap-1"
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                        <span className="text-xs font-medium">Ver detalle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <button
            onClick={() => marcarTodasComoLeidas()}
            className="text-xs text-[#5b4eff] font-medium hover:underline flex items-center gap-1"
          >
            <CheckCheck size={14} />
            Marcar todas como leídas
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/notificaciones");
            }}
            className="text-xs text-[#5b4eff] font-medium hover:underline"
          >
            Ver todas
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Notificaciones"
        >
          {notificacionesNoLeidas > 0 ? (
            <BellRing size={20} className="text-[#5b4eff]" />
          ) : (
            <Bell size={20} className="text-gray-600" />
          )}
          {notificacionesNoLeidas > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
            </span>
          )}
        </button>
      </div>

      {/* ✅ Portal al body — escapa de cualquier stacking context */}
      {ReactDOM.createPortal(dropdownContent, document.body)}

      {selectedNotif && ReactDOM.createPortal(
        <NotificationDetailModal
          notificacion={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onEliminar={() => {
            eliminarNotificacion(selectedNotif.id);
            setSelectedNotif(null);
          }}
          onMarcarLeida={() => {
            marcarComoLeida(selectedNotif.id);
            setSelectedNotif({ ...selectedNotif, leido: true });
          }}
        />,
        document.body
      )}
    </>
  );
}