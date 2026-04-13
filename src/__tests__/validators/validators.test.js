import { describe, test, expect } from 'vitest';

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pe|net|org)$/i;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    return /^9\d{8}$/.test(phone);
};

const validateName = (name) => {
    return /^[a-zA-ZáéíóúñÑ\s]{3,}$/.test(name);
};

describe('Pruebas de validadores', () => {

    describe('validateEmail', () => {
        test('Email válido debe retornar true', () => {
            expect(validateEmail('usuario@test.com')).toBe(true);
        });

        test('Email sin @ debe retornar false', () => {
            expect(validateEmail('usuariotest.com')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        test('Teléfono válido debe retornar true', () => {
            expect(validatePhone('987654321')).toBe(true);
        });

        test('Teléfono inválido debe retornar false', () => {
            expect(validatePhone('12345')).toBe(false);
        });
    });

    describe('validateName', () => {
        test('Nombre válido debe retornar true', () => {
            expect(validateName('Juan Perez')).toBe(true);
        });

        test('Nombre con números debe retornar false', () => {
            expect(validateName('Juan123')).toBe(false);
        });
    });
});