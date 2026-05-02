# yast的小窝 - 个人博客主页

一个基于原生 HTML/CSS/JavaScript 构建的个人博客主页，淡色系少女感设计风格，支持亮暗主题切换。

## 快速开始

直接在浏览器中打开 `index.html` 即可运行，无需任何构建工具或服务器。

## 功能特性

### 页面与导航
- **首页** — Banner 轮播 + 文章卡片网格
- **归档** — 按年份分组的文章归档列表
- **关于** — 个人介绍、技能展示、兴趣爱好、联系方式
- **友链** — 友情链接卡片展示

### 交互功能
- 亮/暗主题切换（自动检测系统偏好，手动切换后记住选择）
- 文章卡片网格/列表布局切换
- 侧边栏分类和标签筛选
- 内联搜索
- 文章详情弹窗（含目录 TOC）
- Banner 自动轮播 + 手动切换
- 打字机效果副标题
- 回到顶部 + 阅读进度条

### 响应式设计
- **桌面端**（>1024px）：左侧固定侧边栏 + 主内容区 + 顶部导航
- **平板端**（768-1024px）：侧边栏折叠为抽屉式
- **手机端**（<=768px）：底部 Tab Bar 导航，精简顶部栏

## 目录结构

```
├── index.html              # 主页面
├── css/
│   ├── variables.css       # CSS 变量（颜色、间距、圆角等）
│   ├── base.css            # 基础重置与排版
│   ├── navbar.css          # 顶部导航栏
│   ├── banner.css          # Banner 轮播
│   ├── sidebar.css         # 侧边栏
│   ├── posts.css           # 文章列表与卡片
│   ├── pagination.css      # 分页
│   ├── search.css          # 搜索弹窗
│   ├── components.css      # 弹窗、文章详情等组件
│   ├── footer.css          # 页脚
│   ├── animations.css      # 动画效果
│   └── responsive.css      # 响应式媒体查询
├── js/
│   ├── data.js             # 站点数据（文章、分类、标签、Banner、友链）
│   ├── app.js              # 主应用逻辑与页面导航
│   ├── theme.js            # 主题切换
│   ├── navbar.js           # 导航栏滚动效果
│   ├── banner.js           # Banner 轮播与打字效果
│   ├── sidebar.js          # 侧边栏（分类、标签、公告）
│   ├── posts.js            # 文章渲染、分页、筛选
│   ├── search.js           # 搜索
│   ├── scroll.js           # 滚动进度条与回到顶部
│   └── modal.js            # 弹窗系统
├── logo/                   # 站点图标与头像
└── meitu/                  # 文章封面图
```

## 自定义指南

### 修改站点信息
编辑 `js/data.js`，修改 `SITE_DATA` 对象中的 `site` 字段。

### 修改主题色
编辑 `css/variables.css`，调整 `--hue` 值即可全局切换色相：
- `340` — 粉色系（默认）
- `200` — 蓝色系
- `150` — 绿色系
- `30` — 橙色系

### 添加文章
在 `SITE_DATA.posts` 数组中追加对象：
```javascript
{
  id: 51,
  title: "文章标题",
  excerpt: "文章摘要",
  cover: "./meitu/51.png",
  category: 1,
  tags: [1, 2],
  author: "yast",
  date: "2024-03-01",
  content: "<h2>正文HTML</h2><p>内容</p>"
}
```

### 添加友链
在 `SITE_DATA.friends` 数组中追加对象：
```javascript
{
  id: 2,
  name: "友站名称",
  avatar: "头像URL",
  description: "简介",
  url: "https://example.com"
}
```

## 性能优化

- Banner 图片懒加载：首张立即加载，其余在切换时按需加载
- 文章封面图 `loading="lazy"` + `decoding="async"`
- 滚动事件 `requestAnimationFrame` 节流
- 页面切换淡入动画，减少白屏闪烁
- 字体 `font-display: swap` 非阻塞加载

## 技术栈

- 纯前端实现，零依赖，无需 Node.js 或任何构建工具
- CSS 变量驱动的主题系统
- CSS 模块化拆分
- JS 对象字面量模块模式
- 尊重 `prefers-color-scheme` 系统偏好

## 浏览器兼容

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

## License

MIT
