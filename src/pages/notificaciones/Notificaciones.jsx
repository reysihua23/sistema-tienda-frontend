// pages/notificaciones/Notificaciones.jsx
import React, { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { 
  Bell, Check, X, Circle, Trash2, 
  CheckCheck, Filter, Package, AlertTriangle,
  Wrench, CreditCard
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

  const getIcono = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return <Package size={20} />;
      case 'STOCK': return <AlertTriangle size={20} />;
      case 'SERVICIO': return <Wrench size={20} />;
      case 'PAGO': return <CreditCard size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getColor = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return 'bg-blue-100 text-blue-600';
      case 'STOCK': return 'bg-red-100 text-red-600';
      case 'SERVICIO': return 'bg-purple-100 text-purple-600';
      case 'PAGO': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return 'Pedido';
      case 'STOCK': return 'Stock bajo';
      case 'SERVICIO': return 'Servicio Técnico';
      case 'PAGO': return 'Pago';
      default: return 'General';
    }
  };

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === "no-leidas") return !n.leida;
    if (filtro === "leidas") return n.leida;
    return true;
  });

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  !notif.leida ? 'border-l-4 border-l-[#5b4eff]' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(notif.tipo)}`}>
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getColor(notif.tipo)}`}>
                            {getTipoLabel(notif.tipo)}
                          </span>
                          {!notif.leida && (
                            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                              Nueva
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatFecha(notif.fecha)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{notif.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-3">{notif.mensaje}</p>
                      {notif.url && (
                        <Link
                          to={notif.url}
                          className="text-sm text-[#5b4eff] hover:underline"
                        >
                          Ver detalles →
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notif.leida && (
                        <button
                          onClick={() => marcarComoLeida(notif.id)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                          title="Marcar como leída"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNotificacion(notif.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}