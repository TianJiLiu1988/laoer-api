"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const config_1 = require("../../config");
const errors_1 = require("../../utils/errors");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.UnauthorizedError('Missing or invalid authorization header');
    }
    const token = authHeader.slice(7);
    if (token !== config_1.config.validToken) {
        throw new errors_1.ForbiddenError('Invalid token');
    }
    next();
}
//# sourceMappingURL=auth.js.map