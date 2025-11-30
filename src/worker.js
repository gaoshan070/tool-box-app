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
    // if (path.startsWith('/api/')) {
    //   return handleApiRequest(request, path);
    // }

    // // 静态资源
    // if (path.startsWith('/assets/')) {
    //   return handleStaticAssets(path);
    // }

    // return new Response(notFoundPage(), {
    //   status: 404,
    //   headers: { 'Content-Type': 'text/html; charset=utf-8' }
    // });
  },
};



function mainPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tool Box</title>
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