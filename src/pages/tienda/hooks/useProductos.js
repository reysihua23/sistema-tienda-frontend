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
                imagen: prod.imagen || "https://placehold.co/400x400?text=Producto"
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
                imagen: prod.imagen || "/images/placeholder.jpg"
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
    const determinarCategoria = (nombre) => {
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes("iphone") || nombreLower.includes("samsung") ||
            nombreLower.includes("celular") || nombreLower.includes("smartphone")) {
            return "celulares";
        }
        if (nombreLower.includes("ipad") || nombreLower.includes("tablet") ||
            nombreLower.includes("pad")) {
            return "tablets";
        }
        if (nombreLower.includes("airpods") || nombreLower.includes("cargador") ||
            nombreLower.includes("teclado") || nombreLower.includes("case") ||
            nombreLower.includes("mouse") || nombreLower.includes("funda")) {
            return "accesorios";
        }
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