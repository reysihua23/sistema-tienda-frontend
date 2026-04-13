// pages/tecnico/hooks/useServicios.js
import { useState, useEffect, useCallback } from "react";
import { servicioTecnicoService } from "../../../services/api";

export const useServicios = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        estado: "todos",
        clienteId: null,
        fechaInicio: null,
        fechaFin: null
    });

    const cargarServicios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (filtros.estado !== "todos") {
                data = await servicioTecnicoService.buscarPorEstado(filtros.estado);
            } else if (filtros.clienteId) {
                data = await servicioTecnicoService.buscarPorCliente(filtros.clienteId);
            } else {
                data = await servicioTecnicoService.listar();
            }
            
            let filteredData = Array.isArray(data) ? data : [];
            
            if (filtros.fechaInicio) {
                filteredData = filteredData.filter(s => new Date(s.fecha) >= new Date(filtros.fechaInicio));
            }
            if (filtros.fechaFin) {
                filteredData = filteredData.filter(s => new Date(s.fecha) <= new Date(filtros.fechaFin));
            }
            
            setServicios(filteredData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        } catch (error) {
            console.error("Error cargando servicios:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    useEffect(() => {
        cargarServicios();
    }, [cargarServicios]);

    const actualizarFiltros = (nuevosFiltros) => {
        setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            estado: "todos",
            clienteId: null,
            fechaInicio: null,
            fechaFin: null
        });
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            const response = await servicioTecnicoService.cambiarEstado(id, nuevoEstado);
            await cargarServicios();
            return response;
        } catch (error) {
            console.error("Error cambiando estado:", error);
            throw error;
        }
    };

    const agregarDiagnostico = async (id, diagnostico, costo) => {
        try {
            const response = await servicioTecnicoService.agregarDiagnostico(id, diagnostico, costo);
            await cargarServicios();
            return response;
        } catch (error) {
            console.error("Error agregando diagnóstico:", error);
            throw error;
        }
    };

    const crearServicio = async (servicioData) => {
        try {
            const response = await servicioTecnicoService.crear(servicioData);
            await cargarServicios();
            return response;
        } catch (error) {
            console.error("Error creando servicio:", error);
            throw error;
        }
    };

    return {
        servicios,
        loading,
        error,
        filtros,
        actualizarFiltros,
        limpiarFiltros,
        cargarServicios,
        cambiarEstado,
        agregarDiagnostico,
        crearServicio
    };
};