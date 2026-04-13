import React from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Shield, Truck, Headphones, Award, Star, Clock, MapPin, CreditCard, Smartphone, Users, TrendingUp, CheckCircle, Zap, Package, ThumbsUp, Heart } from "lucide-react";

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

export default function Nosotros() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section con parallax y animación */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Fondo animado */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img
            src="https://images.unsplash.com/photo-1592899677977-9e10cb5889e2?auto=format&fit=crop&q=80&w=2000"
            alt="Celulares"
            className="w-full h-full object-cover opacity-10"
          />
        </motion.div>
        
        {/* Círculos decorativos animados */}
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-[#5b4eff]/20 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-[#4a3dcc]/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Smartphone size={16} className="text-[#5b4eff]" />
              Más de 5 años de experiencia
            </motion.span>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              En <span className="text-[#5b4eff]">Jimenez</span>,<br />
              tu <span className="bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] bg-clip-text text-transparent">próximo celular</span><br />
              te espera
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Somos una empresa peruana especializada en telefonía móvil.  
              Ofrecemos celulares originales, garantía y soporte técnico especializado.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button 
                className="bg-[#5b4eff] hover:bg-[#4a3dcc] px-8 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver catálogo
              </motion.button>
              <motion.button 
                className="border-2 border-white/30 hover:border-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contactar ventas
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Ola decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Estadísticas con animación de conteo */}
      <section className="border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <AnimatedStat number={15000} label="Clientes satisfechos" suffix="+" icon={<Users size={24} />} />
            <AnimatedStat number={20000} label="Celulares vendidos" suffix="+" icon={<Smartphone size={24} />} />
            <AnimatedStat number={5} label="Años de experiencia" suffix="+" icon={<Award size={24} />} />
            <AnimatedStat number={24} label="Soporte técnico" suffix="/7" icon={<Headphones size={24} />} />
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-8">
          <AnimatedSection delay={0.1}>
            <MissionCard 
              icon={<Star size={28} />}
              title="Nuestra Misión"
              text="Democratizar el acceso a la tecnología móvil de calidad, ofreciendo productos auténticos con asesoría honesta y servicio postventa excepcional."
              color="from-blue-500 to-blue-600"
            />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <MissionCard 
              icon={<TrendingUp size={28} />}
              title="Nuestra Visión"
              text="Ser la tienda de celulares más confiable del Perú, reconocida por transformar la experiencia de compra en algo cercano y transparente."
              color="from-purple-500 to-purple-600"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* Valores / Pilares */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <motion.div 
                className="inline-flex items-center gap-2 bg-[#5b4eff]/10 px-4 py-2 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Heart size={16} className="text-[#5b4eff]" />
                <span className="text-sm font-medium text-[#5b4eff]">Nuestros valores</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ¿Por qué <span className="text-[#5b4eff]">confiar</span> en nosotros?
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Cuatro principios que nos definen
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            <ValueCard icon={<Shield size={28} />} title="Originalidad" desc="Productos 100% garantizados" delay={0.1} />
            <ValueCard icon={<Truck size={28} />} title="Rapidez" desc="Envíos en 24-48 horas" delay={0.2} />
            <ValueCard icon={<Headphones size={28} />} title="Soporte" desc="Atención postventa" delay={0.3} />
            <ValueCard icon={<CreditCard size={28} />} title="Flexibilidad" desc="Paga como quieras" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <motion.div 
                className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-yellow-500">★★★★★</span>
                <span className="text-sm font-medium text-yellow-600">Opiniones reales</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Lo que dicen <span className="text-[#5b4eff]">nuestros clientes</span>
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Historias de personas que ya confían en Jimenez
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="María F."
              comment="Excelente atención, me ayudaron a elegir el celular perfecto para mí. Llegó antes de lo esperado."
              rating={5}
              delay={0.1}
            />
            <TestimonialCard 
              name="Javier R."
              comment="Muy buen servicio, me ayudaron a reparar las fallas de mi celular."
              rating={5}
              delay={0.2}
            />
            <TestimonialCard 
              name="Camila S."
              comment="Muy profesionales, resolvieron todas mis dudas antes de comprar. Recomiendo 100%."
              rating={5}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <motion.section 
        className="relative mx-6 mb-16 rounded-3xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592899677977-9e10cb5889e2?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="relative py-16 px-8 text-center text-white">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            ¿Listo para tu nuevo celular?
          </motion.h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Visítanos o contáctanos. Te ayudaremos a encontrar el equipo perfecto.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
              <MapPin size={18} /> Amazonas, Písac 08106- Cusco - Perú
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
              <Clock size={18} /> Lun a Sab: 9am - 8pm
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
              <Smartphone size={18} /> +51 997 863 112
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// Componente con animación de conteo
function AnimatedStat({ number, label, suffix, icon }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const step = number / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= number) {
          setCount(number);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, number]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <motion.div 
        className="w-12 h-12 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-[#5b4eff]"
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <p className="text-3xl md:text-4xl font-bold text-gray-900">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </motion.div>
  );
}

// Componente Misión/Visión
function MissionCard({ icon, title, text, color }) {
  return (
    <motion.div 
      className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="w-14 h-14 bg-gradient-to-br from-[#5b4eff]/10 to-[#4a3dcc]/10 rounded-2xl flex items-center justify-center mb-5 text-[#5b4eff]"
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </motion.div>
  );
}

// Componente Valor
function ValueCard({ icon, title, desc, delay }) {
  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <motion.div 
        className="w-16 h-16 bg-gradient-to-br from-[#5b4eff]/10 to-[#4a3dcc]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#5b4eff]"
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </motion.div>
  );
}

// Componente Testimonio
function TestimonialCard({ name, comment, rating, delay }) {
  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="w-10 h-10 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] rounded-full flex items-center justify-center text-white font-bold"
          whileHover={{ scale: 1.1 }}
        >
          {name.charAt(0)}
        </motion.div>
        <div>
          <h4 className="font-bold text-gray-800">{name}</h4>
          <div className="flex gap-0.5 text-yellow-400 text-xs">
            {"★".repeat(rating)}
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">"{comment}"</p>
    </motion.div>
  );
}