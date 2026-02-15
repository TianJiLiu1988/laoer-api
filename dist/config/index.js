"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// 配置常量
exports.config = {
    port: parseInt(process.env.PORT || '18790', 10),
    agentsDir: process.env.AGENTS_DIR || '/root/.openclaw/agents',
    validToken: process.env.API_TOKEN || '4a2e4fc3979f9efa833b392394a859ced2381606c3e22b61',
    // 小弟列表
    subagents: [
        { id: 'analyst', name: 'Mary', role: '市场调研、竞品分析', emoji: '📊' },
        { id: 'pm', name: 'John', role: 'PRD、需求发现', emoji: '📋' },
        { id: 'architect', name: 'Winston', role: '系统架构、技术选型', emoji: '🏗️' },
        { id: 'sm', name: 'Bob', role: 'Sprint 规划、敏捷流程', emoji: '🏃' },
        { id: 'dev', name: 'Amelia', role: '代码实现', emoji: '💻' },
        { id: 'qa', name: 'Quinn', role: '测试自动化', emoji: '🧪' },
        { id: 'ux', name: 'Sally', role: '用户体验设计', emoji: '🎨' },
        { id: 'quickdev', name: 'Barry', role: '快速原型', emoji: '⚡' },
        { id: 'finance', name: 'Fiona', role: '额度监控、财务', emoji: '💰' },
        { id: 'newsbot', name: 'Nina', role: '科技资讯', emoji: '📰' }
    ],
    // 状态判断阈值
    idleThresholdMs: 30 * 60 * 1000, // 30分钟
};
//# sourceMappingURL=index.js.map