import React, { useState, useEffect, useRef } from "react";
import { productoService, stockService } from "../../../services/api";
import { 
    X, Package, DollarSign, Box, AlertTriangle, 
    Image, Upload, Trash2, Star, Plus, CheckCircle,
    AlertCircle, Info, Loader2, Edit, Save, Camera,
    Shield, Zap, ShoppingBag, Layers
} from "lucide-react";

export default function ProductoForm({ editingProduct, onClose, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [productForm, setProductForm] = useState({
        nombre: editingProduct?.nombre || "",
        descripcion: editingProduct?.descripcion || "",
        precio: editingProduct?.precio || "",
        stock: editingProduct?.stock || 0,
        stockMinimo: editingProduct?.stockMinimo || 5,
        activo: editingProduct?.activo !== undefined ? editingProduct.activo : true
    });

    const fileInputRef = useRef(null);

    // Limpiar URLs al desmontar
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (type, title, message, suggestion = "") => {
        setNotification({ type, title, message, suggestion });
    };

    // Funciones de validación
    const validateField = (name, value) => {
        switch (name) {
            case "nombre":
                if (!value.trim()) return "El nombre del producto es obligatorio";
                if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
                if (value.trim().length > 100) return "El nombre no puede exceder 100 caracteres";
                return "";
            case "precio":
                if (!value) return "El precio es obligatorio";
                if (parseFloat(value) <= 0) return "El precio debe ser mayor a 0";
                if (parseFloat(value) > 999999) return "El precio no puede exceder S/ 999,999";
                return "";
            case "stock":
                if (value && parseInt(value) < 0) return "El stock no puede ser negativo";
                if (value && parseInt(value) > 999999) return "El stock no puede exceder 999,999";
                return "";
            case "stockMinimo":
                if (value && parseInt(value) < 0) return "El stock mínimo no puede ser negativo";
                return "";
            default:
                return "";
        }
    };

    // ✅ Validación completa del formulario
    const validateForm = () => {
        const newErrors = {};

        newErrors.nombre = validateField("nombre", productForm.nombre);
        newErrors.precio = validateField("precio", productForm.precio);
        newErrors.stock = validateField("stock", productForm.stock);
        newErrors.stockMinimo = validateField("stockMinimo", productForm.stockMinimo);

        if (!editingProduct) {
            if (uploadedImages.length === 0) {
                newErrors.imagenes = "Debes agregar al menos una imagen para el producto";
            } else if (uploadedImages.length > 10) {
                newErrors.imagenes = "Máximo 10 imágenes por producto";
            }
        }

        setErrors(newErrors);
        const isValid = Object.values(newErrors).every(error => error === "");

        if (!isValid) {
            const firstError = Object.values(newErrors).find(error => error !== "");
            if (firstError) {
                showNotification("error", "Campos incompletos", firstError, "Completa todos los campos obligatorios");
            }
        }

        return isValid;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const error = validateField(field, productForm[field]);
        setErrors({ ...errors, [field]: error });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const uploadImages = async (productoId, files) => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No se encontró token de autenticación");
        }

        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        formData.append("productoId", productoId.toString());

        const response = await fetch("http://localhost:8080/api/producto-imagenes/upload-multiple", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Error ${response.status}`);
        }

        const result = await response.json();

        return {
            success: true,
            resultados: result.imagenes || [],
            exitosas: result.imagenes?.length || 0,
            total: files.length,
            fallidas: files.length - (result.imagenes?.length || 0)
        };
    };

    const handleAddImage = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalImages = uploadedImages.length + files.length;

        if (totalImages > 10) {
            showNotification("warning", "Límite excedido", `Máximo 10 imágenes por producto. Actualmente tienes ${uploadedImages.length} y estás agregando ${files.length}.`);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            showNotification("warning", "Archivo muy grande", `${oversizedFiles.map(f => f.name).join(", ")} excede el límite de 5MB`);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            showNotification("warning", "Formato no válido", `${invalidFiles.map(f => f.name).join(", ")} no es una imagen válida. Formatos permitidos: JPG, PNG, WEBP`);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        setUploadedImages(prev => [...prev, ...files]);
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...urls]);

        if (errors.imagenes) {
            setErrors({ ...errors, imagenes: "" });
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        showNotification("success", "Imágenes agregadas", `Se agregaron ${files.length} imagen(es). Total: ${totalImages} imagen(es)`);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);

        const newImages = [...uploadedImages];
        const newUrls = [...previewUrls];
        newImages.splice(index, 1);
        newUrls.splice(index, 1);

        setUploadedImages(newImages);
        setPreviewUrls(newUrls);

        if (!editingProduct && newImages.length === 0) {
            setErrors({ ...errors, imagenes: "Debes agregar al menos una imagen para el producto" });
        } else {
            setErrors({ ...errors, imagenes: "" });
        }
    };

    const crearStock = async (productoId, cantidad) => {
        try {
            const stockExistente = await stockService.buscarPorProducto(productoId);
            if (!stockExistente?.id) {
                await stockService.crear({
                    producto: { id: productoId },
                    cantidad: cantidad
                });
            } else {
                await stockService.actualizar(stockExistente.id, {
                    ...stockExistente,
                    cantidad: cantidad
                });
            }
        } catch (error) {
            showNotification("warning", "Stock", "Producto creado pero hubo problema con el stock");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allFields = ["nombre", "precio", "stock", "stockMinimo"];
        const touchedFields = {};
        allFields.forEach(field => { touchedFields[field] = true; });
        setTouched(touchedFields);

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        setLoading(true);
        setNotification(null);

        try {
            const productoData = {
                nombre: productForm.nombre.trim(),
                descripcion: productForm.descripcion,
                precio: parseFloat(productForm.precio),
                stockMinimo: parseInt(productForm.stockMinimo),
                activo: productForm.activo,
                stock: parseInt(productForm.stock) || 0
            };

            if (editingProduct) {
                await productoService.actualizar(editingProduct.id, productoData);
                showNotification("success", "¡Actualizado!", "Producto actualizado correctamente");
                setTimeout(() => {
                    onRefresh();
                    onClose();
                }, 1500);
                return;
            }

            const respuesta = await productoService.crear(productoData);

            const productoId = respuesta.producto?.id || respuesta.id;
            if (!productoId) {
                throw new Error("No se pudo obtener el ID del producto");
            }

            await crearStock(productoId, parseInt(productForm.stock) || 0);

            if (uploadedImages.length > 0) {
                setUploadingImages(true);
                showNotification("info", "Subiendo imágenes", `Subiendo ${uploadedImages.length} imagen(es)...`);

                const resultado = await uploadImages(productoId, uploadedImages);
                setUploadingImages(false);

                if (resultado.exitosas === resultado.total) {
                    showNotification(
                        "success",
                        "¡Producto Creado!",
                        `"${productForm.nombre}" agregado al catálogo`,
                        `${resultado.exitosas} imagen(es) subida(s) correctamente`
                    );
                } else if (resultado.exitosas > 0) {
                    showNotification(
                        "warning",
                        "Producto Creado",
                        `"${productForm.nombre}" fue creado`,
                        `${resultado.exitosas} de ${resultado.total} imagen(es) subidas`
                    );
                } else {
                    showNotification(
                        "warning",
                        "Producto Creado",
                        `"${productForm.nombre}" fue creado`,
                        "No se pudieron subir las imágenes. Puedes agregarlas después."
                    );
                }
            }

            setTimeout(() => {
                onRefresh();
                onClose();
            }, 2000);

        } catch (error) {
            setUploadingImages(false);

            let errorTitle = "Error";
            let errorMessage = "Error al guardar producto";
            let errorDetail = "Verifica los datos e intenta nuevamente";

            if (error.message) {
                try {
                    let cleanMessage = error.message.replace(/^Error \d+:\s*/, '');
                    const parsed = JSON.parse(cleanMessage);

                    if (parsed.error === "DUPLICATE_PRODUCT") {
                        errorTitle = "Producto Duplicado";
                        errorMessage = parsed.message || "Ya existe un producto con este nombre";
                        errorDetail = parsed.suggestion || "Verifica el catálogo o utiliza un nombre diferente";
                    } else {
                        errorMessage = parsed.message || parsed.error || errorMessage;
                        errorDetail = parsed.suggestion || parsed.detail || errorDetail;
                    }
                } catch (e) {
                    errorMessage = error.message;
                }
            }

            showNotification(
                "error",
                errorTitle,
                errorMessage,
                errorDetail
            );

        } finally {
            setLoading(false);
        }
    };

    const notificationStyles = {
        success: { bg: "from-emerald-500 to-teal-600", icon: <CheckCircle size={24} />, shadow: "shadow-emerald-500/20" },
        error: { bg: "from-rose-500 to-red-600", icon: <AlertCircle size={24} />, shadow: "shadow-rose-500/20" },
        warning: { bg: "from-amber-500 to-orange-600", icon: <AlertTriangle size={24} />, shadow: "shadow-amber-500/20" },
        info: { bg: "from-blue-500 to-indigo-600", icon: <Info size={24} />, shadow: "shadow-blue-500/20" }
    };

    return (
        <>
            {notification && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className={`bg-gradient-to-r ${notificationStyles[notification.type].bg} text-white rounded-2xl shadow-2xl ${notificationStyles[notification.type].shadow} max-w-md w-full mx-4 border border-white/20`}>
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="animate-bounce">
                                    {notificationStyles[notification.type].icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-base tracking-wide">{notification.title}</h4>
                                    <p className="text-sm mt-1 opacity-95">{notification.message}</p>
                                    {notification.suggestion && (
                                        <div className="mt-3 pt-2 border-t border-white/30">
                                            <p className="text-xs flex items-center gap-1">
                                                <Info size={12} /> {notification.suggestion}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setNotification(null)}
                                    className="text-white/60 hover:text-white transition-all hover:scale-110 duration-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white/80 rounded-full animate-[shrink_5s_linear_forwards]" />
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white px-6 pt-6 pb-3 border-b border-gray-100 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black bg-gradient-to-r from-[#0d0c1e] to-[#5b4eff] bg-clip-text text-transparent flex items-center gap-2">
                                {editingProduct ? <Edit size={18} /> : <Package size={18} />}
                                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                            </h3>
                            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Package size={12} />
                                    Nombre del Producto <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    className={`w-full p-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 transition-all ${touched.nombre && errors.nombre ? "border-rose-500 bg-rose-50" : "border-gray-100"
                                        }`}
                                    value={productForm.nombre}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur("nombre")}
                                    placeholder="Ej: iPhone 15 Pro"
                                />
                                {touched.nombre && errors.nombre && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.nombre}
                                    </p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <FileText size={12} />
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    rows="3"
                                    className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl resize-none focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 transition-all"
                                    value={productForm.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describe las características del producto..."
                                />
                            </div>

                            {/* Precio y Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <DollarSign size={12} />
                                        Precio (S/) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        step="0.01"
                                        required
                                        className={`w-full p-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 transition-all ${touched.precio && errors.precio ? "border-rose-500 bg-rose-50" : "border-gray-100"
                                            }`}
                                        value={productForm.precio}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur("precio")}
                                        placeholder="0.00"
                                    />
                                    {touched.precio && errors.precio && (
                                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={10} /> {errors.precio}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <Box size={12} />
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        className={`w-full p-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 transition-all ${touched.stock && errors.stock ? "border-rose-500 bg-rose-50" : "border-gray-100"
                                            }`}
                                        value={productForm.stock}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur("stock")}
                                        placeholder="0"
                                    />
                                    {touched.stock && errors.stock && (
                                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={10} /> {errors.stock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stock Mínimo y Activo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Stock Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        name="stockMinimo"
                                        className={`w-full p-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:border-[#5b4eff] focus:ring-2 focus:ring-[#5b4eff]/20 transition-all ${touched.stockMinimo && errors.stockMinimo ? "border-rose-500 bg-rose-50" : "border-gray-100"
                                            }`}
                                        value={productForm.stockMinimo}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur("stockMinimo")}
                                        placeholder="5"
                                    />
                                    {touched.stockMinimo && errors.stockMinimo && (
                                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={10} /> {errors.stockMinimo}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={8} /> Alerta de stock bajo
                                    </p>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-xl w-full hover:bg-gray-100 transition-all">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={productForm.activo}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded text-[#5b4eff] focus:ring-[#5b4eff]"
                                        />
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Shield size={14} /> Producto Activo
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Imágenes - SOLO PARA PRODUCTOS NUEVOS */}
                            {!editingProduct && (
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <Image size={12} />
                                        Imágenes del Producto <span className="text-rose-500">*</span>
                                    </label>

                                    <div className={`border-2 border-dashed rounded-xl p-4 text-center hover:border-[#5b4eff] transition-all hover:bg-gray-50 cursor-pointer group ${errors.imagenes ? "border-rose-500 bg-rose-50" : "border-gray-200"
                                        }`}>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleAddImage}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            <Upload size={32} className="text-gray-400 group-hover:scale-110 transition-transform group-hover:text-[#5b4eff]" />
                                            <span className="text-sm text-gray-500 font-medium">Haz clic para subir imágenes</span>
                                            <span className="text-xs text-gray-400">Puedes seleccionar múltiples imágenes (JPG, PNG, WEBP hasta 5MB)</span>
                                        </label>
                                    </div>

                                    {errors.imagenes && (
                                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={10} /> {errors.imagenes}
                                        </p>
                                    )}

                                    {previewUrls.length > 0 && previewUrls.length < 10 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-3 w-full py-2 text-sm text-[#5b4eff] border border-[#5b4eff] rounded-xl hover:bg-[#5b4eff] hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> Agregar más imágenes ({previewUrls.length}/10)
                                        </button>
                                    )}

                                    {previewUrls.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                                    <Camera size={12} /> {previewUrls.length} / 10 imagen(es) seleccionada(s)
                                                </p>
                                                <p className="text-[10px] text-green-600 flex items-center gap-1">
                                                    <Star size={10} /> La primera será la principal
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                                                {previewUrls.map((url, idx) => (
                                                    <div key={idx} className="relative group flex-shrink-0">
                                                        <img
                                                            src={url}
                                                            alt={`preview-${idx}`}
                                                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 group-hover:border-[#5b4eff] transition-all"
                                                        />

                                                        {idx === 0 && (
                                                            <span className="absolute top-1 left-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
                                                                <Star size={8} /> Principal
                                                            </span>
                                                        )}

                                                        {idx > 0 && (
                                                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                                                #{idx + 1}
                                                            </span>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-rose-600 hover:scale-110 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                                            title="Eliminar imagen"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {previewUrls.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                                            <AlertTriangle size={10} /> Es obligatorio agregar al menos una imagen
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || uploadingImages}
                                    className={`flex-1 py-3 bg-gradient-to-r from-[#5b4eff] to-[#4a3dcc] text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${loading || uploadingImages ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:scale-105"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Guardando...
                                        </>
                                    ) : uploadingImages ? (
                                        <>
                                            <Upload size={16} className="animate-pulse" /> Subiendo imágenes...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} /> {editingProduct ? "Actualizar Producto" : "Guardar Producto"}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center gap-2"
                                >
                                    <X size={14} /> Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

// Componente FileText para la descripción (agregar si no existe en lucide-react)
const FileText = ({ size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
);