const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 18790;

// Gateway token for authentication
const VALID_TOKEN = '4a2e4fc3979f9efa833b392394a859ced2381606c3e22b61';

// Agents base directory
const AGENTS_DIR = '/root/.openclaw/agents';

// 小弟列表
const SUBAGENTS = [
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
];

app.use(cors());
app.use(express.json());

// Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.slice(7);
  if (token !== VALID_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  next();
}

app.use(authenticate);

// GET /subagents - 获取所有小弟及其状态
app.get('/subagents', async (req, res) => {
  try {
    const result = [];
    
    for (const agent of SUBAGENTS) {
      const sessionsDir = path.join(AGENTS_DIR, agent.id, 'sessions');
      const sessionsFile = path.join(sessionsDir, 'sessions.json');
      
      let status = 'offline';
      let lastActiveAt = null;
      let currentTask = null;
      let sessions = [];
      
      try {
        const content = await fs.readFile(sessionsFile, 'utf-8');
        const data = JSON.parse(content);
        
        // sessions.json 是对象格式，key 是 sessionKey，value 是会话信息
        const sessionEntries = Object.entries(data).filter(([key, val]) => 
          typeof val === 'object' && val.sessionId
        );
        
        if (sessionEntries.length > 0) {
          // 转换为数组并按 updatedAt 排序
          const sortedSessions = sessionEntries
            .map(([key, val]) => ({ key, ...val }))
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          
          const latestSession = sortedSessions[0];
          lastActiveAt = latestSession.updatedAt;
          
          // 判断状态：30分钟内活跃为 idle
          const now = Date.now();
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (lastActiveAt && now - lastActiveAt < thirtyMinutes) {
            status = 'idle';
          }
          
          // 获取会话列表
          sessions = sortedSessions.slice(0, 10).map(s => ({
            id: s.sessionId,
            key: s.key,
            updatedAt: s.updatedAt,
            status: s.abortedLastRun ? 'interrupted' : 'completed'
          }));
        }
      } catch (err) {
        // 文件不存在或解析失败，保持 offline 状态
      }
      
      result.push({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        status,
        lastActiveAt,
        currentTask,
        sessionCount: sessions.length,
        sessions
      });
    }
    
    res.json({ subagents: result });
  } catch (error) {
    console.error('Error fetching subagents:', error.message);
    res.status(500).json({ error: 'Failed to fetch subagents', details: error.message });
  }
});

// GET /subagents/:agentId/sessions - 获取某个小弟的会话列表
app.get('/subagents/:agentId/sessions', async (req, res) => {
  try {
    const { agentId } = req.params;
    const sessionsDir = path.join(AGENTS_DIR, agentId, 'sessions');
    const sessionsFile = path.join(sessionsDir, 'sessions.json');
    
    try {
      const content = await fs.readFile(sessionsFile, 'utf-8');
      const data = JSON.parse(content);
      
      // sessions.json 是对象格式，key 是 sessionKey，value 是会话信息
      const sessionEntries = Object.entries(data).filter(([key, val]) => 
        typeof val === 'object' && val.sessionId
      );
      
      // 按 updatedAt 排序
      const sortedSessions = sessionEntries
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      
      const sessions = sortedSessions.map(s => ({
        id: s.sessionId,
        key: s.key,
        updatedAt: s.updatedAt,
        model: s.model,
        totalTokens: s.totalTokens,
        status: s.abortedLastRun ? 'interrupted' : 'completed'
      }));
      
      res.json({ agentId, sessions });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.json({ agentId, sessions: [] });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching sessions:', error.message);
    res.status(500).json({ error: 'Failed to fetch sessions', details: error.message });
  }
});

// GET /subagents/:agentId/sessions/:sessionId/history - 获取会话历史
app.get('/subagents/:agentId/sessions/:sessionId/history', async (req, res) => {
  try {
    const { agentId, sessionId } = req.params;
    const sessionsDir = path.join(AGENTS_DIR, agentId, 'sessions');
    
    // 尝试找到会话文件（可能有 .deleted 后缀）
    let historyFile = path.join(sessionsDir, `${sessionId}.jsonl`);
    
    try {
      await fs.access(historyFile);
    } catch {
      // 尝试找 .deleted 文件
      const files = await fs.readdir(sessionsDir);
      const deletedFile = files.find(f => f.startsWith(sessionId) && f.includes('.deleted'));
      if (deletedFile) {
        historyFile = path.join(sessionsDir, deletedFile);
      } else {
        return res.status(404).json({ error: 'Session history not found' });
      }
    }
    
    const content = await fs.readFile(historyFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    const messages = [];
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        // 只提取消息内容
        if (entry.role && entry.content) {
          messages.push({
            role: entry.role,
            content: entry.content,
            timestamp: entry.timestamp || entry.ts
          });
        }
      } catch {
        // 跳过解析失败的行
      }
    }
    
    res.json({
      agentId,
      sessionId,
      messageCount: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ error: 'Failed to fetch session history', details: error.message });
  }
});

