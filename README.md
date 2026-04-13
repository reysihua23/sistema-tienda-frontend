# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## API CON LOGS
/**
 * SERVICIO CENTRALIZADO DE API - TIENDA VIRTUAL
 * Conexión directa con Backend Java Spring Boot
 */

const BASE_URL = "http://localhost:8080/api";

// USAR BACKEND REAL
const USE_REAL_BACKEND = true; // ✅ SIEMPRE TRUE

export const apiService = {
  /**
   * Método genérico para peticiones POST
   */
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Error en el servidor");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en API (POST):", error);
      throw error;
    }
  },

  /**
   * Método genérico para peticiones GET
   */
  get: async (endpoint) => {
    try {
      const token = localStorage.getItem("token");
      console.log(`🔵 GET ${endpoint} - Token: ${token ? "✅ existe" : "❌ NO HAY TOKEN"}`);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      console.log(`🟢 Respuesta ${endpoint}: status ${response.status}`);

      if (!response.ok) {
        // Solo lanzar el error, NO redirigir
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Error en GET ${endpoint}:`, error);
      throw error;
    }
  },
  /**
   * Método para peticiones PUT
   */
  put: async (endpoint, data) => {
    try {
      const token = localStorage.getItem("token");
      console.log(`🔵 PUT ${endpoint}`);
      console.log(`🔵 Token completo: ${token}`);
      console.log(`🔵 Token existe: ${token ? "SÍ" : "NO"}`);
      console.log(`🔵 Data:`, data);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(data),
      });

      console.log(`🟢 Respuesta PUT ${endpoint}: status ${response.status}`);

      const responseText = await response.text();
      console.log(`📄 Respuesta texto:`, responseText);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
      }

      if (responseText) {
        return JSON.parse(responseText);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error en API (PUT):`, error);
      throw error;
    }
  },

  /**
   * Método para peticiones DELETE
   */
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      return true;
    } catch (error) {
      console.error("Error en API (DELETE):", error);
      throw error;
    }
  },

  /**
   * Método para peticiones PATCH
   */
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error en la actualización");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en API (PATCH):", error);
      throw error;
    }
  }
};

// ============================================
// SERVICIOS ESPECÍFICOS PARA CADA ENTIDAD
// ============================================

// AUTH - Login, Registro y Autenticación
export const authService = {
  // Login (funciona para todos)
  login: async (correo, password) => {
    const response = await apiService.post("/auth/login", { correo, password });
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("usuario", JSON.stringify(response));
    }
    return response;
  },

  // Registro de CLIENTE (público)
  register: async (data) => {
    const response = await apiService.post("/auth/register", {
      correo: data.correo,
      password: data.password,
      nombre: data.nombre,
      telefono: data.telefono
    });
    return response;
  },

  // Registro de EMPLEADOS (ADMIN, VENTAS, TECNICO) - solo para usuarios con rol ADMIN
  registerEmployee: async (data) => {
    const response = await apiService.post("/auth/register-employee", {
      correo: data.correo,
      password: data.password,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol // "ADMIN", "VENTAS", "TECNICO"
    });
    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("usuario");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (rol) => {
    const user = authService.getCurrentUser();
    return user && user.rol === rol;
  },

  // Verificar si es ADMIN
  isAdmin: () => {
    return authService.hasRole("ADMIN");
  },

  // Verificar si es VENTAS
  isVentas: () => {
    return authService.hasRole("VENTAS");
  },

  // Verificar si es TECNICO
  isTecnico: () => {
    return authService.hasRole("TECNICO");
  },

  // Verificar si es CLIENTE
  isCliente: () => {
    return authService.hasRole("CLIENTE");
  }
};

// CLIENTES
export const clienteService = {
  listar: () => apiService.get("/clientes"),
  buscarPorId: (id) => apiService.get(`/clientes/${id}`),
  crear: (cliente) => apiService.post("/clientes", cliente),
  actualizar: (id, cliente) => apiService.put(`/clientes/${id}`, cliente),
  eliminar: (id) => apiService.delete(`/clientes/${id}`)
};

