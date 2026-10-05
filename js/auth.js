/* ============================================================
   CraveCart - auth.js
   Signup / Login / Logout + route protection + toast notifications
   ============================================================ */

/* ---------------- Toast notifications ---------------- */
function fbToast(message, type) {
  type = type || 'success';
  let container = document.getElementById('fb-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'fb-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'fb-toast ' + type;
  const icons = { success: '✔', error: '✖', info: 'ℹ' };
  toast.innerHTML = '<span class="fb-toast-icon">' + (icons[type] || 'ℹ') + '</span><span>' + fbEscape(message) + '</span>';
  container.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('show'); });
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
}

/* ---------------- Validation helpers ---------------- */
function fbIsValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function fbFieldError(id, message) {
  const field = document.getElementById(id);
  const errorEl = document.getElementById(id + '-error');
  if (field) field.classList.add('fb-invalid');
  if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
}

function fbClearErrors(formEl) {
  formEl.querySelectorAll('.fb-invalid').forEach(function (el) { el.classList.remove('fb-invalid'); });
  formEl.querySelectorAll('.field-error').forEach(function (el) { el.style.display = 'none'; el.textContent = ''; });
}

/* ---------------- Signup ---------------- */
function fbHandleSignup(event) {
  event.preventDefault();
  const form = event.target;
  fbClearErrors(form);

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  let valid = true;
  if (!name) { fbFieldError('signup-name', 'Full name is required'); valid = false; }
  if (!email) { fbFieldError('signup-email', 'Email is required'); valid = false; }
  else if (!fbIsValidEmail(email)) { fbFieldError('signup-email', 'Please enter a valid email address'); valid = false; }
  if (!password) { fbFieldError('signup-password', 'Password is required'); valid = false; }
  else if (password.length < 6) { fbFieldError('signup-password', 'Password must be at least 6 characters'); valid = false; }
  if (!confirm) { fbFieldError('signup-confirm', 'Please confirm your password'); valid = false; }
  else if (password !== confirm) { fbFieldError('signup-confirm', 'Passwords do not match'); valid = false; }

  const users = getData(LS_KEYS.USERS) || [];
  if (valid && users.some(function (u) { return u.email === email; })) {
    fbFieldError('signup-email', 'This email is already registered');
    fbToast('An account with this email already exists', 'error');
    return false;
  }
  if (!valid) { fbToast('Please fix the highlighted fields', 'error'); return false; }

  const newUser = {
    id: fbGenerateId('user'),
    name: name,
    email: email,
    password: password,
    savedRecipes: [],
    collections: [],
    createdRecipes: [],
    createdAt: fbGetToday()
  };
  users.push(newUser);
  saveData(LS_KEYS.USERS, users);

  fbToast('Signup successful! Please login to continue.', 'success');
  setTimeout(function () { window.location.href = 'login.html'; }, 1200);
  return false;
}

/* ---------------- Login (user) ---------------- */
function fbHandleLogin(event) {
  event.preventDefault();
  fbClearErrors(event.target);

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  let valid = true;
  if (!email) { fbFieldError('login-email', 'Email is required'); valid = false; }
  else if (!fbIsValidEmail(email)) { fbFieldError('login-email', 'Please enter a valid email address'); valid = false; }
  if (!password) { fbFieldError('login-password', 'Password is required'); valid = false; }
  if (!valid) { fbToast('Please fill in all fields', 'error'); return false; }

  const users = getData(LS_KEYS.USERS) || [];
  const user = users.find(function (u) { return u.email === email && u.password === password; });
  if (!user) {
    fbToast('Invalid email or password', 'error');
    return false;
  }

  saveData(LS_KEYS.CURRENT_USER, user.id);
  fbToast('Welcome back, ' + user.name + '!', 'success');
  setTimeout(function () { window.location.href = 'index.html'; }, 800);
  return false;
}

/* ---------------- Logout ---------------- */
function fbLogout() {
  deleteData(LS_KEYS.CURRENT_USER);
  fbToast('You have been logged out', 'info');
  setTimeout(function () { window.location.href = 'login.html'; }, 600);
}

