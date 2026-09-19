// src/utils/notificationRoutes.js

/**
 * Configuración de rutas por tipo de notificación.
 * Cada tipo define a qué rol(es) pertenece y a dónde debe navegar cada uno.
 */
const ROUTES = {
  STOCK: {
    roles: {
      ADMIN: { label: "Ir a Stock", path: "/admin", state: { tab: "stock" } },
      VENDEDOR: { label: "Ir a Stock", path: "/vendedor", state: { tab: "stock" } },
    },
  },
  PEDIDO: {
    roles: {
      ADMIN: { label: "Ir a Pedidos", path: "/admin", state: { tab: "pedidos" } },
      VENDEDOR: { label: "Ir a Pedidos", path: "/vendedor", state: { tab: "pedidos" } },
    },
  },
  PAGO: {
    roles: {
      ADMIN: { label: "Ir a Pedidos", path: "/admin", state: { tab: "pedidos" } },
      VENDEDOR: { label: "Ir a Pedidos", path: "/vendedor", state: { tab: "pedidos" } },
    },
  },
  ENVIO: {
    roles: {
      ADMIN: { label: "Ir a Pedidos", path: "/admin", state: { tab: "pedidos" } },
      VENDEDOR: { label: "Ir a Pedidos", path: "/vendedor", state: { tab: "pedidos" } },
    },
  },
  PRODUCTO: {
    roles: {
      ADMIN: { label: "Ir a Productos", path: "/admin", state: { tab: "productos" } },
      VENDEDOR: { label: "Ir a Productos", path: "/vendedor", state: { tab: "productos" } },
    },
  },
  SERVICIO: {
    roles: {
      TECNICO: { label: "Ir a Servicios", path: "/tecnico", state: { tab: "servicios" } },
      ADMIN:   { label: "Ir a Servicios", path: "/admin", state: { tab: "servicios" } },
    },
  },
  RECLAMO: {
    roles: {
      ADMIN: { label: "Ir a Reclamos", path: "/admin", state: { tab: "reclamos" } },
      VENDEDOR: { label: "Ir a Reclamos", path: "/vendedor", state: { tab: "reclamos" } },
    },
  },
};

/**
 * Devuelve la info de navegación para una notificación según el rol del usuario.
 * @param {string} tipo - Tipo de la notificación (STOCK, PEDIDO, etc.)
 * @param {string} userRol - Rol del usuario actual (ADMIN, VENDEDOR, TECNICO, CLIENTE)
 * @returns {{label: string, path: string, state: object} | null}
 */
export function getNotificationRoute(tipo, userRol) {
  if (!tipo || !userRol) return null;
  const config = ROUTES[tipo.toUpperCase()];
  if (!config) return null;
  return config.roles[userRol.toUpperCase()] || null;
}

/**
 * Devuelve el rol del usuario actual desde localStorage.
 */
export function getCurrentUserRol() {
  try {
    const raw = localStorage.getItem("usuario");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user.rol || null;
  } catch {
    return null;
  }
}