// GET /api/sessions/:sessionKey/history - 通过 sessionKey 获取会话历史
// sessionKey 格式: agent:{agentId}:subagent:{sessionId}
app.get('/api/sessions/:sessionKey/history', async (req, res) => {
  try {
    const { sessionKey } = req.params;
    
    // 解析 sessionKey: agent:{agentId}:subagent:{uuid}
    const parts = sessionKey.split(':');
    if (parts.length < 4 || parts[0] !== 'agent' || parts[2] !== 'subagent') {
      return res.status(400).json({ error: 'Invalid sessionKey format. Expected: agent:{agentId}:subagent:{uuid}' });
    }
    
    const agentId = parts[1];
    const sessionsDir = path.join(AGENTS_DIR, agentId, 'sessions');
    const sessionsFile = path.join(sessionsDir, 'sessions.json');
    
    // 从 sessions.json 中查找 sessionId
    let sessionId;
    try {
      const sessionsContent = await fs.readFile(sessionsFile, 'utf-8');
      const sessionsData = JSON.parse(sessionsContent);
      const sessionInfo = sessionsData[sessionKey];
      if (sessionInfo && sessionInfo.sessionId) {
        sessionId = sessionInfo.sessionId;
      } else {
        return res.status(404).json({ error: 'Session not found in sessions.json' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'Failed to read sessions.json' });
    }
    
    // 尝试找到会话文件
    let historyFile = path.join(sessionsDir, `${sessionId}.jsonl`);
    
    try {
      await fs.access(historyFile);
    } catch {
      // 尝试找 .deleted 文件
      try {
        const files = await fs.readdir(sessionsDir);
        const deletedFile = files.find(f => f.startsWith(sessionId) && f.includes('.deleted'));
        if (deletedFile) {
          historyFile = path.join(sessionsDir, deletedFile);
        } else {
          return res.status(404).json({ error: 'Session history not found' });
        }
      } catch {
        return res.status(404).json({ error: 'Session history not found' });
      }
    }
    
    const content = await fs.readFile(historyFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    const messages = [];
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        
        // 处理 type: "message" 格式
        if (entry.type === 'message' && entry.message) {
          const msg = entry.message;
          if (msg.role && msg.content) {
            // 提取文本内容（包括 text 和 toolCall）
            let text = '';
            if (typeof msg.content === 'string') {
              text = msg.content;
            } else if (Array.isArray(msg.content)) {
              const parts = [];
              for (const c of msg.content) {
                if (c.type === 'text' && c.text) {
                  parts.push(c.text);
                } else if (c.type === 'toolCall' && c.name) {
                  parts.push(`🔧 调用: ${c.name}`);
                } else if (c.type === 'toolResult') {
                  // 工具结果可以简化显示
                  const resultPreview = typeof c.content === 'string' 
                    ? c.content.slice(0, 200) 
                    : JSON.stringify(c.content).slice(0, 200);
                  parts.push(`📋 结果: ${resultPreview}${resultPreview.length >= 200 ? '...' : ''}`);
                }
              }
              text = parts.join('\n');
            }
            
            if (text) {
              messages.push({
                role: msg.role,
                content: { text },
                timestamp: msg.timestamp || entry.timestamp
              });
            }
          }
        }
        // 处理旧格式 (直接 role + content)
        else if (entry.role && entry.content) {
          let text = '';
          if (typeof entry.content === 'string') {
            text = entry.content;
          } else if (Array.isArray(entry.content)) {
            const parts = [];
            for (const c of entry.content) {
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
            text = parts.join('\n');
          }
          
          if (text) {
            messages.push({
              role: entry.role,
              content: { text },
              timestamp: entry.timestamp || entry.ts
            });
          }
        }
      } catch {
        // 跳过解析失败的行
      }
    }
    
    res.json({
      sessionKey,
      messages
    });
  } catch (error) {
    console.error('Error fetching session history:', error.message);
    res.status(500).json({ error: 'Failed to fetch session history', details: error.message });
  }
});

// 保留旧的 /sessions 接口兼容
app.get('/sessions', async (req, res) => {
  try {
    const sessionsFile = path.join(AGENTS_DIR, 'main', 'sessions', 'sessions.json');
    const content = await fs.readFile(sessionsFile, 'utf-8');
    const data = JSON.parse(content);
    res.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error.message);
    res.status(500).json({ error: 'Failed to fetch sessions', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Laoer API server running on port ${PORT}`);
});