// PRODUCTOS
export const productoService = {
  listar: () => apiService.get("/productos"),
  listarActivos: () => apiService.get("/productos/activos"),
  buscarPorId: (id) => apiService.get(`/productos/${id}`),
  buscarPorNombre: (nombre) => apiService.get(`/productos/buscar?nombre=${nombre}`),
  listarStockBajo: (stockMinimo) => apiService.get(`/productos/stock-bajo?stockMinimo=${stockMinimo}`),
  filtrar: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/productos/filtrar?${query}`);
  },
  crear: (producto) => apiService.post("/productos", producto),
  actualizar: (id, producto) => apiService.put(`/productos/${id}`, producto),
  cambiarEstado: (id, activo) => apiService.patch(`/productos/${id}/activo?activo=${activo}`, {}),
  eliminar: (id) => apiService.delete(`/productos/${id}`)
};

// STOCK
export const stockService = {
  listar: () => apiService.get("/stock"),
  buscarPorId: (id) => apiService.get(`/stock/${id}`),
  buscarPorProducto: (productoId) => apiService.get(`/stock/producto/${productoId}`),
  listarStockBajo: (cantidad) => apiService.get(`/stock/bajo?cantidad=${cantidad}`),
  crear: (stock) => apiService.post("/stock", stock),
  actualizar: (id, stock) => apiService.put(`/stock/${id}`, stock),
  //actualizarStock: (productoId, nuevaCantidad) => apiService.patch(`/stock/producto/${productoId}/actualizar?nuevaCantidad=${nuevaCantidad}`, {}),
  incrementar: (productoId, cantidad) => apiService.patch(`/stock/producto/${productoId}/incrementar?cantidad=${cantidad}`, {}),
  decrementar: (productoId, cantidad) => apiService.patch(`/stock/producto/${productoId}/decrementar?cantidad=${cantidad}`, {}),
  eliminar: (id) => apiService.delete(`/stock/${id}`)
};

// PEDIDOS
export const pedidoService = {
  listar: () => apiService.get("/pedidos"),
  buscarPorId: (id) => apiService.get(`/pedidos/${id}`),
  buscarPorCliente: (clienteId) => apiService.get(`/pedidos/cliente/${clienteId}`),
  buscarPorEstado: (estado) => apiService.get(`/pedidos/estado/${estado}`),
  crear: (pedido) => apiService.post("/pedidos", pedido),
  actualizar: (id, pedido) => apiService.put(`/pedidos/${id}`, pedido),
  cambiarEstado: (id, estado) => apiService.patch(`/pedidos/${id}/estado?estado=${estado}`, {}),
  eliminar: (id) => apiService.delete(`/pedidos/${id}`)
};

// DETALLE PEDIDO
export const detallePedidoService = {
  listar: () => apiService.get("/detalle-pedido"),
  buscarPorId: (id) => apiService.get(`/detalle-pedido/${id}`),
  buscarPorPedido: (pedidoId) => apiService.get(`/detalle-pedido/pedido/${pedidoId}`),
  buscarPorProducto: (productoId) => apiService.get(`/detalle-pedido/producto/${productoId}`),
  crear: (detalle) => apiService.post("/detalle-pedido", detalle),
  actualizar: (id, detalle) => apiService.put(`/detalle-pedido/${id}`, detalle),
  eliminar: (id) => apiService.delete(`/detalle-pedido/${id}`),
  eliminarPorPedido: (pedidoId) => apiService.delete(`/detalle-pedido/pedido/${pedidoId}`)
};


// PAGOS
export const pagoService = {
  listar: () => apiService.get("/pagos"),
  buscarPorId: (id) => apiService.get(`/pagos/${id}`),
  buscarPorPedido: (pedidoId) => apiService.get(`/pagos/pedido/${pedidoId}`),
  buscarPorEstado: (estado) => apiService.get(`/pagos/estado/${estado}`),
  buscarPorMetodo: (metodo) => apiService.get(`/pagos/metodo/${metodo}`),
  crear: (pago) => apiService.post("/pagos", pago),
  actualizar: (id, pago) => apiService.put(`/pagos/${id}`, pago),
  aprobar: (id) => apiService.patch(`/pagos/${id}/aprobar`, {}),
  rechazar: (id) => apiService.patch(`/pagos/${id}/rechazar`, {}),
  eliminar: (id) => apiService.delete(`/pagos/${id}`)
};

// SERVICIOS TECNICOS
export const servicioTecnicoService = {
  listar: () => apiService.get("/servicios-tecnicos"),
  buscarPorId: (id) => apiService.get(`/servicios-tecnicos/${id}`),
  buscarPorCliente: (clienteId) => apiService.get(`/servicios-tecnicos/cliente/${clienteId}`),
  buscarPorEstado: (estado) => apiService.get(`/servicios-tecnicos/estado/${estado}`),
  crear: (servicio) => apiService.post("/servicios-tecnicos", servicio),
  actualizar: (id, servicio) => apiService.put(`/servicios-tecnicos/${id}`, servicio),
  cambiarEstado: (id, estado) => apiService.patch(`/servicios-tecnicos/${id}/estado?estado=${estado}`, {}),
  eliminar: (id) => apiService.delete(`/servicios-tecnicos/${id}`)
};

// RECLAMOS
export const reclamoService = {
  listar: () => apiService.get("/reclamos"),
  buscarPorId: (id) => apiService.get(`/reclamos/${id}`),
  buscarPorCliente: (clienteId) => apiService.get(`/reclamos/cliente/${clienteId}`),
  buscarPorEstado: (estado) => apiService.get(`/reclamos/estado/${estado}`),
  buscarPorTipo: (tipo) => apiService.get(`/reclamos/tipo/${tipo}`),
  filtrar: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/reclamos/filtrar?${query}`);
  },
  crear: (reclamo) => apiService.post("/reclamos", reclamo),
  actualizar: (id, reclamo) => apiService.put(`/reclamos/${id}`, reclamo),
  cambiarEstado: (id, estado) => apiService.patch(`/reclamos/${id}/estado?estado=${estado}`, {}),
  eliminar: (id) => apiService.delete(`/reclamos/${id}`)
};

