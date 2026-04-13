import React from "react";
import { Navigate } from "react-router-dom";
import Admin from "../pages/admin/Admin";
import Vendedor from "../pages/vendedor/Vendedor";
import Tecnico from "../pages/tecnico/Tecnico";

export default function DashboardRouter() {
    const userJson = localStorage.getItem("usuario");
    
    console.log("=== DashboardRouter ===");
    console.log("userJson:", userJson);
    
    if (!userJson) {
        console.log("No hay usuario, redirigiendo a login");
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userJson);
    console.log("Usuario parseado:", user);
    console.log("Rol del usuario:", user.rol);
    console.log("Rol en minúsculas:", user.rol?.toLowerCase());

    if (!user.rol) {
        console.log("No tiene rol, redirigiendo a login");
        return <Navigate to="/login" replace />;
    }

    switch (user.rol.toLowerCase()) {
        case 'admin':
            console.log("✅ Renderizando Admin");
            return <Admin user={user} />;
        
        case 'ventas':
            console.log("✅ Renderizando Vendedor");
            return <Vendedor user={user} />;
        
        case 'tecnico':
            console.log("✅ Renderizando Tecnico");
            return <Tecnico user={user} />;
        
        default:
            console.log("Rol no reconocido:", user.rol);
            return <Navigate to="/perfil" replace />;
    }
}