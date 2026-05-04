const Download = {
  currentPath: [],
  currentItems: [],
  viewMode: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
  searchQuery: '',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const sortBtn = e.target.closest('.download-sort-btn');
      const sortMenu = e.target.closest('.download-sort-menu');
      const sortItem = e.target.closest('.download-sort-item');
      const viewBtn = e.target.closest('.view-toggle-btn');
      const breadcrumb = e.target.closest('.breadcrumb-item');
      const downloadItem = e.target.closest('.download-item');
      const downloadBtn = e.target.closest('.download-btn');
      const searchClear = e.target.closest('.download-search-clear');

      if (sortBtn) {
        e.stopPropagation();
        const menu = sortBtn.nextElementSibling;
        document.querySelectorAll('.download-sort-menu').forEach(m => {
          if (m !== menu) m.classList.remove('active');
        });
        menu.classList.toggle('active');
        return;
      }

      if (!sortMenu && !sortBtn) {
        document.querySelectorAll('.download-sort-menu').forEach(m => m.classList.remove('active'));
      }

      if (sortItem) {
        const sort = sortItem.dataset.sort;
        const order = sortItem.dataset.order;
        this.sortBy = sort;
        this.sortOrder = order;
        this.updateSortMenu();
        this.render();
        return;
      }

      if (viewBtn) {
        const mode = viewBtn.dataset.view;
        this.viewMode = mode;
        this.updateViewToggle();
        this.render();
        return;
      }

      if (breadcrumb && !breadcrumb.classList.contains('active')) {
        const index = parseInt(breadcrumb.dataset.index);
        this.navigateTo(index);
        return;
      }

      if (downloadItem && !downloadBtn) {
        const isFolder = downloadItem.classList.contains('folder');
        if (isFolder) {
          const index = parseInt(downloadItem.dataset.index);
          this.enterFolder(index);
        }
        return;
      }

      if (downloadBtn) {
        e.stopPropagation();
        const url = downloadBtn.dataset.url;
        const name = downloadBtn.dataset.name;
        this.downloadFile(url, name);
        return;
      }

      if (searchClear) {
        const input = document.querySelector('.download-search-input');
        input.value = '';
        this.searchQuery = '';
        this.updateSearchClear();
        this.render();
        return;
      }
    });

    const searchInput = document.querySelector('.download-search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.updateSearchClear();
          this.render();
        }, 300);
      });
    }
  },

  getCurrentItems() {
    let items = this.currentPath.length === 0 
      ? DOWNLOAD_DATA.folders 
      : this.currentItems;

    if (this.searchQuery) {
      items = items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(this.searchQuery);
        const descMatch = item.description && item.description.toLowerCase().includes(this.searchQuery);
        return nameMatch || descMatch;
      });
    }

    return this.sortItems(items);
  },

  sortItems(items) {
    const folders = items.filter(item => item.children);
    const files = items.filter(item => !item.children);

    folders.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, 'zh-CN');
      return this.sortOrder === 'asc' ? cmp : -cmp;
    });

    files.sort((a, b) => {
      let cmp = 0;
      switch (this.sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'zh-CN');
          break;
        case 'size':
          cmp = this.parseSize(a.size) - this.parseSize(b.size);
          break;
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
      }
      return this.sortOrder === 'asc' ? cmp : -cmp;
    });

    return [...folders, ...files];
  },

  parseSize(size) {
    if (!size) return 0;
    const match = size.match(/([\d.]+)\s*(B|KB|MB|GB)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const units = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
    return value * (units[unit] || 1);
  },

  enterFolder(index) {
    const folder = this.getCurrentItems()[index];
    if (folder && folder.children) {
      this.currentPath.push({
        id: folder.id,
        name: folder.name,
        items: this.currentItems
      });
      this.currentItems = folder.children;
      this.render();
    }
  },

  navigateTo(index) {
    if (index === 0) {
      this.currentPath = [];
      this.currentItems = [];
    } else {
      const targetPath = this.currentPath.slice(0, index);
      let items = DOWNLOAD_DATA.folders;
      for (let i = 0; i < targetPath.length; i++) {
        const pathItem = targetPath[i];
        const folder = items.find(f => f.id === pathItem.id);
        if (folder && folder.children) {
          items = folder.children;
        }
      }
      this.currentPath = targetPath;
      this.currentItems = targetPath.length > 0 ? items : [];
    }
    this.render();
  },

  downloadFile(url, name) {
    if (url === '#') {
      this.showToast('演示模式：' + name + ' 下载链接');
      return;
    }
    window.open(url, '_blank');
  },

  showToast(message) {
    let toast = document.querySelector('.download-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'download-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        font-size: 0.9rem;
        color: var(--text-primary);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  },

  getFileIcon(type) {
    const icons = {
      folder: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
      jar: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H8v2h6v-2zm0-4H8v2h6V8z"/></svg>`,
      zip: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2v2z"/></svg>`,
      rar: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4 10.5v-2l-1.5 1.5-1-1L15 13l-1.5 1.5L12 13l1-1-1.5-1.5L13 12l-2 2V8h6v8.5z"/></svg>`,
      '7z': `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10.5V17h-2v-2h-2v2h-2v2h2v2h2v-2h2v-3.5z"/></svg>`,
      py: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/><text x="7" y="16" font-size="8" font-weight="bold" fill="currentColor">py</text></svg>`,
      js: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><text x="5.5" y="14" font-size="7" font-weight="bold" fill="#333">JS</text></svg>`,
      exe: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12v-2h6v2h-6zm0-4v-2h6v2h-6zm0-4V8h6v2h-6z"/></svg>`,
      msi: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12v-2h6v2h-6zm0-4v-2h6v2h-6z"/></svg>`,
      dll: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12v-2h6v2h-6zm0-4v-2h6v2h-6z"/></svg>`,
      pdf: `<svg viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>`,
      png: `<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
      jpg: `<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
      json: `<svg viewBox="0 0 24 24"><path d="M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2m-5 12a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1"/></svg>`,
      txt: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/><path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/></svg>`,
      md: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/><path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h6v2h-6zm0 4h6v2h-6zm-4 0h2v2h-2zm4-8h2v2h-2zm0 4h2v6h-2z"/></svg>`,
      mp4: `<svg viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm-6.75 11.25L14 12l-2.75 3.25v-6.5L14 12z"/></svg>`,
      mp3: `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
      html: `<svg viewBox="0 0 24 24"><path d="M12 17.56L16.07 16.43L16.62 10.33H9.38L9.2 8.3H16.8L17 6.31H7L7.56 12.32H14.45L14.22 14.9L12 15.5L9.78 14.9L9.64 13.24H7.64L7.93 16.43L12 17.56M4.07 3H19.93L18.5 19.2L12 21L5.5 19.2L4.07 3Z"/></svg>`,
      css: `<svg viewBox="0 0 24 24"><path d="M5 3l-.65 3.34h13.59L17.5 8.5H3.92l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-3.64h-2.02l.66 3.33h1.59L3.94 19H2l.66-3.33h2.34l-.76 3.81 5.48 1.81L18.5 19l.65-3.34h-13.59l.76-3.81h8.67l-.66-3.33H7.19l.76-3.81L5 3Z"/></svg>`,
      java: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/><text x="5" y="16" font-size="9" font-weight="bold" fill="currentColor">Ja</text></svg>`,
      cpp: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/><text x="5" y="16" font-size="8" font-weight="bold" fill="currentColor">C+</text></svg>`,
      cs: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/><text x="4" y="16" font-size="8" font-weight="bold" fill="currentColor">C#</text></svg>`
    };
    return icons[type] || icons.default || icons.txt;
  },

  getFileIconClass(type) {
    const folderClass = 'file-icon-folder';
    if (type === 'folder') return folderClass;
    const typeClass = `file-icon-${type}`;
    const validTypes = ['jar', 'zip', 'rar', '7z', 'py', 'js', 'exe', 'msi', 'dll', 'pdf', 'png', 'jpg', 'json', 'txt', 'md', 'mp4', 'mp3', 'html', 'css', 'java', 'cpp', 'cs'];
    return validTypes.includes(type) ? typeClass : 'file-icon-default';
  },

  renderBreadcrumb() {
    const breadcrumb = document.querySelector('.download-breadcrumb');
    if (!breadcrumb) return;

    const path = [
      { name: '全部文件', icon: 'folder' }
    ];

    this.currentPath.forEach(item => {
      path.push({ name: item.name, icon: 'folder' });
    });

    breadcrumb.innerHTML = path.map((item, index) => {
      const isLast = index === path.length - 1;
      const icon = item.icon === 'folder' 
        ? `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`
        : '';

      return `
        <a href="javascript:;" class="breadcrumb-item ${isLast ? 'active' : ''}" data-index="${index}">
          ${index > 0 ? icon : ''}
          <span>${item.name}</span>
        </a>
        ${!isLast ? '<span class="breadcrumb-separator">/</span>' : ''}
      `;
    }).join('');
  },

  renderStats() {
    const stats = document.querySelector('.download-stats');
    if (!stats) return;

    const items = this.getCurrentItems();
    const folders = items.filter(item => item.children).length;
    const files = items.filter(item => !item.children).length;

    stats.innerHTML = `
      <div class="download-stat">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span><strong>${folders}</strong> 个文件夹</span>
      </div>
      <div class="download-stat">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </span>
        <span><strong>${files}</strong> 个文件</span>
      </div>
    `;
  },

  renderItems() {
    const content = document.querySelector('.download-content');
    if (!content) return;

    const items = this.getCurrentItems();

    if (items.length === 0) {
      content.innerHTML = `
        <div class="download-empty">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <h3>${this.searchQuery ? '没有找到匹配的文件' : '文件夹为空'}</h3>
          <p>${this.searchQuery ? '试试其他关键词吧~' : '这个文件夹里还没有文件'}</p>
        </div>
      `;
      return;
    }

    const isGrid = this.viewMode === 'grid';

    content.innerHTML = `
      <div class="${isGrid ? 'download-grid' : 'download-list'}">
        ${items.map((item, index) => {
          const isFolder = !!item.children;
          const icon = isFolder 
            ? this.getFileIcon('folder')
            : this.getFileIcon(item.type || 'default');
          const iconClass = isFolder 
            ? this.getFileIconClass('folder')
            : this.getFileIconClass(item.type || 'default');

          if (isGrid) {
            return `
              <div class="download-item ${isFolder ? 'folder' : ''}" data-index="${index}">
                <div class="grid-item">
                  <div class="file-icon ${iconClass}">${icon}</div>
                  <div class="file-name">${item.name}</div>
                  ${item.size ? `<div class="file-size">${item.size}</div>` : ''}
                  ${item.description && !isFolder ? `<div class="file-description">${item.description}</div>` : ''}
                  ${!isFolder ? `
                    <div class="file-actions">
                      <button class="download-btn" data-url="${item.url || '#'}" data-name="${item.name}" title="下载">
                        <span class="icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </span>
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          } else {
            return `
              <div class="download-item ${isFolder ? 'folder' : ''}" data-index="${index}">
                <div class="list-item">
                  <div class="file-icon ${iconClass}">${icon}</div>
                  <div class="file-info">
                    <div class="file-name">${item.name}</div>
                    <div class="file-meta">
                      ${item.size ? `<span class="file-size">${item.size}</span>` : ''}
                      ${item.date ? `<span class="file-date">${item.date}</span>` : ''}
                      ${item.type ? `<span class="file-type">.${item.type}</span>` : ''}
                    </div>
                  </div>
                  ${!isFolder ? `
                    <div class="file-actions">
                      <button class="download-btn" data-url="${item.url || '#'}" data-name="${item.name}" title="下载">
                        <span class="icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </span>
                      </button>
                    </div>
                  ` : `
                    <span class="icon" style="color: var(--text-tertiary); margin-left: auto;">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </span>
                  `}
                </div>
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  },

  updateSortMenu() {
    document.querySelectorAll('.download-sort-item').forEach(item => {
      const sort = item.dataset.sort;
      const order = item.dataset.order;
      if (sort === this.sortBy && order === this.sortOrder) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const sortLabel = document.querySelector('.sort-label');
    if (sortLabel) {
      const labels = {
        'name-asc': '名称 A-Z',
        'name-desc': '名称 Z-A',
        'size-asc': '从小到大',
        'size-desc': '从大到小',
        'date-asc': '从旧到新',
        'date-desc': '从新到旧',
        'type-asc': '类型 A-Z',
        'type-desc': '类型 Z-A'
      };
      sortLabel.textContent = labels[`${this.sortBy}-${this.sortOrder}`] || '排序';
    }
  },

  updateViewToggle() {
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      if (btn.dataset.view === this.viewMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateSearchClear() {
    const clearBtn = document.querySelector('.download-search-clear');
    if (clearBtn) {
      if (this.searchQuery) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
    }
  },

  render() {
    this.renderBreadcrumb();
    this.renderStats();
    this.renderItems();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const downloadSection = document.getElementById('download');
  if (downloadSection) {
    Download.init();
  }
});
