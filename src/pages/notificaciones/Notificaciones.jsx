// pages/notificaciones/Notificaciones.jsx
import React, { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { 
  Bell, Check, X, Trash2, 
  CheckCheck, Package, AlertTriangle,
  Wrench, Clock, Tag, Info,
  Truck, DollarSign, ArrowLeft
} from "lucide-react";
import NotificationDetailModal from "../../components/NotificationDetailModal";

export default function Notificaciones() {
  const { 
    notificaciones, 
    notificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    loading,
    recargarNotificaciones
  } = useNotifications();
  
  const [filtro, setFiltro] = useState("todas");
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [contadorLocal, setContadorLocal] = useState(notificacionesNoLeidas);

  useEffect(() => {
    setContadorLocal(notificacionesNoLeidas);
  }, [notificacionesNoLeidas]);

  const getIcono = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'PEDIDO': return <Package size={20} />;
      case 'STOCK': return <AlertTriangle size={20} />;
      case 'SERVICIO': return <Wrench size={20} />;
      case 'PAGO': return <DollarSign size={20} />;
      case 'ENVIO': return <Truck size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getColor = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'PEDIDO': return 'bg-blue-100 text-blue-600';
      case 'STOCK': return 'bg-red-100 text-red-600';
      case 'SERVICIO': return 'bg-purple-100 text-purple-600';
      case 'PAGO': return 'bg-green-100 text-green-600';
      case 'ENVIO': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'PEDIDO': return 'Pedido';
      case 'STOCK': return 'Stock bajo';
      case 'SERVICIO': return 'Servicio Técnico';
      case 'PAGO': return 'Pago';
      case 'ENVIO': return 'Envío';
      default: return 'General';
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === "no-leidas") return !n.leido;
    if (filtro === "leidas") return n.leido;
    return true;
  });

  // ✅ Abre el modal y marca como leída automáticamente si no lo estaba
  const verDetalle = (notif) => {
    setSelectedNotif(notif);
    setShowDetailModal(true);
    if (!notif.leido) {
      marcarComoLeida(notif.id);
      setContadorLocal(prev => Math.max(0, prev - 1));
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Bell size={22} className="text-[#5b4eff]" />
                Notificaciones
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {contadorLocal} no leídas · {notificaciones.length} total
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {contadorLocal > 0 && (
                <button
                  onClick={() => {
                    marcarTodasComoLeidas();
                    setContadorLocal(0);
                  }}
                  className="px-3 sm:px-4 py-2 bg-[#5b4eff] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#4a3dcc] transition flex items-center gap-2"
                >
                  <CheckCheck size={16} />
                  <span>Marcar todas como leídas</span>
                </button>
              )}
              <button
                onClick={recargarNotificaciones}
                className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* ===== BARRA DE FILTROS ===== */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.history.back()} 
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="text-sm sm:text-base font-semibold text-gray-800">
                Notificaciones recientes
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltro("todas")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filtro === "todas"
                    ? "bg-[#5b4eff] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltro("no-leidas")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 ${
                  filtro === "no-leidas"
                    ? "bg-[#5b4eff] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                No leídas
                {contadorLocal > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    filtro === "no-leidas" ? "bg-white/20" : "bg-red-500 text-white"
                  }`}>
                    {contadorLocal}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFiltro("leidas")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filtro === "leidas"
                    ? "bg-[#5b4eff] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Leídas
              </button>
            </div>
          </div>
        </div>

        {/* ===== LISTA DE NOTIFICACIONES ===== */}
        {notificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
            <Bell size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm sm:text-base text-gray-400">No hay notificaciones</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {notificacionesFiltradas.map((notif) => {
              const enNegrita = !notif.leido;
              
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                    !notif.leido ? 'border-l-4 border-l-[#5b4eff]' : 'border-gray-100'
                  }`}
                  onClick={() => verDetalle(notif)}
                >
                  <div className="p-3 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(notif.tipo)}`}>
                        {getIcono(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getColor(notif.tipo)} ${
                              enNegrita ? 'font-bold' : ''
                            }`}>
                              {getTipoLabel(notif.tipo)}
                            </span>
                            {!notif.leido && (
                              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                                Nueva
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-xs flex-shrink-0 ${
                            enNegrita ? 'text-gray-700 font-bold' : 'text-gray-400'
                          }`}>
                            {formatFecha(notif.fecha)}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base mb-1 ${
                          enNegrita ? 'font-bold text-gray-900' : 'font-bold text-gray-800'
                        }`}>
                          {notif.titulo || 'Notificación'}
                        </h3>
                        <p className={`text-xs sm:text-sm line-clamp-2 ${
                          enNegrita ? 'font-bold text-gray-800' : 'text-gray-600'
                        }`}>
                          {notif.mensaje}
                        </p>
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        {!notif.leido && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarComoLeida(notif.id);
                              setContadorLocal(prev => Math.max(0, prev - 1));
                            }}
                            className="p-1.5 sm:p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                            title="Marcar como leída"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarNotificacion(notif.id);
                            if (!notif.leido) {
                              setContadorLocal(prev => Math.max(0, prev - 1));
                            }
                          }}
                          className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL REUTILIZABLE ===== */}
      {showDetailModal && selectedNotif && (
        <NotificationDetailModal
          notificacion={selectedNotif}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotif(null);
          }}
          onEliminar={() => {
            eliminarNotificacion(selectedNotif.id);
            if (!selectedNotif.leido) {
              setContadorLocal(prev => Math.max(0, prev - 1));
            }
            setShowDetailModal(false);
            setSelectedNotif(null);
          }}
          onMarcarLeida={() => {
            marcarComoLeida(selectedNotif.id);
            setSelectedNotif({ ...selectedNotif, leido: true });
            setContadorLocal(prev => Math.max(0, prev - 1));
          }}
        />
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}