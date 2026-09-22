// src/components/NotificationDetailModal.jsx
import React from 'react';
import {
  X, Calendar, Clock, Tag, Package, AlertTriangle, Wrench,
  CreditCard, Bell, Trash2, CheckCircle, Truck, DollarSign,
  ShoppingBag, MessageSquare, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotificationRoute, getCurrentUserRol } from '../utils/notificationRoutes';

export default function NotificationDetailModal({ notificacion, onClose, onEliminar, onMarcarLeida }) {
  const navigate = useNavigate();
  const userRol = getCurrentUserRol();

  const getIcono = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PEDIDO': return <Package size={28} />;
      case 'STOCK': return <AlertTriangle size={28} />;
      case 'SERVICIO': return <Wrench size={28} />;
      case 'PAGO': return <CreditCard size={28} />;
      case 'ENVIO': return <Truck size={28} />;
      case 'PRODUCTO': return <ShoppingBag size={28} />;
      case 'RECLAMO': return <MessageSquare size={28} />;
      default: return <Bell size={28} />;
    }
  };

  const getColor = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PEDIDO': return 'bg-blue-100 text-blue-600';
      case 'STOCK': return 'bg-red-100 text-red-600';
      case 'SERVICIO': return 'bg-purple-100 text-purple-600';
      case 'PAGO': return 'bg-green-100 text-green-600';
      case 'ENVIO': return 'bg-amber-100 text-amber-600';
      case 'PRODUCTO': return 'bg-indigo-100 text-indigo-600';
      case 'RECLAMO': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
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

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const route = getNotificationRoute(notificacion, userRol);

  const handleIrA = () => {
    if (!route) return;
    onClose();
    navigate(route.path, { state: route.state });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100000] flex items-end sm:items-center justify-center sm:p-4">
      <div
        data-modal-detalle
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-5 rounded-t-2xl flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">Detalle de notificación</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getColor(notificacion.tipo)}`}>
              {getIcono(notificacion.tipo)}
            </div>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getColor(notificacion.tipo)}`}>
                {getTipoLabel(notificacion.tipo)}
              </span>
              {notificacion.leido && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle size={12} /> Leída
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {notificacion.mensaje}
            </p>
          </div>

          <div className="space-y-2 text-sm bg-gray-50/50 rounded-xl p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <Calendar size={16} className="flex-shrink-0" />
              <span className="break-words">{formatFecha(notificacion.fecha)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Tag size={16} className="flex-shrink-0" />
              <span>Tipo: {getTipoLabel(notificacion.tipo)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Clock size={16} className="flex-shrink-0" />
              <span>ID: #{notificacion.id}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            {route && (
              <button
                onClick={handleIrA}
                className="w-full py-3 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] transition flex items-center justify-center gap-2"
              >
                {route.label}
                <ArrowRight size={16} />
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!notificacion.leido && onMarcarLeida && (
                <button
                  onClick={onMarcarLeida}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Marcar como leída
                </button>
              )}
              <button
                onClick={onEliminar}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}