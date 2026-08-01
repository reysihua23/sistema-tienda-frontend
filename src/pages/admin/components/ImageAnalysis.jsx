// src/pages/admin/components/ImageAnalysis.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    CheckCircle, XCircle, AlertCircle, Info, 
    Shield, Image, Loader2, RefreshCw, Check
} from 'lucide-react';
import { useImageAnalysis } from '../../../hooks/useImageAnalysis';

export default function ImageAnalysis({ 
    image, 
    onImageProcessed,
    onCancel,
    onAccept
}) {
    const { 
        analyzeImage, 
        analysisResult, 
        isAnalyzing, 
        processedImage, 
        processingStep,
        clearAnalysis,
        getFinalImage,
        originalPreview,
        processedPreview
    } = useImageAnalysis();
    
    const [localOriginalPreview, setLocalOriginalPreview] = useState(null);
    const hasAnalyzed = useRef(false);

    // ✅ Crear preview local de la imagen original
    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            setLocalOriginalPreview(url);
            
            return () => {
                // No revocar aquí para que se muestre
            };
        }
    }, [image]);

    // ✅ Analizar la imagen al montar
    useEffect(() => {
        if (image && !hasAnalyzed.current) {
            hasAnalyzed.current = true;
            analyzeImage(image);
        }

        return () => {
            clearAnalysis();
            // Revocar la URL local al desmontar
            if (localOriginalPreview) {
                URL.revokeObjectURL(localOriginalPreview);
            }
        };
    }, [image]);

    const handleAccept = () => {
        if (onAccept) {
            const finalImage = getFinalImage() || image;
            onAccept(finalImage);
            clearAnalysis();
        }
    };

    const handleReject = () => {
        hasAnalyzed.current = false;
        clearAnalysis();
        if (onCancel) {
            onCancel();
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBarColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const isProcessing = isAnalyzing || processingStep === 'processing' || processingStep === 'analyzing';
    const isDone = processingStep === 'done' && analysisResult;

    // ✅ Usar la URL local o la del hook
    const originalUrl = localOriginalPreview || originalPreview;

    return (
        <div className="space-y-6">
            {/* PREVIEW DE IMÁGENES */}
            <div className="grid grid-cols-2 gap-6">
                {/* Imagen Original */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Image size={14} /> Imagen Original
                    </label>
                    <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 flex items-center justify-center min-h-[200px] relative">
                        {originalUrl ? (
                            <img 
                                src={originalUrl} 
                                alt="Original" 
                                className="max-h-[200px] object-contain rounded-lg"
                                onError={(e) => {
                                    // Si la imagen falla, intentar recrearla
                                    if (image) {
                                        const newUrl = URL.createObjectURL(image);
                                        setLocalOriginalPreview(newUrl);
                                        e.target.src = newUrl;
                                    }
                                }}
                            />
                        ) : image ? (
                            <div className="text-center">
                                <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Cargando imagen...</p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <Image size={32} className="mx-auto mb-2" />
                                <p className="text-sm">No hay imagen seleccionada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Imagen Procesada */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Shield size={14} /> Imagen Procesada
                    </label>
                    <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 flex items-center justify-center min-h-[200px] relative">
                        {isProcessing ? (
                            <div className="text-center">
                                <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    {processingStep === 'analyzing' ? 'Analizando imagen...' : 'Procesando imagen...'}
                                </p>
                                <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
                                </div>
                            </div>
                        ) : processedPreview ? (
                            <div className="relative">
                                <img 
                                    src={processedPreview} 
                                    alt="Procesada" 
                                    className="max-h-[200px] object-contain rounded-lg"
                                    onError={(e) => {
                                        // Si la imagen procesada falla, mostrar mensaje
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {isDone && analysisResult?.isApt && (
                                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <Image size={32} className="mx-auto mb-2" />
                                <p className="text-sm">Esperando análisis</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RESULTADOS DEL ANÁLISIS */}
            {analysisResult && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                            <Shield size={16} /> Análisis de imagen
                        </h4>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Calidad</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${getScoreBarColor(analysisResult.score)} transition-all duration-500`}
                                        style={{ width: `${analysisResult.score}%` }}
                                    />
                                </div>
                                <span className={`text-sm font-bold ${getScoreColor(analysisResult.score)}`}>
                                    {analysisResult.score}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-gray-500">
                                <span className="font-medium">Formato:</span> {analysisResult.fileType}
                            </p>
                            <p className="text-gray-500">
                                <span className="font-medium">Tamaño:</span> {(analysisResult.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-gray-500">
                                <span className="font-medium">Resolución:</span> {analysisResult.width} x {analysisResult.height}px
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-500">
                                <span className="font-medium">Aspecto:</span> {analysisResult.aspectRatio?.toFixed(2) || 'N/A'}
                            </p>
                            <p className="text-gray-500 flex items-center gap-1">
                                <span className="font-medium">Estado:</span>
                                {analysisResult.isApt ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle size={14} /> Apta para publicidad
                                    </span>
                                ) : (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> Requiere mejoras
                                    </span>
                                )}
                            </p>
                            <p className="text-gray-500">
                                <span className="font-medium">Procesada:</span>
                                {analysisResult.wasProcessed ? (
                                    <span className="text-green-600">✅ Sí</span>
                                ) : (
                                    <span className="text-amber-600">⚠️ No</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Problemas detectados */}
                    {analysisResult.issues && analysisResult.issues.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">
                                <AlertCircle size={12} /> Problemas detectados:
                            </p>
                            <ul className="space-y-1">
                                {analysisResult.issues.map((issue, idx) => (
                                    <li key={idx} className="text-xs text-red-600 flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Sugerencias */}
                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs font-bold text-blue-500 mb-1 flex items-center gap-1">
                                <Info size={12} /> Sugerencias:
                            </p>
                            <ul className="space-y-1">
                                {analysisResult.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="text-xs text-blue-600 flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Mensaje de procesamiento */}
                    {analysisResult.wasProcessed && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={14} />
                                La imagen fue procesada automáticamente (redimensionada y fondo eliminado)
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-3 pt-2">
                {isProcessing ? (
                    <div className="flex-1 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Procesando imagen...
                    </div>
                ) : analysisResult ? (
                    <>
                        {analysisResult.isApt ? (
                            <button
                                onClick={handleAccept}
                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Aceptar imagen
                            </button>
                        ) : (
                            <button
                                onClick={handleReject}
                                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} /> Probar otra imagen
                            </button>
                        )}
                        <button
                            onClick={handleReject}
                            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            <XCircle size={14} /> Cancelar
                        </button>
                    </>
                ) : (
                    <div className="flex-1 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-center text-sm">
                        Esperando imagen...
                    </div>
                )}
            </div>
        </div>
    );
}