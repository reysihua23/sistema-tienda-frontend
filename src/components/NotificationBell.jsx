// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 16 });
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Detección de móvil con matchMedia (más confiable que innerWidth)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  // ✅ Calcular posición del dropdown (solo desktop/tablet)
  // Se recalcula al abrir, en resize y en scroll
  // ✅ Calcular posición del dropdown (solo desktop/tablet)
useLayoutEffect(() => {
  if (!isOpen || isMobile) return;

  const updatePos = () => {
    setDropdownPos({
      top: buttonRef.current
        ? buttonRef.current.getBoundingClientRect().bottom + 8
        : 68,
      right: 16   // 🎯 FIJO: 16px del borde derecho, siempre
    });
  };

  updatePos();
  window.addEventListener('resize', updatePos);
  window.addEventListener('scroll', updatePos, true);
  return () => {
    window.removeEventListener('resize', updatePos);
    window.removeEventListener('scroll', updatePos, true);
  };
}, [isOpen, isMobile]);

  // ✅ Cerrar al hacer clic fuera (solo si NO hay modal abierto)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedNotif) return;

      const modalDetalle = document.querySelector('[data-modal-detalle]');
      if (modalDetalle && modalDetalle.contains(event.target)) return;

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

  // ✅ Escape cierra modal → dropdown
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (selectedNotif) setSelectedNotif(null);
      else if (isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedNotif, isOpen]);

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

  // 🎨 Estilos responsive del dropdown
  const dropdownStyle = isMobile
    ? {
        position: 'fixed',
        top: 56,
        left: 8,
        right: 8,
        width: 'auto',
        maxHeight: 'calc(100vh - 72px)',
        zIndex: 99999,
      }
    : {
        position: 'fixed',
        top: dropdownPos.top,
        right: dropdownPos.right,
        width: '460px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: `calc(100vh - ${dropdownPos.top + 16}px)`,
        zIndex: 99999,
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
        style={dropdownStyle}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base sm:text-lg">Notificaciones</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/notificaciones");
              }}
              className="text-xs text-[#5b4eff] hover:underline font-medium hidden sm:inline"
            >
              Ver todas
            </button>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 text-2xl leading-none p-1 -mr-1"
                aria-label="Cerrar"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Lista scrolleable */}
        <div
          className="overflow-y-auto flex-1 overscroll-contain"
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
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition ${!notif.leido ? 'bg-blue-50/40' : ''}`}
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

                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {!notif.leido && (
                        <button
                          onClick={(e) => { e.stopPropagation(); marcarComoLeida(notif.id); }}
                          className="p-2 text-green-500 hover:bg-green-50 rounded transition"
                          title="Marcar como leída"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notif.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); verDetalle(notif); }}
                        className="p-1.5 text-[#5b4eff] hover:bg-[#5b4eff]/10 rounded transition flex items-center gap-1 ml-auto"
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
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0 gap-2">
          <button
            onClick={() => marcarTodasComoLeidas()}
            className="text-xs text-[#5b4eff] font-medium hover:underline flex items-center gap-1"
          >
            <CheckCheck size={14} />
            <span className="hidden sm:inline">Marcar todas como leídas</span>
            <span className="sm:hidden">Marcar todas</span>
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
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
            </span>
          )}
        </button>
      </div>

      {/* ✅ Portal al body */}
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