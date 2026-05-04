# yast的小窝

个人博客主页，纯前端零依赖，淡色系少女感设计，支持亮暗主题切换。

直接打开 `index.html` 即可运行，无需构建工具。

## 页面

| 页面 | 说明 |
|------|------|
| 首页 | Banner 轮播 + 文章卡片网格 |
| 归档 | 按年份分组的文章列表 |
| 下载 | 网盘风格文件管理器，支持多级文件夹导航 |
| 关于 | 个人介绍、技能、兴趣、联系方式 |
| 友链 | 友情链接展示 |

## 功能

- 亮/暗主题切换（自动检测系统偏好，手动选择后记忆）
- 文章网格/列表布局切换
- 侧边栏分类与标签筛选
- 搜索弹窗
- 文章详情弹窗（含目录 TOC）
- Banner 自动轮播 + 打字机效果
- 下载页文件夹导航、网格/列表视图、搜索排序
- 回到顶部 + 阅读进度条

## 目录结构

```
├── index.html
├── css/
│   ├── variables.css        # CSS 变量（主题色、间距、圆角）
│   ├── base.css             # 基础重置与排版
│   ├── navbar.css           # 顶部导航栏
│   ├── banner.css           # Banner 轮播
│   ├── sidebar.css          # 侧边栏
│   ├── posts.css            # 文章列表与卡片
│   ├── download.css         # 下载页样式
│   ├── pagination.css       # 分页
│   ├── search.css           # 搜索弹窗
│   ├── components.css       # 弹窗等组件
│   ├── footer.css           # 页脚
│   ├── animations.css       # 动画效果
│   └── responsive.css       # 响应式媒体查询
├── js/
│   ├── data.js              # 站点数据（文章、分类、标签、Banner、友链）
│   ├── download-data.js     # 下载页文件数据
│   ├── download.js          # 下载页交互逻辑
│   ├── app.js               # 主应用逻辑与页面导航
│   ├── theme.js             # 主题切换
│   ├── navbar.js            # 导航栏滚动效果
│   ├── banner.js            # Banner 轮播与打字效果
│   ├── sidebar.js           # 侧边栏
│   ├── posts.js             # 文章渲染、分页、筛选
│   ├── search.js            # 搜索
│   ├── scroll.js            # 滚动进度条与回到顶部
│   └── modal.js             # 弹窗系统
├── logo/                    # 站点图标与头像
└── meitu/                   # 文章封面图（webp 格式）
```

## 自定义

### 站点信息

编辑 `js/data.js` 中的 `SITE_DATA.site` 字段。

### 主题色

编辑 `css/variables.css`，修改 `--hue` 即可全局切换色相：

| --hue | 色系 |
|-------|------|
| 340 | 粉色（默认） |
| 200 | 蓝色 |
| 150 | 绿色 |
| 30 | 橙色 |

### 添加文章

在 `SITE_DATA.posts` 中追加：

```javascript
{
  id: 51,
  title: "文章标题",
  excerpt: "摘要",
  cover: "./meitu/51.webp",
  category: 1,
  tags: [1, 2],
  author: "yast",
  date: "2024-03-01",
  content: "<h2>正文</h2><p>内容</p>"
}
```

### 管理下载页文件

编辑 `js/download-data.js`：

```javascript
const DOWNLOAD_DATA = {
  folders: [
    {
      id: "my-folder",
      name: "文件夹名称",
      description: "文件夹描述",
      icon: "folder",
      children: [
        {
          id: "sub-folder",
          name: "子文件夹",
          children: [
            {
              id: null,
              name: "文件名.zip",
              type: "zip",
              size: "10 MB",
              date: "2026-01-01",
              url: "https://example.com/file.zip",
              description: "文件描述"
            }
          ]
        }
      ]
    }
  ]
};
```

支持的 `type` 值：`zip` `rar` `7z` `jar` `py` `js` `exe` `msi` `dll` `pdf` `png` `jpg` `json` `txt` `md` `mp4` `mp3` `html` `css` `java` `cpp` `cs` 等，每种类型对应不同的图标和配色。

### 添加友链

在 `SITE_DATA.friends` 中追加：

```javascript
{
  id: 2,
  name: "友站名称",
  avatar: "头像URL",
  description: "简介",
  url: "https://example.com"
}
```

## 响应式

| 断点 | 布局 |
|------|------|
| >1024px | 左侧固定侧边栏 + 主内容区 + 顶部导航 |
| 768-1024px | 侧边栏折叠为抽屉式 |
| <=768px | 底部 Tab Bar 导航，精简顶部栏 |

## 性能优化

- Banner 图片懒加载：首张立即加载，其余按需加载
- 封面图 `loading="lazy"` + `decoding="async"` + webp 格式
- 滚动事件 `requestAnimationFrame` 节流
- 字体 `font-display: swap` 非阻塞加载

## 技术栈

- 纯前端，零依赖，无需 Node.js 或构建工具
- CSS 变量驱动主题系统
- JS 对象字面量模块模式
- 尊重 `prefers-color-scheme` 系统偏好

## 部署

推送到 GitHub 仓库，开启 GitHub Pages 即可。选择分支 + 根目录，无需额外配置。

## 浏览器兼容

Chrome 80+ / Firefox 80+ / Safari 14+ / Edge 80+

## License

MIT
