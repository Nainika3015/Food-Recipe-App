/* ============================================================
   CraveCart - admin.js
   Admin module: sidebar, dashboard, manage recipes, users,
   categories and reviews
   ============================================================ */

function fbRenderAdminShell(activeKey) {
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar) {
    const links = [
      { key: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
      { key: 'recipes', icon: '🍲', label: 'Manage Recipes', href: 'recipes.html' },
      { key: 'users', icon: '👥', label: 'Manage Users', href: 'users.html' },
      { key: 'categories', icon: '🏷️', label: 'Manage Categories', href: 'categories.html' },
      { key: 'reviews', icon: '⭐', label: 'Manage Reviews', href: 'reviews.html' }
    ];
    sidebar.innerHTML =
      '<div class="admin-logo">' + FBC_LOGO_SVG + ' <span class="logo-text">Crave<span>Cart</span> Admin</span></div>' +
      '<div class="admin-role-chip">🛡️ Administrator</div>' +
      '<nav class="admin-nav">' +
        links.map(function (l) {
          return '<a href="' + l.href + '"' + (l.key === activeKey ? ' class="active"' : '') + '><span class="nav-icon">' + l.icon + '</span>' + l.label + '</a>';
        }).join('') +
      '</nav>' +
      '<a href="../index.html" class="admin-nav" style="color:inherit;"><span class="nav-icon">🌐</span>View User Site</a>' +
      '<button class="btn btn-danger btn-sm btn-block admin-exit" onclick="fbAdminLogout()">Logout</button>';

    /* Mobile burger */
    const burger = document.getElementById('admin-burger');
    const overlay = document.getElementById('sidebar-overlay');
    if (burger && overlay) {
      burger.addEventListener('click', function () {
        sidebar.classList.add('open');
        overlay.classList.add('show');
      });
      overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
  }
}

/* ================= DASHBOARD ================= */
function fbInitAdminDashboard() {
  fbRenderAdminShell('dashboard');

  const users = getData(LS_KEYS.USERS) || [];
  const recipes = fbGetRecipes();
  const categories = getData(LS_KEYS.CATEGORIES) || [];
  const reviews = getData(LS_KEYS.REVIEWS) || [];
  const savedTotal = users.reduce(function (sum, u) { return sum + (u.savedRecipes || []).length; }, 0);

  document.getElementById('ad-total-users').textContent = users.length;
  document.getElementById('ad-total-recipes').textContent = recipes.length;
  document.getElementById('ad-total-cats').textContent = categories.length;
  document.getElementById('ad-total-reviews').textContent = reviews.length;
  document.getElementById('ad-total-saved').textContent = savedTotal;

  /* Recently added recipes */
  const recent = recipes.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 5);
  document.getElementById('ad-recent-recipes').innerHTML = recent.map(function (r) {
    return (
      '<div class="mini-item">' +
        '<img src="' + fbEscape(r.image) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div><div class="mi-name">' + fbEscape(r.name) + '</div>' +
        '<div class="mi-sub">' + fbEscape(r.cuisine) + ' · ' + fbEscape(r.category) + '</div></div>' +
        '<div class="mi-right">' + fbFormatDate(r.createdAt) + '</div>' +
      '</div>'
    );
  }).join('');

  /* Most rated recipes */
  const mostRated = recipes.slice().sort(function (a, b) {
    return fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count;
  }).slice(0, 5);
  document.getElementById('ad-most-rated').innerHTML = mostRated.map(function (r) {
    const rt = fbGetRecipeRating(r.id);
    return (
      '<div class="mini-item">' +
        '<div class="mini-avatar">🍳</div>' +
        '<div><div class="mi-name">' + fbEscape(r.name) + '</div>' +
        '<div class="mi-sub">' + (rt.count ? '★ ' + rt.avg.toFixed(1) + ' avg' : 'No ratings yet') + '</div></div>' +
        '<div class="mi-right">' + rt.count + ' rating' + (rt.count === 1 ? '' : 's') + '</div>' +
      '</div>'
    );
  }).join('');

  /* Recent users */
  const recentUsers = users.slice().sort(function (a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); }).slice(0, 5);
  document.getElementById('ad-recent-users').innerHTML = recentUsers.map(function (u) {
    return (
      '<div class="mini-item">' +
        '<div class="mini-avatar">' + fbEscape((u.name || 'U').charAt(0).toUpperCase()) + '</div>' +
        '<div><div class="mi-name">' + fbEscape(u.name) + '</div>' +
        '<div class="mi-sub">' + fbEscape(u.email) + '</div></div>' +
        '<div class="mi-right">' + fbFormatDate(u.createdAt) + '</div>' +
      '</div>'
    );
  }).join('');
}

