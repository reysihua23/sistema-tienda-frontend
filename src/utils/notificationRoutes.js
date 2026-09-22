// src/utils/notificationRoutes.js

const ROUTES = {
  STOCK: {
    roles: {
      ADMIN: {
        label: "Ir a Stock",
        path: "/admin",
        state: (notif) => ({
          tab: "stock",
          highlightId: notif.referenciaId ?? null,
          openEditModal: true,
        }),
      },
      VENDEDOR: {
        label: "Ir a Stock",
        path: "/vendedor",
        state: (notif) => ({
          tab: "stock",
          highlightId: notif.referenciaId ?? null,
          openEditModal: true,
        }),
      },
    },
  },
  PEDIDO: {
    roles: {
      ADMIN: {
        label: "Ir al Pedido",
        path: "/admin",
        state: (notif) => ({
          tab: "pedidos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
      VENDEDOR: {
        label: "Ir al Pedido",
        path: "/vendedor",
        state: (notif) => ({
          tab: "pedidos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
    },
  },
  PAGO: {
    roles: {
      ADMIN: {
        label: "Ir al Pedido",
        path: "/admin",
        state: (notif) => ({
          tab: "pedidos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
      VENDEDOR: {
        label: "Ir al Pedido",
        path: "/vendedor",
        state: (notif) => ({
          tab: "pedidos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
    },
  },
  ENVIO: {
    roles: {
      ADMIN: {
        label: "Ir al Pedido",
        path: "/admin",
        state: (notif) => ({
          tab: "pedidos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
      VENDEDOR: {
        label: "Ir al Pedido",
        path: "/vendedor",
        state: (notif) => ({
          tab: "pedidos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
    },
  },
  PRODUCTO: {
    roles: {
      ADMIN: {
        label: "Ir a Productos",
        path: "/admin",
        state: (notif) => ({
          tab: "productos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: false,
        }),
      },
      VENDEDOR: {
        label: "Ir a Productos",
        path: "/vendedor",
        state: (notif) => ({
          tab: "productos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: false,
        }),
      },
    },
  },
  SERVICIO: {
    roles: {
      TECNICO: {
        label: "Ir al Servicio",
        path: "/tecnico",
        state: (notif) => ({
          tab: "servicios",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
      ADMIN: {
        label: "Ir al Servicio",
        path: "/admin",
        state: (notif) => ({
          tab: "servicios",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
    },
  },
  RECLAMO: {
    roles: {
      ADMIN: {
        label: "Ir al Reclamo",
        path: "/admin",
        state: (notif) => ({
          tab: "reclamos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
      VENDEDOR: {
        label: "Ir al Reclamo",
        path: "/vendedor",
        state: (notif) => ({
          tab: "reclamos",
          highlightId: notif.referenciaId ?? null,
          openDetailModal: true,
        }),
      },
    },
  },
};

export function getNotificationRoute(notificacionOrTipo, userRol) {
  if (!notificacionOrTipo || !userRol) return null;

  const notif = typeof notificacionOrTipo === "string"
    ? { tipo: notificacionOrTipo }
    : notificacionOrTipo;

  const tipo = notif.tipo;
  if (!tipo) return null;

  const config = ROUTES[tipo.toUpperCase()];
  if (!config) return null;

  const roleConfig = config.roles[userRol.toUpperCase()];
  if (!roleConfig) return null;

  const resolvedState = typeof roleConfig.state === "function"
    ? roleConfig.state(notif)
    : roleConfig.state || {};

  return {
    label: roleConfig.label,
    path: roleConfig.path,
    state: resolvedState,
  };
}

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