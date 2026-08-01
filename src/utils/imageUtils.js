// src/utils/imageUtils.js

/**
 * Redimensiona la imagen a un tamaño estándar (800x800px)
 * - Si es más pequeña, la agranda
 * - Si es más grande, la reduce
 * - Mantiene la proporción y centra la imagen en un canvas cuadrado
 */
export const resizeAndCropToSquare = (file, targetSize = 800) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            // Fondo blanco por defecto (luego se eliminará)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetSize, targetSize);

            // Calcular para centrar la imagen manteniendo proporción
            let drawWidth = targetSize;
            let drawHeight = targetSize;
            let offsetX = 0;
            let offsetY = 0;

            const ratio = img.width / img.height;

            if (ratio > 1) {
                // Imagen más ancha que alta
                drawHeight = targetSize / ratio;
                offsetY = (targetSize - drawHeight) / 2;
            } else {
                // Imagen más alta que ancha
                drawWidth = targetSize * ratio;
                offsetX = (targetSize - drawWidth) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^.]+$/, '.png'), {
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    resolve(newFile);
                } else {
                    reject(new Error('Error al redimensionar la imagen'));
                }
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Error al cargar la imagen'));
        };

        img.src = objectUrl;
    });
};

/**
 * Elimina el fondo de la imagen (simulado con canvas)
 * En producción usarías remove.bg API o similar
 */
export const removeBackground = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Simulación de eliminación de fondo
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Detectar color de fondo (esquinas)
            const bgColors = [
                [data[0], data[1], data[2]],
                [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]],
                [data[(canvas.height - 1) * canvas.width * 4], data[(canvas.height - 1) * canvas.width * 4 + 1], data[(canvas.height - 1) * canvas.width * 4 + 2]],
                [data[(canvas.width - 1 + (canvas.height - 1) * canvas.width) * 4], data[(canvas.width - 1 + (canvas.height - 1) * canvas.width) * 4 + 1], data[(canvas.width - 1 + (canvas.height - 1) * canvas.width) * 4 + 2]]
            ];

            // Color promedio de fondo
            const avgBg = [
                (bgColors[0][0] + bgColors[1][0] + bgColors[2][0] + bgColors[3][0]) / 4,
                (bgColors[0][1] + bgColors[1][1] + bgColors[2][1] + bgColors[3][1]) / 4,
                (bgColors[0][2] + bgColors[1][2] + bgColors[2][2] + bgColors[3][2]) / 4
            ];

            const tolerance = 60;

            // Hacer transparentes los píxeles que coinciden con el fondo
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (Math.abs(r - avgBg[0]) < tolerance &&
                    Math.abs(g - avgBg[1]) < tolerance &&
                    Math.abs(b - avgBg[2]) < tolerance) {
                    data[i + 3] = 0; // Hacer transparente
                }
            }

            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^.]+$/, '.png'), {
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    resolve(newFile);
                } else {
                    reject(new Error('Error al eliminar el fondo'));
                }
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Error al cargar la imagen'));
        };

        img.src = objectUrl;
    });
};

/**
 * Procesa la imagen completa: redimensiona + elimina fondo
 */
export const processImage = async (file) => {
    try {
        // Paso 1: Redimensionar a 800x800px
        console.log('📐 Redimensionando imagen...');
        const resizedFile = await resizeAndCropToSquare(file, 800);

        // Paso 2: Eliminar fondo
        console.log('🎨 Eliminando fondo...');
        const noBgFile = await removeBackground(resizedFile);

        console.log('✅ Imagen procesada correctamente');
        return noBgFile;
    } catch (error) {
        console.error('❌ Error procesando imagen:', error);
        throw error;
    }
};

/**
 * Analiza la calidad de la imagen
 */
export const analyzeImageQuality = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const analysis = {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height,
                isApt: false,
                issues: [],
                suggestions: [],
                score: 0,
                isSquare: Math.abs(img.width - img.height) < 50
            };

            // Validar que sea cuadrado (800x800)
            if (!analysis.isSquare) {
                analysis.issues.push('La imagen no es cuadrada (debe ser 800x800px)');
                analysis.suggestions.push('La imagen ya fue procesada a 800x800px');
            }

            // Validar tamaño (debe ser 800x800)
            if (img.width !== 800 || img.height !== 800) {
                analysis.issues.push('La imagen no tiene el tamaño estándar de 800x800px');
                analysis.suggestions.push('La imagen ya fue procesada al tamaño correcto');
            }

            // Verificar si tiene fondo transparente
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const hasTransparency = detectTransparency(imageData);

            if (!hasTransparency) {
                analysis.issues.push('La imagen no tiene fondo transparente');
                analysis.suggestions.push('La imagen será procesada para eliminar el fondo');
            }

            // Calcular score
            let score = 100;
            if (!analysis.isSquare) score -= 30;
            if (img.width !== 800 || img.height !== 800) score -= 30;
            if (!hasTransparency) score -= 20;

            analysis.score = Math.max(0, Math.min(100, score));
            analysis.isApt = analysis.score >= 70 && analysis.issues.length === 0;

            resolve(analysis);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('No se pudo cargar la imagen'));
        };

        img.src = objectUrl;
    });
};

/**
 * Detecta si la imagen tiene píxeles transparentes
 */
const detectTransparency = (imageData) => {
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 40) {
        if (data[i] < 255) return true;
    }
    return false;
};