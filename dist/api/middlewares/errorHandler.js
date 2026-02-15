"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../../utils/errors");
const logger_1 = require("../../loaders/logger");
function errorHandler(err, req, res, _next) {
    if (err instanceof errors_1.AppError) {
        logger_1.logger.warn(`${err.statusCode} - ${err.message} - ${req.method} ${req.path}`);
        res.status(err.statusCode).json({
            error: err.message
        });
        return;
    }
    // 未知错误
    logger_1.logger.error(`500 - ${err.message} - ${req.method} ${req.path}\n${err.stack}`);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
}
//# sourceMappingURL=errorHandler.js.map