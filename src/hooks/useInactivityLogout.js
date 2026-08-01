// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useState } from 'react';

// ⏰ CONFIGURACIÓN DE TIEMPOS (en milisegundos)
const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos
const WARNING_TIME = 1 * 60 * 1000; // 1 minuto antes (aparece el modal)

export const useInactivityLogout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const logoutExecutedRef = useRef(false);

  // 🔒 Función que cierra la sesión
  const logout = () => {
    if (logoutExecutedRef.current) return; // Evita ejecutar logout varias veces
    logoutExecutedRef.current = true;

    console.log("🔒 [Seguridad] Cerrando sesión por inactividad");

    // Limpiar todo
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.clear();

    // Cerrar modales
    setShowWarning(false);
    
    // Redirigir al login con mensaje
    window.location.href = "/login?mensaje=sesion-expirada";
  };

  // 🔄 Reiniciar el timer de inactividad
  const resetTimer = () => {
    // Si el modal está visible, NO reiniciar (el usuario debe hacer clic en "Continuar")
    if (showWarning) {
      console.log("⚠️ [Seguridad] Modal visible - esperando acción del usuario");
      return;
    }

    console.log("🔄 [Seguridad] Reiniciando timer de inactividad");

    // Limpiar timers existentes
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Resetear estados
    setShowWarning(false);
    setCountdown(60);

    // ⏰ Timer para mostrar advertencia (a los 4 minutos)
    warningTimerRef.current = setTimeout(() => {
      console.log("⚠️ [Seguridad] Mostrando advertencia de inactividad");
      setShowWarning(true);
      
      // Iniciar contador regresivo
      setCountdown(60);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    }, INACTIVITY_TIME - WARNING_TIME);

    // 🔒 Timer para cerrar sesión (a los 5 minutos)
    timerRef.current = setTimeout(() => {
      console.log("🔒 [Seguridad] Ejecutando logout por inactividad");
      logout();
    }, INACTIVITY_TIME);
  };

  // 👆 Función para continuar sesión (desde el modal)
  const continuarSesion = () => {
    console.log("🔄 [Seguridad] Usuario continuó sesión");
    setShowWarning(false);
    setCountdown(60);
    logoutExecutedRef.current = false;
    
    // Limpiar interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Reiniciar el timer
    resetTimer();
  };

  // 🚀 Activar el hook al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Solo activar si el usuario está autenticado
    if (!token) {
      console.log("❌ [Seguridad] No hay token - cierre por inactividad desactivado");
      return;
    }

    console.log("✅ [Seguridad] Cierre por inactividad ACTIVADO");
    console.log(`⏰ [Seguridad] Tiempo de inactividad: ${INACTIVITY_TIME / 60000} minutos`);

    // Eventos que indican actividad del usuario
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'scroll', 'touchstart', 'click', 'wheel'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Registrar eventos
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Iniciar el timer
    resetTimer();

    // Limpiar al desmontar
    return () => {
      console.log("🧹 [Seguridad] Limpiando recursos de inactividad");
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]); // Dependencia: se ejecuta cuando showWarning cambia

  return { showWarning, countdown, continuarSesion };
};