/* ================= MANAGE RECIPES ================= */
function fbInitAdminRecipes() {
  fbRenderAdminShell('recipes');

  const tbody = document.getElementById('admin-recipes-body');
  const searchInput = document.getElementById('admin-recipe-search');

  function render() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const recipes = fbGetRecipes().filter(function (r) {
      if (!q) return true;
      return r.name.toLowerCase().indexOf(q) !== -1 ||
             r.cuisine.toLowerCase().indexOf(q) !== -1 ||
             r.category.toLowerCase().indexOf(q) !== -1;
    });

    document.getElementById('admin-recipe-count').textContent = recipes.length + ' recipes';

    if (!recipes.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center muted">No recipes found.</td></tr>';
      return;
    }

    tbody.innerHTML = recipes.map(function (r) {
      const rt = fbGetRecipeRating(r.id);
      return (
        '<tr>' +
          '<td><img class="recipe-thumb" src="' + fbEscape(r.image) + '" alt="" onerror="this.style.visibility=\'hidden\'"></td>' +
          '<td><strong>' + fbEscape(r.name) + '</strong><br><span class="muted small">' + fbEscape(r.authorName || 'Admin') + '</span></td>' +
          '<td>' + fbEscape(r.cuisine) + '<br><span class="muted small">' + fbEscape(r.category) + '</span></td>' +
          '<td>' + (rt.count ? '★ ' + rt.avg.toFixed(1) : '—') + '</td>' +
          '<td>' + fbFormatDate(r.createdAt) + '</td>' +
          '<td><div class="row-actions-cell">' +
            '<button class="icon-btn" data-view="' + r.id + '">View</button>' +
            '<button class="icon-btn" data-edit="' + r.id + '">Edit</button>' +
            '<button class="icon-btn danger" data-delete="' + r.id + '">Delete</button>' +
          '</div></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        openAdminRecipeModal(b.getAttribute('data-view'));
      });
    });
    tbody.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        window.location.href = '../create-recipe.html?edit=' + encodeURIComponent(b.getAttribute('data-edit'));
      });
    });
    tbody.querySelectorAll('[data-delete]').forEach(function (b) {
      b.addEventListener('click', function () {
        const id = b.getAttribute('data-delete');
        fbConfirm('Delete Recipe', 'Delete this recipe permanently? Reviews and saved links will also be removed.', function () {
          saveData(LS_KEYS.RECIPES, fbGetRecipes().filter(function (r) { return r.id !== id; }));
          saveData(LS_KEYS.REVIEWS, (getData(LS_KEYS.REVIEWS) || []).filter(function (rv) { return rv.recipeId !== id; }));
          const users = getData(LS_KEYS.USERS) || [];
          users.forEach(function (u) {
            u.savedRecipes = (u.savedRecipes || []).filter(function (rid) { return rid !== id; });
            u.createdRecipes = (u.createdRecipes || []).filter(function (rid) { return rid !== id; });
          });
          saveData(LS_KEYS.USERS, users);
          fbToast('Recipe deleted', 'info');
          render();
        });
      });
    });
  }

  searchInput.addEventListener('input', render);
  document.getElementById('admin-add-recipe').addEventListener('click', function () {
    window.location.href = '../create-recipe.html';
  });

  render();
}

