const tools = [
      {
        id: 'base64',
        name: 'Base64 编码/解码',
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
      toolsGrid.innerHTML = '';
      tools.forEach(tool => {
        const toolCard = document.createElement('div');
        toolCard.className = 'tool-card';
        toolCard.innerHTML = `
          <h3>${tool.icon} ${tool.name}</h3>
          <p>${tool.description}</p>
        `;
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
      toolContent.innerHTML = `
        <div class="tool-panel">
          <h2>${tool.icon} ${tool.name}</h2>
          <p class="description">${tool.description}</p>
          <div id="toolInterface"></div>
        </div>
      `;

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
      return `
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
      `;
    }

    // 其他工具界面函数 (为简洁起见，这里只展示 Base64 的完整实现)
    // 实际部署时需要为每个工具实现相应的界面和功能

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
      try {
        const response = await fetch(`/api/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        return await response.json();
      } catch (error) {
        throw new Error('网络请求失败: ' + error.message);
      }
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
          document.querySelector('.option-btn[onclick="switchBase64Mode(\\'encode\\')"]').classList.add('active');
        } else {
          document.getElementById('base64DecodeSection').style.display = 'block';
          document.querySelector('.option-btn[onclick="switchBase64Mode(\\'decode\\')"]').classList.add('active');
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
          showResult('base64Result', `编码结果: ${result.result}`);
        } catch (error) {
          showError('base64Result', error.message);
        }
      };

      window.base64Decode = async function() {
        const base64 = document.getElementById('base64DecodeInput').value;
        
        try {
          const result = await callApi('base64-decode', { base64 });
          showResult('base64Result', `解码结果: ${result.result}`);
        } catch (error) {
          showError('base64Result', error.message);
        }
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
      return `<div class="input-group">
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
      </div>`;
    }