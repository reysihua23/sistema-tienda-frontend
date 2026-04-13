// services/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token, userId, rol) => {
  // Si ya hay una conexión, devolverla
  if (socket && socket.connected) {
    return socket;
  }
  
  // Si hay un socket pero está desconectado, limpiarlo
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  try {
    socket = io("http://localhost:8080", {
      transports: ["websocket", "polling"], // Permitir fallback a polling
      auth: {
        token: token
      },
      query: {
        userId: userId,
        rol: rol
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor de notificaciones");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Desconectado del servidor:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Error de conexión:", error.message);
      // No hacer nada, solo loguear
    });

    return socket;
  } catch (error) {
    console.error("Error creando conexión Socket.IO:", error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default { connectSocket, disconnectSocket, getSocket };