export interface MessageContent {
    text: string;
}
export interface ParsedMessage {
    role: string;
    content: MessageContent;
    timestamp?: number;
}
export interface JsonlMessageEntry {
    type?: string;
    message?: {
        role: string;
        content: string | ContentPart[];
        timestamp?: number;
    };
    role?: string;
    content?: string | ContentPart[];
    timestamp?: number;
    ts?: number;
}
export interface ContentPart {
    type: string;
    text?: string;
    name?: string;
    content?: string | unknown;
}
//# sourceMappingURL=message.d.ts.map