import React, { useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Smartphone, Battery, Zap, Wrench, 
  Microscope, Shield, Clock, Truck, 
  MapPin, Phone, Mail, ChevronRight,
  CheckCircle, AlertCircle, Search, Star
} from "lucide-react";

// Componente para animación al hacer scroll
function AnimatedSection({ children, delay = 0 }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function ServicioTec() {
  const [trackId, setTrackId] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  const servicios = [
    { 
      id: 1,
      title: "Pantallas", 
      desc: "Cambio de cristales y paneles OLED con repuestos originales", 
      icon: <Smartphone size={32} />,
      price: "Desde S/ 89",
      warranty: "3 meses",
      time: "1-2 horas"
    },
    { 
      id: 2,
      title: "Baterías", 
      desc: "Celdas originales con máxima duración y seguridad certificada", 
      icon: <Battery size={32} />,
      price: "Desde S/ 69",
      warranty: "6 meses",
      time: "30-60 min"
    },
    { 
      id: 3,
      title: "Puerto de Carga", 
      desc: "Reparación de puertos Tipo-C, Lightning y Micro USB", 
      icon: <Zap size={32} />,
      price: "Desde S/ 49",
      warranty: "3 meses",
      time: "1 hora"
    },
    { 
      id: 4,
      title: "Software", 
      desc: "Flasheo, desbloqueo, eliminación de cuentas y optimización", 
      icon: <Wrench size={32} />,
      price: "Desde S/ 39",
      warranty: "30 días",
      time: "1-2 horas"
    },
    { 
      id: 5,
      title: "Cámara", 
      desc: "Reparación y reemplazo de cámaras frontales y traseras", 
      icon: <Microscope size={32} />,
      price: "Desde S/ 79",
      warranty: "3 meses",
      time: "1-2 horas"
    },
    { 
      id: 6,
      title: "Micrófono y Altavoz", 
      desc: "Reparación de problemas de audio y llamadas", 
      icon: <Phone size={32} />,
      price: "Desde S/ 45",
      warranty: "3 meses",
      time: "1 hora"
    }
  ];

  const garantias = [
    { icon: <Shield size={20} />, text: "Repuestos originales" },
    { icon: <Clock size={20} />, text: "Garantía hasta 6 meses" },
    { icon: <Truck size={20} />, text: "Recojo a domicilio" },
    { icon: <CheckCircle size={20} />, text: "Diagnóstico gratis" }
  ];

  const handleTracking = () => {
    if (trackId.trim()) {
      setShowTracking(true);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=2000" 
            alt="Reparación de celulares"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <motion.span 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Wrench size={16} className="text-[#5b4eff]" />
              Especialistas en reparación de celulares
            </motion.span>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Servicio Técnico <br />
              <span className="text-[#5b4eff]">Especializado</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Más de 5,000 reparaciones realizadas. Diagnóstico gratuito y 
              presupuesto sin compromiso. Repuestos originales y garantía.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button className="bg-[#5b4eff] hover:bg-[#4a3dcc] px-8 py-3 rounded-xl font-semibold transition shadow-lg">
                Solicitar presupuesto
              </button>
              <button className="border-2 border-white/30 hover:border-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition">
                WhatsApp: +51 997 863 112
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Catálogo de Servicios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nuestros <span className="text-[#5b4eff]">Servicios</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Reparaciones rápidas, confiables y con garantía
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio, idx) => (
              <ServiceCard key={servicio.id} servicio={servicio} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Garantías */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            {garantias.map((item, idx) => (
              <motion.div 
                key={idx}
                className="flex items-center justify-center gap-3 bg-white p-4 rounded-xl shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-[#5b4eff]">{item.icon}</div>
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios referenciales */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">¿Necesitas una reparación urgente?</h3>
              <p className="text-white/80 mt-2">Diagnóstico gratuito • Presupuesto sin compromiso</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-[#5b4eff] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition">
                WhatsApp
              </button>
              <button className="border-2 border-white/30 hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition">
                Llamar ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin size={24} className="text-[#5b4eff]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">Visítanos</h4>
              <p className="text-gray-500 text-sm">Amazonas, Písac 08106, Cusco</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock size={24} className="text-[#5b4eff]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">Horario</h4>
              <p className="text-gray-500 text-sm">Lun a Sab: 9am - 8pm</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Phone size={24} className="text-[#5b4eff]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">Contacto</h4>
              <p className="text-gray-500 text-sm">+51 997 863 112</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente ServiceCard
function ServiceCard({ servicio, delay }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div 
          className="w-14 h-14 bg-gradient-to-br from-[#5b4eff]/10 to-[#4a3dcc]/10 rounded-2xl flex items-center justify-center text-[#5b4eff]"
          animate={isHovered ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {servicio.icon}
        </motion.div>
        <div className="text-right">
          <p className="text-xs text-gray-400 line-through">Regular</p>
          <p className="text-lg font-bold text-[#5b4eff]">{servicio.price}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{servicio.title}</h3>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed">{servicio.desc}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          <span>{servicio.time}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Shield size={12} />
          <span>Garantía {servicio.warranty}</span>
        </div>
      </div>
      
      <motion.button 
        className="w-full mt-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-[#5b4eff] hover:text-white transition group-hover:shadow-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Solicitar presupuesto
      </motion.button>
    </motion.div>
  );
}