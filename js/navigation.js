/* ============================================================
   CraveCart - navigation.js
   Shared navbar, footer, mobile toggle and confirm modal
   ============================================================ */

/* Renders the standard user navbar into #fb-navbar */
function fbRenderNavbar(activePage) {
  const el = document.getElementById('fb-navbar');
  if (!el) return;

  const links = [
    { key: 'home', label: 'Home', href: 'index.html' },
    { key: 'explore', label: 'Explore', href: 'explore.html' },
    { key: 'categories', label: 'Categories', href: 'index.html#categories' },
    { key: 'saved', label: 'Saved', href: 'saved.html' },
    { key: 'collections', label: 'Collections', href: 'collections.html' },
    { key: 'create', label: 'Create Recipe', href: 'create-recipe.html' },
    { key: 'myrecipes', label: 'My Recipes', href: 'my-recipes.html' },
    { key: 'profile', label: 'Profile', href: 'profile.html' }
  ];

  const linkHtml = links.map(function (l) {
    return '<a href="' + l.href + '"' + (l.key === activePage ? ' class="active"' : '') + '>' + l.label + '</a>';
  }).join('');

  el.innerHTML =
    '<div class="container nav-inner">' +
      '<a href="index.html" class="logo"><span class="logo-icon">' + FBC_LOGO_SVG + '</span><span class="logo-text">Crave<span>Cart</span></span></a>' +
      '<nav class="nav-links" id="fb-nav-links">' + linkHtml + '</nav>' +
      '<div class="nav-user">' +
        '<div id="fb-guest-links" style="display:none; gap:10px;">' +
          '<a href="login.html" class="btn btn-outline btn-sm">Login</a>' +
          '<a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>' +
        '</div>' +
        '<div id="fb-user-links" style="display:none; gap:12px;">' +
          '<a href="profile.html" class="nav-user-chip"><span class="avatar" id="fb-nav-avatar">U</span><span id="fb-nav-username">User</span></a>' +
          '<button class="nav-logout" onclick="fbLogout()">Logout</button>' +
        '</div>' +
        '<button class="nav-toggle" id="fb-nav-toggle" aria-label="Menu">☰</button>' +
      '</div>' +
    '</div>';

  fbUpdateNavbarSession();

  const toggle = document.getElementById('fb-nav-toggle');
  const navLinks = document.getElementById('fb-nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }
}

/* Renders the standard footer into #fb-footer */
function fbRenderFooter() {
  const el = document.getElementById('fb-footer');
  if (!el) return;
  el.innerHTML =
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<div class="logo" style="color:#fff;"><span class="logo-icon">' + FBC_LOGO_SVG + '</span><span class="logo-text">Crave<span style="color:var(--accent)">Cart</span></span></div>' +
          '<p class="small mt-1" style="color:#9a9aa5; max-width:300px;">Discover. Create. Crave. — Search, save, cook and share your favourite recipes.</p>' +
        '</div>' +
        '<div>' +
          '<h4>Quick Links</h4>' +
          '<a href="index.html">Home</a>' +
          '<a href="explore.html">Explore Recipes</a>' +
          '<a href="collections.html">Collections</a>' +
          '<a href="create-recipe.html">Create Recipe</a>' +
        '</div>' +
        '<div>' +
          '<h4>Account</h4>' +
          '<a href="login.html">Login</a>' +
          '<a href="signup.html">Sign Up</a>' +
          '<a href="admin/admin-login.html">Admin Portal</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">© 2026 CraveCart – Food Recipe &amp; Meal Planning App. Built with HTML, CSS &amp; Vanilla JavaScript.</div>' +
    '</div>';
}

/* Reusable confirmation modal (replaces confirm()) */
function fbConfirm(title, message, onYes) {
  let overlay = document.getElementById('fb-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fb-confirm-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-head"><h3>' + fbEscape(title) + '</h3><button class="modal-close" data-fbclose>&times;</button></div>' +
      '<p class="muted">' + fbEscape(message) + '</p>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-ghost" data-fbclose>Cancel</button>' +
        '<button class="btn btn-danger" id="fb-confirm-yes">Yes, Continue</button>' +
      '</div>' +
    '</div>';
  overlay.classList.add('open');

  overlay.querySelectorAll('[data-fbclose]').forEach(function (btn) {
    btn.addEventListener('click', function () { overlay.classList.remove('open'); });
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.getElementById('fb-confirm-yes').addEventListener('click', function () {
    overlay.classList.remove('open');
    onYes();
  });
}
