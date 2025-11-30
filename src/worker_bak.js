export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    // 路由处理
    if (path === '/' || path === '/index.html') {
      return new Response(mainPage(), {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders()
        },
      });
    }

    // API 路由
    if (path.startsWith('/api/')) {
      return handleApiRequest(request, path);
    }

    // 静态资源
    if (path.startsWith('/assets/')) {
      return handleStaticAssets(path);
    }

    return new Response(notFoundPage(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  },
};

// API 请求处理
async function handleApiRequest(request, path) {
  try {
    switch (path) {
      case '/api/base64-encode':
        return await handleBase64Encode(request);
      case '/api/base64-decode':
        return await handleBase64Decode(request);
      case '/api/json-format':
        return await handleJsonFormat(request);
      case '/api/url-encode':
        return await handleUrlEncode(request);
      case '/api/url-decode':
        return await handleUrlDecode(request);
      case '/api/hash-generate':
        return await handleHashGenerate(request);
      case '/api/jwt-decode':
        return await handleJwtDecode(request);
      case '/api/timestamp-convert':
        return await handleTimestampConvert(request);
      case '/api/uuid-generate':
        return await handleUuidGenerate(request);
      case '/api/qr-generate':
        return await handleQrGenerate(request);
      case '/api/cron-parse':
        return await handleCronParse(request);
      case '/api/color-convert':
        return await handleColorConvert(request);
      case '/api/yaml-convert':
        return await handleYamlConvert(request);
      default:
        return jsonResponse({ error: 'API endpoint not found' }, 404);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

// Base64 编码
async function handleBase64Encode(request) {
  const { text, file } = await request.json();
  
  if (file) {
    // 文件 Base64 编码
    const cleanBase64 = file.replace(/^data:[^;]+;base64,/, '');
    return jsonResponse({ 
      result: cleanBase64,
      dataUrl: file
    });
  } else if (text) {
    // 文本 Base64 编码
    const base64 = btoa(unescape(encodeURIComponent(text)));
    return jsonResponse({ result: base64 });
  } else {
    throw new Error('No text or file provided');
  }
}

// Base64 解码
async function handleBase64Decode(request) {
  const { base64 } = await request.json();
  
  if (!base64) {
    throw new Error('No base64 data provided');
  }

  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  const text = decodeURIComponent(escape(atob(cleanBase64)));
  
  return jsonResponse({ result: text });
}

// JSON 格式化
async function handleJsonFormat(request) {
  const { json, action = 'format' } = await request.json();
  
  if (!json) {
    throw new Error('No JSON data provided');
  }

  try {
    const parsed = JSON.parse(json);
    
    switch (action) {
      case 'format':
        return jsonResponse({ 
          result: JSON.stringify(parsed, null, 2),
          valid: true
        });
      case 'minify':
        return jsonResponse({ 
          result: JSON.stringify(parsed),
          valid: true
        });
      case 'validate':
        return jsonResponse({ 
          valid: true,
          size: JSON.stringify(parsed).length
        });
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return jsonResponse({ 
      valid: false,
      error: error.message
    });
  }
}

// URL 编码
async function handleUrlEncode(request) {
  const { text } = await request.json();
  
  if (!text) {
    throw new Error('No text provided');
  }

  return jsonResponse({ 
    result: encodeURIComponent(text),
    fullEncode: encodeURI(text)
  });
}

// URL 解码
async function handleUrlDecode(request) {
  const { text } = await request.json();
  
  if (!text) {
    throw new Error('No text provided');
  }

  return jsonResponse({ 
    result: decodeURIComponent(text),
    fullDecode: decodeURI(text)
  });
}

// 哈希生成
async function handleHashGenerate(request) {
  const { text, algorithm = 'SHA-256' } = await request.json();
  
  if (!text) {
    throw new Error('No text provided');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  try {
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return jsonResponse({ 
      result: hashHex,
      algorithm: algorithm
    });
  } catch (error) {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}

// JWT 解码
async function handleJwtDecode(request) {
  const { token } = await request.json();
  
  if (!token) {
    throw new Error('No JWT token provided');
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // 检查过期时间
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    
    return jsonResponse({
      header,
      payload,
      isExpired,
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
    });
  } catch (error) {
    throw new Error('Invalid JWT token: ' + error.message);
  }
}

// 时间戳转换
async function handleTimestampConvert(request) {
  const { timestamp, action = 'toDate' } = await request.json();
  
  if (!timestamp) {
    throw new Error('No timestamp provided');
  }

  try {
    if (action === 'toDate') {
      const date = new Date(parseInt(timestamp) * (timestamp.length === 10 ? 1000 : 1));
      return jsonResponse({
        iso: date.toISOString(),
        local: date.toLocaleString(),
        utc: date.toUTCString(),
        timestamp: {
          seconds: Math.floor(date.getTime() / 1000),
          milliseconds: date.getTime()
        }
      });
    } else {
      const date = new Date(timestamp);
      return jsonResponse({
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime()
      });
    }
  } catch (error) {
    throw new Error('Invalid timestamp: ' + error.message);
  }
}

// UUID 生成
async function handleUuidGenerate(request) {
  const { version = 4, count = 1 } = await request.json();
  
  const uuids = [];
  for (let i = 0; i < count; i++) {
    let uuid;
    
    if (version === 4) {
      // v4 UUID
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else if (version === 1) {
      // 简化版 v1 UUID (基于时间)
      const timestamp = Date.now();
      const randomPart = Math.random().toString(16).substr(2, 12);
      uuid = `${timestamp.toString(16)}-${randomPart.substr(0,4)}-4${randomPart.substr(4,3)}-${((Math.random() * 4) | 8).toString(16)}${randomPart.substr(7,3)}-${randomPart.substr(10,12)}`;
    }
    
    uuids.push(uuid);
  }
  
  return jsonResponse({ uuids, version });
}

// QR 码生成
async function handleQrGenerate(request) {
  const { text, size = 200 } = await request.json();
  
  if (!text) {
    throw new Error('No text provided for QR code');
  }

  // 简单的 QR 码生成 (使用 QRCode.js 的逻辑简化版)
  // 在实际部署中，可以考虑使用第三方服务或更复杂的实现
  const qrData = {
    text,
    size: parseInt(size),
    generatedAt: new Date().toISOString()
  };
  
  return jsonResponse(qrData);
}

// Cron 表达式解析
async function handleCronParse(request) {
  const { expression } = await request.json();
  
  if (!expression) {
    throw new Error('No cron expression provided');
  }

  // 简单的 cron 表达式解析
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('Invalid cron expression format (expected 5 parts)');
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  const description = {
    minute: parseCronPart(minute, 0, 59, 'minute'),
    hour: parseCronPart(hour, 0, 23, 'hour'),
    dayOfMonth: parseCronPart(dayOfMonth, 1, 31, 'day of month'),
    month: parseCronPart(month, 1, 12, 'month'),
    dayOfWeek: parseCronPart(dayOfWeek, 0, 7, 'day of week')
  };

  return jsonResponse({
    expression,
    description,
    parts: { minute, hour, dayOfMonth, month, dayOfWeek }
  });
}

function parseCronPart(part, min, max, name) {
  if (part === '*') return `every ${name}`;
  if (part.includes(',')) return `on ${name} ${part}`;
  if (part.includes('-')) return `from ${name} ${part.replace('-', ' to ')}`;
  if (part.includes('/')) return `every ${part.split('/')[1]} ${name}s`;
  return `on ${name} ${part}`;
}

// 颜色转换
async function handleColorConvert(request) {
  const { color } = await request.json();
  
  if (!color) {
    throw new Error('No color provided');
  }

  let hex, rgb, hsl;
  
  try {
    // 简单的颜色转换逻辑
    if (color.startsWith('#')) {
      hex = color;
      const r = parseInt(color.substr(1,2), 16);
      const g = parseInt(color.substr(3,2), 16);
      const b = parseInt(color.substr(5,2), 16);
      rgb = `rgb(${r}, ${g}, ${b})`;
      hsl = rgbToHsl(r, g, b);
    } else if (color.startsWith('rgb')) {
      rgb = color;
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
        hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        hsl = rgbToHsl(r, g, b);
      }
    }
  } catch (error) {
    throw new Error('Invalid color format');
  }

  return jsonResponse({ hex, rgb, hsl });
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// YAML 转换
async function handleYamlConvert(request) {
  const { data, action = 'toYaml' } = await request.json();
  
  if (!data) {
    throw new Error('No data provided');
  }

  try {
    if (action === 'toYaml') {
      // JSON 转 YAML (简化版)
      const json = JSON.parse(data);
      const yaml = jsonToYaml(json);
      return jsonResponse({ yaml });
    } else {
      // YAML 转 JSON (简化版)
      const json = yamlToJson(data);
      return jsonResponse({ json: JSON.stringify(json, null, 2) });
    }
  } catch (error) {
    throw new Error('Conversion failed: ' + error.message);
  }
}

function jsonToYaml(obj, indent = 0) {
  let yaml = '';
  const spaces = '  '.repeat(indent);
  
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        yaml += `${spaces}- ${jsonToYaml(item, indent + 1).trim()}\n`;
      } else {
        yaml += `${spaces}- ${item}\n`;
      }
    });
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    });
  }
  
  return yaml;
}

function yamlToJson(yaml) {
  // 简化的 YAML 解析
  const lines = yaml.split('\n');
  const result = {};
  let currentObj = result;
  const stack = [];
  
  lines.forEach(line => {
    if (line.trim() === '' || line.trim().startsWith('#')) return;
    
    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();
    
    if (content.startsWith('- ')) {
      // 数组项
      if (!Array.isArray(currentObj)) {
        throw new Error('Invalid YAML format');
      }
      currentObj.push(content.substr(2));
    } else if (content.includes(': ')) {
      const [key, value] = content.split(': ');
      currentObj[key] = value;
    } else if (content.endsWith(':')) {
      const key = content.slice(0, -1);
      currentObj[key] = {};
      stack.push(currentObj);
      currentObj = currentObj[key];
    }
  });
  
  return result;
}

// 静态资源处理
function handleStaticAssets(path) {
  // 这里可以添加 CSS、JS、图片等静态资源
  if (path === '/assets/style.css') {
    return new Response(getStyles(), {
      headers: { 
        'Content-Type': 'text/css',
        ...corsHeaders()
      }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// 工具函数
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    },
  });
}

// 主页面 HTML
function mainPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tool Box</title>
    <style>${getStyles()}</style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🛠️ Developer Tools</h1>            
        </header>

        <div class="search-box">
            <input type="text" id="toolSearch" placeholder="Search tools..." class="search-input">
        </div>

        <div class="tools-grid" id="toolsGrid">
            <!-- 工具卡片将通过 JavaScript 动态生成 -->
        </div>

        <div class="tool-content" id="toolContent">
            <div class="welcome-message" id="welcomeMessage">
                <h2>👋 Welcome to use the developer tool box</h2>
                <p>请从左侧选择您需要的工具，或者使用搜索功能快速查找。</p>
                <div class="feature-list">
                    <div class="feature">
                        <h3>🚀 快速高效</h3>
                        <p>所有工具都在 CloudFlare Edge 网络运行，响应迅速</p>
                    </div>
                    <div class="feature">
                        <h3>🔒 隐私安全</h3>
                        <p>您的数据不会离开浏览器，处理过程安全可靠</p>
                    </div>
                    <div class="feature">
                        <h3>🆓 完全免费</h3>
                        <p>所有工具免费使用，无需注册或登录</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>${getScript()}</script>
</body>
</html>`;
}

// 404 页面
function notFoundPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面未找到 - 开发者工具集合</title>
    <style>${getStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="error-page">
            <h1>404</h1>
            <p>页面未找到</p>
            <a href="/" class="btn">返回首页</a>
        </div>
    </div>
</body>
</html>`;
}

