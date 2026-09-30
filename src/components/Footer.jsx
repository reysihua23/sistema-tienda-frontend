ç// components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    Facebook,
    Instagram,
    MessageCircle,
    CreditCard,
    ShieldCheck
} from "lucide-react";

// 🎯 Datos de la empresa (sincronizar con backend - ComprobanteServiceImpl)
const EMPRESA = {
    nombre: "JIMENEZ",
    ruc: "20601234567",
    direccion: "Amazonas, Písac 08106 - Cusco - Perú",
    telefono: "997 863 112",
    email: "soporte@jimenez.com",
};

export default function Footer() {
    const anioActual = new Date().getFullYear();

    return (
        <footer className="bg-[#0d0c1e] text-gray-300 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Grid principal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

                    {/* Col 1: Logo + descripción */}
                    <div>
                        <Link to="/" className="inline-block mb-4">
                            <h3 className="text-3xl font-black italic text-white">
                                Jimenez<span className="text-[#5b4eff]">.</span>
                            </h3>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Tu tienda de tecnología de confianza. Productos
                            originales, servicio técnico especializado y
                            atención personalizada.
                        </p>

                        <div className="flex items-center gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                               aria-label="Facebook"
                               className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#5b4eff] hover:text-white transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                               aria-label="Instagram"
                               className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#5b4eff] hover:text-white transition-all">
                                <Instagram size={16} />
                            </a>
                            <a href="https://wa.me/51997863112" target="_blank" rel="noopener noreferrer"
                               aria-label="WhatsApp"
                               className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#5b4eff] hover:text-white transition-all">
                                <MessageCircle size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Col 2: Tienda */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                            Tienda
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="text-gray-400 hover:text-[#5b4eff] transition-colors">Inicio</Link></li>
                            <li><Link to="/nosotros" className="text-gray-400 hover:text-[#5b4eff] transition-colors">Nosotros</Link></li>
                            <li><Link to="/servicioTec" className="text-gray-400 hover:text-[#5b4eff] transition-colors">Servicio Técnico</Link></li>
                            <li><Link to="/carrito" className="text-gray-400 hover:text-[#5b4eff] transition-colors">Carrito</Link></li>
                        </ul>
                    </div>

                    {/* Col 3: Ayuda */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                            Ayuda
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/mis-pedidos" className="text-gray-400 hover:text-[#5b4eff] transition-colors">
                                    Mis Pedidos
                                </Link>
                            </li>
                            <li>
                                <Link to="/servicioTec" className="text-gray-400 hover:text-[#5b4eff] transition-colors">
                                    Soporte Técnico
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                            Legal
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/terminos-condiciones" className="text-gray-400 hover:text-[#5b4eff] transition-colors">
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link to="/politicas-privacidad" className="text-gray-400 hover:text-[#5b4eff] transition-colors">
                                    Política de Privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contacto */}
                <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-[#5b4eff] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white font-semibold text-xs uppercase tracking-wider mb-1">Dirección</p>
                            <p className="text-gray-400">{EMPRESA.direccion}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone size={18} className="text-[#5b4eff] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white font-semibold text-xs uppercase tracking-wider mb-1">Teléfono</p>
                            <a href={`tel:+51${EMPRESA.telefono.replace(/\s/g, "")}`}
                               className="text-gray-400 hover:text-[#5b4eff] transition">
                                {EMPRESA.telefono}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail size={18} className="text-[#5b4eff] flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white font-semibold text-xs uppercase tracking-wider mb-1">Email</p>
                            <a href={`mailto:${EMPRESA.email}`}
                               className="text-gray-400 hover:text-[#5b4eff] transition">
                                {EMPRESA.email}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <CreditCard size={14} className="text-[#5b4eff]" />
                            Aceptamos:
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">VISA</span>
                            <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">MC</span>
                            <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">YAPE</span>
                            <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">PLIN</span>
                        </div>
                    </div>

                    <div className="text-center sm:text-right text-xs text-gray-500">
                        <p className="flex items-center justify-center sm:justify-end gap-1.5">
                            <ShieldCheck size={12} className="text-[#5b4eff]" />
                            RUC: {EMPRESA.ruc}
                        </p>
                        <p className="mt-1">
                            © {anioActual} {EMPRESA.nombre}. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}