export declare const config: {
    port: number;
    agentsDir: string;
    validToken: string;
    subagents: readonly [{
        readonly id: "analyst";
        readonly name: "Mary";
        readonly role: "市场调研、竞品分析";
        readonly emoji: "📊";
    }, {
        readonly id: "pm";
        readonly name: "John";
        readonly role: "PRD、需求发现";
        readonly emoji: "📋";
    }, {
        readonly id: "architect";
        readonly name: "Winston";
        readonly role: "系统架构、技术选型";
        readonly emoji: "🏗️";
    }, {
        readonly id: "sm";
        readonly name: "Bob";
        readonly role: "Sprint 规划、敏捷流程";
        readonly emoji: "🏃";
    }, {
        readonly id: "dev";
        readonly name: "Amelia";
        readonly role: "代码实现";
        readonly emoji: "💻";
    }, {
        readonly id: "qa";
        readonly name: "Quinn";
        readonly role: "测试自动化";
        readonly emoji: "🧪";
    }, {
        readonly id: "ux";
        readonly name: "Sally";
        readonly role: "用户体验设计";
        readonly emoji: "🎨";
    }, {
        readonly id: "quickdev";
        readonly name: "Barry";
        readonly role: "快速原型";
        readonly emoji: "⚡";
    }, {
        readonly id: "finance";
        readonly name: "Fiona";
        readonly role: "额度监控、财务";
        readonly emoji: "💰";
    }, {
        readonly id: "newsbot";
        readonly name: "Nina";
        readonly role: "科技资讯";
        readonly emoji: "📰";
    }];
    idleThresholdMs: number;
};
export type SubagentConfig = typeof config.subagents[number];
//# sourceMappingURL=index.d.ts.map