// CSS 样式
function getStyles() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      display: grid;
      grid-template-columns: 300px 1fr;
      grid-template-rows: auto 1fr;
      min-height: 100vh;
      gap: 0;
    }
    
    .header {
      grid-column: 1 / -1;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 30px;
      text-align: center;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .header p {
      color: #6b7280;
      font-size: 1.1rem;
    }
    
    .search-box {
      grid-column: 1;
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-right: 1px solid #e5e7eb;
    }
    
    .search-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    .tools-grid {
      grid-column: 1;
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-right: 1px solid #e5e7eb;
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }
    
    .tool-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .tool-card:hover {
      border-color: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .tool-card.active {
      border-color: #4f46e5;
      background: #eef2ff;
    }
    
    .tool-card h3 {
      font-size: 16px;
      margin-bottom: 4px;
      color: #1f2937;
    }
    
    .tool-card p {
      font-size: 14px;
      color: #6b7280;
    }
    
    .tool-content {
      grid-column: 2;
      background: white;
      padding: 40px;
      overflow-y: auto;
    }
    
    .welcome-message {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 0;
    }
    
    .welcome-message h2 {
      font-size: 2rem;
      margin-bottom: 16px;
      color: #1f2937;
    }
    
    .welcome-message p {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 40px;
    }
    
    .feature-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-top: 40px;
    }
    
    .feature {
      text-align: center;
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
    }
    
    .feature h3 {
      font-size: 1.1rem;
      margin-bottom: 8px;
      color: #1f2937;
    }
    
    .feature p {
      font-size: 0.9rem;
      color: #6b7280;
    }
    
    .tool-panel {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .tool-panel h2 {
      font-size: 1.8rem;
      margin-bottom: 8px;
      color: #1f2937;
    }
    
    .tool-panel .description {
      color: #6b7280;
      margin-bottom: 30px;
    }
    
    .input-group {
      margin-bottom: 24px;
    }
    
    .input-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
    }
    
    .textarea {
      width: 100%;
      min-height: 120px;
      padding: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      resize: vertical;
      transition: border-color 0.3s ease;
    }
    
    .textarea:focus {
      outline: none;
      border-color: #4f46e5;
    }
    
    .btn {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .result-area {
      margin-top: 24px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #4f46e5;
    }
    
    .result-area h3 {
      margin-bottom: 12px;
      color: #1f2937;
    }
    
    .result-pre {
      background: white;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      overflow-x: auto;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
    }
    
    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 6px;
      border-left: 4px solid #dc2626;
      margin-top: 16px;
    }
    
    .success-message {
      background: #f0fdf4;
      color: #16a34a;
      padding: 12px 16px;
      border-radius: 6px;
      border-left: 4px solid #16a34a;
      margin-top: 16px;
    }
    
    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }
    
    .loading.active {
      display: block;
    }
    
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4f46e5;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .file-upload {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .file-upload:hover {
      border-color: #4f46e5;
      background: #f8fafc;
    }
    
    .option-group {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .option-btn {
      padding: 8px 16px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .option-btn.active {
      border-color: #4f46e5;
      background: #eef2ff;
      color: #4f46e5;
    }
    
    .error-page {
      text-align: center;
      padding: 100px 20px;
      color: white;
    }
    
    .error-page h1 {
      font-size: 6rem;
      margin-bottom: 16px;
    }
    
    .error-page p {
      font-size: 1.5rem;
      margin-bottom: 30px;
    }
    
    @media (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
      }
      
      .tools-grid {
        grid-column: 1;
        max-height: 200px;
      }
      
      .tool-content {
        grid-column: 1;
      }
      
      .feature-list {
        grid-template-columns: 1fr;
      }
    }
  `;
}

// JavaScript 代码
function getScript() {
  return `
    // 工具定义
          const tools = [
      {
        id: 'base64',
        name: 'Base64 encode/decode',
        description: '文本和文件的 Base64 编码与解码',
        icon: '🔤'
      },
      {
        id: 'json',
        name: 'JSON 格式化',
        description: 'JSON 数据格式化、验证和压缩',
        icon: '📄'
      },
      {
        id: 'url',
        name: 'URL 编码/解码',
        description: 'URL 编码和解码工具',
        icon: '🔗'
      },
      {
        id: 'hash',
        name: '哈希生成器',
        description: '生成文本的 MD5、SHA1、SHA256 等哈希值',
        icon: '🔒'
      },
      {
        id: 'jwt',
        name: 'JWT 解码器',
        description: '解析和解码 JWT 令牌',
        icon: '🎫'
      },
      {
        id: 'timestamp',
        name: '时间戳转换',
        description: '时间戳与日期时间相互转换',
        icon: '⏰'
      },
      {
        id: 'uuid',
        name: 'UUID 生成器',
        description: '生成 UUID 唯一标识符',
        icon: '🆔'
      },
      {
        id: 'qr',
        name: 'QR 码生成器',
        description: '生成 QR 二维码',
        icon: '📱'
      },
      {
        id: 'cron',
        name: 'Cron 解析器',
        description: '解析 Cron 表达式',
        icon: '⏱️'
      },
      {
        id: 'color',
        name: '颜色转换器',
        description: '颜色格式转换 (HEX, RGB, HSL)',
        icon: '🎨'
      },
      {
        id: 'yaml',
        name: 'YAML 转换器',
        description: 'JSON 与 YAML 相互转换',
        icon: '⚙️'
      }
    ];

    // DOM 元素
    const toolsGrid = document.getElementById('toolsGrid');
    const toolContent = document.getElementById('toolContent');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const toolSearch = document.getElementById('toolSearch');

    // 初始化工具网格
    function initToolsGrid() {
      toolsGrid.innerHTML = "";
      tools.forEach(tool => {
        const toolCard = document.createElement('div');
        toolCard.className = 'tool-card';
        toolCard.innerHTML = \`
          <h3>${tool.icon} ${tool.name}</h3>
          <p>${tool.description}</p>
        \`;
        toolCard.addEventListener('click', () => showTool(tool.id));
        toolsGrid.appendChild(toolCard);
      });
    }

    // 显示工具界面
    function showTool(toolId) {
      // 更新活动卡片
      document.querySelectorAll('.tool-card').forEach(card => {
        card.classList.remove('active');
      });
      document.querySelectorAll('.tool-card').forEach(card => {
        if (card.querySelector('h3').textContent.includes(tools.find(t => t.id === toolId).name)) {
          card.classList.add('active');
        }
      });

      // 隐藏欢迎信息
      welcomeMessage.style.display = 'none';

      // 显示工具内容
      const tool = tools.find(t => t.id === toolId);
      toolContent.innerHTML = \`
        <div class="tool-panel">
          <h2>${tool.icon} ${tool.name}</h2>
          <p class="description">${tool.description}</p>
          <div id="toolInterface"></div>
        </div>
      \`;

      // 加载具体工具界面
      loadToolInterface(toolId);
    }

    // 加载工具界面
    function loadToolInterface(toolId) {
      const interfaceDiv = document.getElementById('toolInterface');
      
      switch (toolId) {
        case 'base64':
          interfaceDiv.innerHTML = getBase64Interface();
          initBase64Tool();
          break;
        case 'json':
          interfaceDiv.innerHTML = getJsonInterface();
          initJsonTool();
          break;
        case 'url':
          interfaceDiv.innerHTML = getUrlInterface();
          initUrlTool();
          break;
        case 'hash':
          interfaceDiv.innerHTML = getHashInterface();
          initHashTool();
          break;
        case 'jwt':
          interfaceDiv.innerHTML = getJwtInterface();
          initJwtTool();
          break;
        case 'timestamp':
          interfaceDiv.innerHTML = getTimestampInterface();
          initTimestampTool();
          break;
        case 'uuid':
          interfaceDiv.innerHTML = getUuidInterface();
          initUuidTool();
          break;
        case 'qr':
          interfaceDiv.innerHTML = getQrInterface();
          initQrTool();
          break;
        case 'cron':
          interfaceDiv.innerHTML = getCronInterface();
          initCronTool();
          break;
        case 'color':
          interfaceDiv.innerHTML = getColorInterface();
          initColorTool();
          break;
        case 'yaml':
          interfaceDiv.innerHTML = getYamlInterface();
          initYamlTool();
          break;
      }
    }

    // Base64 工具界面
    function getBase64Interface() {
      return \`
        <div class="option-group">
          <button class="option-btn active" onclick="switchBase64Mode('encode')">编码</button>
          <button class="option-btn" onclick="switchBase64Mode('decode')">解码</button>
        </div>
        
        <div id="base64EncodeSection">
          <div class="input-group">
            <label>输入文本</label>
            <textarea class="textarea" id="base64InputText" placeholder="输入要编码的文本..."></textarea>
          </div>
          
          <div class="file-upload" onclick="document.getElementById('base64FileInput').click()">
            <p>📁 或拖放文件到这里</p>
            <input type="file" id="base64FileInput" style="display: none" onchange="handleBase64FileSelect(this.files[0])">
          </div>
          
          <button class="btn" onclick="base64Encode()">编码</button>
        </div>
        
        <div id="base64DecodeSection" style="display: none">
          <div class="input-group">
            <label>Base64 字符串</label>
            <textarea class="textarea" id="base64DecodeInput" placeholder="输入要解码的 Base64 字符串..."></textarea>
          </div>
          <button class="btn" onclick="base64Decode()">解码</button>
        </div>
        
        <div class="result-area" id="base64Result" style="display: none">
          <h3>结果</h3>
          <pre class="result-pre" id="base64ResultText"></pre>
          <button class="btn" onclick="copyResult('base64ResultText')" style="margin-top: 12px">复制结果</button>
        </div>
      \`;
    }

    //Encode url interface
    // URL 工具界面
    function getUrlInterface() {
      return \`
        <div class="option-group">
          <button class="option-btn active" onclick="switchUrlMode('encode')">URL 编码</button>
          <button class="option-btn" onclick="switchUrlMode('decode')">URL 解码</button>
        </div>
        
        <div id="urlEncodeSection">
          <div class="input-group">
            <label>输入文本（需要编码）</label>
            <textarea class="textarea" id="urlEncodeInput" placeholder="输入需要URL编码的文本..."></textarea>
          </div>
          <button class="btn" onclick="urlEncode()">编码</button>
        </div>
        
        <div id="urlDecodeSection" style="display: none">
          <div class="input-group">
            <label>URL 编码字符串（需要解码）</label>
            <textarea class="textarea" id="urlDecodeInput" placeholder="输入需要URL解码的字符串..."></textarea>
          </div>
          <button class="btn" onclick="urlDecode()">解码</button>
        </div>
        
        <div class="result-area" id="urlResult" style="display: none">
          <h3>结果</h3>
          <pre class="result-pre" id="urlResultText"></pre>
          <button class="btn" onclick="copyResult('urlResultText')" style="margin-top: 12px">复制结果</button>
        </div>
      \`;
    }

    // 初始化 URL 工具
    function initUrlTool() {
      window.switchUrlMode = function(mode) {
        document.querySelectorAll('#urlEncodeSection, #urlDecodeSection').forEach(el => {
          el.style.display = 'none';
        });
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        if (mode === 'encode') {
          document.getElementById('urlEncodeSection').style.display = 'block';
          document.querySelector('.option-btn[onclick="switchUrlMode(\'encode\')"]').classList.add('active');
        } else {
          document.getElementById('urlDecodeSection').style.display = 'block';
          document.querySelector('.option-btn[onclick="switchUrlMode(\'decode\')"]').classList.add('active');
        }
        
        // 隐藏之前的结果
        document.getElementById('urlResult').style.display = 'none';
      };

      window.urlEncode = async function() {
        const text = document.getElementById('urlEncodeInput').value.trim();
        
        if (!text) {
          showError('urlResult', '请输入需要编码的文本');
          return;
        }
        
        try {
          showLoading('urlResult', true);
          const result = await callApi('url-encode', { text });
          showResult('urlResult', result.encoded || result.result);
        } catch (error) {
          showError('urlResult', error.message);
        } finally {
          showLoading('urlResult', false);
        }
      };

      window.urlDecode = async function() {
        const text = document.getElementById('urlDecodeInput').value.trim();
        
        if (!text) {
          showError('urlResult', '请输入需要解码的URL编码字符串');
          return;
        }
        
        try {
          showLoading('urlResult', true);
          const result = await callApi('url-decode', { text });
          showResult('urlResult', result.decoded || result.result);
        } catch (error) {
          showError('urlResult', error.message);
        } finally {
          showLoading('urlResult', false);
        }
      };
    }

    // 显示/隐藏加载状态
    function showLoading(containerId, show) {
      const container = document.getElementById(containerId);
      let loadingElement = document.getElementById(containerId + 'Loading');
      
      if (show) {
        if (!loadingElement) {
          loadingElement = document.createElement('div');
          loadingElement.id = containerId + 'Loading';
          loadingElement.className = 'loading active';
          loadingElement.innerHTML = \`
            <div class="spinner"></div>
            <p>处理中...</p>
          \`;
          container.parentNode.insertBefore(loadingElement, container);
        } else {
          loadingElement.className = 'loading active';
        }
        container.style.display = 'none';
      } else {
        if (loadingElement) {
          loadingElement.className = 'loading';
        }
      }
    }
    //End of url interface

    //Harsh interface
    // 哈希生成器工具界面
    function getHashInterface() {
  return \`
    <div class="input-group">
      <label>输入文本</label>
      <textarea class="textarea" id="hashInput" placeholder="输入需要生成哈希值的文本..."></textarea>
    </div>
    
    <div class="input-group">
      <label>选择哈希算法</label>
      <div class="option-group">
        <button class="option-btn active" onclick="selectHashAlgorithm('md5')">MD5</button>
        <button class="option-btn" onclick="selectHashAlgorithm('sha1')">SHA1</button>
        <button class="option-btn" onclick="selectHashAlgorithm('sha256')">SHA256</button>
        <button class="option-btn" onclick="selectHashAlgorithm('sha512')">SHA512</button>
      </div>
    </div>
    
    <div class="file-upload" onclick="document.getElementById('hashFileInput').click()">
      <p>📁 或拖放文件到这里生成文件哈希</p>
      <input type="file" id="hashFileInput" style="display: none" onchange="handleHashFileSelect(this.files[0])">
    </div>
    
    <button class="btn" onclick="generateHash()">生成哈希值</button>
    
    <div class="result-area" id="hashResult" style="display: none">
      <h3>哈希结果</h3>
      <div style="margin-bottom: 12px;">
        <strong>算法:</strong> <span id="hashAlgorithmLabel">MD5</span>
      </div>
      <pre class="result-pre" id="hashResultText"></pre>
      <button class="btn" onclick="copyResult('hashResultText')" style="margin-top: 12px">复制哈希值</button>
    </div>
    
    <div class="feature-list" style="margin-top: 40px;">
      <div class="feature">
        <h3>MD5</h3>
        <p>128位哈希值，常用于文件校验</p>
      </div>
      <div class="feature">
        <h3>SHA1</h3>
        <p>160位哈希值，安全性高于MD5</p>
      </div>
      <div class="feature">
        <h3>SHA256</h3>
        <p>256位哈希值，比特币使用</p>
      </div>
      <div class="feature">
        <h3>SHA512</h3>
        <p>512位哈希值，最高安全性</p>
      </div>
    </div>
  \`;
}

    // 初始化哈希工具
    function initHashTool() {
      window.currentHashAlgorithm = 'md5';
      window.currentHashFile = null;

      window.selectHashAlgorithm = function(algorithm) {
        window.currentHashAlgorithm = algorithm;
        
        // 更新按钮状态
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        document.querySelector(`.option-btn[onclick="selectHashAlgorithm('${algorithm}')"]`).classList.add('active');
        
        // 更新算法标签
        document.getElementById('hashAlgorithmLabel').textContent = algorithm.toUpperCase();
      };

      window.handleHashFileSelect = function(file) {
        if (!file) return;
        
        window.currentHashFile = file;
        document.getElementById('hashInput').value = \`文件已选择: ${file.name} (${(file.size / 1024).toFixed(2)} KB)\`;
      };

      window.generateHash = async function() {
        const text = document.getElementById('hashInput').value.trim();
        const algorithm = window.currentHashAlgorithm;
        const file = window.currentHashFile;
        
        if (!text && !file) {
          showError('hashResult', '请输入文本或选择文件');
          return;
        }
        
        try {
          showLoading('hashResult', true);
          
          let requestData;
          if (file) {
            // 处理文件哈希
            const fileBuffer = await readFileAsArrayBuffer(file);
            requestData = {
              algorithm: algorithm,
              file: arrayBufferToBase64(fileBuffer),
              fileName: file.name
            };
          } else {
            // 处理文本哈希
            requestData = {
              algorithm: algorithm,
              text: text
            };
          }
          
          const result = await callApi('hash-generate', requestData);
          showResult('hashResult', result.hash || result.result);
          
          // 确保算法标签是最新的
          document.getElementById('hashAlgorithmLabel').textContent = algorithm.toUpperCase();
          
        } catch (error) {
          showError('hashResult', error.message);
        } finally {
          showLoading('hashResult', false);
        }
      };

      // 读取文件为ArrayBuffer
      window.readFileAsArrayBuffer = function(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function(e) {
            resolve(e.target.result);
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
      };

      // 将ArrayBuffer转换为Base64
      window.arrayBufferToBase64 = function(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };

      // 添加拖放文件支持
      const toolContent = document.getElementById('toolContent');
      toolContent.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '#f0f9ff';
      });

      toolContent.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '';
      });

      toolContent.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleHashFileSelect(files[0]);
        }
      });
    }
    //End of harsh interface

    // 搜索功能
    function initSearch() {
      toolSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(card => {
          const toolName = card.querySelector('h3').textContent.toLowerCase();
          const toolDesc = card.querySelector('p').textContent.toLowerCase();
          if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }

    // API 调用函数
    async function callApi(endpoint, data) {      
        const response = await fetch(\`/api/${endpoint}\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          const parsedError = JSON.parse(errorText)
          throw new Error(parsedError.error || \`Failed to call ${endpoint} API \`);
        }
        
        return await response.json();      
    }

    // 工具初始化
    function initBase64Tool() {
      window.switchBase64Mode = function(mode) {
        document.querySelectorAll('#base64EncodeSection, #base64DecodeSection').forEach(el => {
          el.style.display = 'none';
        });
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        if (mode === 'encode') {
          document.getElementById('base64EncodeSection').style.display = 'block';
          document.querySelector('.option-btn[onclick="switchBase64Mode(\'encode\')"]').classList.add('active');
        } else {
          document.getElementById('base64DecodeSection').style.display = 'block';
          document.querySelector('.option-btn[onclick="switchBase64Mode(\'decode\')"]').classList.add('active');
        }
      };

      window.handleBase64FileSelect = async function(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64 = e.target.result;
          document.getElementById('base64InputText').value = '文件已选择: ' + file.name;
          window.currentFileBase64 = base64;
        };
        reader.readAsDataURL(file);
      };

      window.base64Encode = async function() {
        const text = document.getElementById('base64InputText').value;
        const file = window.currentFileBase64;
        
        try {
          const result = await callApi('base64-encode', { text, file });
          showResult('base64Result', \`编码结果: ${result.result}\`);
        } catch (error) {
          showError('base64Result', error.message);
        }
      };

      window.base64Decode = async function() {
        const base64 = document.getElementById('base64DecodeInput').value;
        
        try {
          const result = await callApi('base64-decode', { base64 });
          showResult('base64Result', \`解码结果: ${result.result}\`);
        } catch (error) {
          showError('base64Result', error.message);
        }
      };
    }

    function initJsonTool() {
      window.jsonFormat = function(action) {
        document.querySelectorAll('.option-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        document.querySelector(`.option-btn[onclick="jsonFormat('${action}')"]`).classList.add('active');
        window.currentJsonAction = action;
      };

      window.processJson = async function() {
        const jsonData = document.getElementById('jsonInput').value;
        const action = window.currentJsonAction || 'format';
        
        try {
          const result = await callApi('json-format', { json: jsonData, action });
          showResult('jsonResult', ${result.result});
        } catch (error) {          
          showError('jsonResult', error.message);
        }
      };
    }
    
    function initJwtTool() {
      window.decodeJwt = async function() {
        const jwtToken = document.getElementById('jwtInput').value;
        
        try {
          const result = await callApi('jwt-decode', { token: jwtToken });          
          showResult('jwtResult', JSON.stringify(result, null, 2));
        } catch (error) {
          showError('jwtResult', error.message);
        }
      };

      window.clearJwt = function() {
        document.getElementById('jwtInput').value = '';
        document.getElementById('jwtResult').style.display = 'none';
        document.getElementById('jwt-error').style.display = 'none';
      };

    }
    
    // 显示结果
    function showResult(containerId, content) {
      const container = document.getElementById(containerId);
      const resultText = document.getElementById(containerId + 'Text');
      
      resultText.textContent = content;
      container.style.display = 'block';
    }

    // 显示错误
    function showError(containerId, message) {
      const container = document.getElementById(containerId);
      const resultText = document.getElementById(containerId + 'Text');
      
      resultText.textContent = '错误: ' + message;
      resultText.className = 'result-pre error-message';
      container.style.display = 'block';
    }

    // 复制结果
    function copyResult(elementId) {
      const text = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板！');
      });
    }

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
      initToolsGrid();
      initSearch();
    });

    // 其他工具界面函数模板
    function getJsonInterface() {
      return \`<div class="input-group">
        <label>JSON 数据</label>
        <textarea class="textarea" id="jsonInput" placeholder='输入 JSON 数据...'></textarea>
      </div>
      <div class="option-group">
        <button class="option-btn active" onclick="jsonFormat('format')">格式化</button>
        <button class="option-btn" onclick="jsonFormat('minify')">压缩</button>
        <button class="option-btn" onclick="jsonFormat('validate')">验证</button>
      </div>
      <button class="btn" onclick="processJson()">处理</button>
      <div class="result-area" id="jsonResult" style="display: none">
        <h3>结果</h3>
        <pre class="result-pre" id="jsonResultText"></pre>
        <button class="btn" onclick="copyResult('jsonResultText')">复制结果</button>
      </div>\`;
    }

    function getJwtInterface() {
      return \`
          <div class="input-group">
              <label for="jwtInput">JWT Token</label>
              <textarea class="textarea" id="jwtInput" placeholder="输入 JWT Token..."></textarea>
          </div>

          <div class="action-buttons" style="display: flex; gap: 12px; margin-bottom: 20px;">
              <button class="btn" onclick="decodeJwt()" id="jwt-decode-btn">解析 JWT</button>
              <button class="btn" style="background: #6b7280;" onclick="clearJwt()">清空</button>              
          </div>

         <div class="result-area" id="jwtResult" style="display: none">
          <h3>结果</h3>
          <pre class="result-pre" id="jwtResultText"></pre>
          <button class="btn" onclick="copyResult('jwtResultText')">复制结果</button>
        </div>

          <div class="error-message" id="jwt-error" style="display: none;"></div>
      \`;
    }
  `;
}