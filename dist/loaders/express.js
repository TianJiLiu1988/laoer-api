"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExpress = loadExpress;
// Express 配置
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("../api/middlewares/auth");
const errorHandler_1 = require("../api/middlewares/errorHandler");
const requestLogger_1 = require("../api/middlewares/requestLogger");
const api_1 = __importDefault(require("../api"));
function loadExpress(app) {
    // 基础中间件
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // 请求日志
    app.use(requestLogger_1.requestLogger);
    // 认证中间件
    app.use(auth_1.authMiddleware);
    // 路由
    app.use(api_1.default);
    // 错误处理（必须在最后）
    app.use(errorHandler_1.errorHandler);
}
//# sourceMappingURL=express.js.map