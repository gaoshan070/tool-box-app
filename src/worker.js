export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 路由处理
    if (path === '/' || path === '/index.html') {
      return new Response(mainPage(), {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
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

function mainPage() {
  return `<!DOCTYPE html>
    <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Developer ToolBox</title>
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
                <title>Page Not Found</title>
                <style>${getStyles()}</style>
            </head>
            <body>
                <div class="container">
                    <div class="error-page">
                        <h1>404</h1>
                        <p>Page Not Found</p>
                        <a href="/" class="btn">Index</a>
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