/**
 * SERVICIO CENTRALIZADO DE API - TIENDA VIRTUAL
 * Conexión directa con Backend Java Spring Boot
 */
// services/api.js
//import apiService from './api';

const BASE_URL = "http://localhost:8080/api";

export const apiService = {
  /**
   * Método genérico para peticiones POST
   */
  post: async (endpoint, data) => {
    try {
      const token = localStorage.getItem("token");
      console.log(`🔵 POST ${endpoint}`);
      console.log(`🔵 Token: ${token ? token.substring(0, 50) + "..." : "NO HAY TOKEN"}`);
      console.log(`🔵 Data:`, data);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(data),
      });

      console.log(`🟢 Respuesta POST ${endpoint}: status ${response.status}`);

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
      console.error(`❌ Error en API (POST):`, error);
      throw error;
    }
  },

  /**
   * Método genérico para peticiones GET
   */
  get: async (endpoint) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
      }

      if (responseText) {
        return JSON.parse(responseText);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Método genérico para peticiones PUT
   */
  put: async (endpoint, data) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
      }

      if (responseText) {
        return JSON.parse(responseText);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Método genérico para peticiones DELETE
   */
  delete: async (endpoint) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Método genérico para peticiones PATCH
   */
  patch: async (endpoint, data) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
      }

      if (responseText) {
        return JSON.parse(responseText);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  // para subir archivos (imágenes)
  upload: async (endpoint, formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: formData
    });

    const text = await response.text();
    if (!response.ok) throw new Error(`Error ${response.status}: ${text}`);
    return text ? JSON.parse(text) : true;
  }
};

// ============================================
// SERVICIOS ESPECÍFICOS PARA CADA ENTIDAD
// ============================================

// AUTH - Login, Registro y Autenticación
// services/api.js - authService
export const authService = {
  login: async (correo, password) => {
    const response = await apiService.post("/auth/login", { correo, password });

    if (response.token) {
      // ✅ Guardar token
       sessionStorage.setItem("token", response.token);

      // ✅ Guardar usuario con los campos correctos
      const usuario = {
        id: response.usuarioId,
        clienteId: response.clienteId,
        correo: response.correo,
        rol: response.rol,
        nombre: response.nombre || response.correo
      };

      console.log("✅ Usuario guardado:", usuario);
      localStorage.setItem("usuario", JSON.stringify(usuario));
    }

    return response;
  },

  register: async (data) => {
    return await apiService.post("/auth/register", {
      correo: data.correo,
      password: data.password,
      nombre: data.nombre,
      telefono: data.telefono
    });
  },

  registerEmployee: async (data) => {
    return await apiService.post("/auth/register-employee", {
      correo: data.correo,
      password: data.password,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol
    });
  },

  // ✅ LOGOUT COMPLETO - Limpia todo
  logout: () => {
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("redirectAfterLogin");
    // Limpiar cualquier otro dato de sesión si existe
    sessionStorage.clear();
    console.log("✅ Sesión cerrada correctamente");
  },

  // ✅ Cierre de sesión por inactividad o cierre de ventana
  setupAutoLogout: () => {
    // Cerrar sesión cuando se cierra la ventana o pestaña
    window.addEventListener("beforeunload", () => {
      authService.logout();
    });

    // Opcional: Cerrar sesión después de 30 minutos de inactividad
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (authService.isAuthenticated()) {
          console.log("⏰ Sesión expirada por inactividad");
          authService.logout();
          window.location.href = "/login";
        }
      }, 30 * 60 * 1000); // 30 minutos
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("beforeunload", () => { });
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("usuario");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },

  hasRole: (rol) => {
    const user = authService.getCurrentUser();
    return user && user.rol === rol;
  },

  isAdmin: () => authService.hasRole("ADMIN"),
  isVentas: () => authService.hasRole("VENTAS"),
  isTecnico: () => authService.hasRole("TECNICO"),
  isCliente: () => authService.hasRole("CLIENTE")
};


// CLIENTES
export const clienteService = {
  listar: () => apiService.get("/clientes"),
  buscarPorId: (id) => apiService.get(`/clientes/${id}`),
  buscarPorEmail: (email) => apiService.get(`/clientes/email/${email}`),
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
  crear: (producto) => apiService.post("/productos/crear", producto),  // ← Este es el que se usa
  actualizar: (id, producto) => apiService.put(`/productos/actualizar/${id}`, producto), // actualizar producto por ID
  cambiarEstado: (id, activo) => apiService.patch(`/productos/${id}/activo?activo=${activo}`, {}),
  eliminar: (id) => apiService.delete(`/productos/${id}`)
};

// services/api.js

