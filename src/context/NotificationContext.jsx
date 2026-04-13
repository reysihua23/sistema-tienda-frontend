// context/NotificationContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import { notificacionService } from "../services/api";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("usuario") || "{}");
  const token = localStorage.getItem("token");

  // Cargar notificaciones guardadas
  const cargarNotificaciones = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      // Verificar si el servicio existe antes de llamarlo
      if (notificacionService && typeof notificacionService.listarPorUsuario === 'function') {
        const data = await notificacionService.listarPorUsuario(user.id);
        const notificacionesLista = Array.isArray(data) ? data : [];
        setNotificaciones(notificacionesLista);
        setNotificacionesNoLeidas(notificacionesLista.filter(n => !n.leida).length);
      } else {
        console.warn("notificacionService.listarPorUsuario no está disponible");
        setNotificaciones([]);
        setNotificacionesNoLeidas(0);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Conectar WebSocket (solo si el backend lo soporta)
  useEffect(() => {
    // Solo conectar si hay token y usuario, y si el servicio de socket está disponible
    if (token && user?.id && connectSocket) {
      try {
        const socket = connectSocket(token, user.id, user.rol);
        
        if (socket) {
          socket.on("connect", () => {
            console.log("✅ Conectado al servidor de notificaciones");
            setSocketConnected(true);
          });
          
          socket.on("disconnect", () => {
            console.log("❌ Desconectado del servidor de notificaciones");
            setSocketConnected(false);
          });
          
          socket.on("connect_error", (error) => {
            console.error("Error de conexión WebSocket:", error);
            setSocketConnected(false);
          });
          
          socket.on("nueva-notificacion", (notificacion) => {
            setNotificaciones(prev => [notificacion, ...prev]);
            setNotificacionesNoLeidas(prev => prev + 1);
          });
        }
      } catch (error) {
        console.error("Error configurando WebSocket:", error);
      }
    }
    
    cargarNotificaciones();
    
    return () => {
      if (disconnectSocket) {
        disconnectSocket();
      }
    };
  }, [token, user?.id, user?.rol, cargarNotificaciones]);

  // Marcar como leída
  const marcarComoLeida = async (notificacionId) => {
    try {
      if (notificacionService && typeof notificacionService.marcarComoLeida === 'function') {
        await notificacionService.marcarComoLeida(notificacionId);
      }
      setNotificaciones(prev =>
        prev.map(n =>
          n.id === notificacionId ? { ...n, leida: true } : n
        )
      );
      setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    try {
      if (notificacionService && typeof notificacionService.marcarTodasComoLeidas === 'function') {
        await notificacionService.marcarTodasComoLeidas(user.id);
      }
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leida: true }))
      );
      setNotificacionesNoLeidas(0);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (notificacionId) => {
    try {
      if (notificacionService && typeof notificacionService.eliminar === 'function') {
        await notificacionService.eliminar(notificacionId);
      }
      const notificacionEliminada = notificaciones.find(n => n.id === notificacionId);
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      if (!notificacionEliminada?.leida) {
        setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        notificacionesNoLeidas,
        socketConnected,
        loading,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
        recargarNotificaciones: cargarNotificaciones
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};