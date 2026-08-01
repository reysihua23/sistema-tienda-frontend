// src/hooks/useImageAnalysis.js
import { useState, useCallback, useRef } from 'react';
import { analyzeImageQuality, processImage } from '../utils/imageUtils';

export const useImageAnalysis = () => {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [processedImage, setProcessedImage] = useState(null);
    const [processingStep, setProcessingStep] = useState('idle');
    const [originalPreview, setOriginalPreview] = useState(null);
    const [processedPreview, setProcessedPreview] = useState(null);
    const isAnalyzingRef = useRef(false);

    const analyzeImage = useCallback(async (file) => {
        if (!file || isAnalyzingRef.current) return;

        isAnalyzingRef.current = true;
        setIsAnalyzing(true);
        setProcessingStep('analyzing');
        setAnalysisResult(null);

        // ✅ Guardar preview de la imagen original (CON REVOCACIÓN)
        if (originalPreview) {
            URL.revokeObjectURL(originalPreview);
        }
        const originalUrl = URL.createObjectURL(file);
        setOriginalPreview(originalUrl);

        try {
            // PASO 1: Redimensionar y eliminar fondo
            console.log('🔄 Procesando imagen (redimensionar + quitar fondo)...');
            setProcessingStep('processing');

            const processedFile = await processImage(file);
            setProcessedImage(processedFile);

            // Mostrar preview de la imagen procesada
            const processedUrl = URL.createObjectURL(processedFile);
            setProcessedPreview(processedUrl);

            // PASO 2: Analizar la imagen procesada
            console.log('📊 Analizando imagen procesada...');
            setProcessingStep('analyzing');

            const qualityAnalysis = await analyzeImageQuality(processedFile);

            const result = {
                ...qualityAnalysis,
                originalFile: file,
                processedFile: processedFile,
                wasProcessed: true,
                needsResize: false,
                needsBackgroundRemoval: false
            };

            setAnalysisResult(result);
            setProcessingStep('done');

            return result;

        } catch (error) {
            console.error('❌ Error procesando imagen:', error);
            setProcessingStep('error');

            const fallbackResult = {
                isApt: false,
                score: 0,
                issues: ['Error al procesar la imagen: ' + error.message],
                suggestions: ['Intenta con otra imagen'],
                width: 0,
                height: 0,
                fileSize: file.size,
                fileType: file.type,
                fileName: file.name,
                aspectRatio: 0,
                wasProcessed: false
            };
            setAnalysisResult(fallbackResult);
            throw error;
        } finally {
            setIsAnalyzing(false);
            isAnalyzingRef.current = false;
        }
    }, []);

    const clearAnalysis = useCallback(() => {
        if (originalPreview) {
            URL.revokeObjectURL(originalPreview);
        }
        if (processedPreview) {
            URL.revokeObjectURL(processedPreview);
        }
        setOriginalPreview(null);
        setProcessedPreview(null);
        setAnalysisResult(null);
        setProcessedImage(null);
        setProcessingStep('idle');
        isAnalyzingRef.current = false;
    }, [originalPreview, processedPreview]);

    const getFinalImage = useCallback(() => {
        return processedImage || null;
    }, [processedImage]);

    return {
        analysisResult,
        isAnalyzing,
        processedImage,
        processingStep,
        originalPreview,
        processedPreview,
        analyzeImage,
        clearAnalysis,
        getFinalImage,
        isApt: analysisResult?.isApt || false,
        score: analysisResult?.score || 0,
        issues: analysisResult?.issues || [],
        suggestions: analysisResult?.suggestions || []
    };
};