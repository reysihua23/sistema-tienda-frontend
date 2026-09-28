// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
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
            // ✅ Si no hay usuarioId, cerrar cualquier conexión previa
            if (clientRef.current && clientRef.current.active) {
                console.log('🔌 Cerrando WebSocket porque no hay usuarioId');
                clientRef.current.deactivate();
                clientRef.current = null;
                setConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('⏳ WebSocket: esperando token...');
            return;
        }

        // ✅ CRÍTICO: Si hay una conexión activa CON OTRO usuario, desconectarla
        if (clientRef.current && clientRef.current.active) {
            console.log('🔌 Desconectando WebSocket anterior para reconectar con usuario', usuarioId);
            clientRef.current.deactivate();
            clientRef.current = null;
            setConnected(false);
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
                console.log('✅ WebSocket conectado para usuario', usuarioId);
                setConnected(true);

                const destination = `/topic/notificaciones/${usuarioId}`;
                console.log('📡 Suscribiéndose a:', destination);

                stompClient.subscribe(destination, (message) => {
                    console.log('🎉 ¡Mensaje WebSocket recibido!');
                    try {
                        const notificacion = JSON.parse(message.body);
                        console.log('📩 Notificación:', notificacion);

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

        // ✅ LIMPIEZA: Desconectar cuando cambia el usuarioId o al desmontar
        return () => {
            if (stompClient.active) {
                console.log('🔌 Cleanup: cerrando WebSocket para usuario', usuarioId);
                stompClient.deactivate();
            }
        };
    }, [usuarioId]);

    return { connected };
};