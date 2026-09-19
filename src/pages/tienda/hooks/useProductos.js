import { useState, useEffect, useMemo, useCallback } from "react";
import { productoService } from "../../../services/api";

export const useProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productosOriginales, setProductosOriginales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        categoria: "todos",
        busqueda: "",
        soloStock: false
    });

    // Cargar todos los productos al inicio
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const data = await productoService.listar();
            const productosActivos = data.filter(prod => prod.activo === true);

            const productosFormateados = productosActivos.map(prod => ({
                id: prod.id,
                nombre: prod.nombre,
                descripcion: prod.descripcion || "Sin descripción",
                precio: prod.precio,
                stock: prod.stock || 0,
                stockMinimo: prod.stockMinimo || 5,
                activo: prod.activo,
                imagen: prod.imagen || "https://placehold.co/400x400?text=Producto",


                // ✅ AGREGAR CAMPOS DE DESCUENTO
                porcentajeDescuento: prod.porcentajeDescuento || 0,
                precioDescuento: prod.precioDescuento || 0,
                descuentoActivo: prod.descuentoActivo || false,
                fechaInicioDescuento: prod.fechaInicioDescuento || null,
                fechaFinDescuento: prod.fechaFinDescuento || null,
                precioActual: prod.precioActual || prod.precio,  // ← Importante

                // ✅ Función para saber si tiene descuento
                tieneDescuento: () => {
                    return prod.descuentoActivo && prod.porcentajeDescuento > 0;
                },

                // ✅ Función para obtener el precio actual
                getPrecioActual: () => {
                    if (prod.precioActual && prod.precioActual > 0) {
                        return prod.precioActual;
                    }
                    if (prod.descuentoActivo && prod.porcentajeDescuento > 0) {
                        return prod.precio - (prod.precio * prod.porcentajeDescuento / 100);
                    }
                    return prod.precio;
                }

            }));

            setProductos(productosFormateados);
        } catch (err) {
            console.error("Error cargando productos:", err);
            // ✅ No mostrar error al usuario si es por autenticación
            if (err.message?.includes("401") || err.message?.includes("403")) {
                console.log("Los productos requieren autenticación - esto debería solucionarse en el backend");
            } else {
                setError("Error al cargar los productos");
            }
        } finally {
            setLoading(false);
        }
    };

    // Buscar productos por nombre usando el endpoint real
    const buscarProductos = async (termino) => {
        if (!termino.trim()) {
            setProductos(productosOriginales);
            return;
        }

        setLoading(true);
        try {
            const data = await productoService.buscarPorNombre(termino);
            const productosActivos = data.filter(prod => prod.activo === true);

            const productosFormateados = productosActivos.map(prod => ({
                id: prod.id,
                nombre: prod.nombre,
                descripcion: prod.descripcion || "Sin descripción",
                precio: prod.precio,
                stock: prod.stock || 0,
                stockMinimo: prod.stockMinimo || 5,
                activo: prod.activo,
                imagen: prod.imagen || "/images/placeholder.jpg",
                categoria: prod.categoria || "otros",

                // CAMPOS DE DESCUENTO
                porcentajeDescuento: prod.porcentajeDescuento || 0,
                precioDescuento: prod.precioDescuento || 0,
                descuentoActivo: prod.descuentoActivo || false,
                fechaInicioDescuento: prod.fechaInicioDescuento || null,
                fechaFinDescuento: prod.fechaFinDescuento || null,
                precioActual: prod.precioActual || prod.precio,

                tieneDescuento: () => {
                    return prod.descuentoActivo && prod.porcentajeDescuento > 0;
                },
                getPrecioActual: () => {
                    if (prod.precioActual && prod.precioActual > 0) {
                        return prod.precioActual;
                    }
                    if (prod.descuentoActivo && prod.porcentajeDescuento > 0) {
                        return prod.precio - (prod.precio * prod.porcentajeDescuento / 100);
                    }
                    return prod.precio;
                }

            }));

            setProductos(productosFormateados);
        } catch (err) {
            console.error("Error buscando productos:", err);
            setError("Error al buscar productos");
        } finally {
            setLoading(false);
        }
    };

    // Determinar categoría
    // hooks/useProductos.js - Función corregida
    const determinarCategoria = (nombre) => {
        const nombreLower = nombre.toLowerCase();

        // ✅ AUDÍFONOS - PRIMERO (más específico)
        if (nombreLower.includes("audifono") || nombreLower.includes("audífono") ||
            nombreLower.includes("auricular") || nombreLower.includes("headphone") ||
            nombreLower.includes("earphone") || nombreLower.includes("airpods") ||
            nombreLower.includes("earbuds") || nombreLower.includes("galaxy buds") ||
            nombreLower.includes("xiaomi buds") || nombreLower.includes("samsung buds") ||
            nombreLower.includes("jbl") || nombreLower.includes("sony") ||
            nombreLower.includes("bose") || nombreLower.includes("audio")) {
            return "audifonos";
        }


        // ✅ ACCESORIOS - TERCERO (antes que celulares)
        if (nombreLower.includes("case") || nombreLower.includes("funda") ||
            nombreLower.includes("protector") || nombreLower.includes("vidrio") ||
            nombreLower.includes("teclado") || nombreLower.includes("mouse") ||
            nombreLower.includes("webcam") || nombreLower.includes("memoria") ||
            nombreLower.includes("usb") || nombreLower.includes("disco duro") ||
            nombreLower.includes("ssd") ||
            nombreLower.includes("cargador") || nombreLower.includes("cable") ||
            nombreLower.includes("cable usb") || nombreLower.includes("cable tipo c") ||
            nombreLower.includes("cable lightning") || nombreLower.includes("cargador usb") ||
            nombreLower.includes("cargador tipo c") || nombreLower.includes("cargador lightning") ||
            nombreLower.includes("cargador rápido") || nombreLower.includes("cargador inalámbrico") ||
            nombreLower.includes("cargador de pared") || nombreLower.includes("cargador de auto") ||
            nombreLower.includes("cargador portátil") || nombreLower.includes("power bank") ||
            nombreLower.includes("batería") || nombreLower.includes("bateria") ||
            nombreLower.includes("carga") || nombreLower.includes("adaptador") ||
            nombreLower.includes("hub") || nombreLower.includes("dock") ||
            nombreLower.includes("cargador 120w") || nombreLower.includes("cargador 67w") ||
            nombreLower.includes("cargador 33w") || nombreLower.includes("cargador rápido")) {
            return "accesorios";
        }

        // ✅ CELULARES - ÚLTIMO (menos específico)
        if (nombreLower.includes("iphone") || nombreLower.includes("samsung") ||
            nombreLower.includes("celular") || nombreLower.includes("smartphone") ||
            nombreLower.includes("xiaomi") || nombreLower.includes("huawei") ||
            nombreLower.includes("motorola") || nombreLower.includes("lg") ||
            nombreLower.includes("oneplus") || nombreLower.includes("pixel") ||
            nombreLower.includes("oppo") || nombreLower.includes("vivo") ||
            nombreLower.includes("realme") || nombreLower.includes("nothing")) {
            return "celulares";
        }

        // ✅ TABLETS - 3° (ANTES que celulares)
        if (nombreLower.includes("tablet") || nombreLower.includes("tab") ||
            nombreLower.includes("ipad") || nombreLower.includes("pad") ||
            nombreLower.includes("galaxy tab") || nombreLower.includes("huawei mediapad") ||
            nombreLower.includes("lenovo tab") || nombreLower.includes("xiaomi pad") ||
            nombreLower.includes("samsung tab") || nombreLower.includes("tableta")) {
            return "tablets";
        }

        // ✅ OTROS
        return "otros";
    };

    // ✅ Productos filtrados por categoría y stock
    const productosFiltrados = useMemo(() => {
        if (productos.length === 0) return [];

        let resultado = [...productos];

        // Filtrar por categoría
        if (filtros.categoria !== "todos") {
            resultado = resultado.filter(p => determinarCategoria(p.nombre) === filtros.categoria);
        }

        // Filtrar solo con stock
        if (filtros.soloStock) {
            resultado = resultado.filter(p => p.stock > 0);
        }

        return resultado;
    }, [productos, filtros.categoria, filtros.soloStock]);

    // Actualizar filtros
    const actualizarFiltros = useCallback((nuevosFiltros) => {
        setFiltros(prev => {
            const nuevos = { ...prev, ...nuevosFiltros };
            if (JSON.stringify(prev) === JSON.stringify(nuevos)) {
                return prev;
            }
            return nuevos;
        });

        // Si se actualiza la búsqueda, llamar al endpoint
        if (nuevosFiltros.busqueda !== undefined) {
            buscarProductos(nuevosFiltros.busqueda);
        }
    }, []);

    const limpiarFiltros = useCallback(() => {
        setFiltros({
            categoria: "todos",
            busqueda: "",
            soloStock: false
        });
        setProductos(productosOriginales);
    }, [productosOriginales]);

    const recargar = useCallback(() => {
        cargarProductos();
    }, []);

    return {
        productosFiltrados,
        loading,
        error,
        filtros,
        actualizarFiltros,
        limpiarFiltros,
        recargar
    };
};