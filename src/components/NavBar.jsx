// components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Search from "../pages/search/Search";
import { useCarrito } from "../context/CarritoContext";
import NotificationBell from "./NotificationBell";

function NavBar({ searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const { itemsCount } = useCarrito();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("usuario");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (itemsCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemsCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUser(null);
    setShowUserMenu(false);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event("carrito-cambio-usuario"));
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const getProfilePath = () => {
    if (!user) return "/login";
    const role = user.rol?.toLowerCase();
    if (role === "admin" || role === "ventas" || role === "tecnico") {
      return "/dashboard";
    }
    return "/perfil";
  };

  const getRoleName = () => {
    if (!user) return "";
    const role = user.rol?.toLowerCase();
    const roles = {
      admin: "Administrador",
      ventas: "Vendedor",
      tecnico: "Técnico",
      cliente: "Cliente"
    };
    return roles[role] || "Cliente";
  };

  const navLinks = [
    { to: "/", label: "Tienda", exact: true },
    { to: "/nosotros", label: "Nosotros", exact: false },
    { to: "/servicioTec", label: "Servicios", exact: false }
  ];

  const CartIcon = () => (
    <Link
      to="/carrito"
      className="relative p-2.5 flex items-center justify-center rounded-full transition-all duration-200 group hover:bg-[#5b4eff]/8"
      aria-label="Carrito de compras"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-700 group-hover:text-[#5b4eff] transition-colors duration-200"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {itemsCount > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-black min-w-[19px] h-[19px] flex items-center justify-center rounded-full shadow-md shadow-red-500/30 ring-2 ring-white transition-all duration-300 px-1 ${
            animate ? "scale-125" : "scale-100"
          }`}
        >
          {itemsCount > 99 ? "99+" : itemsCount}
        </span>
      )}
    </Link>
  );

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className="h-20 md:h-24" />

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(13,12,30,0.08)] border-b border-gray-100/60"
            : "py-4 bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group flex items-center">
              <h1 className="relative text-3xl sm:text-4xl font-black tracking-tighter text-[#0d0c1e] italic transition-all duration-300 leading-none">
                <span className="relative inline-block">
                  Jimenez
                  <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-gradient-to-r from-[#5b4eff] to-[#8b7dff] rounded-full transition-all duration-500 group-hover:w-full"></span>
                </span>
                <span className="text-[#5b4eff] inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">.</span>
              </h1>
            </Link>

            {/* Search Desktop */}
            <div className="hidden md:block flex-grow max-w-2xl mx-auto">
              <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
              {/* 👇 NAV LINKS (Tienda, Nosotros, Servicios) - AGREGADO */}
              <div className="flex items-center gap-1 mr-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 lg:px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-full ${
                      isActive(link.to, link.exact)
                        ? "text-[#5b4eff] bg-[#5b4eff]/10"
                        : "text-gray-500 hover:text-[#5b4eff] hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <CartIcon />

              <div className="relative ml-2" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-10 h-10 bg-gradient-to-br from-[#0d0c1e] to-[#2a293e] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md shadow-[#0d0c1e]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[#5b4eff]/25 hover:scale-105 hover:ring-2 hover:ring-[#5b4eff]/30 hover:ring-offset-2 active:scale-95"
                      aria-label="Menú de usuario"
                    >
                      {getInitials(user.correo)}
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(13,12,30,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
                          <p className="text-[9px] font-black text-[#5b4eff] uppercase tracking-widest">
                            {getRoleName()}
                          </p>
                          <p className="text-sm font-bold text-[#0d0c1e] truncate mt-0.5">
                            {user.correo}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            to={getProfilePath()}
                            onClick={() => setShowUserMenu(false)}
                            className="group flex items-center w-full px-4 py-3 text-xs font-bold text-gray-700 hover:bg-[#5b4eff]/5 hover:text-[#5b4eff] transition-all duration-150"
                          >
                            <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#5b4eff]/10 flex items-center justify-center mr-3 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </span>
                            {user.rol === "ADMIN" ? "Panel de Control" : "Mi Perfil"}
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="group flex items-center w-full px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center mr-3 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </span>
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="bg-[#0d0c1e] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#5b4eff] transition-all duration-200 shadow-md shadow-[#0d0c1e]/20 hover:shadow-lg hover:shadow-[#5b4eff]/30 hover:scale-[1.03] active:scale-95"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <CartIcon />
              <button
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-gray-100 transition-colors z-50"
                aria-label="Abrir menú"
              >
                <span
                  className={`block w-5 h-0.5 bg-black rounded-full transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-black rounded-full transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-black rounded-full transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Search - Mobile */}
          {!isMenuOpen && (
            <div className="md:hidden mt-3">
              <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out translate-x-0 overflow-y-auto"
          >
            <div className="flex flex-col min-h-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black text-[#0d0c1e]">Menú</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-6 py-4 text-sm font-bold transition-colors ${
                      isActive(link.to, link.exact)
                        ? "text-[#5b4eff] bg-[#5b4eff]/5 border-r-4 border-[#5b4eff]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-gray-100 mt-auto">
                {user ? (
                  <>
                    <Link
                      to={getProfilePath()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center w-full py-4 mb-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {user.rol === "ADMIN" ? "Panel de Control" : "Mi Perfil"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full py-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full py-4 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        button:focus-visible {
          outline: 2px solid #5b4eff;
          outline-offset: 2px;
        }
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }
      `}</style>
    </>
  );
}

export default NavBar;