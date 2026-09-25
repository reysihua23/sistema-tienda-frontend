// pages/notificaciones/NotificacionesWrapper.jsx
import React from 'react';
import { authService } from '../../services/api';
import Admin from '../admin/Admin';
import Vendedor from '../vendedor/Vendedor';
import Tecnico from '../tecnico/Tecnico';
import Notificaciones from './Notificaciones';

/**
 * 🎯 Envuelve Notificaciones en el layout del rol correspondiente.
 * - ADMIN → dentro del panel Admin (con tabs)
 * - VENDEDOR → dentro del panel Vendedor (con tabs)
 * - TECNICO → dentro del panel Técnico (con tabs)
 * - CLIENTE → página independiente con NavBar
 */
export default function NotificacionesWrapper() {
    const user = authService.getCurrentUser();
    const rol = user?.rol;

    // 🎯 Contenido de notificaciones que se pasa al layout del rol
    const contenido = <Notificaciones />;

    if (rol === 'ADMIN') {
        return <Admin childrenOverride={contenido} />;
    }
    if (rol === 'VENDEDOR') {
        return <Vendedor childrenOverride={contenido} />;
    }
    if (rol === 'TECNICO') {
        return <Tecnico childrenOverride={contenido} />;
    }

    // Cliente → renderiza la página sola con NavBar
    return <Notificaciones />;
}