export interface SessionDetail {
    id: string;
    key: string;
    updatedAt: number;
    model?: string;
    totalTokens?: number;
    status: 'completed' | 'interrupted';
}
export interface SessionHistoryResponse {
    agentId: string;
    sessionId: string;
    messageCount: number;
    messages: Array<{
        role: string;
        content: {
            text: string;
        };
        timestamp?: number;
    }>;
}
export interface SessionKeyHistoryResponse {
    sessionKey: string;
    messages: Array<{
        role: string;
        content: {
            text: string;
        };
        timestamp?: number;
    }>;
}
//# sourceMappingURL=session.d.ts.map