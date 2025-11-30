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
      default:
        return jsonResponse({ error: 'API endpoint not found' }, 404);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
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