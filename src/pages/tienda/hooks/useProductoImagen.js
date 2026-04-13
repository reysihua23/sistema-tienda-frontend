import { useState, useEffect } from "react";
import { productoImagenService } from "../../../services/api";

export const useProductoImagen = (productoId) => {
    const [imagenUrl, setImagenUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productoId) {
            setLoading(false);
            return;
        }

        const cargarImagen = async () => {
            setLoading(true);
            
            try {
                // Intentar obtener las imágenes del producto
                const imagenes = await productoImagenService.buscarPorProducto(productoId);
                
                if (imagenes && imagenes.length > 0) {
                    // Buscar la imagen principal o usar la primera
                    const imagenPrincipal = imagenes.find(img => img.principal === true) || imagenes[0];
                    if (imagenPrincipal && imagenPrincipal.urlImagen) {
                        setImagenUrl(`http://localhost:8080${imagenPrincipal.urlImagen}`);
                    } else {
                        setImagenUrl(null);
                    }
                } else {
                    setImagenUrl(null);
                }
            } catch (error) {
                // Si hay error (404 incluido), simplemente no mostrar imagen
                setImagenUrl(null);
            } finally {
                setLoading(false);
            }
        };

        cargarImagen();
    }, [productoId]);

    return { imagenUrl, loading };
};