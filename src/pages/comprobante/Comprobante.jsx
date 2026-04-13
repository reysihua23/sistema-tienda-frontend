// pages/comprobante/Comprobante.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { comprobanteService } from "../../services/api";
import {
  CheckCircle, Download, Printer, Package, ArrowLeft, 
  Calendar, User, MapPin, Phone, FileText, CreditCard,
  Truck, Store, Clock, AlertCircle, Copy, Share2,Loader
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

// Componente PDF para descargar
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
                <Text style={pdfStyles.empresaNombre}>{comprobante.empresaNombre}</Text>
                <Text>RUC: {comprobante.empresaRuc}</Text>
                <Text>{comprobante.empresaDireccion}</Text>
                <Text>Tel: {comprobante.empresaTelefono}</Text>
            </View>

            {/* Datos del cliente */}
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>DATOS DEL CLIENTE</Text>
                <View style={pdfStyles.row}>
                    <Text>Cliente: {comprobante.clienteNombre}</Text>
                    <Text>DNI: {comprobante.clienteDocumento}</Text>
                </View>
                <View style={pdfStyles.row}>
                    <Text>Dirección: {comprobante.clienteDireccion}</Text>
                    <Text>Teléfono: {comprobante.clienteTelefono}</Text>
                </View>
            </View>

            {/* Fecha y tipo */}
            <View style={pdfStyles.section}>
                <View style={pdfStyles.row}>
                    <Text>Fecha de emisión: {new Date(comprobante.fechaEmision).toLocaleDateString('es-PE')}</Text>
                    <Text>Tipo: {comprobante.tipoComprobante}</Text>
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
                        <Text style={pdfStyles.colProducto}>{item.productoNombre}</Text>
                        <Text style={pdfStyles.colCantidad}>{item.cantidad}</Text>
                        <Text style={pdfStyles.colPrecio}>S/ {item.precioUnitario.toFixed(2)}</Text>
                        <Text style={pdfStyles.colTotal}>S/ {item.totalItem.toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Totales */}
            <View style={pdfStyles.totalSection}>
                <View style={pdfStyles.totalRow}>
                    <Text style={{ width: 100, textAlign: 'right' }}>Subtotal:</Text>
                    <Text style={{ width: 100, textAlign: 'right' }}>S/ {comprobante.subtotal.toFixed(2)}</Text>
                </View>
                <View style={pdfStyles.totalRow}>
                    <Text style={{ width: 100, textAlign: 'right' }}>IGV (18%):</Text>
                    <Text style={{ width: 100, textAlign: 'right' }}>S/ {comprobante.igv.toFixed(2)}</Text>
                </View>
                <View style={pdfStyles.totalRow}>
                    <Text style={{ width: 100, textAlign: 'right', fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ width: 100, textAlign: 'right', fontWeight: 'bold', color: '#5b4eff' }}>S/ {comprobante.total.toFixed(2)}</Text>
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
    const { pedidoId } = useParams();
    const [comprobante, setComprobante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        cargarComprobante();
    }, [pedidoId]);

    const cargarComprobante = async () => {
        try {
            const data = await comprobanteService.obtenerPorPedido(pedidoId);
            setComprobante(data);
        } catch (err) {
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
        }).format(price);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyNumber = () => {
        navigator.clipboard.writeText(comprobante?.numeroComprobante || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Comprobante de pago',
                text: `Comprobante N° ${comprobante?.numeroComprobante}`,
                url: window.location.href
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5b4eff]"></div>
                <p className="mt-4 text-slate-500 font-medium">Cargando comprobante...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
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
                            <p className="text-sm opacity-90">Se ha enviado el comprobante a tu correo electrónico</p>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap justify-end gap-3 mb-6 print:hidden">
                    <PDFDownloadLink
                        document={<ComprobantePDF comprobante={comprobante} />}
                        fileName={`comprobante_${comprobante.numeroComprobante}.pdf`}
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
                    
                    {navigator.share && (
                        <button
                            onClick={handleShare}
                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <Share2 size={16} />
                            Compartir
                        </button>
                    )}
                    
                    <Link
                        to="/perfil"
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Package size={16} />
                        Mis Pedidos
                    </Link>
                </div>

                {/* Comprobante principal */}
                <div ref={printRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
                    {/* Header con gradiente */}
                    <div className="bg-gradient-to-r from-[#0d0c1e] to-[#1a1932] text-white p-8 print:bg-white print:text-black print:border-b print:border-gray-200">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <CreditCard size={40} className="text-[#5b4eff]" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">COMPROBANTE DE PAGO</h1>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <p className="text-lg opacity-90">N° {comprobante.numeroComprobante}</p>
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
                        <h2 className="text-2xl font-bold text-gray-800">{comprobante.empresaNombre}</h2>
                        <p className="text-sm text-gray-500 mt-1">RUC: {comprobante.empresaRuc}</p>
                        <p className="text-sm text-gray-500">{comprobante.empresaDireccion}</p>
                        <p className="text-sm text-gray-500">Tel: {comprobante.empresaTelefono}</p>
                    </div>

                    {/* Información del cliente y fechas */}
                    <div className="p-6 border-b bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
                                        <p className="font-semibold text-gray-800">{comprobante.clienteNombre}</p>
                                        <p className="text-sm text-gray-600">DNI: {comprobante.clienteDocumento}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Dirección</p>
                                        <p className="text-sm text-gray-600">{comprobante.clienteDireccion || "No especificada"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Teléfono</p>
                                        <p className="text-sm text-gray-600">{comprobante.clienteTelefono || "No especificado"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 md:text-right">
                                <div className="flex items-start gap-3 md:justify-end">
                                    <Calendar size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de emisión</p>
                                        <p className="font-semibold text-gray-800">{new Date(comprobante.fechaEmision).toLocaleDateString('es-PE', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 md:justify-end">
                                    <FileText size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Tipo de comprobante</p>
                                        <p className="text-sm text-gray-600 font-medium">{comprobante.tipoComprobante}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 md:justify-end">
                                    <Truck size={18} className="text-[#5b4eff] mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Método de envío</p>
                                        <p className="text-sm text-gray-600">{comprobante.metodoEnvio === "ENVIO_DOMICILIO" ? "🚚 Envío a domicilio" : "🏪 Recogo en tienda"}</p>
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
                                    {comprobante.detalles?.map((item, idx) => (
                                        <tr key={idx} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="p-3 text-sm font-medium text-gray-700">{item.productoNombre}</td>
                                            <td className="p-3 text-sm text-center text-gray-600">{item.cantidad}</td>
                                            <td className="p-3 text-sm text-right text-gray-600">{formatPrice(item.precioUnitario)}</td>
                                            <td className="p-3 text-sm text-right font-semibold text-gray-800">{formatPrice(item.totalItem)}</td>
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
                                        <span className="text-gray-700">{formatPrice(comprobante.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-gray-500">IGV (18%):</span>
                                        <span className="text-gray-700">{formatPrice(comprobante.igv)}</span>
                                    </div>
                                    {comprobante.costoEnvio > 0 && (
                                        <div className="flex justify-between text-sm py-1">
                                            <span className="text-gray-500">Costo de envío:</span>
                                            <span className="text-gray-700">{formatPrice(comprobante.costoEnvio)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-3 mt-2 border-t border-gray-200">
                                        <span className="text-gray-800">Total:</span>
                                        <span className="text-[#5b4eff]">{formatPrice(comprobante.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="px-6 pb-4">
                        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0070ba]/10 rounded-full flex items-center justify-center">
                                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Método de pago</p>
                                    <p className="font-semibold text-gray-800">PayPal</p>
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

                    {/* Información adicional */}
                    <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-[#5b4eff]" />
                                <span>Este comprobante es válido como constancia de pago</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Store size={14} className="text-[#5b4eff]" />
                                <span>Para consultas: ventas@jimenez.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Pie de página */}
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white text-center text-xs text-gray-400 border-t">
                        <p>Este documento es una representación digital de su comprobante de pago</p>
                        <p className="mt-1">© {new Date().getFullYear()} Jimenez - Todos los derechos reservados</p>
                    </div>
                </div>

                {/* Botón de volver al inicio */}
                <div className="mt-8 text-center print:hidden">
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all">
                        <ArrowLeft size={18} />
                        Volver a la tienda
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