/* ---------------- Admin login / logout ---------------- */
function fbHandleAdminLogin(event) {
  event.preventDefault();
  fbClearErrors(event.target);

  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-password').value;

  if (!email || !password) {
    fbToast('Please fill in both fields', 'error');
    return false;
  }
  if (email === 'admin@cravecart.com' && password === 'admin123') {
    saveData(LS_KEYS.ADMIN, true);
    fbToast('Welcome, Admin!', 'success');
    setTimeout(function () { window.location.href = 'dashboard.html'; }, 800);
  } else {
    fbToast('Invalid admin credentials', 'error');
  }
  return false;
}

function fbAdminLogout() {
  deleteData(LS_KEYS.ADMIN);
  fbToast('Admin logged out', 'info');
  setTimeout(function () { window.location.href = 'admin-login.html'; }, 600);
}

/* ---------------- Route guards ---------------- */
function fbRequireUser() {
  const user = fbGetCurrentUser();
  if (!user) {
    fbToast('Please login to access this page', 'error');
    setTimeout(function () { window.location.href = 'login.html'; }, 900);
    return null;
  }
  return user;
}

function fbRequireAdmin() {
  if (!fbIsAdminLoggedIn()) {
    fbToast('Admin access required. Please login as admin.', 'error');
    setTimeout(function () { window.location.href = 'admin-login.html'; }, 900);
    return false;
  }
  return true;
}

/* ---------------- Navbar session UI ---------------- */
function fbUpdateNavbarSession() {
  const guestLinks = document.getElementById('fb-guest-links');
  const userLinks = document.getElementById('fb-user-links');
  const user = fbGetCurrentUser();

  if (guestLinks && userLinks) {
    if (user) {
      guestLinks.style.display = 'none';
      userLinks.style.display = 'flex';
      const nameEl = document.getElementById('fb-nav-username');
      if (nameEl) nameEl.textContent = user.name;
      const avatarEl = document.getElementById('fb-nav-avatar');
      if (avatarEl) avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
    } else {
      guestLinks.style.display = 'flex';
      userLinks.style.display = 'none';
    }
  }
}

/* ---------------- Profile page ---------------- */
function fbInitProfilePage() {
  const user = fbRequireUser();
  if (!user) return;

  /* Stats (computed fresh from storage) */
  const savedCount = (user.savedRecipes || []).length;
  const createdCount = fbGetRecipes().filter(function (r) { return r.author === user.id; }).length;
  const collCount = fbGetUserCollections(user.id).length;

  document.getElementById('pf-avatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
  document.getElementById('pf-name').textContent = user.name;
  document.getElementById('pf-email').textContent = user.email;
  document.getElementById('pf-email-ro').value = user.email;
  document.getElementById('pf-created').textContent = fbFormatDate(user.createdAt);
  document.getElementById('stat-saved').textContent = savedCount;
  document.getElementById('stat-created').textContent = createdCount;
  document.getElementById('stat-collections').textContent = collCount;

  /* Edit name */
  const form = document.getElementById('edit-name-form');
  const nameInput = document.getElementById('edit-name');
  nameInput.value = user.name;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const newName = nameInput.value.trim();
    if (!newName) { fbToast('Name cannot be empty', 'error'); return; }
    if (newName.length < 2) { fbToast('Name must be at least 2 characters', 'error'); return; }

    fbUpdateCurrentUser({ name: newName });

    /* Keep author names on the user's recipes in sync */
    const recipes = fbGetRecipes();
    let changed = false;
    recipes.forEach(function (r) {
      if (r.author === user.id) { r.authorName = newName; changed = true; }
    });
    if (changed) saveData(LS_KEYS.RECIPES, recipes);

    /* Keep review names in sync */
    const reviews = getData(LS_KEYS.REVIEWS) || [];
    let rChanged = false;
    reviews.forEach(function (rv) {
      if (rv.userId === user.id) { rv.userName = newName; rChanged = true; }
    });
    if (rChanged) saveData(LS_KEYS.REVIEWS, reviews);

    fbToast('Profile updated successfully!', 'success');
    fbUpdateNavbarSession();
    document.getElementById('pf-name').textContent = newName;
    document.getElementById('pf-avatar').textContent = newName.charAt(0).toUpperCase();
  });
}
