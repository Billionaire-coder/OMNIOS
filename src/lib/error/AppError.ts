
export type ErrorCode =
    | 'INTERNAL_ERROR'
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'TIMEOUT';

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly meta?: Record<string, any>;

    constructor(
        message: string,
        code: ErrorCode = 'INTERNAL_ERROR',
        statusCode: number = 500,
        meta?: Record<string, any>,
        isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.meta = meta;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }

    static badRequest(message: string, meta?: any) {
        return new AppError(message, 'BAD_REQUEST', 400, meta);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new AppError(message, 'UNAUTHORIZED', 401);
    }

    static forbidden(message: string = 'Forbidden') {
        return new AppError(message, 'FORBIDDEN', 403);
    }

    static notFound(message: string = 'Resource not found') {
        return new AppError(message, 'NOT_FOUND', 404);
    }

    static internal(message: string = 'Internal Server Error', meta?: any) {
        return new AppError(message, 'INTERNAL_ERROR', 500, meta);
    }
}
