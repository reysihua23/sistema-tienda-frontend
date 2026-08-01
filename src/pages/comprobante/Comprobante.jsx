// pages/comprobante/Comprobante.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { comprobanteService } from "../../services/api";
import {
    CheckCircle,
    Download,
    Printer,
    Package,
    ArrowLeft,
    Calendar,
    User,
    MapPin,
    Phone,
    FileText,
    CreditCard,
    Truck,
    Store,
    Clock,
    AlertCircle,
    Copy,
    Share2,
    Loader,
    Mail
} from "lucide-react";

// Estilos para el PDF
const pdfStyles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 15,
        textAlign: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#1a1a2e'
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666666',
        marginTop: 5
    },
    empresaInfo: {
        textAlign: 'center',
        marginBottom: 25,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    empresaNombre: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5b4eff',
        marginBottom: 5
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        padding: 8,
        color: '#333333'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        fontSize: 9
    },
    table: {
        marginTop: 15,
        marginBottom: 20
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#5b4eff',
        padding: 10,
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold'
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee'
    },
    colProducto: { width: '45%' },
    colCantidad: { width: '15%', textAlign: 'center' },
    colPrecio: { width: '20%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },
    totalSection: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'flex-end'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
        width: '100%'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#999999',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 10
    }
});

// Componente PDF
const ComprobantePDF = ({ comprobante }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            {/* Encabezado */}
            <View style={pdfStyles.header}>
                <Text style={pdfStyles.title}>COMPROBANTE DE PAGO</Text>
                <Text style={pdfStyles.subtitle}>N° {comprobante.numeroComprobante}</Text>
            </View>

            {/* Datos de la empresa */}
            <View style={pdfStyles.empresaInfo}>
                <Text style={pdfStyles.empresaNombre}>{comprobante.empresaNombre || 'TIENDA JIMENEZ'}</Text>
                <Text>RUC: {comprobante.empresaRuc || '20601234567'}</Text>
                <Text>{comprobante.empresaDireccion || 'Av. Principal 123, Lima'}</Text>
                <Text>Tel: {comprobante.empresaTelefono || '01-2345678'}</Text>
            </View>

            {/* Datos del cliente */}
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>DATOS DEL CLIENTE</Text>
                <View style={pdfStyles.row}>
                    <Text>Cliente: {comprobante.clienteNombre || 'Cliente no especificado'}</Text>
                    <Text>DNI: {comprobante.clienteDocumento || 'Sin documento'}</Text>
                </View>
                <View style={pdfStyles.row}>
                    <Text>Dirección: {comprobante.clienteDireccion || 'No especificada'}</Text>
                    <Text>Teléfono: {comprobante.clienteTelefono || 'No especificado'}</Text>
                </View>
            </View>

            {/* Fecha y tipo */}
            <View style={pdfStyles.section}>
                <View style={pdfStyles.row}>
                    <Text>Fecha de emisión: {new Date(comprobante.fechaEmision || Date.now()).toLocaleDateString('es-PE')}</Text>
                    <Text>Tipo: {comprobante.tipoComprobante || 'BOLETA'}</Text>
                </View>
            </View>

            {/* Detalle de productos */}
            <View style={pdfStyles.table}>
                <Text style={pdfStyles.sectionTitle}>DETALLE DE PRODUCTOS</Text>
                <View style={pdfStyles.tableHeader}>
                    <Text style={pdfStyles.colProducto}>Producto</Text>
                    <Text style={pdfStyles.colCantidad}>Cant.</Text>
                    <Text style={pdfStyles.colPrecio}>Precio Unit.</Text>
                    <Text style={pdfStyles.colTotal}>Total</Text>
                </View>
                {comprobante.detalles?.map((item, idx) => (
                    <View key={idx} style={pdfStyles.tableRow}>
                        <Text style={pdfStyles.colProducto}>{item.productoNombre || 'Producto'}</Text>
                        <Text style={pdfStyles.colCantidad}>{item.cantidad || 1}</Text>
                        <Text style={pdfStyles.colPrecio}>S/ {(item.precioUnitario || 0).toFixed(2)}</Text>
                        <Text style={pdfStyles.colTotal}>S/ {(item.totalItem || 0).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Totales */}
            <View style={pdfStyles.totalSection}>
                <View style={pdfStyles.totalRow}>
                    <Text style={{ width: 100, textAlign: 'right' }}>Subtotal:</Text>
                    <Text style={{ width: 100, textAlign: 'right' }}>S/ {(comprobante.subtotal || 0).toFixed(2)}</Text>
                </View>
                <View style={pdfStyles.totalRow}>
                    <Text style={{ width: 100, textAlign: 'right' }}>IGV (18%):</Text>
                    <Text style={{ width: 100, textAlign: 'right' }}>S/ {(comprobante.igv || 0).toFixed(2)}</Text>
                </View>
                {comprobante.costoEnvio > 0 && (
                    <View style={pdfStyles.totalRow}>
                        <Text style={{ width: 100, textAlign: 'right' }}>Costo envío:</Text>
                        <Text style={{ width: 100, textAlign: 'right' }}>S/ {(comprobante.costoEnvio || 0).toFixed(2)}</Text>
                    </View>
                )}
                <View style={pdfStyles.totalRow}>
                    <Text style={{ width: 100, textAlign: 'right', fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ width: 100, textAlign: 'right', fontWeight: 'bold', color: '#5b4eff' }}>S/ {(comprobante.total || 0).toFixed(2)}</Text>
                </View>
            </View>

            {/* Pie de página */}
            <View style={pdfStyles.footer}>
                <Text>Este documento es una representación digital de su comprobante de pago</Text>
                <Text>© {new Date().getFullYear()} Jimenez - Todos los derechos reservados</Text>
            </View>
        </Page>
    </Document>
);

export default function Comprobante() {
    const { pedidoId, id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [comprobante, setComprobante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const comprobanteId = id || pedidoId;
        cargarComprobante(comprobanteId);
    }, [pedidoId, id, location.state]);

    const cargarComprobante = async (comprobanteId) => {
        try {
            setLoading(true);

            // ✅ Si viene del state (venta presencial)
            if (location.state && location.state.comprobanteId) {
                console.log("📄 Comprobante desde state:", location.state);

                const data = {
                    numeroComprobante: location.state.numeroComprobante || `B001-${String(comprobanteId).padStart(8, '0')}`,
                    empresaNombre: 'TIENDA JIMENEZ',
                    empresaRuc: '20601234567',
                    empresaDireccion: 'Av. Principal 123, Lima',
                    empresaTelefono: '01-2345678',
                    clienteNombre: location.state.clienteNombre || 'Cliente no especificado',
                    clienteDocumento: location.state.clienteDocumento || 'Sin documento',
                    clienteDireccion: location.state.clienteDireccion || 'No especificada',
                    clienteTelefono: location.state.clienteTelefono || 'No especificado',
                    tipoComprobante: 'BOLETA',
                    fechaEmision: location.state.fecha || new Date().toISOString(),
                    subtotal: location.state.subtotal || 0,
                    igv: location.state.igv || 0,
                    costoEnvio: location.state.costoEnvio || 0,
                    total: location.state.total || 0,
                    metodoPago: location.state.metodoPago || 'EFECTIVO',
                    metodoEnvio: 'RECOJO_EN_TIENDA',
                    detalles: location.state.productos || [],
                    estado: 'PAGADO'
                };

                setComprobante(data);
                setLoading(false);
                return;
            }

            // ✅ Si viene por URL (pedido online)
            if (comprobanteId) {
                const data = await comprobanteService.obtenerPorPedido(comprobanteId);
                setComprobante(data);
            } else {
                setError("No se encontró el comprobante");
            }

        } catch (err) {
            console.error("Error al cargar comprobante:", err);
            setError("Error al cargar el comprobante");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(price || 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyNumber = () => {
        navigator.clipboard.writeText(comprobante?.numeroComprobante || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMetodoPagoIcon = (metodo) => {
        const icons = {
            'EFECTIVO': '💵',
            'TARJETA': '💳',
            'YAPE': '📱',
            'PLIN': '💙',
            'TRANSFERENCIA': '🏦',
            'PAYPAL': '🅿️'
        };
        return icons[metodo] || '💳';
    };

    const getMetodoPagoColor = (metodo) => {
        const colors = {
            'EFECTIVO': 'text-green-600',
            'TARJETA': 'text-blue-600',
            'YAPE': 'text-purple-600',
            'PLIN': 'text-sky-600',
            'TRANSFERENCIA': 'text-orange-600',
            'PAYPAL': 'text-[#0070ba]'
        };
        return colors[metodo] || 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Loader className="animate-spin text-[#5b4eff] text-5xl" />
                <p className="mt-4 text-slate-500 font-medium">Cargando comprobante...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
                    <AlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <p className="text-red-500 mb-4 font-medium">{error}</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-medium hover:shadow-lg transition-all">
                        <ArrowLeft size={18} />
                        Volver a la tienda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Banner de éxito */}
                <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <CheckCircle size={28} />
                        <div>
                            <h2 className="font-bold text-lg">¡Pago completado exitosamente!</h2>
                            <p className="text-sm opacity-90">Se ha generado el comprobante de tu venta</p>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap justify-end gap-3 mb-6 print:hidden">
                    <PDFDownloadLink
                        document={<ComprobantePDF comprobante={comprobante} />}
                        fileName={`comprobante_${comprobante?.numeroComprobante || 'venta'}.pdf`}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {({ loading }) => loading ? (
                            <><Loader size={16} className="animate-spin" /> Generando...</>
                        ) : (
                            <><Download size={16} /> Descargar PDF</>
                        )}
                    </PDFDownloadLink>

                    <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:shadow-md transition-all flex items-center gap-2"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>

                    <button
                        onClick={handleCopyNumber}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Copy size={16} />
                        {copied ? "¡Copiado!" : "Copiar N°"}
                    </button>

                    <Link
                        to={location.state?.fromVentas ? "/vendedor" : "/perfil"}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        {location.state?.fromVentas ? "Volver a Ventas" : "Mis Pedidos"}
                    </Link>
                </div>

                {/* Comprobante principal */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white p-8 print:bg-white print:text-black print:border-b print:border-gray-200">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <CreditCard size={40} className="text-[#5b4eff]" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">COMPROBANTE DE PAGO</h1>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <p className="text-lg opacity-90">N° {comprobante?.numeroComprobante || 'N/A'}</p>
                                <button onClick={handleCopyNumber} className="opacity-50 hover:opacity-100 transition">
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-green-500/20 rounded-full">
                                <CheckCircle size={12} />
                                <span className="text-xs font-medium">PAGADO</span>
                            </div>
                        </div>
                    </div>

                    {/* Información de la empresa */}
                    <div className="p-6 border-b text-center bg-gradient-to-r from-slate-50 to-white">
                        <h2 className="text-2xl font-bold text-gray-800">TIENDA JIMENEZ</h2>
                        <p className="text-sm text-gray-500 mt-1">RUC: 20601234567</p>
                        <p className="text-sm text-gray-500">Av. Principal 123, Lima</p>
                        <p className="text-sm text-gray-500">Tel: 01-2345678</p>
                    </div>

                    {/* Información del cliente */}
                    <div className="p-6 border-b bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
                                        <p className="font-semibold text-gray-800">{comprobante?.clienteNombre || 'Cliente no especificado'}</p>
                                        <p className="text-sm text-gray-600">DNI: {comprobante?.clienteDocumento || 'Sin documento'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Dirección</p>
                                        <p className="text-sm text-gray-600">{comprobante?.clienteDireccion || 'No especificada'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Teléfono</p>
                                        <p className="text-sm text-gray-600">{comprobante?.clienteTelefono || 'No especificado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail size={18} className="text-[#5b4eff] mt-0.5" /> 
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                                        <p className="text-sm text-gray-600">{comprobante?.clienteEmail || 'No especificado'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 md:text-right">
                                <div className="flex items-start gap-3 md:justify-end">
                                    <Calendar size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de emisión</p>
                                        <p className="font-semibold text-gray-800">
                                            {comprobante?.fechaEmision ? new Date(comprobante.fechaEmision).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 md:justify-end">
                                    <FileText size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Tipo de comprobante</p>
                                        <p className="text-sm text-gray-600 font-medium">{comprobante?.tipoComprobante || 'BOLETA'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 md:justify-end">
                                    <Truck size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Método de envío</p>
                                        <p className="text-sm text-gray-600">🏪 Recogida en tienda</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detalle de productos */}
                    <div className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 border-l-4 border-[#5b4eff] pl-3">Detalle de Productos</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 rounded-xl">
                                    <tr>
                                        <th className="text-left p-3 text-sm font-semibold text-gray-600">Producto</th>
                                        <th className="text-center p-3 text-sm font-semibold text-gray-600">Cantidad</th>
                                        <th className="text-right p-3 text-sm font-semibold text-gray-600">Precio Unit.</th>
                                        <th className="text-right p-3 text-sm font-semibold text-gray-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comprobante?.detalles?.map((item, idx) => (
                                        <tr key={idx} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="p-3 text-sm font-medium text-gray-700">{item.productoNombre || 'Producto'}</td>
                                            <td className="p-3 text-sm text-center text-gray-600">{item.cantidad || 1}</td>
                                            <td className="p-3 text-sm text-right text-gray-600">{formatPrice(item.precioUnitario || 0)}</td>
                                            <td className="p-3 text-sm text-right font-semibold text-gray-800">{formatPrice(item.totalItem || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totales */}
                        <div className="mt-6 border-t pt-4">
                            <div className="flex justify-end">
                                <div className="w-72 space-y-2">
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-gray-500">Subtotal:</span>
                                        <span className="text-gray-700">{formatPrice(comprobante?.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-gray-500">IGV (18%):</span>
                                        <span className="text-gray-700">{formatPrice(comprobante?.igv || 0)}</span>
                                    </div>
                                    {comprobante?.costoEnvio > 0 && (
                                        <div className="flex justify-between text-sm py-1">
                                            <span className="text-gray-500">Costo de envío:</span>
                                            <span className="text-gray-700">{formatPrice(comprobante.costoEnvio)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-3 mt-2 border-t border-gray-200">
                                        <span className="text-gray-800">Total:</span>
                                        <span className="text-[#5b4eff]">{formatPrice(comprobante?.total || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="px-6 pb-4">
                        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getMetodoPagoColor(comprobante?.metodoPago)} bg-opacity-10`}>
                                    <span className="text-2xl">{getMetodoPagoIcon(comprobante?.metodoPago)}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Método de pago</p>
                                    <p className="font-semibold text-gray-800">{comprobante?.metodoPago || 'EFECTIVO'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase">Estado</p>
                                <p className="font-semibold text-green-600 flex items-center gap-1">
                                    <CheckCircle size={14} />
                                    Completado
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pie de página */}
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white text-center text-xs text-gray-400 border-t">
                        <p>Este documento es una representación digital de su comprobante de pago</p>
                        <p className="mt-1">© {new Date().getFullYear()} Jimenez - Todos los derechos reservados</p>
                    </div>
                </div>

                {/* Botón de volver */}
                <div className="mt-8 text-center print:hidden">
                    <Link
                        to={location.state?.fromVentas ? "/vendedor" : "/"}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all"
                    >
                        <ArrowLeft size={18} />
                        {location.state?.fromVentas ? "Volver al Panel de Vendedor" : "Volver a la tienda"}
                    </Link>
                </div>
            </div>

            {/* Estilos para impresión */}
            <style>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:rounded-none {
                        border-radius: 0 !important;
                    }
                    body {
                        background: white;
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                }
            `}</style>
        </div>
    );
}