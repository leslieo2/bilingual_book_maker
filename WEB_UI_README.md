# Bilingual Book Maker Web UI

一个现代化的React网页界面，用于bilingual_book_maker CLI工具，提供直观的方式来翻译EPUB、TXT、SRT和Markdown文件。

## 🎯 特性

### 完整的CLI功能对等
- **文件上传**: 支持EPUB、TXT、SRT、MD文件的拖拽上传
- **多模型支持**: 10+个AI服务（OpenAI、Claude、Gemini、DeepL等）
- **语言选择**: 30+种支持的语言，带有原生名称
- **高级设置**: 通过分页界面提供所有CLI选项

### 增强的用户体验
- **实时进度**: 实时翻译进度显示，包含预计时间和统计信息
- **暂停/恢复**: 可以暂停和恢复翻译过程
- **错误处理**: 完善的错误信息和恢复选项
- **下载管理**: 完成翻译后直接下载链接

### 高级配置
- **提示词自定义**: 支持自定义系统和用户提示词模板
- **处理选项**: 标签过滤、文件排除、批量设置
- **性能调优**: Token限制、请求间隔、批量处理
- **AI设置**: 温度、上下文感知、模型特定选项

## 🚀 快速开始

### 必要条件
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 一键启动

```bash
# 在项目根目录运行
python start_web_ui.py
```

这个脚本会自动：
1. 检查和安装Python依赖
2. 检查Node.js环境
3. 安装npm依赖（如果需要）
4. 启动Flask API服务器（端口8000）
5. 启动React开发服务器（端口3000）
6. 自动打开浏览器

### 手动启动

如果需要手动启动各个服务：

```bash
# 1. 安装Python依赖
pip install -r requirements-api.txt

# 2. 启动API服务器
python api_server.py

# 3. 在新终端窗口中启动前端
cd web-ui
npm install
npm start
```

应用将在 `http://localhost:3000` 打开，API服务器运行在 `http://localhost:8000`。

## 📁 项目结构

```
├── api_server.py              # Flask API服务器
├── start_web_ui.py           # 一键启动脚本
├── requirements-api.txt      # API服务器依赖
├── WEB_UI_README.md         # 此文档
└── web-ui/                  # React前端应用
    ├── src/
    │   ├── components/      # React组件
    │   ├── services/       # API服务
    │   ├── constants/      # 常量定义
    │   └── App.jsx        # 主应用组件
    ├── package.json       # 前端依赖
    └── README.md         # 前端详细文档
```

## 🔧 核心组件

### 1. API服务器 (api_server.py)
- **集成现有翻译服务**: 直接使用book_maker模块
- **RESTful API**: 提供标准的REST接口
- **文件处理**: 安全的文件上传和下载
- **进度跟踪**: 实时翻译进度更新
- **错误处理**: 完善的错误处理和日志记录

**主要端点**:
```bash
POST /api/translate          # 开始翻译
GET  /api/translate/:id      # 获取翻译状态
POST /api/translate/:id/pause # 暂停翻译
POST /api/translate/:id/resume # 恢复翻译
DELETE /api/translate/:id    # 取消翻译
GET  /api/download/:id       # 下载结果
GET  /api/models            # 获取可用模型
GET  /api/languages         # 获取支持的语言
GET  /api/health            # 健康检查
```

### 2. 文件上传组件 (FileUpload.jsx)
- 拖拽上传界面
- 文件类型验证和大小限制（100MB）
- 视觉文件预览和元数据显示
- 支持EPUB、TXT、SRT、MD格式

### 3. 模型选择器 (ModelSelector.jsx)
- 按类别分组的模型选择（OpenAI、Anthropic、Google等）
- 安全的API密钥输入（遮码显示）
- 模型特定配置选项
- 高级用户自定义模型列表支持

### 4. 高级设置 (AdvancedSettings.jsx)
分为5个标签页的界面：

**通用设置**:
- 测试模式、恢复功能
- 代理服务器、自定义API端点
- 单一翻译模式

**提示词设置**:
- 自定义系统提示词
- 用户提示词模板
- 支持{text}和{language}占位符

**处理设置**:
- HTML标签过滤（针对EPUB）
- 文件包含/排除列表
- 翻译样式CSS设置
- 导航字符串处理

**性能设置**:
- 批量大小和Token累积
- 请求间隔控制
- 块大小合并
- 批量API支持

**AI设置**:
- 温度参数控制
- 上下文感知翻译
- Azure OpenAI部署ID
- 上下文段落限制

### 5. 进度跟踪器 (ProgressTracker.jsx)
- 实时进度条和百分比显示
- 已用时间和预计剩余时间
- 当前处理项目显示
- 翻译统计（tokens、错误数）
- 暂停/恢复/取消控制
- 可滚动的实时日志显示
- 完成后的下载按钮