export const stockService = {
  listar: () => apiService.get("/stock"),
  buscarPorId: (id) => apiService.get(`/stock/${id}`),
  buscarPorProducto: (productoId) => apiService.get(`/stock/producto/${productoId}`),
  crear: (stock) => apiService.post("/stock", stock),
  actualizar: (id, stock) => apiService.put(`/stock/${id}`, stock),
  eliminar: (id) => apiService.delete(`/stock/${id}`),

  // ✅ Reducir stock después de una compra (endpoint para clientes)
  reducirStockCompra: async (productoId, cantidad) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:8080/api/stock/comprar/${productoId}?cantidad=${cantidad}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  // Métodos existentes...
  incrementar: (productoId, cantidad) => apiService.patch(`/stock/producto/${productoId}/incrementar?cantidad=${cantidad}`, {}),
  decrementar: (productoId, cantidad) => apiService.patch(`/stock/producto/${productoId}/decrementar?cantidad=${cantidad}`, {}),
  actualizarPorProducto: (productoId, nuevaCantidad) => apiService.patch(`/stock/producto/${productoId}/actualizar?nuevaCantidad=${nuevaCantidad}`, {}),
  listarStockBajo: (cantidad) => apiService.get(`/stock/bajo?cantidad=${cantidad}`)
};


// PARA REALIZAR PEDIDOS DESDE EL FRONTEND (CARRITO DE COMPRAS)
// PEDIDOS
// services/api.js - Verifica que el pedidoService use el token

// services/api.js

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

/**SERVICIOS TECNICOS
export const servicioTecnicoService = {
  listar: () => apiService.get("/servicios-tecnicos"),
  buscarPorId: (id) => apiService.get(`/servicios-tecnicos/${id}`),
  buscarPorCliente: (clienteId) => apiService.get(`/servicios-tecnicos/cliente/${clienteId}`),
  buscarPorEstado: (estado) => apiService.get(`/servicios-tecnicos/estado/${estado}`),
  crear: (servicio) => apiService.post("/servicios-tecnicos", servicio),
  actualizar: (id, servicio) => apiService.put(`/servicios-tecnicos/${id}`, servicio),
  cambiarEstado: (id, estado) => apiService.patch(`/servicios-tecnicos/${id}/estado?estado=${estado}`, {}),
  eliminar: (id) => apiService.delete(`/servicios-tecnicos/${id}`)


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
};};*/

// services/api.js - Agregar reclamoService
export const reclamoService = {
  listar: () => apiService.get("/reclamos"),
  buscarPorId: (id) => apiService.get(`/reclamos/${id}`),
  buscarPorCliente: (clienteId) => apiService.get(`/reclamos/cliente/${clienteId}`),
  buscarPorEstado: (estado) => apiService.get(`/reclamos/estado/${estado}`),
  buscarPorTipo: (tipo) => apiService.get(`/reclamos/tipo/${tipo}`),
  crear: (reclamo) => apiService.post("/reclamos", reclamo),
  actualizar: (id, reclamo) => apiService.put(`/reclamos/${id}`, reclamo),
  cambiarEstado: (id, estado) => apiService.patch(`/reclamos/${id}/estado?estado=${estado}`, {}),
  eliminar: (id) => apiService.delete(`/reclamos/${id}`),

  // Evidencias
  listarEvidencias: (reclamoId) => apiService.get(`/reclamos/${reclamoId}/evidencias`),
  subirEvidencia: (reclamoId, formData) => apiService.upload(`/reclamos/${reclamoId}/evidencias`, formData),
  eliminarEvidencia: (evidenciaId) => apiService.delete(`/reclamo-evidencias/${evidenciaId}`)
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
  obtenerPorPedido: (pedidoId) => apiService.get(`/comprobantes/pedido/${pedidoId}`),
  listar: () => apiService.get("/comprobantes"),
  buscarPorId: (id) => apiService.get(`/comprobantes/${id}`),
  buscarPorPedido: (pedidoId) => apiService.get(`/comprobantes/pedido/${pedidoId}`),
  buscarPorServicio: (servicioId) => apiService.get(`/comprobantes/servicio/${servicioId}`),
  buscarPorTipo: (tipo) => apiService.get(`/comprobantes/tipo/${tipo}`),
  crear: (comprobante) => apiService.post("/comprobantes", comprobante),
  actualizar: (id, comprobante) => apiService.put(`/comprobantes/${id}`, comprobante),
  eliminar: (id) => apiService.delete(`/comprobantes/${id}`)
};


/*// NOTIFICACIONES
export const notificacionService = {
  listar: () => apiService.get("/notificaciones"),
  listarNoLeidas: () => apiService.get("/notificaciones/no-leidas"),
  buscarPorId: (id) => apiService.get(`/notificaciones/${id}`),
  buscarPorTipo: (tipo) => apiService.get(`/notificaciones/tipo/${tipo}`),
  crear: (notificacion) => apiService.post("/notificaciones", notificacion),
  marcarComoLeida: (id) => apiService.patch(`/notificaciones/${id}/leer`, {}),
  marcarTodasLeidas: () => apiService.patch("/notificaciones/marcar-todas-leidas", {}),
  eliminar: (id) => apiService.delete(`/notificaciones/${id}`)
};*/

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



// services/api.js - Agregar al usuarioService

