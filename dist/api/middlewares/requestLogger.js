"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../../loaders/logger");
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map