// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Package, Users, ShoppingBag, Coins, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Calendar, RefreshCw,
  Truck, CreditCard, Store, Eye, ChevronRight, BarChart3, PieChart
} from "lucide-react";
import { 
  pedidoService, 
  productoService, 
  usuarioService, 
  servicioTecnicoService,
  stockService,
  detallePedidoService
} from "../../services/api";

// ═════════════════════════════════════════════════════════════
// Tarjeta de métrica
// ═════════════════════════════════════════════════════════════
const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick, loading }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer group ${onClick ? 'hover:border-[#5b4eff]' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{value}</p>
        )}
        {subtitle && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend !== undefined && trend !== null && trend !== 0 && (
          <div className={`flex items-center gap-0.5 mt-1 text-[10px] sm:text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════
// Ventas Diarias
// ═════════════════════════════════════════════════════════════
const DailySalesChart = ({ data, loading }) => {
  const maxValue = Math.max(...data.map(d => d.total), 1);
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-[#5b4eff]" />
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Ventas Diarias</h3>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
          Total: S/ {data.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
        </span>
      </div>
      {loading ? (
        <div className="h-40 sm:h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff]"></div>
        </div>
      ) : (
        <div className="h-40 sm:h-48 flex items-end gap-1 sm:gap-2">
          {data.map((item, idx) => {
            const height = item.total > 0 ? (item.total / maxValue) * 90 : 6;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 absolute -top-9 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <span className="bg-gray-800 text-white text-xs sm:text-sm font-semibold rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      S/ {item.total.toFixed(2)}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-[#5b4eff] to-[#4a3dcc] rounded-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(height, 6)}px`, minHeight: '6px' }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">{diasSemana[item.diaSemana]}</span>
                <span className="text-[8px] sm:text-[10px] text-gray-400">{item.dia}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Ventas Mensuales
// ═════════════════════════════════════════════════════════════
const MonthlySalesChart = ({ data, loading }) => {
  const maxValue = Math.max(...data.map(d => d.total), 1);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-emerald-500" />
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Ventas Mensuales</h3>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
          Total: S/ {data.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
        </span>
      </div>
      {loading ? (
        <div className="h-40 sm:h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="h-40 sm:h-48 flex items-end gap-1 sm:gap-2">
          {data.map((item, idx) => {
            const height = item.total > 0 ? (item.total / maxValue) * 90 : 6;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex flex-col items-center">
                  <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 absolute -top-9 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <span className="bg-gray-800 text-white text-xs sm:text-sm font-semibold rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      S/ {item.total.toFixed(2)}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-400 to-emerald-600 rounded-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(height, 6)}px`, minHeight: '6px' }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">{meses[item.mes - 1]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Donut Chart — REDISEÑADO
// ═════════════════════════════════════════════════════════════
const DonutChart = ({ data, title, loading }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ["#5b4eff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <PieChart size={14} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">{title}</h3>
        </div>
        <div className="h-40 sm:h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff]"></div>
        </div>
      </div>
    );
  }
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <PieChart size={14} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">{title}</h3>
        </div>
        <div className="h-40 sm:h-48 flex items-center justify-center">
          <p className="text-gray-400 text-xs sm:text-sm">No hay datos disponibles</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <PieChart size={14} className="text-gray-400" />
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">{title}</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Donut */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
            {(() => {
              let currentAngle = 0;
              return data.map((item, idx) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = startAngle + angle;
                currentAngle = endAngle;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);
                const largeArc = angle > 180 ? 1 : 0;
                
                return (
                  <path
                    key={idx}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[idx % colors.length]}
                    className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  />
                );
              });
            })()}
            <circle cx="50" cy="50" r="25" fill="white" />
            {/* Total en el centro */}
            <text 
              x="50" 
              y="48" 
              textAnchor="middle" 
              className="fill-gray-800 font-bold"
              style={{ fontSize: '12px' }}
              transform="rotate(90 50 50)"
            >
              {total}
            </text>
            <text 
              x="50" 
              y="58" 
              textAnchor="middle" 
              className="fill-gray-400"
              style={{ fontSize: '6px' }}
              transform="rotate(90 50 50)"
            >
              total
            </text>
          </svg>
        </div>
        
        {/* Leyenda con números pegados */}
        <div className="flex-1 w-full space-y-1.5 sm:space-y-2">
          {data.map((item, idx) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <div 
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: colors[idx % colors.length] }} 
                />
                <span className="text-gray-600 truncate">{item.label}</span>
                <span className="text-[10px] sm:text-xs text-gray-400 ml-auto mr-2">
                  {percentage}%
                </span>
                <span className="font-bold text-gray-800 min-w-[20px] text-right">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Top Productos
// ═════════════════════════════════════════════════════════════
const TopProducts = ({ products, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Package size={14} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Top Productos</h3>
        </div>
        <Eye size={12} className="text-gray-400" />
      </div>
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff] mx-auto"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>No hay datos de productos</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {products.map((producto, idx) => (
            <div 
              key={idx} 
              className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-gray-50 transition gap-2"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-600 flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                    {producto.nombre}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Stock: {producto.stock || 0}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#5b4eff] text-xs sm:text-sm">
                  {producto.totalVendido} ventas
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  S/ {producto.totalIngresos?.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Actividades Recientes
// ═════════════════════════════════════════════════════════════
const RecentActivities = ({ activities, loading }) => {
  const getActivityIcon = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return <ShoppingBag size={12} />;
      case 'PRODUCTO': return <Package size={12} />;
      case 'USUARIO': return <Users size={12} />;
      default: return <Eye size={12} />;
    }
  };
  
  const getActivityColor = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return 'bg-amber-100 text-amber-600';
      case 'PRODUCTO': return 'bg-green-100 text-green-600';
      case 'USUARIO': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Actividades Recientes</h3>
        </div>
        <ChevronRight size={12} className="text-gray-400" />
      </div>
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff] mx-auto"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>No hay actividades recientes</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activities.map((activity, idx) => (
            <div 
              key={idx} 
              className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition flex items-center gap-2 sm:gap-3"
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.tipo)}`}>
                {getActivityIcon(activity.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                  {activity.descripcion}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {activity.tiempo}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Componente principal
// ═════════════════════════════════════════════════════════════
export default function AdminDashboard({ stats, user, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [serviciosPorEstado, setServiciosPorEstado] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [ventasPorOrigen, setVentasPorOrigen] = useState({ presencial: 0, online: 0 });
  const [fechaActual, setFechaActual] = useState(new Date());
  const [tendenciaMensual, setTendenciaMensual] = useState(0);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    try {
      const pedidos = await pedidoService.listar();
      const pedidosArray = Array.isArray(pedidos) ? pedidos : [];
      const pedidosVenta = pedidosArray.filter(p => p.estado === "PAGADO" || p.estado === "ENTREGADO");
      
      const hoy = new Date();
      const ultimos7Dias = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        fecha.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        
        const ventasDia = pedidosVenta
          .filter(p => {
            const fechaPedido = new Date(p.fecha);
            return fechaPedido >= fecha && fechaPedido <= fechaFin;
          })
          .reduce((sum, p) => sum + (p.total || 0), 0);
        
        ultimos7Dias.push({
          fecha: fecha.toISOString().split('T')[0],
          dia: fecha.getDate(),
          diaSemana: fecha.getDay(),
          total: ventasDia
        });
      }
      setVentasDiarias(ultimos7Dias);
      
      const ventasPorMes = [];
      for (let i = 11; i >= 0; i--) {
        const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 1);
        
        const ventasMes = pedidosVenta
          .filter(p => {
            const fechaPedido = new Date(p.fecha);
            return fechaPedido >= fechaInicio && fechaPedido < fechaFin;
          })
          .reduce((sum, p) => sum + (p.total || 0), 0);
        
        ventasPorMes.push({
          mes: fechaInicio.getMonth() + 1,
          año: fechaInicio.getFullYear(),
          total: ventasMes
        });
      }
      setVentasMensuales(ventasPorMes);
      
      const mesActual = ventasPorMes[ventasPorMes.length - 1]?.total || 0;
      const mesAnterior = ventasPorMes[ventasPorMes.length - 2]?.total || 0;
      const tendencia = mesAnterior > 0 ? ((mesActual - mesAnterior) / mesAnterior) * 100 : 0;
      setTendenciaMensual(tendencia);
      
      try {
        const servicios = await servicioTecnicoService.listar();
        const serviciosArray = Array.isArray(servicios) ? servicios : [];
        const completados = serviciosArray.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length;
        const enProceso = serviciosArray.filter(s => s.estado === "EN_PROCESO").length;
        const enRevision = serviciosArray.filter(s => s.estado === "EN_REVISION").length;
        const recibidos = serviciosArray.filter(s => s.estado === "RECIBIDO").length;
        setServiciosPorEstado([
          { label: "Completados", value: completados },
          { label: "En Proceso", value: enProceso },
          { label: "En Revisión", value: enRevision },
          { label: "Recibidos", value: recibidos }
        ]);
      } catch (error) {
        setServiciosPorEstado([]);
      }
      
      const ventasPorProducto = new Map();
      for (const pedido of pedidosVenta) {
        try {
          const detalles = await detallePedidoService.buscarPorPedido(pedido.id);
          if (Array.isArray(detalles)) {
            detalles.forEach(detalle => {
              const productoId = detalle.productoId;
              const cantidad = detalle.cantidad || 1;
              const subtotal = detalle.subtotal || (detalle.precio * cantidad);
              
              if (!ventasPorProducto.has(productoId)) {
                ventasPorProducto.set(productoId, {
                  nombre: detalle.productoNombre || `Producto #${productoId}`,
                  cantidad: 0,
                  ingresos: 0
                });
              }
              const prod = ventasPorProducto.get(productoId);
              prod.cantidad += cantidad;
              prod.ingresos += subtotal;
            });
          }
        } catch (error) {}
      }
      
      const productosTopArray = Array.from(ventasPorProducto.entries())
        .map(([id, data]) => ({ id, nombre: data.nombre, totalVendido: data.cantidad, totalIngresos: data.ingresos, stock: 0 }))
        .sort((a, b) => b.totalVendido - a.totalVendido)
        .slice(0, 5);
      setProductosTop(productosTopArray);
      
      const presencial = pedidosVenta.filter(p => p.origen === "TIENDA_FISICA").reduce((sum, p) => sum + (p.total || 0), 0);
      const online = pedidosVenta.filter(p => p.origen !== "TIENDA_FISICA").reduce((sum, p) => sum + (p.total || 0), 0);
      setVentasPorOrigen({ presencial, online });
      
      const actividades = pedidosArray
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)
        .map(p => ({ tipo: "PEDIDO", descripcion: `Pedido Nº ${p.id}`, tiempo: formatTiempo(p.fecha) }));
      setActividadesRecientes(actividades);
      
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTiempo = (fecha) => {
    const diff = new Date() - new Date(fecha);
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    
    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `${minutos} min`;
    if (horas < 24) return `${horas} h`;
    return `${dias} d`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            ¡Bienvenido, {user?.nombre || user?.correo?.split('@')[0]}!
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Resumen completo de tu negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">
              {fechaActual.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <button
            onClick={() => { cargarDatosDashboard(); onRefresh?.(); }}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard title="Productos" value={stats.totalProductos} icon={Package} color="bg-gradient-to-br from-blue-500 to-blue-600" loading={loading} />
        <MetricCard title="Usuarios" value={stats.totalUsuarios} icon={Users} color="bg-gradient-to-br from-purple-500 to-purple-600" loading={loading} />
        <MetricCard title="Pedidos" value={stats.totalPedidos} icon={ShoppingBag} color="bg-gradient-to-br from-cyan-500 to-cyan-600" loading={loading} />
        <MetricCard title="Ventas" value={formatCurrency(stats.ventasTotales)} icon={Coins} color="bg-gradient-to-br from-emerald-500 to-emerald-600" trend={tendenciaMensual} loading={loading} />
        <MetricCard title="Pendientes" value={stats.pedidosPendientes} icon={Clock} color="bg-gradient-to-br from-amber-500 to-amber-600" subtitle="Por procesar" loading={loading} />
        <MetricCard title="Stock Bajo" value={stats.stockBajo} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-red-600" subtitle="Requieren atención" loading={loading} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailySalesChart data={ventasDiarias} loading={loading} />
        <MonthlySalesChart data={ventasMensuales} loading={loading} />
      </div>

      {/* Análisis adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutChart data={serviciosPorEstado} title="Servicios Técnicos" loading={loading} />
        <TopProducts products={productosTop} loading={loading} />
      </div>

      {/* Ventas por origen y actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs opacity-90">Ventas Presenciales</p>
                <p className="text-sm sm:text-base font-bold mt-0.5">{formatCurrency(ventasPorOrigen.presencial)}</p>
                <p className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">
                  {stats.ventasTotales > 0 ? ((ventasPorOrigen.presencial / stats.ventasTotales) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Store size={24} className="opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs opacity-90">Ventas Online</p>
                <p className="text-sm sm:text-base font-bold mt-0.5">{formatCurrency(ventasPorOrigen.online)}</p>
                <p className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">
                  {stats.ventasTotales > 0 ? ((ventasPorOrigen.online / stats.ventasTotales) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <CreditCard size={24} className="opacity-50" />
            </div>
          </div>
        </div>
        <RecentActivities activities={actividadesRecientes} loading={loading} />
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] sm:text-xs text-gray-400 pt-2 border-t border-gray-200">
        <p>Última actualización: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}