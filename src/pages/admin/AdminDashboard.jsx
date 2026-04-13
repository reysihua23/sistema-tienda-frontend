// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Package, Users, ShoppingBag, DollarSign, Clock, AlertTriangle,
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

// Componente de tarjeta de métrica
const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick, loading }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer group ${onClick ? 'hover:border-[#5b4eff]' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        )}
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        {trend !== undefined && trend !== null && trend !== 0 && (
          <div className={`flex items-center gap-0.5 mt-1 text-[10px] ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
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

// Componente de gráfico de barras para ventas diarias - CORREGIDO
const DailySalesChart = ({ data, loading }) => {
  const maxValue = Math.max(...data.map(d => d.total), 1);
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-[#5b4eff]" />
          <h3 className="font-semibold text-gray-800 text-xs">Ventas Diarias</h3>
        </div>
        <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
          Total: S/ {data.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
        </span>
      </div>
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff]"></div>
        </div>
      ) : (
        <div className="h-32 flex items-end gap-1">
          {data.map((item, idx) => {
            const height = item.total > 0 ? (item.total / maxValue) * 80 : 4;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-[#5b4eff] to-[#4a3dcc] rounded-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(height, 4)}px`, minHeight: '4px' }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -mt-6 text-center pointer-events-none">
                      <span className="bg-gray-800 text-white text-[8px] rounded px-1 py-0.5 whitespace-nowrap">
                        S/ {item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[8px] text-gray-500">{diasSemana[item.diaSemana]}</span>
                <span className="text-[6px] text-gray-400">{item.dia}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Componente de gráfico de barras para ventas mensuales - CORREGIDO
const MonthlySalesChart = ({ data, loading }) => {
  const maxValue = Math.max(...data.map(d => d.total), 1);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-emerald-500" />
          <h3 className="font-semibold text-gray-800 text-xs">Ventas Mensuales</h3>
        </div>
        <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
          Total: S/ {data.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
        </span>
      </div>
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="h-32 flex items-end gap-1">
          {data.map((item, idx) => {
            const height = item.total > 0 ? (item.total / maxValue) * 80 : 4;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-400 to-emerald-600 rounded-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(height, 4)}px`, minHeight: '4px' }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -mt-6 text-center pointer-events-none">
                      <span className="bg-gray-800 text-white text-[8px] rounded px-1 py-0.5 whitespace-nowrap">
                        S/ {item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[8px] text-gray-500">{meses[item.mes - 1]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Componente de donut chart para distribución
const DonutChart = ({ data, title, loading }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ["#5b4eff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <PieChart size={14} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs">{title}</h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff]"></div>
        </div>
      </div>
    );
  }
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <PieChart size={14} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs">{title}</h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-400 text-[10px]">No hay datos disponibles</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <PieChart size={14} className="text-gray-400" />
        <h3 className="font-semibold text-gray-800 text-xs">{title}</h3>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
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
                const x1 = 50 + 32 * Math.cos(startRad);
                const y1 = 50 + 32 * Math.sin(startRad);
                const x2 = 50 + 32 * Math.cos(endRad);
                const y2 = 50 + 32 * Math.sin(endRad);
                const largeArc = angle > 180 ? 1 : 0;
                
                return (
                  <path
                    key={idx}
                    d={`M 50 50 L ${x1} ${y1} A 32 32 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[idx % colors.length]}
                    className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  />
                );
              });
            })()}
            <circle cx="50" cy="50" r="20" fill="white" />
          </svg>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-1">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
              <span className="text-[9px] text-gray-600 truncate">{item.label}:</span>
              <span className="text-[9px] font-semibold text-gray-800 ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente de productos más vendidos
const TopProducts = ({ products, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Package size={12} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs">Top Productos</h3>
        </div>
        <Eye size={10} className="text-gray-400" />
      </div>
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff] mx-auto"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-[10px]">
          <p>No hay datos de productos</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {products.map((producto, idx) => (
            <div key={idx} className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-[10px] truncate max-w-[100px]">{producto.nombre}</p>
                  <p className="text-[8px] text-gray-400">Stock: {producto.stock || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#5b4eff] text-[10px]">{producto.totalVendido} ventas</p>
                <p className="text-[8px] text-gray-400">S/ {producto.totalIngresos?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de actividades recientes
const RecentActivities = ({ activities, loading }) => {
  const getActivityIcon = (tipo) => {
    switch(tipo) {
      case 'PEDIDO': return <ShoppingBag size={10} />;
      case 'PRODUCTO': return <Package size={10} />;
      case 'USUARIO': return <Users size={10} />;
      default: return <Eye size={10} />;
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
      <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-xs">Actividades Recientes</h3>
        </div>
        <ChevronRight size={10} className="text-gray-400" />
      </div>
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5b4eff] mx-auto"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-[10px]">
          <p>No hay actividades recientes</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activities.map((activity, idx) => (
            <div key={idx} className="px-3 py-2 hover:bg-gray-50 transition flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getActivityColor(activity.tipo)}`}>
                {getActivityIcon(activity.tipo)}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-medium text-gray-800 truncate">{activity.descripcion}</p>
                <p className="text-[8px] text-gray-400">{activity.tiempo}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
      
      // Ventas diarias
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
      
      // Ventas mensuales
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
      
      // Tendencia
      const mesActual = ventasPorMes[ventasPorMes.length - 1]?.total || 0;
      const mesAnterior = ventasPorMes[ventasPorMes.length - 2]?.total || 0;
      const tendencia = mesAnterior > 0 ? ((mesActual - mesAnterior) / mesAnterior) * 100 : 0;
      setTendenciaMensual(tendencia);
      
      // Servicios por estado
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
      
      // Productos más vendidos
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
      
      // Ventas por origen
      const presencial = pedidosVenta.filter(p => p.origen === "TIENDA_FISICA").reduce((sum, p) => sum + (p.total || 0), 0);
      const online = pedidosVenta.filter(p => p.origen !== "TIENDA_FISICA").reduce((sum, p) => sum + (p.total || 0), 0);
      setVentasPorOrigen({ presencial, online });
      
      // Actividades recientes
      const actividades = pedidosArray
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)
        .map(p => ({ tipo: "PEDIDO", descripcion: `Pedido #${p.id}`, tiempo: formatTiempo(p.fecha) }));
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
        <MetricCard title="Ventas" value={formatCurrency(stats.ventasTotales)} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" trend={tendenciaMensual} loading={loading} />
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
                <p className="text-[8px] opacity-90">Ventas Presenciales</p>
                <p className="text-sm font-bold mt-0.5">{formatCurrency(ventasPorOrigen.presencial)}</p>
                <p className="text-[7px] opacity-80 mt-0.5">
                  {stats.ventasTotales > 0 ? ((ventasPorOrigen.presencial / stats.ventasTotales) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Store size={24} className="opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] opacity-90">Ventas Online</p>
                <p className="text-sm font-bold mt-0.5">{formatCurrency(ventasPorOrigen.online)}</p>
                <p className="text-[7px] opacity-80 mt-0.5">
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
      <div className="text-center text-[8px] text-gray-400 pt-2 border-t border-gray-200">
        <p>Última actualización: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}