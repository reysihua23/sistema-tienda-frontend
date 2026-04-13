// src/__tests__/utils/formatters.test.js
import { describe, test, expect } from 'vitest';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(price);
};

describe('Pruebas de formateadores', () => {

    test('formatPrice debe formatear 100 como S/100.00', () => {
        // El formato real es "S/100.00" sin espacio
        expect(formatPrice(100)).toBe('S/100.00');
    });

    test('formatPrice debe formatear 49.99 como S/49.99', () => {
        expect(formatPrice(49.99)).toBe('S/49.99');
    });

    test('formatPrice debe manejar valor 0', () => {
        expect(formatPrice(0)).toBe('S/0.00');
    });
});