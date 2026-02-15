"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 小弟路由
const express_1 = require("express");
const subagent_service_1 = require("../../services/subagent.service");
const router = (0, express_1.Router)();
/**
 * GET /subagents - 获取所有小弟及其状态
 */
router.get('/', async (req, res, next) => {
    try {
        const subagents = await subagent_service_1.subagentService.getAllSubagents();
        res.json({ subagents });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=subagents.js.map