import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { servicioTecnicoService } from "../../services/api";

export default function ClienteServicioDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const data = await servicioTecnicoService.buscarPorId(id);
                setServicio(data);
            } catch (err) {
                console.error("Error:", err);
                setError("No se pudo cargar el detalle del servicio");
            } finally {
                setLoading(false);
            }
        };
        cargarDetalle();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b4eff] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Cargando detalle...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => navigate("/perfil")}
                        className="mt-4 px-6 py-2 bg-[#5b4eff] text-white rounded-lg"
                    >
                        Volver a Mi Perfil
                    </button>
                </div>
            </div>
        );
    }

    if (!servicio) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Servicio no encontrado</p>
                    <button
                        onClick={() => navigate("/perfil")}
                        className="mt-4 px-6 py-2 bg-[#5b4eff] text-white rounded-lg"
                    >
                        Volver a Mi Perfil
                    </button>
                </div>
            </div>
        );
    }

    const getEstadoColor = (estado) => {
        const colores = {
            REGISTRADO: "#6c757d",
            EN_REVISION: "#ffc107",
            EN_PROCESO: "#17a2b8",
            FINALIZADO: "#28a745",
            ENTREGADO: "#28a745"
        };
        return colores[estado] || "#6c757d";
    };

    const getEstadoTexto = (estado) => {
        const textos = {
            REGISTRADO: "Registrado",
            EN_REVISION: "En Revisión",
            EN_PROCESO: "En Proceso",
            FINALIZADO: "Finalizado",
            ENTREGADO: "Entregado"
        };
        return textos[estado] || estado;
    };

    return (
        <div className="min-h-screen bg-[#f4f7fe] py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate("/perfil")}
                    className="mb-6 text-[#5b4eff] font-bold hover:underline flex items-center gap-2"
                >
                    ← Volver a Mi Perfil
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#0d0c1e] to-[#1a1930]">
                        <h1 className="text-2xl font-black text-white">
                            Servicio Técnico #{servicio.id}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {new Date(servicio.fecha).toLocaleString()}
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-600">Estado:</span>
                            <span
                                className="px-4 py-2 rounded-full text-sm font-bold text-white"
                                style={{ backgroundColor: getEstadoColor(servicio.estado) }}
                            >
                                {getEstadoTexto(servicio.estado)}
                            </span>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-600 mb-2">Equipo:</h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                {servicio.equipo || "No especificado"}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-600 mb-2">Problema:</h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                {servicio.problema}
                            </p>
                        </div>

                        {servicio.diagnostico && (
                            <div>
                                <h3 className="font-bold text-gray-600 mb-2">Diagnóstico:</h3>
                                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                    {servicio.diagnostico}
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-600">Costo:</span>
                                <span className="text-2xl font-black text-[#5b4eff]">
                                    S/ {servicio.costo || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}