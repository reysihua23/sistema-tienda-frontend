// pages/notificaciones/Notificaciones.jsx
import React, { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { 
  Bell, Check, X, Circle, Trash2, 
  CheckCheck, Filter, Package, AlertTriangle,
  Wrench, CreditCard, Eye, Clock, Tag, Info,
  Truck, DollarSign
} from "lucide-react";

import { Link } from "react-router-dom";

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

  const verDetalle = (notif) => {
    setSelectedNotif(notif);
    setShowDetailModal(true);
    if (!notif.leido) {
      marcarComoLeida(notif.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Bell size={24} className="text-[#5b4eff]" />
                Notificaciones
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {notificacionesNoLeidas} no leídas · {notificaciones.length} total
              </p>
            </div>
            <div className="flex gap-3">
              {notificacionesNoLeidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className="px-4 py-2 bg-[#5b4eff] text-white rounded-lg text-sm font-medium hover:bg-[#4a3dcc] transition flex items-center gap-2"
                >
                  <CheckCheck size={16} />
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={recargarNotificaciones}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro("todas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === "todas"
                  ? "bg-[#5b4eff] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro("no-leidas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === "no-leidas"
                  ? "bg-[#5b4eff] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              No leídas
              {notificacionesNoLeidas > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>
            <button
              onClick={() => setFiltro("leidas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtro === "leidas"
                  ? "bg-[#5b4eff] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Leídas
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        {notificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No hay notificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificacionesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                  !notif.leido ? 'border-l-4 border-l-[#5b4eff]' : 'border-gray-100'
                }`}
                onClick={() => verDetalle(notif)}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(notif.tipo)}`}>
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getColor(notif.tipo)}`}>
                            {getTipoLabel(notif.tipo)}
                          </span>
                          {!notif.leido && (
                            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                              Nueva
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatFecha(notif.fecha)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{notif.titulo || 'Notificación'}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{notif.mensaje}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notif.leido && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoLeida(notif.id);
                          }}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                          title="Marcar como leída"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarNotificacion(notif.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          verDetalle(notif);
                        }}
                        className="p-2 text-[#5b4eff] hover:bg-[#5b4eff]/10 rounded-lg transition"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Modal de detalle de notificación */}
      {showDetailModal && selectedNotif && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColor(selectedNotif.tipo)}`}>
                  {getIcono(selectedNotif.tipo)}
                </div>
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getColor(selectedNotif.tipo)}`}>
                    {getTipoLabel(selectedNotif.tipo)}
                  </span>
                  {selectedNotif.leido && (
                    <span className="ml-2 text-xs text-gray-400">✓ Leída</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedNotif(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedNotif.titulo || 'Notificación'}
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedNotif.mensaje}
                </p>
              </div>

              <div className="space-y-2 text-sm bg-gray-50/50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-gray-500">
                  <Clock size={16} />
                  <span>{formatFecha(selectedNotif.fecha)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Tag size={16} />
                  <span>Tipo: {getTipoLabel(selectedNotif.tipo)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Info size={16} />
                  <span>ID: #{selectedNotif.id}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Check size={16} />
                  <span>Estado: {selectedNotif.leido ? 'Leída' : 'No leída'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                {!selectedNotif.leido && (
                  <button
                    onClick={() => {
                      marcarComoLeida(selectedNotif.id);
                      setSelectedNotif({ ...selectedNotif, leido: true });
                    }}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Marcar como leída
                  </button>
                )}
                <button
                  onClick={() => {
                    eliminarNotificacion(selectedNotif.id);
                    setShowDetailModal(false);
                    setSelectedNotif(null);
                  }}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedNotif(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        .zoom-in {
          animation: zoomIn 0.2s ease-out;
        }
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