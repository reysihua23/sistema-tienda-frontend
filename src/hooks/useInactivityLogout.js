// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos
const WARNING_TIME = 1 * 60 * 1000; // 1 minuto antes (total: 5 minutos)

export const useInactivityLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setShowWarning(false);
    navigate("/login", { 
      state: { 
        message: "Sesión cerrada por inactividad. Vuelve a iniciar sesión." 
      } 
    });
    window.location.reload();
  };

  const resetTimer = () => {
    // Limpiar timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setShowWarning(false);

    // Mostrar advertencia después de 4 minutos
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_TIME - WARNING_TIME);

    // Cerrar sesión después de 5 minutos
    timerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  return { showWarning, resetTimer };
};