/* Recipe details modal (admin) */
function openAdminRecipeModal(id) {
  const r = fbGetRecipeById(id);
  if (!r) return;
  const rt = fbGetRecipeRating(id);
  const total = Number(r.prepTime) + Number(r.cookTime);

  let overlay = document.getElementById('fb-admin-recipe-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fb-admin-recipe-modal';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML =
    '<div class="modal-box" style="width:min(640px,100%);">' +
      '<div class="modal-head"><h3>' + fbEscape(r.name) + '</h3><button class="modal-close" data-close>&times;</button></div>' +
      '<img src="' + fbEscape(r.image) + '" alt="" style="width:100%; border-radius:12px; max-height:220px; object-fit:cover; margin-bottom:14px;" onerror="this.style.display=\'none\'">' +
      '<p class="small muted">' + fbEscape(r.description) + '</p>' +
      '<div class="detail-badges mt-1">' +
        '<span class="badge badge-cuisine">' + fbEscape(r.cuisine) + '</span>' +
        '<span class="badge">' + fbEscape(r.category) + '</span>' +
        '<span class="badge badge-diet">' + fbEscape(r.dietaryPreference) + '</span>' +
        '<span class="badge badge-diff">' + fbEscape(r.difficulty) + '</span>' +
        '<span class="badge badge-time">⏱ ' + total + ' min total · ' + fbEscape(String(r.servings)) + ' servings</span>' +
        '<span class="badge">' + (rt.count ? '★ ' + rt.avg.toFixed(1) + ' (' + rt.count + ')' : 'No ratings') + '</span>' +
      '</div>' +
      '<h4 class="mt-2">Ingredients</h4>' +
      '<div class="ing-list">' +
        (r.ingredients || []).map(function (i) {
          return '<div class="ing-item"><span>' + fbEscape(i.name) + '</span><span class="qty">' + fbEscape(i.quantity) + ' ' + fbEscape(i.unit) + '</span></div>';
        }).join('') +
      '</div>' +
      '<h4 class="mt-2">Instructions</h4>' +
      '<div class="step-list">' +
        (r.instructions || []).map(function (s) { return '<div class="step-item">' + fbEscape(s) + '</div>'; }).join('') +
      '</div>' +
      '<div class="modal-actions"><button class="btn btn-primary" data-close>Close</button></div>' +
    '</div>';
  overlay.classList.add('open');

  overlay.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { overlay.classList.remove('open'); });
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
}

/* ================= MANAGE USERS ================= */
function fbInitAdminUsers() {
  fbRenderAdminShell('users');

  const tbody = document.getElementById('admin-users-body');
  const searchInput = document.getElementById('admin-user-search');

  function render() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const users = (getData(LS_KEYS.USERS) || []).filter(function (u) {
      if (!q) return true;
      return u.name.toLowerCase().indexOf(q) !== -1 || u.email.toLowerCase().indexOf(q) !== -1;
    });

    document.getElementById('admin-user-count').textContent = users.length + ' users';

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center muted">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(function (u) {
      const recipes = fbGetRecipes();
      const savedCount = (u.savedRecipes || []).length;
      const createdCount = recipes.filter(function (r) { return r.author === u.id; }).length;
      const collCount = (getData(LS_KEYS.COLLECTIONS) || []).filter(function (c) { return c.userId === u.id; }).length;
      return (
        '<tr>' +
          '<td><div class="mini-item" style="border:none; padding:0;">' +
            '<div class="mini-avatar">' + fbEscape((u.name || 'U').charAt(0).toUpperCase()) + '</div>' +
            '<div><div class="mi-name">' + fbEscape(u.name) + '</div></div>' +
          '</div></td>' +
          '<td>' + fbEscape(u.email) + '</td>' +
          '<td>' + fbFormatDate(u.createdAt) + '</td>' +
          '<td>' + savedCount + '</td>' +
          '<td>' + createdCount + (collCount ? ' <span class="muted small">(+' + collCount + ' coll.)</span>' : '') + '</td>' +
          '<td><div class="row-actions-cell">' +
            '<button class="icon-btn" data-view="' + u.id + '">Info</button>' +
            '<button class="icon-btn danger" data-delete="' + u.id + '">Delete</button>' +
          '</div></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        const uid = b.getAttribute('data-view');
        const u = (getData(LS_KEYS.USERS) || []).find(function (x) { return x.id === uid; });
        if (!u) return;
        const recipes = fbGetRecipes();
        const created = recipes.filter(function (r) { return r.author === uid; });
        const cols = (getData(LS_KEYS.COLLECTIONS) || []).filter(function (c) { return c.userId === uid; });
        fbAlertBox(
          'User Details',
          '<strong>' + fbEscape(u.name) + '</strong><br>' + fbEscape(u.email) +
          '<br><br>Account created: ' + fbFormatDate(u.createdAt) +
          '<br>Saved recipes: ' + (u.savedRecipes || []).length +
          '<br>Created recipes: ' + created.length +
          (created.length ? '<br><span class="small muted">' + created.map(function (r) { return fbEscape(r.name); }).join(', ') + '</span>' : '') +
          '<br>Collections: ' + cols.length +
          (cols.length ? '<br><span class="small muted">' + cols.map(function (c) { return fbEscape(c.name); }).join(', ') + '</span>' : '')
        );
      });
    });

    tbody.querySelectorAll('[data-delete]').forEach(function (b) {
      b.addEventListener('click', function () {
        const uid = b.getAttribute('data-delete');
        const u = (getData(LS_KEYS.USERS) || []).find(function (x) { return x.id === uid; });
        fbConfirm('Delete User', 'Delete "' + (u ? u.name : 'this user') + '"? Their recipes and reviews will remain but lose the author link.', function () {
          saveData(LS_KEYS.USERS, (getData(LS_KEYS.USERS) || []).filter(function (x) { return x.id !== uid; }));
          fbToast('User deleted', 'info');
          render();
        });
      });
    });
  }

  searchInput.addEventListener('input', render);
  render();
}

