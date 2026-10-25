// pages/admin/components/Reportes.jsx
import React, { useState, useEffect } from "react";
import { 
  pedidoService, 
  servicioTecnicoService, 
  devolucionService 
} from "../../../services/api";
import { 
  FileText, 
  FileSpreadsheet, 
  Filter,
  RefreshCw,
  Package,
  Wrench,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Shield,
  Database,
  Server,
  WifiOff,
  Download
} from "lucide-react";

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState("ventas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({
    total: 0,
    totalIngresos: 0,
    completados: 0,
    pendientes: 0,
    porcentajeEficiencia: 0
  });
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);

  // Opciones de estado según el tipo de reporte
  const getEstadosDisponibles = () => {
    if (tipoReporte === "ventas") {
      return [
        { value: "todos", label: "Todos" },
        { value: "PENDIENTE", label: "Pendiente" },
        { value: "PAGADO", label: "Pagado" },
        { value: "ENVIADO", label: "Enviado" },
        { value: "ENTREGADO", label: "Entregado" },
        { value: "CANCELADO", label: "Cancelado" }
      ];
    } else if (tipoReporte === "servicios") {
      return [
        { value: "todos", label: "Todos" },
        { value: "RECIBIDO", label: "Recibido" },
        { value: "EN_REVISION", label: "En Revisión" },
        { value: "EN_PROCESO", label: "En Proceso" },
        { value: "FINALIZADO", label: "Finalizado" },
        { value: "ENTREGADO", label: "Entregado" }
      ];
    } else {
      return [
        { value: "todos", label: "Todos" },
        { value: "PENDIENTE", label: "Pendiente" },
        { value: "EN_PROCESO", label: "En Proceso" },
        { value: "PROCESADA", label: "Procesada" },
        { value: "RECHAZADA", label: "Rechazada" }
      ];
    }
  };

  const cargarReporte = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorType("auth");
        setError("No hay sesión activa. Por favor, inicia sesión nuevamente.");
        setLoading(false);
        return;
      }
      
      let response = [];
      
      if (tipoReporte === "ventas") {
        const pedidos = await pedidoService.listar();
        response = Array.isArray(pedidos) ? pedidos : [];
        
        if (filtroEstado !== "todos") {
          response = response.filter(p => p.estado === filtroEstado);
        }
        if (fechaInicio) {
          response = response.filter(p => new Date(p.fecha) >= new Date(fechaInicio));
        }
        if (fechaFin) {
          response = response.filter(p => new Date(p.fecha) <= new Date(fechaFin));
        }
        
        response.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const completados = response.filter(p => p.estado === "ENTREGADO" || p.estado === "PAGADO").length;
        const pendientes = response.filter(p => p.estado === "PENDIENTE").length;
        
        setResumen({
          total: response.length,
          totalIngresos: response.reduce((sum, p) => sum + (p.total || 0), 0),
          completados: completados,
          pendientes: pendientes,
          porcentajeEficiencia: response.length > 0 ? Math.round((completados / response.length) * 100) : 0
        });
        
      } else if (tipoReporte === "servicios") {
        const servicios = await servicioTecnicoService.listar();
        response = Array.isArray(servicios) ? servicios : [];
        
        if (filtroEstado !== "todos") {
          response = response.filter(s => s.estado === filtroEstado);
        }
        if (fechaInicio) {
          response = response.filter(s => new Date(s.fecha) >= new Date(fechaInicio));
        }
        if (fechaFin) {
          response = response.filter(s => new Date(s.fecha) <= new Date(fechaFin));
        }
        
        response.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const completados = response.filter(s => s.estado === "FINALIZADO" || s.estado === "ENTREGADO").length;
        const pendientes = response.filter(s => s.estado === "RECIBIDO" || s.estado === "EN_REVISION" || s.estado === "EN_PROCESO").length;
        
        setResumen({
          total: response.length,
          totalIngresos: response.reduce((sum, s) => sum + (s.costo || 0), 0),
          completados: completados,
          pendientes: pendientes,
          porcentajeEficiencia: response.length > 0 ? Math.round((completados / response.length) * 100) : 0
        });
        
      } else {
        const devoluciones = await devolucionService.listar();
        response = Array.isArray(devoluciones) ? devoluciones : [];
        
        if (filtroEstado !== "todos") {
          response = response.filter(d => d.estado === filtroEstado);
        }
        if (fechaInicio) {
          response = response.filter(d => new Date(d.fecha) >= new Date(fechaInicio));
        }
        if (fechaFin) {
          response = response.filter(d => new Date(d.fecha) <= new Date(fechaFin));
        }
        
        response.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const completados = response.filter(d => d.estado === "PROCESADA").length;
        const pendientes = response.filter(d => d.estado === "PENDIENTE" || d.estado === "EN_PROCESO").length;
        
        setResumen({
          total: response.length,
          totalIngresos: response.reduce((sum, d) => sum + (d.monto || 0), 0),
          completados: completados,
          pendientes: pendientes,
          porcentajeEficiencia: response.length > 0 ? Math.round((completados / response.length) * 100) : 0
        });
      }
      
      if (response.length === 0) {
        setErrorType("empty");
        setError("No hay datos disponibles con los filtros seleccionados.");
      }
      
      setData(response);
      
    } catch (error) {
      console.error("Error cargando reporte:", error);
      
      if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
        setErrorType("auth");
        setError("No tienes permisos para acceder a los reportes. Contacta al administrador.");
      } else if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        setErrorType("auth");
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      } else if (error.message?.includes("Network") || error.message?.includes("fetch") || error.message?.includes("Failed to fetch")) {
        setErrorType("connection");
        setError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
      } else if (error.message?.includes("500")) {
        setErrorType("server");
        setError("Error interno del servidor. Intenta nuevamente más tarde.");
      } else {
        setErrorType("unknown");
        setError(error.message || "Ocurrió un error inesperado al cargar los datos.");
      }
      
      setData([]);
      setResumen({
        total: 0,
        totalIngresos: 0,
        completados: 0,
        pendientes: 0,
        porcentajeEficiencia: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [tipoReporte, filtroEstado, fechaInicio, fechaFin]);

  const exportarPDF = () => {
    const printWindow = window.open('', '_blank');
    const fechaActual = new Date().toLocaleDateString('es-PE', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    let titulo = tipoReporte === "ventas" ? "Reporte de Ventas" : tipoReporte === "servicios" ? "Reporte de Servicios Técnicos" : "Reporte de Devoluciones";
    let headers = [];
    let rows = [];
    
    if (tipoReporte === "ventas") {
      headers = ["ID", "Cliente", "Fecha", "Total", "Estado", "Origen"];
      rows = data.map(item => [`#${item.id}`, item.clienteNombre || `Cliente #${item.clienteId}`, new Date(item.fecha).toLocaleDateString('es-PE'), `S/ ${item.total?.toFixed(2) || "0.00"}`, item.estado, item.origen === "TIENDA_FISICA" ? "Venta Presencial" : "Tienda Virtual"]);
    } else if (tipoReporte === "servicios") {
      headers = ["ID", "Cliente", "Equipo", "Fecha", "Costo", "Estado"];
      rows = data.map(item => [`#${item.id}`, item.clienteNombre || `Cliente #${item.clienteId}`, item.equipo || "N/E", new Date(item.fecha).toLocaleDateString('es-PE'), `S/ ${item.costo?.toFixed(2) || "0.00"}`, item.estado]);
    } else {
      headers = ["ID", "Pedido", "Monto", "Fecha", "Estado"];
      rows = data.map(item => [`#${item.id}`, `#${item.pedidoId}`, `S/ ${item.monto?.toFixed(2) || "0.00"}`, new Date(item.fecha).toLocaleDateString('es-PE'), item.estado]);
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${titulo}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; background: white; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #5b4eff; }
          h1 { color: #5b4eff; font-size: 28px; margin-bottom: 5px; }
          .fecha { color: #666; font-size: 12px; margin-top: 5px; }
          .resumen { display: flex; justify-content: space-around; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
          .resumen-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; text-align: center; min-width: 180px; color: white; }
          .resumen-card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
          .resumen-card .numero { font-size: 28px; font-weight: bold; }
          .resumen-card.ingresos { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
          .resumen-card.completados { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          .resumen-card.pendientes { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #5b4eff; color: white; padding: 12px; text-align: left; font-size: 13px; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          tr:hover { background: #f9fafb; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${titulo}</h1>
          <p class="fecha">Generado: ${fechaActual}</p>
        </div>
        <div class="resumen">
          <div class="resumen-card"><h3>Total Registros</h3><p class="numero">${resumen.total}</p></div>
          <div class="resumen-card ingresos"><h3>Total ${tipoReporte === "servicios" ? "Costo" : "Ingresos"}</h3><p class="numero">S/ ${resumen.totalIngresos.toFixed(2)}</p></div>
          <div class="resumen-card completados"><h3>Completados</h3><p class="numero">${resumen.completados}</p></div>
          <div class="resumen-card pendientes"><h3>Pendientes</h3><p class="numero">${resumen.pendientes}</p></div>
        </div>
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map(cell => `<td style="padding: 8px; border-bottom: 1px solid #ddd;">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <div class="footer"><p>Reporte generado por Sistema de Gestión - Jimenez Store</p></div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const exportarExcel = () => {
    let headers = [];
    let rows = [];
    
    if (tipoReporte === "ventas") {
      headers = ["ID", "Cliente", "Fecha", "Total", "Estado", "Origen"];
      rows = data.map(item => ({ "ID": `#${item.id}`, "Cliente": item.clienteNombre || `Cliente #${item.clienteId}`, "Fecha": new Date(item.fecha).toLocaleDateString('es-PE'), "Total": item.total || 0, "Estado": item.estado, "Origen": item.origen === "TIENDA_FISICA" ? "Venta Presencial" : "Tienda Virtual" }));
    } else if (tipoReporte === "servicios") {
      headers = ["ID", "Cliente", "Equipo", "Fecha", "Costo", "Estado"];
      rows = data.map(item => ({ "ID": `#${item.id}`, "Cliente": item.clienteNombre || `Cliente #${item.clienteId}`, "Equipo": item.equipo || "N/E", "Fecha": new Date(item.fecha).toLocaleDateString('es-PE'), "Costo": item.costo || 0, "Estado": item.estado }));
    } else {
      headers = ["ID", "Pedido", "Monto", "Fecha", "Estado"];
      rows = data.map(item => ({ "ID": `#${item.id}`, "Pedido": `#${item.pedidoId}`, "Monto": item.monto || 0, "Fecha": new Date(item.fecha).toLocaleDateString('es-PE'), "Estado": item.estado }));
    }
    
    const convertToCSV = (data, headers) => {
      const headerRow = headers.join(',');
      const csvRows = data.map(row => headers.map(header => {
          let value = row[header];
          if (value === undefined) value = '';
          if (typeof value === 'string') value = value.replace(/"/g, '""');
          if (value.toString().includes(',') || value.toString().includes('"')) value = `"${value}"`;
          return value;
        }).join(',')
      );
      return [headerRow, ...csvRows].join('\n');
    };
    
    const csvData = convertToCSV(rows, headers);
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    let nombreArchivo = tipoReporte === "ventas" ? `reporte_ventas_${new Date().toISOString().slice(0, 19)}.csv` : tipoReporte === "servicios" ? `reporte_servicios_${new Date().toISOString().slice(0, 19)}.csv` : `reporte_devoluciones_${new Date().toISOString().slice(0, 19)}.csv`;
    
    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(price);
  const formatDate = (date) => new Date(date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  const getEstadoColor = (estado) => {
    const colores = {
      "PENDIENTE": "bg-amber-100 text-amber-800 border-amber-200",
      "PAGADO": "bg-green-100 text-green-800 border-green-200",
      "ENVIADO": "bg-blue-100 text-blue-800 border-blue-200",
      "ENTREGADO": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "CANCELADO": "bg-red-100 text-red-800 border-red-200",
      "RECIBIDO": "bg-amber-100 text-amber-800 border-amber-200",
      "EN_REVISION": "bg-blue-100 text-blue-800 border-blue-200",
      "EN_PROCESO": "bg-purple-100 text-purple-800 border-purple-200",
      "FINALIZADO": "bg-green-100 text-green-800 border-green-200",
      "PROCESADA": "bg-green-100 text-green-800 border-green-200",
      "RECHAZADA": "bg-red-100 text-red-800 border-red-200"
    };
    return colores[estado] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getOrigenBadge = (origen) => {
    if (origen === "TIENDA_FISICA") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-cyan-100 text-cyan-700 border-cyan-200";
  };

  const getTipoIcon = () => {
    if (tipoReporte === "ventas") return <Package size={16} />;
    if (tipoReporte === "servicios") return <Wrench size={16} />;
    return <DollarSign size={16} />;
  };

  const estadosDisponibles = getEstadosDisponibles();
  const estadoSeleccionado = estadosDisponibles.find(e => e.value === filtroEstado);

  const ErrorDisplay = () => {
    const errorConfigs = {
      auth: { icon: <Shield size={48} className="text-red-500" />, title: "Error de Autenticación", message: error, buttonText: "Ir a Iniciar Sesión", buttonAction: () => window.location.href = "/login", color: "red" },
      connection: { icon: <WifiOff size={48} className="text-amber-500" />, title: "Error de Conexión", message: error, buttonText: "Reintentar", buttonAction: () => cargarReporte(), color: "amber" },
      server: { icon: <Server size={48} className="text-orange-500" />, title: "Error del Servidor", message: error, buttonText: "Reintentar", buttonAction: () => cargarReporte(), color: "orange" },
      empty: { icon: <Database size={48} className="text-gray-400" />, title: "Sin Datos", message: error, buttonText: "Limpiar Filtros", buttonAction: () => { setFiltroEstado("todos"); setFechaInicio(""); setFechaFin(""); }, color: "gray" },
      unknown: { icon: <AlertCircle size={48} className="text-red-500" />, title: "Error Inesperado", message: error, buttonText: "Reintentar", buttonAction: () => cargarReporte(), color: "red" }
    };
    
    const config = errorConfigs[errorType] || errorConfigs.unknown;
    const bgColor = { red: "bg-red-50 border-red-200", amber: "bg-amber-50 border-amber-200", orange: "bg-orange-50 border-orange-200", gray: "bg-gray-50 border-gray-200" }[config.color];
    const textColor = { red: "text-red-600", amber: "text-amber-600", orange: "text-orange-600", gray: "text-gray-600" }[config.color];
    
    return (
      <div className={`rounded-2xl p-8 text-center border-2 border-dashed ${bgColor} mt-6`}>
        <div className="flex flex-col items-center">
          <div className="mb-4 bg-white p-4 rounded-full shadow-sm">{config.icon}</div>
          <h3 className={`text-xl font-black mb-2 ${textColor}`}>{config.title}</h3>
          <p className="text-gray-500 font-medium mb-6 max-w-md">{config.message}</p>
          <button onClick={config.buttonAction} className="px-6 py-3 bg-[#5b4eff] text-white rounded-xl font-bold hover:bg-[#4a3dcc] shadow-md shadow-[#5b4eff]/20 transition active:scale-95 flex items-center gap-2">
            <RefreshCw size={16} />
            {config.buttonText}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Generar Reportes</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Analiza el rendimiento de ventas, servicios y devoluciones</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <TrendingUp size={24} className="text-[#5b4eff]" />
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <Filter size={18} className="text-[#5b4eff]" />
          <h2 className="text-base font-bold text-gray-800">Filtros de Búsqueda</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de Reporte (Botones apilados en móvil) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de reporte</label>
            <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button
                onClick={() => setTipoReporte("ventas")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  tipoReporte === "ventas" ? "bg-white text-[#5b4eff] shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Package size={14} /> Ventas
              </button>
              <button
                onClick={() => setTipoReporte("servicios")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  tipoReporte === "servicios" ? "bg-white text-[#5b4eff] shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Wrench size={14} /> Servicios
              </button>
              <button
                onClick={() => setTipoReporte("devoluciones")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  tipoReporte === "devoluciones" ? "bg-white text-[#5b4eff] shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <DollarSign size={14} /> Devol.
              </button>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition text-sm font-medium cursor-pointer"
            >
              {estadosDisponibles.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha inicio</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition text-sm font-medium"
              />
            </div>
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha fin</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 focus:outline-none transition text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Filtros:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold border border-indigo-100">
              {getTipoIcon()} {tipoReporte === "ventas" ? "Ventas" : tipoReporte === "servicios" ? "Servicios" : "Devoluciones"}
            </span>
            {estadoSeleccionado && estadoSeleccionado.value !== "todos" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200">
                {estadoSeleccionado.label}
              </span>
            )}
            {(fechaInicio || fechaFin) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200">
                <Calendar size={10} /> {fechaInicio || "..."} - {fechaFin || "..."}
              </span>
            )}
          </div>
          <button
            onClick={cargarReporte}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Resumen visual */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Registros</p>
            <p className="text-3xl font-black text-gray-800 mt-1">{resumen.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total {tipoReporte === "servicios" ? "Costo" : "Ingresos"}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 truncate">{formatPrice(resumen.totalIngresos)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-4 border-l-teal-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completados</p>
                <p className="text-3xl font-black text-gray-800 mt-1">{resumen.completados}</p>
              </div>
              <div className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs font-black">
                {resumen.porcentajeEficiencia}%
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{resumen.pendientes}</p>
          </div>
        </div>
      )}

      {/* Botones de exportación */}
      {!loading && !error && data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={exportarPDF}
            className="w-full sm:w-auto px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <FileText size={18} className="text-red-500" /> Exportar PDF
          </button>
          <button
            onClick={exportarExcel}
            className="w-full sm:w-auto px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <FileSpreadsheet size={18} className="text-green-600" /> Exportar Excel
          </button>
        </div>
      )}

      {/* Resultados o errores */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff] mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Generando reporte...</p>
        </div>
      ) : error ? (
        <ErrorDisplay />
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} className="text-gray-300" />
          </div>
          <p className="text-lg font-black text-gray-600">No hay datos para mostrar</p>
          <p className="text-sm font-medium text-gray-400 mt-1">Prueba cambiando los filtros de búsqueda</p>
          <button
            onClick={() => {
              setFiltroEstado("todos");
              setFechaInicio("");
              setFechaFin("");
            }}
            className="mt-6 px-5 py-2.5 bg-[#5b4eff] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dcc] shadow-md shadow-[#5b4eff]/20 transition active:scale-95"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          {/* ✅ VISTA ESCRITORIO (Tabla) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    {tipoReporte === "ventas" && (
                      <>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Origen</th>
                      </>
                    )}
                    {tipoReporte === "servicios" && (
                      <>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Equipo</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Costo</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                      </>
                    )}
                    {tipoReporte === "devoluciones" && (
                      <>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pedido</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      {tipoReporte === "ventas" && (
                        <>
                          <td className="px-6 py-4 text-sm font-black text-gray-400">#{item.id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.clienteNombre || `Cliente #${item.clienteId}`}</td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">{formatDate(item.fecha)}</td>
                          <td className="px-6 py-4 text-sm font-black text-[#5b4eff]">{formatPrice(item.total)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-black border ${getEstadoColor(item.estado)}`}>
                              {item.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-black border ${getOrigenBadge(item.origen)}`}>
                              {item.origen === "TIENDA_FISICA" ? "Presencial" : "Virtual"}
                            </span>
                          </td>
                        </>
                      )}
                      {tipoReporte === "servicios" && (
                        <>
                          <td className="px-6 py-4 text-sm font-black text-gray-400">#{item.id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.clienteNombre || `Cliente #${item.clienteId}`}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-600">{item.equipo || "—"}</td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">{formatDate(item.fecha)}</td>
                          <td className="px-6 py-4 text-sm font-black text-[#5b4eff]">{formatPrice(item.costo)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-black border ${getEstadoColor(item.estado)}`}>
                              {item.estado}
                            </span>
                          </td>
                        </>
                      )}
                      {tipoReporte === "devoluciones" && (
                        <>
                          <td className="px-6 py-4 text-sm font-black text-gray-400">#{item.id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">#{item.pedidoId}</td>
                          <td className="px-6 py-4 text-sm font-black text-[#5b4eff]">{formatPrice(item.monto)}</td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">{formatDate(item.fecha)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-black border ${getEstadoColor(item.estado)}`}>
                              {item.estado}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-200 flex justify-between text-xs font-bold text-gray-500">
              <span>Mostrando {data.length} registros</span>
              <span>Actualizado: {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* ✅ VISTA MÓVIL (Tarjetas) */}
          <div className="md:hidden space-y-3">
            {data.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">ID: #{item.id}</p>
                    {tipoReporte === "ventas" && <p className="font-black text-gray-900 text-sm truncate">{item.clienteNombre || `Cliente #${item.clienteId}`}</p>}
                    {tipoReporte === "servicios" && <p className="font-black text-gray-900 text-sm truncate">{item.clienteNombre || `Cliente #${item.clienteId}`}</p>}
                    {tipoReporte === "devoluciones" && <p className="font-black text-gray-900 text-sm">Pedido #{item.pedidoId}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wide font-black border ${getEstadoColor(item.estado)}`}>
                    {item.estado}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-lg p-2.5">
                  <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-600">{formatDate(item.fecha)}</span>
                </div>

                <div className="flex items-center justify-between">
                  {tipoReporte === "ventas" && (
                    <>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getOrigenBadge(item.origen)}`}>
                        {item.origen === "TIENDA_FISICA" ? "Presencial" : "Virtual"}
                      </span>
                      <span className="text-base font-black text-[#5b4eff]">{formatPrice(item.total)}</span>
                    </>
                  )}
                  {tipoReporte === "servicios" && (
                    <>
                      <p className="text-xs font-bold text-slate-600 truncate max-w-[50%]">{item.equipo || "—"}</p>
                      <span className="text-base font-black text-[#5b4eff]">{formatPrice(item.costo)}</span>
                    </>
                  )}
                  {tipoReporte === "devoluciones" && (
                    <>
                      <p className="text-xs font-bold text-slate-600">Devolución</p>
                      <span className="text-base font-black text-[#5b4eff]">{formatPrice(item.monto)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className="text-center pt-2 pb-4">
              <p className="text-xs font-bold text-gray-500">Mostrando {data.length} registros</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}