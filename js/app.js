const App = {
  currentPage: 'home',
  init() {
    this.initBanner();
    Theme.init();
    Navbar.init();
    Sidebar.init();
    Posts.init();
    Search.init();
    Modal.init();
    Scroll.init();
    this.bindGlobalEvents();
    this.initPageNavigation();
    this.renderArchives();
    this.renderFriends();
    this.handleHashChange();
  },
  initPageNavigation() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          window.location.hash = href;
          setTimeout(() => this.handleHashChange(), 50);
        }
      });
    });
  },
  handleHashChange() {
    const hash = window.location.hash || '#';
    const sections = ['archives', 'about', 'friends'];
    let targetSection = null;
    
    sections.forEach(section => {
      const el = document.getElementById(section);
      if (el) {
        if (hash === `#${section}`) {
          targetSection = section;
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      }
    });
    
    const contentWrapper = document.querySelector('.content-wrapper');
    const banner = document.querySelector('.banner');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const footer = document.querySelector('.footer');
    
    if (targetSection === null) {
      contentWrapper.style.display = 'block';
      banner.style.display = 'block';
      if (sidebar) sidebar.style.display = 'block';
      if (sidebarToggle) sidebarToggle.style.display = 'flex';
      if (footer) footer.style.marginLeft = '280px';
      document.querySelector('.main-content').style.marginLeft = '280px';
    } else {
      contentWrapper.style.display = 'none';
      banner.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
      if (sidebarToggle) sidebarToggle.style.display = 'none';
      if (footer) footer.style.marginLeft = '0';
      document.querySelector('.main-content').style.marginLeft = '0';
    }
    
    if (targetSection && targetSection !== 'home') {
      Scroll.scrollToTop();
    }
    
    this.updateNavActiveState(hash);
    this.currentPage = targetSection || 'home';
  },
  updateNavActiveState(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === hash || (hash === '' && href === '#')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },
  renderArchives() {
    const archiveList = document.querySelector('.archive-list');
    if (!archiveList) return;
    
    const posts = SITE_DATA.posts;
    const grouped = {};
    
    posts.forEach(post => {
      const year = post.date.split('-')[0];
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(post);
    });
    
    const years = Object.keys(grouped).sort((a, b) => b - a);
    
    archiveList.innerHTML = years.map(year => `
      <div class="archive-year">
        <h3 class="archive-year-title">${year}</h3>
        <div class="archive-items">
          ${grouped[year].map(post => {
            const category = SITE_DATA.categories.find(c => c.id === post.category);
            return `
              <div class="archive-item" data-post-id="${post.id}">
                <span class="archive-date">${post.date}</span>
                <span class="archive-title">${post.title}</span>
                <span class="archive-category">${category?.name || '未分类'}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
    
    archiveList.addEventListener('click', (e) => {
      const item = e.target.closest('.archive-item');
      if (item) {
        const postId = parseInt(item.dataset.postId);
        Modal.open('post', postId);
      }
    });
  },
renderFriends() {
  const friendsContainer = document.querySelector('.friends-list');
  if (!friendsContainer) return;
  
  // 从 SITE_DATA 读取友链数据
  const friends = SITE_DATA.friends || [];
  
  if (friends.length === 0) {
    friendsContainer.innerHTML = '<div class="no-results"><span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span><h3>暂无友链</h3><p>期待与更多朋友交换链接~</p></div>';
    return;
  }
  
  friendsContainer.innerHTML = friends.map(function(friend) {
    return `
      <div class="friend-card">
        <div class="friend-avatar">
          <img src="${friend.avatar}" alt="${friend.name}" loading="lazy">
        </div>
        <div class="friend-info">
          <h4 class="friend-name">${friend.name}</h4>
          <p class="friend-desc">${friend.description}</p>
          <a href="${friend.url}" class="friend-link" target="_blank" rel="noopener noreferrer">访问</a>
        </div>
      </div>
    `;
  }).join('');
},
  initBanner() {
    const bannerSlides = document.querySelector('.banner-slides');
    const bannerDots = document.querySelector('.banner-dots');
    if (!bannerSlides || !bannerDots) return;
    const banners = SITE_DATA.banners;
    bannerSlides.innerHTML = banners.map((banner, index) => `
      <div class="banner-slide ${index === 0 ? 'active' : ''}">
        <div class="slide-bg" style="background-image: url('${banner.image}')" loading="${index === 0 ? 'eager' : 'lazy'}"></div>
        <div class="slide-overlay"></div>
        <div class="banner-content">
          ${index === 0 ? `<div class="banner-avatar"><img src="${SITE_DATA.site.avatar}" alt="${SITE_DATA.site.author}" loading="eager"></div>` : ''}
          <h1 class="banner-title">${banner.title}</h1>
          <p class="banner-subtitle">
            <span class="typing-text">${banner.subtitle}</span>
            <span class="cursor"></span>
          </p>
          <div class="banner-tags">
            ${banner.tags.map(tag => `<span class="banner-tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
    bannerDots.innerHTML = banners.map((_, index) => `
      <button class="banner-dot ${index === 0 ? 'active' : ''}" aria-label="跳转到第${index + 1}张"></button>
    `).join('');
    Banner.init();
  },
  bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Sidebar.close();
      }
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('.navbar-brand')) {
        e.preventDefault();
        Posts.clearFilter();
        Scroll.scrollToTop();
        if (window.location.hash !== '') {
          window.location.hash = '';
          this.handleHashChange();
        }
      }
      if (e.target.closest('.footer-copyright a')) {
        e.preventDefault();
        Scroll.scrollToTop();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && this.currentPage === 'home') {
        Sidebar.close();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});