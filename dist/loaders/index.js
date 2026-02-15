"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.loadAll = loadAll;
const express_1 = require("./express");
const logger_1 = require("./logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
async function loadAll(app) {
    (0, express_1.loadExpress)(app);
    logger_1.logger.info('Express loaded');
}
//# sourceMappingURL=index.js.map