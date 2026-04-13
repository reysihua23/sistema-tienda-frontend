// App.jsx
import React, { useState,useEffect  } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CarritoProvider } from "./context/CarritoContext";
import { NotificationProvider } from "./context/NotificationContext";

// Componentes de navegación
import NavBar from "./components/Navbar";

// Páginas principales
import Tienda from "./pages/tienda/Tienda";
import Nosotros from "./pages/nosotros/Nosotros";
import ServicioTec from "./pages/servicioTec/ServicioTec";
import Carrito from "./pages/carrito/Carrito";
import MisPedidos from "./pages/pedidos/MisPedidos";
import PageNotFound from "./pages/pageNotFound/PageNotFound";
import AuthPage from "./pages/auth/AuthPage";
import Perfil from "./pages/perfil/Perfil";
import DashboardRouter from "./components/DashboardRouter";

// Paneles individuales
import Admin from "./pages/admin/Admin";
import Vendedor from "./pages/vendedor/Vendedor";
import Tecnico from "./pages/tecnico/Tecnico";
import Pago from "./pages/pago/Pago";

// Detalles
import ClientePedidoDetalle from "./pages/cliente/ClientePedidoDetalle";
import ClienteServicioDetalle from "./pages/cliente/ClienteServicioDetalle";

// Comprobante y legales
import Comprobante from "./pages/comprobante/Comprobante";
import TerminosCondiciones from "./pages/legal/TerminosCondiciones";
import PoliticasPrivacidad from "./pages/legal/PoliticasPrivacidad";
import RecuperarPassword from "./pages/auth/RecuperarPassword";
import Notificaciones from "./pages/notificaciones/Notificaciones";

const PAYPAL_CLIENT_ID = "Aeoc0QcGciCLKk4SQ51PjRq2hHaAeZghGSvvFqrtvTbs_pi0JChUC__wtAJULK36LvOBJADX9dFNGjJJ";
const paypalOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  components: "buttons",
  "enable-funding": "card,paylater",
  "disable-funding": "credit,giropay",
  "locale": "es_PE",
  "buyer-country": "PE"
};

// Componente interno que usa useLocation
function AppContent() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Rutas donde NO se muestra el NavBar
  const hideNavBar = location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/vendedor") ||
    location.pathname.startsWith("/mis-pedidos") ||
    location.pathname.startsWith("/perfil") ||
    location.pathname.startsWith("/terminos-condiciones") ||
    location.pathname.startsWith("/politicas-privacidad") ||
    location.pathname.startsWith("/tecnico") ||
    location.pathname.startsWith("/notificaciones");

  // Verificar si PayPal está disponible (sin process.env)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("PayPal Client ID configurado:", PAYPAL_CLIENT_ID.substring(0, 10) + "...");
      console.log("PayPal Options:", paypalOptions);
    }
  }, []);

  useEffect(() => {
    // Cerrar sesión cuando se cierra la ventana
    const handleBeforeUnload = () => {
      authService.logout();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      {!hideNavBar && (
        <NavBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      <Routes>
        {/* RUTA PRINCIPAL (HOME) */}
        <Route
          path="/"
          element={
            <Tienda
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          }
        />

        {/* RUTAS DE PANELES (para ADMIN, VENTAS, TECNICO) */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/vendedor" element={<Vendedor />} />
        <Route path="/tecnico" element={<Tecnico />} />

        {/* RUTAS PÚBLICAS Y DE CLIENTE */}
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/servicioTec" element={<ServicioTec />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/perfil" element={<Perfil />} />

        <Route path="/cliente/pedido/:id" element={<ClientePedidoDetalle />} />
        <Route path="/cliente/servicio/:id" element={<ClienteServicioDetalle />} />

        {/* RUTAS DEL CARRITO Y PEDIDOS */}
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/pago" element={<Pago />} />

        {/* RUTA DEL COMPROBANTE */}
        <Route path="/comprobante/:pedidoId" element={<Comprobante />} />

        {/* RUTAS LEGALES */}
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />

        {/* RUTA DE NOTIFICACIONES */}
        <Route path="/notificaciones" element={<Notificaciones />} />

        {/* CAPTURADOR DE ERRORES 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

// Componente principal
export default function App() {
  return (
    <Router>
      <PayPalScriptProvider options={paypalOptions}>
        <NotificationProvider>
          <CarritoProvider>
            <AppContent />
          </CarritoProvider>
        </NotificationProvider>
      </PayPalScriptProvider>
    </Router>
  );
}