/* Simple alert-style modal (admin) */
function fbAlertBox(title, html) {
  let overlay = document.getElementById('fb-admin-alert');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fb-admin-alert';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-head"><h3>' + fbEscape(title) + '</h3><button class="modal-close" data-close>&times;</button></div>' +
      '<div>' + html + '</div>' +
      '<div class="modal-actions"><button class="btn btn-primary" data-close>Close</button></div>' +
    '</div>';
  overlay.classList.add('open');
  overlay.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { overlay.classList.remove('open'); });
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
}

/* ================= MANAGE CATEGORIES ================= */
function fbInitAdminCategories() {
  fbRenderAdminShell('categories');

  const grid = document.getElementById('admin-cats-grid');

  function render() {
    const cats = getData(LS_KEYS.CATEGORIES) || [];
    const recipes = fbGetRecipes();
    document.getElementById('admin-cat-count').textContent = cats.length + ' categories';

    grid.innerHTML = cats.map(function (c) {
      /* Cuisine-type categories count matching cuisines too, so they never look empty */
      const cuisineNames = ['Indian', 'Italian', 'Chinese', 'Mexican'];
      const count = recipes.filter(function (r) {
        return r.category === c.name ||
               (cuisineNames.indexOf(c.name) !== -1 && r.cuisine === c.name) ||
               (c.name === 'Vegetarian' && (r.dietaryPreference === 'Vegetarian' || r.dietaryPreference === 'Vegan'));
      }).length;
      return (
        '<div class="cat-admin-card">' +
          '<div class="c-icon">' + fbCatIcon(c.name) + '</div>' +
          '<h3>' + fbEscape(c.name) + '</h3>' +
          '<p>' + fbEscape(c.description || '') + '</p>' +
          '<div class="c-meta">' + count + ' recipe' + (count === 1 ? '' : 's') + ' · added ' + fbFormatDate(c.createdAt || fbGetToday()) + '</div>' +
          '<div class="c-actions">' +
            '<button class="icon-btn" data-edit="' + c.id + '">Edit</button>' +
            '<button class="icon-btn danger" data-delete="' + c.id + '">Delete</button>' +
          '</div>' +
        '</div>'
      );
    }).join('') +
    '<div class="cat-admin-card add-coll-card" id="admin-add-cat">＋<br>Add Category</div>';

    document.getElementById('admin-add-cat').addEventListener('click', openCatModal);

    grid.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () { openCatModal(b.getAttribute('data-edit')); });
    });
    grid.querySelectorAll('[data-delete]').forEach(function (b) {
      b.addEventListener('click', function () {
        const id = b.getAttribute('data-delete');
        const cats = getData(LS_KEYS.CATEGORIES) || [];
        const cat = cats.find(function (c) { return c.id === id; });
        fbConfirm('Delete Category', 'Delete category "' + (cat ? cat.name : '') + '"? Recipes keep their category value but it will no longer appear in chips.', function () {
          saveData(LS_KEYS.CATEGORIES, cats.filter(function (c) { return c.id !== id; }));
          fbToast('Category deleted', 'info');
          render();
        });
      });
    });
  }

  function openCatModal(editId) {
    const cats = getData(LS_KEYS.CATEGORIES) || [];
    const cat = editId ? cats.find(function (c) { return c.id === editId; }) : null;

    let overlay = document.getElementById('fb-cat-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'fb-cat-modal';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-head"><h3>' + (cat ? 'Edit Category' : 'Add Category') + '</h3><button class="modal-close" data-close>&times;</button></div>' +
        '<div class="form-group"><label>Category Name <span class="req">*</span></label>' +
        '<input type="text" id="cat-name" class="form-control" value="' + (cat ? fbEscape(cat.name) : '') + '" maxlength="30" placeholder="e.g. Seafood"></div>' +
        '<div class="form-group"><label>Description</label>' +
        '<input type="text" id="cat-desc" class="form-control" value="' + (cat ? fbEscape(cat.description || '') : '') + '" maxlength="80" placeholder="Short description (optional)"></div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-ghost" data-close>Cancel</button>' +
          '<button class="btn btn-primary" id="cat-save-btn">' + (cat ? 'Save Changes' : 'Add Category') + '</button>' +
        '</div>' +
      '</div>';
    overlay.classList.add('open');

    overlay.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { overlay.classList.remove('open'); });
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

    document.getElementById('cat-save-btn').addEventListener('click', function () {
      const name = document.getElementById('cat-name').value.trim();
      const desc = document.getElementById('cat-desc').value.trim();
      if (!name) { fbToast('Category name is required', 'error'); return; }

      const all = getData(LS_KEYS.CATEGORIES) || [];
      if (all.some(function (c) { return c.name.toLowerCase() === name.toLowerCase() && (!cat || c.id !== cat.id); })) {
        fbToast('A category with this name already exists', 'error');
        return;
      }

      if (cat) {
        const idx = all.findIndex(function (c) { return c.id === cat.id; });
        all[idx].name = name;
        all[idx].description = desc;
        saveData(LS_KEYS.CATEGORIES, all);
        fbToast('Category updated', 'success');
      } else {
        all.push({ id: fbGenerateId('cat'), name: name, description: desc, createdAt: fbGetToday() });
        saveData(LS_KEYS.CATEGORIES, all);
        fbToast('Category added', 'success');
      }
      overlay.classList.remove('open');
      render();
    });
  }

  render();
}

