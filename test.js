/**
 * laoer-api 测试脚本
 * 测试 session history 接口的内容提取逻辑
 */

const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');

// 测试配置
const AGENTS_DIR = '/root/.openclaw/agents';
const TEST_SESSION_KEY = 'agent:finance:subagent:f08bbb9e-3773-42b3-a47d-138dc78430c0';
const TEST_SESSION_ID = 'd05573a7-d5f5-4f43-bda7-7e4dc87cf48a';
const TEST_AGENT_ID = 'finance';

// 从 index.js 复制的内容提取逻辑
function extractMessages(content) {
  const lines = content.trim().split('\n').filter(line => line);
  const messages = [];
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      
      // 处理 type: "message" 格式
      if (entry.type === 'message' && entry.message) {
        const msg = entry.message;
        if (msg.role && msg.content) {
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
  
  return messages;
}

// 测试用例
async function runTests() {
  let passed = 0;
  let failed = 0;
  
  console.log('='.repeat(60));
  console.log('laoer-api 测试开始');
  console.log('='.repeat(60));
  
  // 测试 1: sessions.json 能正确查找 sessionId
  console.log('\n📋 测试 1: sessions.json 查找 sessionId');
  try {
    const sessionsFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', 'sessions.json');
    const sessionsContent = await fs.readFile(sessionsFile, 'utf-8');
    const sessionsData = JSON.parse(sessionsContent);
    
    const sessionInfo = sessionsData[TEST_SESSION_KEY];
    assert(sessionInfo, `sessionKey "${TEST_SESSION_KEY}" 应该存在于 sessions.json`);
    assert.strictEqual(sessionInfo.sessionId, TEST_SESSION_ID, 'sessionId 应该匹配');
    
    console.log(`   ✅ 找到 sessionKey: ${TEST_SESSION_KEY}`);
    console.log(`   ✅ 对应 sessionId: ${sessionInfo.sessionId}`);
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 2: 能正确解析 .jsonl 文件
  console.log('\n📋 测试 2: 解析 .jsonl 文件');
  try {
    const historyFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', `${TEST_SESSION_ID}.jsonl`);
    const content = await fs.readFile(historyFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    
    assert(lines.length > 0, 'jsonl 文件应该有内容');
    
    // 验证每行都是有效 JSON
    let validLines = 0;
    for (const line of lines) {
      try {
        JSON.parse(line);
        validLines++;
      } catch {}
    }
    
    console.log(`   ✅ 文件共 ${lines.length} 行`);
    console.log(`   ✅ 有效 JSON 行: ${validLines}`);
    assert(validLines > 0, '应该有有效的 JSON 行');
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 3: 能正确提取 text 类型内容
  console.log('\n📋 测试 3: 提取 text 类型内容');
  try {
    const historyFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', `${TEST_SESSION_ID}.jsonl`);
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = extractMessages(content);
    
    // 找包含 text 的消息
    const textMessages = messages.filter(m => 
      m.content.text && !m.content.text.startsWith('🔧') && !m.content.text.startsWith('📋')
    );
    
    assert(textMessages.length > 0, '应该有纯文本消息');
    console.log(`   ✅ 找到 ${textMessages.length} 条包含文本的消息`);
    
    // 打印第一条用户消息作为示例
    const userMsg = textMessages.find(m => m.role === 'user');
    if (userMsg) {
      const preview = userMsg.content.text.slice(0, 100);
      console.log(`   ✅ 示例用户消息: "${preview}${preview.length >= 100 ? '...' : ''}"`);
    }
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 4: 能正确提取 toolCall 类型内容
  console.log('\n📋 测试 4: 提取 toolCall 类型内容');
  try {
    const historyFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', `${TEST_SESSION_ID}.jsonl`);
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = extractMessages(content);
    
    // 找包含工具调用的消息
    const toolCallMessages = messages.filter(m => m.content.text.includes('🔧 调用:'));
    
    assert(toolCallMessages.length > 0, '应该有工具调用消息');
    console.log(`   ✅ 找到 ${toolCallMessages.length} 条包含工具调用的消息`);
    
    // 提取工具名称
    const toolNames = new Set();
    for (const msg of toolCallMessages) {
      const matches = msg.content.text.match(/🔧 调用: (\w+)/g);
      if (matches) {
        matches.forEach(m => toolNames.add(m.replace('🔧 调用: ', '')));
      }
    }
    console.log(`   ✅ 调用的工具: ${[...toolNames].join(', ')}`);
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 5: 能正确提取 toolResult 角色的消息
  // 注意：实际数据中 toolResult 是作为独立的 role 存在，而不是嵌套在 content 数组中
  console.log('\n📋 测试 5: 提取 toolResult 角色消息');
  try {
    const historyFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', `${TEST_SESSION_ID}.jsonl`);
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = extractMessages(content);
    
    // 找 role 为 toolResult 的消息
    const toolResultMessages = messages.filter(m => m.role === 'toolResult');
    
    assert(toolResultMessages.length > 0, '应该有 toolResult 角色的消息');
    console.log(`   ✅ 找到 ${toolResultMessages.length} 条 toolResult 角色消息`);
    
    // 验证 toolResult 消息有内容
    const hasContent = toolResultMessages.every(m => m.content.text && m.content.text.length > 0);
    assert(hasContent, 'toolResult 消息应该有内容');
    console.log(`   ✅ 所有 toolResult 消息都有内容`);
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 6: 不会返回空消息
  console.log('\n📋 测试 6: 不返回空消息');
  try {
    const historyFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', `${TEST_SESSION_ID}.jsonl`);
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = extractMessages(content);
    
    const emptyMessages = messages.filter(m => !m.content.text || m.content.text.trim() === '');
    
    assert.strictEqual(emptyMessages.length, 0, '不应该有空消息');
    console.log(`   ✅ 共 ${messages.length} 条消息，无空消息`);
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 7: 验证消息角色正确
  console.log('\n📋 测试 7: 验证消息角色');
  try {
    const historyFile = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions', `${TEST_SESSION_ID}.jsonl`);
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = extractMessages(content);
    
    const roles = new Set(messages.map(m => m.role));
    const validRoles = ['user', 'assistant', 'system', 'toolResult'];
    
    for (const role of roles) {
      assert(validRoles.includes(role), `角色 "${role}" 应该是有效角色`);
    }
    
    console.log(`   ✅ 消息角色: ${[...roles].join(', ')}`);
    
    const userCount = messages.filter(m => m.role === 'user').length;
    const assistantCount = messages.filter(m => m.role === 'assistant').length;
    console.log(`   ✅ user: ${userCount}, assistant: ${assistantCount}`);
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 测试 8: 模拟 /subagents/:agentId/sessions/:sessionId/history 接口逻辑
  console.log('\n📋 测试 8: /subagents/:agentId/sessions/:sessionId/history 接口逻辑');
  try {
    const sessionsDir = path.join(AGENTS_DIR, TEST_AGENT_ID, 'sessions');
    let historyFile = path.join(sessionsDir, `${TEST_SESSION_ID}.jsonl`);
    
    // 检查文件是否存在
    try {
      await fs.access(historyFile);
      console.log(`   ✅ 找到会话文件: ${TEST_SESSION_ID}.jsonl`);
    } catch {
      // 尝试找 .deleted 文件
      const files = await fs.readdir(sessionsDir);
      const deletedFile = files.find(f => f.startsWith(TEST_SESSION_ID) && f.includes('.deleted'));
      if (deletedFile) {
        historyFile = path.join(sessionsDir, deletedFile);
        console.log(`   ✅ 找到已删除会话文件: ${deletedFile}`);
      } else {
        throw new Error('会话文件不存在');
      }
    }
    
    const content = await fs.readFile(historyFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    const messages = [];
    
    // 使用 index.js 中的旧格式解析逻辑
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.role && entry.content) {
          messages.push({
            role: entry.role,
            content: entry.content,
            timestamp: entry.timestamp || entry.ts
          });
        }
      } catch {}
    }
    
    console.log(`   ✅ 解析出 ${messages.length} 条消息 (旧格式逻辑)`);
    passed++;
  } catch (err) {
    console.log(`   ❌ 失败: ${err.message}`);
    failed++;
  }
  
  // 汇总
  console.log('\n' + '='.repeat(60));
  console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('='.repeat(60));
  
  return failed === 0;
}

// 运行测试
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('测试运行出错:', err);
    process.exit(1);
  });
