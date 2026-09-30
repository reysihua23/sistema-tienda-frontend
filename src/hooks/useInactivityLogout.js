// hooks/useInactivityLogout.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useInactivityLogout(
  timeoutMs = 15 * 60 * 1000,
  warningMs = 60 * 1000
  
) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownRef = useRef(null);

  // 📌 Refs para que resetTimers sea ESTABLE
  const timeoutRef = useRef(timeoutMs);
  const warningRef = useRef(warningMs);
  const navigateRef = useRef(navigate);

  // Mantener refs actualizados sin causar re-renders
  useEffect(() => {
    timeoutRef.current = timeoutMs;
    warningRef.current = warningMs;
    navigateRef.current = navigate;
  }, [timeoutMs, warningMs, navigate]);

  // 🔒 Cerrar sesión (ESTABLE - sin dependencias)
  const handleLogout = useCallback(() => {
    setShowWarning(false);
    setRemainingTime(0);
    sessionStorage.setItem("logoutReason", "inactividad");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.dispatchEvent(new Event("carrito-cambio-usuario"));
    window.dispatchEvent(new Event("storage"));
    navigateRef.current("/login");
  }, []);

  // 📌 Ref para handleLogout (para no recrear resetTimers)
  const handleLogoutRef = useRef(handleLogout);
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  // ⏱️ resetTimers ESTABLE (sin dependencias que cambien)
  const resetTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowWarning(false);
    setRemainingTime(0);

    const tMs = timeoutRef.current;
    const wMs = warningRef.current;

    // ⏰ Timer de advertencia
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      const segundosIniciales = Math.round(wMs / 1000);
      setRemainingTime(segundosIniciales);

      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const next = prev - 1;
          if (next <= 1) {
            clearInterval(countdownRef.current);
            return 1;
          }
          return next;
        });
      }, 1000);
    }, tMs - wMs);

    // ⏰ Timer de logout
    logoutTimerRef.current = setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      handleLogoutRef.current();
    }, tMs);
  }, []);  // 👈 SIN dependencias = referencia ESTABLE para siempre

  // 📌 Ref para resetTimers (por si se necesita en useEffect)
  const resetTimersRef = useRef(resetTimers);
  useEffect(() => {
    resetTimersRef.current = resetTimers;
  }, [resetTimers]);

  // 🎯 useEffect PRINCIPAL - se ejecuta SOLO 1 VEZ al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    let lastReset = 0;
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 2000) {
        lastReset = now;
        resetTimersRef.current();  // 👈 Usa la ref (estable)
      }
    };

    events.forEach((event) => window.addEventListener(event, throttledReset));
    resetTimersRef.current();  // 👈 Inicio inicial

    return () => {
      events.forEach((event) => window.removeEventListener(event, throttledReset));
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);  // 👈 VACÍO = solo al montar

  // 🔘 Extender sesión
  const extendSession = useCallback(() => {
    resetTimersRef.current();
  }, []);

  return { showWarning, remainingTime, extendSession, warningMs };
}