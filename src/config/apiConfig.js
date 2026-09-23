// src/config/apiConfig.js

/**
 * ═══════════════════════════════════════════════════════
 * CONFIGURACIÓN CENTRALIZADA DE LA API
 * ═══════════════════════════════════════════════════════
 * 
 * Este archivo es el ÚNICO punto donde se leen las
 * variables de entorno de Vite.
 * 
 * Uso:
 *   import { API_URL, WS_URL, API_BASE_URL } from '@/config/apiConfig';
 *   const res = await fetch(`${API_URL}/productos`);
 * 
 * Variables de entorno (.env):
 *   VITE_API_URL           → http://localhost:8080/api
 *   VITE_API_BASE_URL      → http://localhost:8080
 *   VITE_WS_URL            → http://localhost:8080/ws
 *   VITE_ENVIRONMENT       → development | staging | production
 */

// ─────────────────────────────────────────────────────
// 1. Detectar si estamos en entorno de desarrollo
// ─────────────────────────────────────────────────────
const isDev = import.meta.env.MODE === 'development';

// ─────────────────────────────────────────────────────
// 2. Detectar si estamos en un móvil (WiFi local)
//    Si accedes desde el celular con la IP de la PC,
//    window.location.hostname NO será "localhost"
// ─────────────────────────────────────────────────────
const isLocalNetwork = typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

// ─────────────────────────────────────────────────────
// 3. Construir las URLs base
// ─────────────────────────────────────────────────────

/**
 * URL del backend
 * - En desarrollo normal: usa VITE_API_URL del .env
 * - En red local (celular): reemplaza "localhost" por la IP actual
 */
function buildApiUrl() {
    const envUrl = import.meta.env.VITE_API_URL;

    if (!envUrl) {
        console.error('❌ VITE_API_URL no está definida en .env');
        return 'http://localhost:8080/api';
    }

    // Si estamos en red local (celular), usar la IP actual
    if (isLocalNetwork) {
        const currentHost = window.location.hostname;
        return envUrl.replace('localhost', currentHost);
    }

    return envUrl;
}

function buildApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_BASE_URL;

    if (!envUrl) {
        console.error('❌ VITE_API_BASE_URL no está definida en .env');
        return 'http://localhost:8080';
    }

    if (isLocalNetwork) {
        const currentHost = window.location.hostname;
        return envUrl.replace('localhost', currentHost);
    }

    return envUrl;
}

function buildWsUrl() {
    const envUrl = import.meta.env.VITE_WS_URL;

    if (!envUrl) {
        console.error('❌ VITE_WS_URL no está definida en .env');
        return 'http://localhost:8080/ws';
    }

    if (isLocalNetwork) {
        const currentHost = window.location.hostname;
        return envUrl.replace('localhost', currentHost);
    }

    return envUrl;
}

// ─────────────────────────────────────────────────────
// 4. Exportar constantes
// ─────────────────────────────────────────────────────

/** URL completa del API (con /api) */
export const API_URL = buildApiUrl();

/** URL base del backend (sin /api) - útil para imágenes */
export const API_BASE_URL = buildApiBaseUrl();

/** URL del WebSocket */
export const WS_URL = buildWsUrl();

/** Entorno actual */
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

/** ¿Es desarrollo? */
export const IS_DEV = isDev;

/** ¿Es producción? */
export const IS_PROD = import.meta.env.MODE === 'production';

// ─────────────────────────────────────────────────────
// 5. PayPal
// ─────────────────────────────────────────────────────
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
export const PAYPAL_MODE = import.meta.env.VITE_PAYPAL_MODE || 'sandbox';

// ─────────────────────────────────────────────────────
// 6. Helper para imágenes (evita repetir `${API_BASE_URL}${path}`)
// ─────────────────────────────────────────────────────
/**
 * Construye la URL completa de una imagen.
 * @param {string} path - Ruta relativa de la imagen (ej: /uploads/img.jpg)
 * @returns {string} URL completa o '' si no hay path
 */
export function buildImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path; // ya es una URL completa
    }
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// ─────────────────────────────────────────────────────
// 7. Log de configuración (solo en desarrollo)
// ─────────────────────────────────────────────────────
if (isDev) {
    console.log('🔧 [apiConfig] Configuración cargada:', {
        API_URL,
        API_BASE_URL,
        WS_URL,
        ENVIRONMENT,
        PAYPAL_MODE,
        IS_LOCAL_NETWORK: isLocalNetwork,
        HOSTNAME: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    });
}

// ─────────────────────────────────────────────────────
// 8. Export default con todo
// ─────────────────────────────────────────────────────
export default {
    API_URL,
    API_BASE_URL,
    WS_URL,
    ENVIRONMENT,
    IS_DEV,
    IS_PROD,
    PAYPAL_CLIENT_ID,
    PAYPAL_MODE,
    buildImageUrl,
};