"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 路由入口
const express_1 = require("express");
const subagents_1 = __importDefault(require("./routes/subagents"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const router = (0, express_1.Router)();
// 挂载路由
router.use('/subagents', subagents_1.default);
router.use(sessions_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map