/* ================= MANAGE REVIEWS ================= */
function fbInitAdminReviews() {
  fbRenderAdminShell('reviews');

  const list = document.getElementById('admin-reviews-list');
  const filterSel = document.getElementById('admin-review-filter');

  function render() {
    const filter = filterSel.value;
    let reviews = getData(LS_KEYS.REVIEWS) || [];
    if (filter === '5') reviews = reviews.filter(function (rv) { return rv.rating === 5; });
    if (filter === 'low') reviews = reviews.filter(function (rv) { return rv.rating <= 2; });

    document.getElementById('admin-review-count').textContent = reviews.length + ' reviews';

    if (!reviews.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><h3>No reviews</h3><p>Nothing to moderate here.</p></div>';
      return;
    }

    list.innerHTML = reviews.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).map(function (rv) {
      const recipe = fbGetRecipeById(rv.recipeId);
      return (
        '<div class="review-admin-item">' +
          '<div class="review-admin-head">' +
            '<div class="mini-avatar">' + fbEscape((rv.userName || 'U').charAt(0).toUpperCase()) + '</div>' +
            '<div><div class="review-name">' + fbEscape(rv.userName || 'Anonymous') + '</div>' +
            '<div class="small muted">on <a href="../recipe-details.html?id=' + encodeURIComponent(rv.recipeId) + '"><strong>' + (recipe ? fbEscape(recipe.name) : '[deleted recipe]') + '</strong></a></div></div>' +
            '<span class="r-stars">' + '★★★★★'.slice(0, rv.rating) + '★★★★★'.slice(rv.rating) + '</span>' +
            '<span class="r-date">' + fbFormatDate(rv.date) + '</span>' +
          '</div>' +
          (rv.review ? '<p class="review-admin-text">' + fbEscape(rv.review) + '</p>' : '<p class="review-admin-text muted small">No written review.</p>') +
          '<div class="row-actions-cell"><button class="icon-btn danger" data-del="' + rv.id + '">Delete Review</button></div>' +
        '</div>'
      );
    }).join('');

    list.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        const id = b.getAttribute('data-del');
        fbConfirm('Delete Review', 'Remove this review permanently? The average rating will recalculate.', function () {
          saveData(LS_KEYS.REVIEWS, (getData(LS_KEYS.REVIEWS) || []).filter(function (rv) { return rv.id !== id; }));
          fbToast('Review deleted', 'info');
          render();
        });
      });
    });
  }

  filterSel.addEventListener('change', render);
  render();
}
