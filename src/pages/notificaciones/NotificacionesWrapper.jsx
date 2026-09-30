// pages/notificaciones/NotificacionesWrapper.jsx
import React from 'react';
import { authService } from '../../services/api';
import Admin from '../admin/Admin';
import Vendedor from '../vendedor/Vendedor';
import Tecnico from '../tecnico/Tecnico';
import Perfil from '../perfil/Perfil';
import Notificaciones from './Notificaciones';

export default function NotificacionesWrapper() {
    const user = authService.getCurrentUser();
    const rol = user?.rol;

    const contenido = <Notificaciones />;

    if (rol === 'ADMIN') {
        return <Admin childrenOverride={contenido} />;
    }
    if (rol === 'VENTAS') {
        return <Vendedor childrenOverride={contenido} />;
    }
    if (rol === 'TECNICO') {
        return <Tecnico childrenOverride={contenido} />;
    }
    if (rol === 'CLIENTE' || rol === 'USER' || !rol) {
        return <Perfil childrenOverride={contenido} />;
    }

    return <Notificaciones />;
}