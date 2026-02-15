export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map