## ⚙️ 配置选项

### 环境变量
在项目根目录创建 `.env` 文件：

```bash
# API服务器配置
FLASK_DEBUG=True
FLASK_PORT=8000

# 前端配置
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_MAX_FILE_SIZE=100

# 可选功能
REACT_APP_ENABLE_BATCH_API=true
```

### API密钥配置
支持以下AI服务的API密钥：

- **OpenAI**: `openai_key` - 从 https://platform.openai.com/api-keys 获取
- **Claude**: `claude_key` - 从 https://console.anthropic.com/account/keys 获取
- **Gemini**: `gemini_key` - 从 https://makersuite.google.com/app/apikey 获取
- **Groq**: `groq_key` - 从 https://console.groq.com/keys 获取
- **xAI**: `xai_key` - 从 https://console.x.ai/ 获取
- **DeepL**: `deepl_key` - 从 https://rapidapi.com/splintPRO/api/dpl-translator 获取
- **Caiyun**: `caiyun_key` - 从 https://dashboard.caiyunapp.com/user/sign_in/ 获取

## 🎮 使用指南

### 基本翻译流程
1. **启动服务**: 运行 `python start_web_ui.py`
2. **选择文件**: 拖拽或点击上传文件
3. **选择模型**: 选择AI翻译服务
4. **输入API密钥**: 为选择的服务提供API密钥
5. **选择语言**: 选择目标翻译语言
6. **配置设置**: 根据需要调整高级设置
7. **开始翻译**: 点击"Start Translation"按钮
8. **监控进度**: 查看实时翻译进度和日志
9. **下载结果**: 翻译完成后下载双语文件

### 高级功能使用

**测试模式**:
- 启用测试模式只翻译前几段
- 适合在正式翻译前预览效果
- 可自定义测试段落数量

**上下文感知翻译**:
- 启用"Use Context"选项
- 提供更好的叙事一致性
- 会消耗额外的tokens（约200个）

**自定义提示词**:
- 在高级设置的"提示词"标签中配置
- 支持系统提示词和用户提示词
- 使用{text}和{language}占位符

**批量处理**:
- 针对TXT文件的批量处理
- 可以设置批量大小提高效率
- 适合处理大型文本文件

## 🔧 故障排除

### 常见问题

**服务器无法启动**:
```bash
# 检查端口是否被占用
lsof -i :8000
lsof -i :3000

# 手动安装依赖
pip install flask flask-cors requests
cd web-ui && npm install
```

**API连接失败**:
- 确保API服务器在端口8000运行
- 检查防火墙设置
- 验证CORS配置

**文件上传失败**:
- 检查文件大小（限制100MB）
- 验证文件格式（EPUB、TXT、SRT、MD）
- 确保有足够的磁盘空间

**翻译失败**:
- 验证API密钥正确性
- 检查网络连接
- 查看控制台日志获取详细错误信息

### 日志和调试

**API服务器日志**:
```bash
# API服务器启动时会显示详细日志
# 包括请求处理、错误信息等
```

**前端调试**:
```bash
# 在浏览器控制台查看JavaScript日志
# 检查Network标签查看API请求
```

**进度日志**:
- 实时显示在进度跟踪器中
- 包括翻译状态、错误信息、统计数据

## 🚀 部署

### 开发环境
使用 `python start_web_ui.py` 启动开发服务器。

### 生产环境

**构建前端**:
```bash
cd web-ui
npm run build
```

**使用生产级服务器**:
```bash
# 使用gunicorn运行API服务器
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 api_server:app

# 使用nginx提供前端静态文件
```

**Docker部署**:
```dockerfile
# 可以创建Docker镜像包含整个应用
# 详见web-ui/README.md中的Docker部署说明
```

## 🔒 安全考虑

### API安全
- 实施适当的API认证（生产环境）
- 限制文件上传大小和类型
- 使用HTTPS（生产环境）
- 实施速率限制

### 密钥管理
- API密钥仅在客户端存储（不发送到服务器日志）
- 建议使用环境变量存储敏感信息
- 定期轮换API密钥

## 🤝 贡献

1. Fork项目仓库
2. 创建功能分支
3. 进行更改
4. 添加测试（如适用）
5. 提交Pull Request

### 代码规范
- 使用ESLint和Prettier格式化代码
- 遵循React函数组件模式
- 使用hooks进行状态管理
- 实现适当的错误处理

## 📄 许可证

本项目遵循与主bilingual_book_maker项目相同的许可证（MIT许可证）。

## 🆘 支持

- **GitHub Issues**: 报告bug和功能请求
- **文档**: 查看主项目文档
- **社区**: 在主仓库中参与讨论

---

**注意**: 这是一个集成的全栈实现，包含了完整的前端UI和后端API。启动脚本会自动处理所有依赖安装和服务启动。