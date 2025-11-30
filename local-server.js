const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8787;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  },
});

// 主页 - 提供完整的 HTML 界面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由 - 模拟 CloudFlare Workers 环境

// Base64 编码
app.post('/api/base64-encode', upload.single('file'), async (req, res) => {
  try {
    const { text } = req.body;
    const file = req.file;
    
    if (file) {
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      
      return res.json({
        success: true,
        filename: file.originalname,
        size: file.size,
        base64: base64,
        dataUrl: dataUrl
      });
    } else if (text) {
      const base64 = Buffer.from(text).toString('base64');
      return res.json({ 
        success: true,
        result: base64
      });
    } else {
      return res.status(400).json({ error: 'No text or file provided' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Encoding failed: ' + error.message });
  }
});

// Base64 解码
app.post('/api/base64-decode', (req, res) => {
  try {
    const { base64 } = req.body;
    
    if (!base64) {
      return res.status(400).json({ error: 'No base64 data provided' });
    }

    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
    const text = Buffer.from(cleanBase64, 'base64').toString('utf8');
    
    res.json({ 
      success: true,
      result: text
    });
  } catch (error) {
    res.status(500).json({ error: 'Decoding failed: ' + error.message });
  }
});

// JSON 格式化
app.post('/api/json-format', (req, res) => {
  try {
    const { json, action = 'format' } = req.body;
    
    if (!json) {
      return res.status(400).json({ error: 'No JSON data provided' });
    }

    const parsed = JSON.parse(json);
    
    switch (action) {
      case 'format':
        return res.json({ 
          result: JSON.stringify(parsed, null, 2),
          valid: true
        });
      case 'minify':
        return res.json({ 
          result: JSON.stringify(parsed),
          valid: true
        });
      case 'validate':
        return res.json({ 
          valid: true,
          result: true,
          size: JSON.stringify(parsed).length
        });
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    return res.status(500).json({ 
      valid: false,
      error: error.message
    });
  }
});

// URL 编码
app.post('/api/url-encode', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    res.json({ 
      result: encodeURIComponent(text),
      fullEncode: encodeURI(text)
    });
  } catch (error) {
    res.status(500).json({ error: 'Encoding failed: ' + error.message });
  }
});

// URL 解码
app.post('/api/url-decode', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    res.json({ 
      result: decodeURIComponent(text),
      fullDecode: decodeURI(text)
    });
  } catch (error) {
    res.status(500).json({ error: 'Decoding failed: ' + error.message });
  }
});

// 哈希生成
app.post('/api/hash-generate', async (req, res) => {
  try {
    const { text, algorithm = 'sha256' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const hash = crypto.createHash(algorithm);
    hash.update(text);
    const result = hash.digest('hex');
    
    res.json({ 
      result: result,
      algorithm: algorithm
    });
  } catch (error) {
    res.status(500).json({ error: 'Hash generation failed: ' + error.message });
  }
});

// JWT 解码
app.post('/api/jwt-decode', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No JWT token provided' });
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Invalid JWT format' });
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    
    return res.json({
      header,
      payload,
      isExpired,
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JWT token: ' + error.message });
  }
});

// 时间戳转换
app.post('/api/timestamp-convert', (req, res) => {
  try {
    const { timestamp, action = 'toDate' } = req.body;
    
    if (!timestamp) {
      return res.status(400).json({ error: 'No timestamp provided' });
    }

    if (action === 'toDate') {
      const date = new Date(parseInt(timestamp) * (timestamp.length === 10 ? 1000 : 1));
      res.json({
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
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      res.json({
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime()
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// UUID 生成
app.post('/api/uuid-generate', (req, res) => {
  try {
    const { version = 4, count = 1 } = req.body;
    const countNum = parseInt(count) || 1;
    
    const uuids = [];
    for (let i = 0; i < countNum; i++) {
      let uuid;
      
      if (version === 4) {
        // v4 UUID
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      } else {
        // 简化版 v1 UUID (基于时间)
        const timestamp = Date.now();
        const randomPart = Math.random().toString(16).substr(2, 12);
        uuid = `${timestamp.toString(16)}-${randomPart.substr(0,4)}-4${randomPart.substr(4,3)}-${((Math.random() * 4) | 8).toString(16)}${randomPart.substr(7,3)}-${randomPart.substr(10,12)}`;
      }
      
      uuids.push(uuid);
    }
    
    res.json({ uuids, version });
  } catch (error) {
    res.status(500).json({ error: 'UUID generation failed: ' + error.message });
  }
});

// 其他 API 端点可以类似实现...

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Dev Tools Collection',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Developer Tools Collection running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Available tools:`);
  console.log(`   • Base64 Encode/Decode`);
  console.log(`   • JSON Formatter`);
  console.log(`   • URL Encode/Decode`);
  console.log(`   • Hash Generator`);
  console.log(`   • JWT Decoder`);
  console.log(`   • Timestamp Converter`);
  console.log(`   • UUID Generator`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
});