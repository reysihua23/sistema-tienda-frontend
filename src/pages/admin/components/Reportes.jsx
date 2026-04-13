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
  WifiOff
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
  const [errorType, setErrorType] = useState(null); // 'auth', 'connection', 'server', 'empty'

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
      // Verificar token antes de continuar
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
      
      // Clasificar el error
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let titulo = "";
    if (tipoReporte === "ventas") titulo = "Reporte de Ventas";
    else if (tipoReporte === "servicios") titulo = "Reporte de Servicios Técnicos";
    else titulo = "Reporte de Devoluciones";
    
    let headers = [];
    let rows = [];
    
    if (tipoReporte === "ventas") {
      headers = ["ID", "Cliente", "Fecha", "Total", "Estado", "Origen"];
      rows = data.map(item => [
        `#${item.id}`,
        item.clienteNombre || `Cliente #${item.clienteId}`,
        new Date(item.fecha).toLocaleDateString('es-PE'),
        `S/ ${item.total?.toFixed(2) || "0.00"}`,
        item.estado,
        item.origen === "TIENDA_FISICA" ? "Venta Presencial" : "Tienda Virtual"
      ]);
    } else if (tipoReporte === "servicios") {
      headers = ["ID", "Cliente", "Equipo", "Fecha", "Costo", "Estado"];
      rows = data.map(item => [
        `#${item.id}`,
        item.clienteNombre || `Cliente #${item.clienteId}`,
        item.equipo || "N/E",
        new Date(item.fecha).toLocaleDateString('es-PE'),
        `S/ ${item.costo?.toFixed(2) || "0.00"}`,
        item.estado
      ]);
    } else {
      headers = ["ID", "Pedido", "Monto", "Fecha", "Estado"];
      rows = data.map(item => [
        `#${item.id}`,
        `#${item.pedidoId}`,
        `S/ ${item.monto?.toFixed(2) || "0.00"}`,
        new Date(item.fecha).toLocaleDateString('es-PE'),
        item.estado
      ]);
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
          <div class="resumen-card">
            <h3>Total Registros</h3>
            <p class="numero">${resumen.total}</p>
          </div>
          <div class="resumen-card ingresos">
            <h3>Total ${tipoReporte === "servicios" ? "Costo" : "Ingresos"}</h3>
            <p class="numero">S/ ${resumen.totalIngresos.toFixed(2)}</p>
          </div>
          <div class="resumen-card completados">
            <h3>Completados</h3>
            <p class="numero">${resumen.completados}</p>
          </div>
          <div class="resumen-card pendientes">
            <h3>Pendientes</h3>
            <p class="numero">${resumen.pendientes}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td style="padding: 8px; border-bottom: 1px solid #ddd;">${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Reporte generado por Sistema de Gestión - Jimenez Store</p>
        </div>
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
      rows = data.map(item => ({
        "ID": `#${item.id}`,
        "Cliente": item.clienteNombre || `Cliente #${item.clienteId}`,
        "Fecha": new Date(item.fecha).toLocaleDateString('es-PE'),
        "Total": item.total || 0,
        "Estado": item.estado,
        "Origen": item.origen === "TIENDA_FISICA" ? "Venta Presencial" : "Tienda Virtual"
      }));
    } else if (tipoReporte === "servicios") {
      headers = ["ID", "Cliente", "Equipo", "Fecha", "Costo", "Estado"];
      rows = data.map(item => ({
        "ID": `#${item.id}`,
        "Cliente": item.clienteNombre || `Cliente #${item.clienteId}`,
        "Equipo": item.equipo || "N/E",
        "Fecha": new Date(item.fecha).toLocaleDateString('es-PE'),
        "Costo": item.costo || 0,
        "Estado": item.estado
      }));
    } else {
      headers = ["ID", "Pedido", "Monto", "Fecha", "Estado"];
      rows = data.map(item => ({
        "ID": `#${item.id}`,
        "Pedido": `#${item.pedidoId}`,
        "Monto": item.monto || 0,
        "Fecha": new Date(item.fecha).toLocaleDateString('es-PE'),
        "Estado": item.estado
      }));
    }
    
    const convertToCSV = (data, headers) => {
      const headerRow = headers.join(',');
      const csvRows = data.map(row => 
        headers.map(header => {
          let value = row[header];
          if (value === undefined) value = '';
          if (typeof value === 'string') value = value.replace(/"/g, '""');
          if (value.toString().includes(',') || value.toString().includes('"')) {
            value = `"${value}"`;
          }
          return value;
        }).join(',')
      );
      return [headerRow, ...csvRows].join('\n');
    };
    
    const csvData = convertToCSV(rows, headers);
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    let nombreArchivo = "";
    if (tipoReporte === "ventas") nombreArchivo = `reporte_ventas_${new Date().toISOString().slice(0, 19)}.csv`;
    else if (tipoReporte === "servicios") nombreArchivo = `reporte_servicios_${new Date().toISOString().slice(0, 19)}.csv`;
    else nombreArchivo = `reporte_devoluciones_${new Date().toISOString().slice(0, 19)}.csv`;
    
    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      "PENDIENTE": "bg-amber-100 text-amber-700",
      "PAGADO": "bg-green-100 text-green-700",
      "ENVIADO": "bg-blue-100 text-blue-700",
      "ENTREGADO": "bg-emerald-100 text-emerald-700",
      "CANCELADO": "bg-red-100 text-red-700",
      "RECIBIDO": "bg-amber-100 text-amber-700",
      "EN_REVISION": "bg-blue-100 text-blue-700",
      "EN_PROCESO": "bg-purple-100 text-purple-700",
      "FINALIZADO": "bg-green-100 text-green-700",
      "PROCESADA": "bg-green-100 text-green-700",
      "RECHAZADA": "bg-red-100 text-red-700"
    };
    return colores[estado] || "bg-gray-100 text-gray-700";
  };

  const getOrigenBadge = (origen) => {
    if (origen === "TIENDA_FISICA") {
      return "bg-purple-100 text-purple-700";
    }
    return "bg-cyan-100 text-cyan-700";
  };

  const getTipoIcon = () => {
    if (tipoReporte === "ventas") return <Package size={20} />;
    if (tipoReporte === "servicios") return <Wrench size={20} />;
    return <DollarSign size={20} />;
  };

  const estadosDisponibles = getEstadosDisponibles();
  const estadoSeleccionado = estadosDisponibles.find(e => e.value === filtroEstado);

  // Componente de error según el tipo
  const ErrorDisplay = () => {
    const errorConfigs = {
      auth: {
        icon: <Shield size={48} className="text-red-500" />,
        title: "Error de Autenticación",
        message: error,
        buttonText: "Ir a Iniciar Sesión",
        buttonAction: () => window.location.href = "/login",
        color: "red"
      },
      connection: {
        icon: <WifiOff size={48} className="text-amber-500" />,
        title: "Error de Conexión",
        message: error,
        buttonText: "Reintentar",
        buttonAction: () => cargarReporte(),
        color: "amber"
      },
      server: {
        icon: <Server size={48} className="text-orange-500" />,
        title: "Error del Servidor",
        message: error,
        buttonText: "Reintentar",
        buttonAction: () => cargarReporte(),
        color: "orange"
      },
      empty: {
        icon: <Database size={48} className="text-gray-400" />,
        title: "Sin Datos",
        message: error,
        buttonText: "Limpiar Filtros",
        buttonAction: () => {
          setFiltroEstado("todos");
          setFechaInicio("");
          setFechaFin("");
        },
        color: "gray"
      },
      unknown: {
        icon: <AlertCircle size={48} className="text-red-500" />,
        title: "Error Inesperado",
        message: error,
        buttonText: "Reintentar",
        buttonAction: () => cargarReporte(),
        color: "red"
      }
    };
    
    const config = errorConfigs[errorType] || errorConfigs.unknown;
    const bgColor = {
      red: "bg-red-50 border-red-200",
      amber: "bg-amber-50 border-amber-200",
      orange: "bg-orange-50 border-orange-200",
      gray: "bg-gray-50 border-gray-200"
    }[config.color];
    
    const textColor = {
      red: "text-red-600",
      amber: "text-amber-600",
      orange: "text-orange-600",
      gray: "text-gray-600"
    }[config.color];
    
    return (
      <div className={`rounded-2xl p-8 text-center border ${bgColor}`}>
        <div className="flex flex-col items-center">
          <div className="mb-4">{config.icon}</div>
          <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{config.title}</h3>
          <p className="text-gray-500 mb-6 max-w-md">{config.message}</p>
          <button
            onClick={config.buttonAction}
            className="px-6 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {config.buttonText}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Generar Reportes</h1>
            <p className="text-sm text-gray-500 mt-1">Genera reportes de ventas, servicios técnicos y devoluciones</p>
          </div>
          <div className="w-10 h-10 bg-[#5b4eff]/10 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-[#5b4eff]" />
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Filter size={18} className="text-[#5b4eff]" />
          <h2 className="text-lg font-bold text-gray-800">Filtros de Reporte</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de reporte</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoReporte("ventas")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  tipoReporte === "ventas"
                    ? "bg-[#5b4eff] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Package size={16} /> Ventas
              </button>
              <button
                onClick={() => setTipoReporte("servicios")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  tipoReporte === "servicios"
                    ? "bg-[#5b4eff] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Wrench size={16} /> Servicios
              </button>
              <button
                onClick={() => setTipoReporte("devoluciones")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  tipoReporte === "devoluciones"
                    ? "bg-[#5b4eff] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <DollarSign size={16} /> Devoluciones
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none transition"
            >
              {estadosDisponibles.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha inicio</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha fin</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:border-[#5b4eff] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Filtros activos:</span>
            <div className="flex gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                {getTipoIcon()} {tipoReporte === "ventas" ? "Ventas" : tipoReporte === "servicios" ? "Servicios" : "Devoluciones"}
              </span>
              {estadoSeleccionado && estadoSeleccionado.value !== "todos" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                  Estado: {estadoSeleccionado.label}
                </span>
              )}
              {(fechaInicio || fechaFin) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                  <Calendar size={10} /> {fechaInicio || "inicio"} - {fechaFin || "fin"}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={cargarReporte}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Resumen visual */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-sm">
            <p className="text-sm opacity-90">Total Registros</p>
            <p className="text-3xl font-bold mt-1">{resumen.total}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-sm">
            <p className="text-sm opacity-90">Total {tipoReporte === "servicios" ? "Costo" : "Ingresos"}</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(resumen.totalIngresos)}</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-sm">
            <p className="text-sm opacity-90">Completados</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-3xl font-bold">{resumen.completados}</p>
              <p className="text-sm opacity-80">{resumen.porcentajeEficiencia}%</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-sm">
            <p className="text-sm opacity-90">Pendientes</p>
            <p className="text-3xl font-bold mt-1">{resumen.pendientes}</p>
          </div>
        </div>
      )}

      {/* Botones de exportación */}
      {!loading && !error && data.length > 0 && (
        <div className="flex justify-end gap-3">
          <button
            onClick={exportarPDF}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center gap-2 shadow-sm"
          >
            <FileText size={16} /> Exportar PDF
          </button>
          <button
            onClick={exportarExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet size={16} /> Exportar Excel
          </button>
        </div>
      )}

      {/* Resultados o errores */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b4eff] mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando reporte...</p>
        </div>
      ) : error ? (
        <ErrorDisplay />
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-400">No hay datos para los filtros seleccionados</p>
          <p className="text-sm text-gray-400 mt-1">Prueba cambiando los criterios de búsqueda</p>
          <button
            onClick={() => {
              setFiltroEstado("todos");
              setFechaInicio("");
              setFechaFin("");
            }}
            className="mt-4 px-4 py-2 text-[#5b4eff] border border-[#5b4eff] rounded-lg text-sm font-medium hover:bg-[#5b4eff] hover:text-white transition"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {tipoReporte === "ventas" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Origen</th>
                    </>
                  )}
                  {tipoReporte === "servicios" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Equipo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Costo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                    </>
                  )}
                  {tipoReporte === "devoluciones" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    {tipoReporte === "ventas" && (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{item.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.clienteNombre || `Cliente #${item.clienteId}`}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.fecha)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#5b4eff]">{formatPrice(item.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrigenBadge(item.origen)}`}>
                            {item.origen === "TIENDA_FISICA" ? "🏪 Presencial" : "🛒 Virtual"}
                          </span>
                        </td>
                      </>
                    )}
                    {tipoReporte === "servicios" && (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{item.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.clienteNombre || `Cliente #${item.clienteId}`}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.equipo || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.fecha)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#5b4eff]">{formatPrice(item.costo)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                            {item.estado}
                          </span>
                        </td>
                      </>
                    )}
                    {tipoReporte === "devoluciones" && (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{item.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">#{item.pedidoId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#5b4eff]">{formatPrice(item.monto)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.fecha)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
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
          
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Total registros: {data.length}</span>
            <span>Última actualización: {new Date().toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}