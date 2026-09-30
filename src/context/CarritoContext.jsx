// context/CarritoContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error("useCarrito debe usarse dentro de CarritoProvider");
    }
    return context;
};

// 🔑 Obtener la clave del carrito según el usuario logueado
const getCarritoKey = () => {
    try {
        const usuarioStr = localStorage.getItem("usuario");
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            // Prioriza clienteId, luego id, luego correo
            const id = usuario.clienteId || usuario.id || usuario.correo || "anonimo";
            return `carrito_${id}`;
        }
    } catch (e) {
        console.error("Error al leer usuario:", e);
    }
    return "carrito_anonimo";
};

export const CarritoProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [itemsCount, setItemsCount] = useState(0);

    // 📥 Cargar carrito del localStorage al iniciar y al cambiar de usuario
    useEffect(() => {
        const cargarCarrito = () => {
            const key = getCarritoKey();
            const carritoGuardado = localStorage.getItem(key);
            if (carritoGuardado) {
                try {
                    setCartItems(JSON.parse(carritoGuardado));
                } catch (e) {
                    console.error("Error al parsear carrito:", e);
                    setCartItems([]);
                }
            } else {
                setCartItems([]);
            }
        };

        cargarCarrito();

        // 👂 Escuchar cambios de usuario (login/logout)
        window.addEventListener("storage", cargarCarrito);
        window.addEventListener("carrito-cambio-usuario", cargarCarrito);

        return () => {
            window.removeEventListener("storage", cargarCarrito);
            window.removeEventListener("carrito-cambio-usuario", cargarCarrito);
        };
    }, []);

    // 💾 Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        const key = getCarritoKey();
        localStorage.setItem(key, JSON.stringify(cartItems));
        calcularTotales();
    }, [cartItems]);

    const calcularTotales = () => {
        const nuevoSubtotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const nuevoCount = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
        setSubtotal(nuevoSubtotal);
        setItemsCount(nuevoCount);
    };

    const agregarAlCarrito = (producto, cantidad) => {
        setCartItems(prev => {
            const existe = prev.find(item => item.id === producto.id);
            if (existe) {
                return prev.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            }
            return [...prev, {
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion || "Sin descripción",
                precio: producto.precio,
                stock: producto.stock,
                imagenUrl: producto.imagenUrl || null,
                cantidad: cantidad
            }];
        });
    };

    const eliminarDelCarrito = (productoId) => {
        setCartItems(prev => prev.filter(item => item.id !== productoId));
    };

    const actualizarCantidad = (productoId, cantidad) => {
        if (cantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productoId ? { ...item, cantidad } : item
            )
        );
    };

    const vaciarCarrito = () => {
        setCartItems([]);
    };

    return (
        <CarritoContext.Provider value={{
            cartItems,
            subtotal,
            itemsCount,
            agregarAlCarrito,
            eliminarDelCarrito,
            actualizarCantidad,
            vaciarCarrito
        }}>
            {children}
        </CarritoContext.Provider>
    );
};