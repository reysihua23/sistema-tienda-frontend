// hooks/usePayPal.js
import { useState, useCallback } from 'react';

export const usePayPal = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const validatePayPalPayment = useCallback(async (captureData, pedidoData) => {
    try {
      // Validar que el monto coincida
      const montoPayPal = parseFloat(captureData.purchase_units[0].amount.value);
      const montoEsperado = parseFloat(pedidoData.montoUSD);
      
      if (Math.abs(montoPayPal - montoEsperado) > 0.01) {
        throw new Error(`El monto no coincide: PayPal $${montoPayPal} vs Esperado $${montoEsperado}`);
      }
      
      // Validar que el estado sea COMPLETED
      if (captureData.status !== 'COMPLETED') {
        throw new Error(`Estado de pago inválido: ${captureData.status}`);
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  return {
    isProcessing,
    error,
    validatePayPalPayment,
    setIsProcessing,
    setError
  };
};