// DEVOLUCIONES
export const devolucionService = {
  listar: () => apiService.get("/devoluciones"),
  buscarPorId: (id) => apiService.get(`/devoluciones/${id}`),
  buscarPorReclamo: (reclamoId) => apiService.get(`/devoluciones/reclamo/${reclamoId}`),
  buscarPorEstado: (estado) => apiService.get(`/devoluciones/estado/${estado}`),
  crear: (devolucion) => apiService.post("/devoluciones", devolucion),
  actualizar: (id, devolucion) => apiService.put(`/devoluciones/${id}`, devolucion),
  eliminar: (id) => apiService.delete(`/devoluciones/${id}`)
};

// COMPROBANTES
export const comprobanteService = {
  listar: () => apiService.get("/comprobantes"),
  buscarPorId: (id) => apiService.get(`/comprobantes/${id}`),
  buscarPorPedido: (pedidoId) => apiService.get(`/comprobantes/pedido/${pedidoId}`),
  buscarPorServicio: (servicioId) => apiService.get(`/comprobantes/servicio/${servicioId}`),
  buscarPorTipo: (tipo) => apiService.get(`/comprobantes/tipo/${tipo}`),
  crear: (comprobante) => apiService.post("/comprobantes", comprobante),
  actualizar: (id, comprobante) => apiService.put(`/comprobantes/${id}`, comprobante),
  eliminar: (id) => apiService.delete(`/comprobantes/${id}`)
};

// NOTIFICACIONES
export const notificacionService = {
  listar: () => apiService.get("/notificaciones"),
  listarNoLeidas: () => apiService.get("/notificaciones/no-leidas"),
  buscarPorId: (id) => apiService.get(`/notificaciones/${id}`),
  buscarPorTipo: (tipo) => apiService.get(`/notificaciones/tipo/${tipo}`),
  crear: (notificacion) => apiService.post("/notificaciones", notificacion),
  marcarComoLeida: (id) => apiService.patch(`/notificaciones/${id}/leer`, {}),
  marcarTodasLeidas: () => apiService.patch("/notificaciones/marcar-todas-leidas", {}),
  eliminar: (id) => apiService.delete(`/notificaciones/${id}`)
};

// ENVIOS
export const envioService = {
  listar: () => apiService.get("/envios"),
  buscarPorId: (id) => apiService.get(`/envios/${id}`),
  buscarPorPedido: (pedidoId) => apiService.get(`/envios/pedido/${pedidoId}`),
  buscarPorEstado: (estado) => apiService.get(`/envios/estado/${estado}`),
  crear: (envio) => apiService.post("/envios", envio),
  actualizar: (id, envio) => apiService.put(`/envios/${id}`, envio),
  cambiarEstado: (id, estado) => apiService.patch(`/envios/${id}/estado?estado=${estado}`, {}),
  eliminar: (id) => apiService.delete(`/envios/${id}`)
};

// USUARIOS
export const usuarioService = {
  listar: () => apiService.get("/usuarios"),
  buscarPorId: (id) => apiService.get(`/usuarios/${id}`),
  buscarPorCorreo: (correo) => apiService.get(`/usuarios/correo/${correo}`),
  filtrar: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/usuarios/filtrar?${query}`);
  },
  crear: (usuario) => apiService.post("/usuarios", usuario),
  actualizar: (id, usuario) => apiService.put(`/usuarios/${id}`, usuario),
  cambiarEstado: (id, activo) => apiService.patch(`/usuarios/${id}/activo?activo=${activo}`, {}),
  eliminar: (id) => apiService.delete(`/usuarios/${id}`)
};

// ROLES
export const rolService = {
  listar: () => apiService.get("/roles"),
  buscarPorId: (id) => apiService.get(`/roles/${id}`),
  buscarPorNombre: (nombre) => apiService.get(`/roles/nombre/${nombre}`),
  crear: (rol) => apiService.post("/roles", rol),
  actualizar: (id, rol) => apiService.put(`/roles/${id}`, rol),
  eliminar: (id) => apiService.delete(`/roles/${id}`)
};

// PRODUCTO IMAGENES
export const productoImagenService = {
  listar: () => apiService.get("/producto-imagenes"),
  buscarPorId: (id) => apiService.get(`/producto-imagenes/${id}`),
  buscarPorProducto: (productoId) => apiService.get(`/producto-imagenes/producto/${productoId}`),
  buscarPrincipal: (productoId) => apiService.get(`/producto-imagenes/producto/${productoId}/principal`),
  crear: (imagen) => apiService.post("/producto-imagenes", imagen),
  actualizar: (id, imagen) => apiService.put(`/producto-imagenes/${id}`, imagen),
  marcarComoPrincipal: (id, productoId) => apiService.patch(`/producto-imagenes/${id}/principal?productoId=${productoId}`, {}),
  eliminar: (id) => apiService.delete(`/producto-imagenes/${id}`),
  eliminarPorProducto: (productoId) => apiService.delete(`/producto-imagenes/producto/${productoId}`)
};