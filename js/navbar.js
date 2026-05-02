const Navbar = {
  navbar: null,
  lastScroll: 0,
  init() {
    this.navbar = document.querySelector('.navbar');
    if (!this.navbar) return;
    this.bindEvents();
    this.handleScroll();
  },
  bindEvents() {
    window.addEventListener('scroll', () => this.handleScroll());
  },
  handleScroll() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
    this.lastScroll = currentScroll;
  },
  closeMobileMenu() {
    const nav = document.querySelector('.navbar-nav');
    const overlay = document.querySelector('.sidebar-overlay');
    if (nav) nav.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }
};

window.Navbar = Navbar;
