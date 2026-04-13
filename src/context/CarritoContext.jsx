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

export const CarritoProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [itemsCount, setItemsCount] = useState(0);

    // Cargar carrito del localStorage al iniciar
    useEffect(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        if (carritoGuardado) {
            setCartItems(JSON.parse(carritoGuardado));
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem("carrito", JSON.stringify(cartItems));
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