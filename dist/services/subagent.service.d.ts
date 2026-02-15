import { SubagentWithStatus } from '../models/subagent';
export declare class SubagentService {
    private readonly agentsDir;
    constructor();
    /**
     * 获取所有小弟及其状态
     */
    getAllSubagents(): Promise<SubagentWithStatus[]>;
}
export declare const subagentService: SubagentService;
//# sourceMappingURL=subagent.service.d.ts.map