// utils/currency.js (nuevo archivo)
export const TASA_CAMBIO = {
  PEN_USD: 3.80,  // 1 USD = 3.80 PEN
  actualizar: async () => {
    try {
      // Opcional: Obtener tasa actual de una API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/PEN');
      const data = await response.json();
      TASA_CAMBIO.PEN_USD = data.rates.USD;
      console.log('Tasa de cambio actualizada:', TASA_CAMBIO.PEN_USD);
    } catch (error) {
      console.error('Error obteniendo tasa de cambio:', error);
    }
  }
};

export const convertirPENaUSD = (pen) => pen / TASA_CAMBIO.PEN_USD;
export const convertirUSDaPEN = (usd) => usd * TASA_CAMBIO.PEN_USD;