export const usuarioService = {
  listar: () => apiService.get("/usuarios"),
  buscarPorId: (id) => apiService.get(`/usuarios/${id}`),
  buscarPorCorreo: (correo) => apiService.get(`/usuarios/correo/${correo}`),
  filtrar: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiService.get(`/usuarios/filtrar?${query}`);
  },

  // ✅ Crear usuario (envía la contraseña sin encriptar, el backend la encripta)
  crear: (usuario) => apiService.post("/usuarios", {
    correo: usuario.correo,
    password: usuario.password,  // ← Enviar como password
    nombre: usuario.nombre,
    rolId: usuario.rolId,
    activo: usuario.activo,
    telefono: usuario.telefono,      // ✅ Agregar
    documento: usuario.documento,    // ✅ Agregar
    direccion: usuario.direccion     // ✅ Agregar
  }),
  actualizar: (id, usuario) => apiService.put(`/usuarios/${id}`, usuario),
  cambiarEstado: (id, activo) => apiService.patch(`/usuarios/${id}/activo?activo=${activo}`, {}),
  eliminar: (id) => apiService.delete(`/usuarios/${id}`),

  // ✅ NUEVO: Obtener perfil del usuario autenticado
  getPerfil: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/api/usuarios/perfil`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  }
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


// CONSUME PARA SUBIR IMAGENES DE PRODUCTOS
export const productoImagenService = {
  listar: () => apiService.get("/producto-imagenes"),
  buscarPorId: (id) => apiService.get(`/producto-imagenes/${id}`),
  buscarPorProducto: (productoId) => apiService.get(`/producto-imagenes/producto/${productoId}`),
  buscarPrincipal: (productoId) => apiService.get(`/producto-imagenes/producto/${productoId}/principal`),
  crear: (imagen) => apiService.post("/producto-imagenes", imagen),
  actualizar: (id, imagen) => apiService.put(`/producto-imagenes/${id}`, imagen),
  marcarComoPrincipal: (id, productoId) => apiService.patch(`/producto-imagenes/${id}/principal?productoId=${productoId}`, {}),
  eliminar: (id) => apiService.delete(`/producto-imagenes/${id}`),
  eliminarPorProducto: (productoId) => apiService.delete(`/producto-imagenes/producto/${productoId}`),

  // ✅ SUBIR UNA SOLA IMAGEN (usando endpoint individual)
  upload: async (productoId, file, isPrincipal = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productoId", productoId);
    formData.append("principal", isPrincipal ? "true" : "false");

    return await apiService.upload("/producto-imagenes/upload", formData);
  },

  // ✅ SUBIR MÚLTIPLES IMÁGENES DE UNA VEZ (MÁS EFICIENTE)
  uploadMultiple: async (productoId, files) => {
    const formData = new FormData();

    // Agregar todos los archivos con la misma clave "files"
    files.forEach(file => {
      formData.append("files", file);
    });
    formData.append("productoId", productoId);

    // Usar el endpoint optimizado para múltiples archivos
    return await apiService.upload("/producto-imagenes/upload-multiple", formData);
  }
};

// services/api.js - Agregar al final del archivo

// =========================================================
// SERVICIOS TÉCNICOS
// =========================================================
export const servicioTecnicoService = {
  // Listar todos los servicios
  listar: () => apiService.get("/servicios-tecnicos"),

  // Buscar servicio por ID
  buscarPorId: (id) => apiService.get(`/servicios-tecnicos/${id}`),

  // Buscar servicios por cliente
  buscarPorCliente: (clienteId) => apiService.get(`/servicios-tecnicos/cliente/${clienteId}`),

  // Buscar servicios por estado
  buscarPorEstado: (estado) => apiService.get(`/servicios-tecnicos/estado/${estado}`),

  // Crear nuevo servicio
  crear: (servicio) => apiService.post("/servicios-tecnicos", servicio),

  // Actualizar servicio
  actualizar: (id, servicio) => apiService.put(`/servicios-tecnicos/${id}`, servicio),

  // Cambiar estado del servicio
  cambiarEstado: (id, estado) => apiService.patch(`/servicios-tecnicos/${id}/estado?estado=${estado}`, {}),

  // Agregar diagnóstico
  agregarDiagnostico: (id, diagnostico, costo) => apiService.patch(`/servicios-tecnicos/${id}/diagnostico`, { diagnostico, costo }),

  // Eliminar servicio
  eliminar: (id) => apiService.delete(`/servicios-tecnicos/${id}`)
};



// =========================================================
// NOTIFICACIONES
// =========================================================
export const notificacionService = {
    obtenerMisNotificaciones: () => apiService.get('/notificaciones/mis-notificaciones'),
    obtenerNoLeidas: () => apiService.get('/notificaciones/no-leidas'),
    contarNoLeidas: async () => {
        try {
            const response = await apiService.get('/notificaciones/contar-no-leidas');
            return response.count || 0;
        } catch (error) {
            return 0;
        }
    },
    marcarComoLeida: (id) => apiService.patch(`/notificaciones/${id}/leer`, {}),
    marcarTodasComoLeidas: () => apiService.patch('/notificaciones/marcar-todas', {}),
    eliminar: (id) => apiService.delete(`/notificaciones/${id}`),
    listarPorUsuario: (usuarioId) => apiService.get(`/notificaciones/usuario/${usuarioId}`)
};

