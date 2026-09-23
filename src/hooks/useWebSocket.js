// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
//import SockJS from 'sockjs-client/dist/sockjs.js';
import SockJS from 'sockjs-client/dist/sockjs.js';
import { WS_URL } from '../config/apiConfig';

export const useWebSocket = (usuarioId, onMessageReceived) => {
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);
    const onMessageRef = useRef(onMessageReceived);
    
    // ✅ Actualizar la referencia del callback sin reconectar
    useEffect(() => {
        onMessageRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        if (!usuarioId) {
            console.log('⏳ WebSocket: esperando usuarioId...');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('⏳ WebSocket: esperando token...');
            return;
        }

        // ✅ Si ya hay un cliente activo, no reconectar
        if (clientRef.current && clientRef.current.active) {
            console.log('⏳ WebSocket: ya hay una conexión activa, ignorando...');
            return;
        }

        console.log('🔌 Conectando WebSocket para usuario:', usuarioId);

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ WebSocket conectado');
                setConnected(true);

                const destination = `/topic/notificaciones/${usuarioId}`;
                console.log('📡 Suscribiéndose a:', destination);
                
                stompClient.subscribe(destination, (message) => {
                    console.log('🎉 ¡Mensaje WebSocket recibido!');
                    try {
                        const notificacion = JSON.parse(message.body);
                        console.log('📩 Notificación:', notificacion);
                        
                        // ✅ Usar la referencia actualizada
                        if (onMessageRef.current) {
                            onMessageRef.current(notificacion);
                        }
                    } catch (error) {
                        console.error('❌ Error al parsear:', error);
                    }
                });
            },
            onDisconnect: () => {
                console.log('❌ WebSocket desconectado');
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error('❌ Error STOMP:', frame);
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            // ✅ Solo desconectar si el componente se desmonta de verdad
            // (No hacer nada en el cleanup para evitar reconexiones)
        };
    }, [usuarioId]); // ✅ Solo usuarioId como dependencia

    // ✅ Desconectar solo al desmontar el provider (cuando el usuario cierra sesión)
    useEffect(() => {
        return () => {
            if (clientRef.current && clientRef.current.active) {
                console.log('🔌 Cerrando WebSocket al desmontar');
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, []);

    return { connected };
};