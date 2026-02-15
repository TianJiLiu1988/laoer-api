// JSONL 解析工具
import { ParsedMessage, JsonlMessageEntry, ContentPart } from '../models/message';

/**
 * 从 content 数组或字符串中提取文本
 */
function extractTextFromContent(content: string | ContentPart[]): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (!Array.isArray(content)) {
    return '';
  }
  
  const parts: string[] = [];
  
  for (const c of content) {
    if (c.type === 'text' && c.text) {
      parts.push(c.text);
    } else if (c.type === 'toolCall' && c.name) {
      parts.push(`🔧 调用: ${c.name}`);
    } else if (c.type === 'toolResult') {
      const resultPreview = typeof c.content === 'string'
        ? c.content.slice(0, 200)
        : JSON.stringify(c.content).slice(0, 200);
      parts.push(`📋 结果: ${resultPreview}${resultPreview.length >= 200 ? '...' : ''}`);
    }
  }
  
  return parts.join('\n');
}

/**
 * 解析 JSONL 文件内容为消息数组
 */
export function parseJsonlContent(content: string): ParsedMessage[] {
  const lines = content.trim().split('\n').filter(line => line);
  const messages: ParsedMessage[] = [];
  
  for (const line of lines) {
    try {
      const entry: JsonlMessageEntry = JSON.parse(line);
      let text = '';
      let role = '';
      let timestamp: number | undefined;
      
      // 处理 type: "message" 格式
      if (entry.type === 'message' && entry.message) {
        const msg = entry.message;
        if (msg.role && msg.content) {
          role = msg.role;
          text = extractTextFromContent(msg.content);
          timestamp = msg.timestamp || entry.timestamp;
        }
      }
      // 处理旧格式 (直接 role + content)
      else if (entry.role && entry.content) {
        role = entry.role;
        text = extractTextFromContent(entry.content);
        timestamp = entry.timestamp || entry.ts;
      }
      
      if (text && role) {
        messages.push({
          role,
          content: { text },
          timestamp
        });
      }
    } catch {
      // 跳过解析失败的行
    }
  }
  
  return messages;
}
