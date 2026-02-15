"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 应用入口
const express_1 = __importDefault(require("express"));
const loaders_1 = require("./loaders");
const config_1 = require("./config");
async function startServer() {
    const app = (0, express_1.default)();
    await (0, loaders_1.loadAll)(app);
    app.listen(config_1.config.port, '0.0.0.0', () => {
        loaders_1.logger.info(`Laoer API server running on port ${config_1.config.port}`);
    });
}
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=app.js.map