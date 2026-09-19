// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificacionService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket'; // ✅ Importar el hook

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  console.log('📢 NotificationProvider montado');

  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  // Obtener usuarioId del localStorage
  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        setUsuarioId(userData.id || userData.usuarioId);
        console.log('👤 Usuario ID obtenido:', userData.id || userData.usuarioId);
      } catch (e) {
        console.error('Error al obtener usuarioId:', e);
      }
    }
  }, []);

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leido).length;

  // ✅ Cargar desde el backend
  const cargarNotificaciones = useCallback(async () => {
    console.log('🔄 Cargando notificaciones...');
    setLoading(true);
    setError(null);

    try {
      const data = await notificacionService.obtenerMisNotificaciones();
      if (data && Array.isArray(data)) {
        setNotificaciones(data);
        console.log('✅ Notificaciones cargadas:', data.length);
      } else {
        setNotificaciones([]);
      }
    } catch (err) {
      console.error('❌ Error cargando notificaciones:', err);
      setError('Error al cargar notificaciones');
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Manejar notificación en tiempo real
  const handleNewNotification = useCallback((nuevaNotificacion) => {
    console.log('📩 Nueva notificación recibida en tiempo real:', nuevaNotificacion);
    
    // ✅ Verificar que la notificación no esté duplicada
    setNotificaciones(prev => {
      // Evitar duplicados por ID
      const existe = prev.some(n => n.id === nuevaNotificacion.id);
      if (existe) {
        console.log('⏳ Notificación ya existe, no se duplica');
        return prev;
      }
      return [nuevaNotificacion, ...prev];
    });

    // ✅ Opcional: Mostrar toast o alerta
    // showToast(nuevaNotificacion.mensaje, 'info');

  }, []);

  // ✅ Conectar WebSocket cuando tengamos usuarioId
  const { connected } = useWebSocket(usuarioId, handleNewNotification);

  // ✅ Mostrar estado de conexión
  useEffect(() => {
    if (usuarioId) {
      console.log(`🔌 WebSocket ${connected ? 'conectado' : 'desconectado'} para usuario ${usuarioId}`);
    }
  }, [connected, usuarioId]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  // ✅ Marcar como leída
  const marcarComoLeida = async (id) => {
    try {
      await notificacionService.marcarComoLeida(id);
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leido: true } : n)
      );
    } catch (err) {
      console.error('Error marcando como leída:', err);
    }
  };

  // ✅ Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leido: true }))
      );
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
    }
  };

  // ✅ Eliminar notificación
  const eliminarNotificacion = async (id) => {
    try {
      await notificacionService.eliminar(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error eliminando notificación:', err);
    }
  };

  // ✅ Recargar
  const recargarNotificaciones = () => {
    cargarNotificaciones();
  };

  // Cargar al montar
  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const value = {
    notificaciones,
    notificacionesNoLeidas,
    loading,
    error,
    cargarNotificaciones,
    recargarNotificaciones: recargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};