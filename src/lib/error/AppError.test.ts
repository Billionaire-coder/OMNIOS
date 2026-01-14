
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { AppError } from './AppError';

describe('AppError', () => {
    it('should create an error with correct properties', () => {
        const error = new AppError('Test error', 'BAD_REQUEST', 400);
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('BAD_REQUEST');
        expect(error.statusCode).toBe(400);
        expect(error.isOperational).toBe(true);
    });

    it('should use static factories correctly', () => {
        const error = AppError.notFound('Missing resource');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
    });
});
