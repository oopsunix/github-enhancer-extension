<div align="center">
  <img src="src/icons/icon128.png" alt="GitHub Enhancer Logo" width="128" height="128">
  <h1 align="center">GitHub Enhancer</h1>
  <p align="center">一款提升 GitHub 日常使用体验的浏览器扩展</p>
  <p align="center">
    <a href="README.md">English</a>
    <strong> · 简体中文</strong>
  </p>
  <br>
</div>

## 📖 简介

**GitHub Enhancer** 是一款专为 GitHub 设计的 Chrome 浏览器扩展，旨在通过一系列实用功能优化你的 GitHub 浏览体验。无论是代码审查、仓库浏览还是日常开发，它都能让操作更加高效、直观和愉悦。

扩展本身轻量、零依赖，所有功能均可独立开关，你可以根据个人偏好自由组合。

---

## ✨ 功能介绍

### 🎨 Material 图标

将 GitHub 文件列表中的默认图标替换为**Material Design 风格**的图标，让文件和文件夹的辨识度大幅提升。

- 支持数千种文件扩展名和文件名映射
- 支持文件夹展开/折叠状态的不同图标
- 自动适配 GitHub 深色/浅色主题
- 图标数据定时从远程自动更新

### 🚩 返回顶部

在长页面滚动时，提供一个始终可用的**返回顶部按钮**，一键平滑滚动到页面顶端。

- 可自定义按钮位置（右下角 / 左下角）
- 可自定义触发显示的滚动距离阈值
- 滚动动画平滑自然

### 🕒 时间格式化

将 GitHub 上默认的"相对时间"（如 _3 days ago_）替换为自定义格式的**绝对时间**，让你对事件发生的具体时间一目了然。

- 支持自定义时间格式模板（如 `YY-MM-DD HH:mm`、`YYYY-MM-DD HH:mm:ss`）
- 鼠标悬浮时可查看完整时间
- 对 GitHub 的 Turbolinks 导航和动态加载内容均支持

### 🗃️ 图片文件布局

在仓库文件列表中，为图片文件提供**平铺预览模式**和**全宽预览模式**，告别单调的列表显示。

- **列表模式**：恢复为默认的列表视图
- **平铺模式**：以网格状平铺展示所有图片预览
- **全宽模式**：图片横向铺满展示，便于快速浏览和筛选
- 自动识别目录中的图片文件（支持 png/jpg/gif/webp/bmp 等常见格式）

### 🖼️ 图片预览

在 README、Issue、PR 评论或代码文件中的图片，点击即可在页面内打开**大图预览**，无需跳转或新建标签页。

- 点击图片即可打开预览遮罩层
- **滚轮缩放**：滚动鼠标滚轮即可放大/缩小
- **拖拽平移**：放大后拖拽图片查看细节
- **切换浏览**：支持上一张/下一张快捷键（← / →）
- **下载图片**：一键下载当前预览的图片
- **双击复原**：双击图片恢复原始缩放比例
- **键盘支持**：Esc 关闭、方向键切换

### 📁 文件大小

在仓库页面显示**仓库总大小**，并在文件列表的每个文件旁显示**单个文件大小**，让你对仓库的体积有直观认识。

- 仓库根目录自动显示总大小
- 每个文件旁显示精确大小（B/KB/MB/GB）
- 使用 GitHub API 获取数据（支持配置 Personal Access Token 以突破 API 限额）

---

## ⚙️ 配置与管理

扩展提供了直观的**弹出面板（Popup）**，方便你集中管理所有功能：

- **功能开关**：每个功能均可独立启用/禁用
- **参数配置**：时间格式模板、预览模式、Token 等均可自定义
- **即时保存**：所有修改自动保存，无需手动确认

---

## 🧩 项目结构

```
github-enhancer-extension/
├── LICENSE                         # MIT 开源许可证
├── README.md                       # 英文说明文档
└── src/
    ├── manifest.json               # 扩展清单配置
    ├── background/
    │   └── service-worker.js       # 后台 Service Worker（图标数据更新）
    ├── content-scripts/
    │   ├── back-to-top/            # 返回顶部功能
    │   ├── image-file-layout/      # 图片文件布局切换
    │   ├── image-preview/          # 图片预览弹窗
    │   ├── material-icons/         # Material 图标替换
    │   ├── repo-size/              # 仓库与文件大小显示
    │   └── time-format/            # 相对时间格式化
    ├── icons/
    │   ├── icon16.png              # 16×16 扩展图标
    │   ├── icon48.png              # 48×48 扩展图标
    │   └── icon128.png             # 128×128 扩展图标
    └── popup/
        ├── popup.html              # 弹出面板 HTML
        ├── popup.css               # 弹出面板样式
        └── popup.js                # 弹出面板逻辑
```

---

## 🚀 安装扩展

### Chrome / Microsoft Edge 网上应用商店

> 待上架

### 开发者模式安装

1. 克隆本仓库到本地：
   ```bash
   git clone https://github.com/oopsunix/github-enhancer-extension.git
   ```
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择项目中的 `src/` 文件夹即可

---

## 🛠 技术栈

- **Manifest V3** — 最新 Chrome 扩展规范
- **原生 JavaScript** — 零依赖，纯原生实现
- **GitHub REST API** — 获取仓库元数据和文件信息
- **MutationObserver** — 高效监听 DOM 变化，适配动态加载内容

---

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests 来帮助改进本项目！

---

## 📄 许可证

[Apache License 2.0](LICENSE)

---

<div align="center">
  <p>如果你觉得这个项目对你有帮助，不妨给它点个⭐，让更多人发现这款工具！</p>
  <p>Built with ❤️ by <a href="https://github.com/oopsunix">oopsunix</a></p>
</div>