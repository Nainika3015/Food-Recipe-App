/* ============================================================
   CraveCart - collections.js
   My Saved Recipes page + Personal Collections (CRUD)
   Collection object: { id, name, userId, recipeIds: [], createdAt }
   ============================================================ */

function fbGetUserCollections(userId) {
  return (getData(LS_KEYS.COLLECTIONS) || []).filter(function (c) { return c.userId === userId; });
}

/* ---------------- My Saved Recipes page ---------------- */
function fbInitSavedPage() {
  const user = fbRequireUser();
  if (!user) return;

  const grid = document.getElementById('saved-grid');

  function render() {
    const freshUser = fbGetCurrentUser();
    const savedIds = freshUser.savedRecipes || [];
    const recipes = fbGetRecipes().filter(function (r) { return savedIds.indexOf(r.id) !== -1; });

    const countEl = document.getElementById('saved-count');
    if (countEl) countEl.textContent = recipes.length;

    if (!recipes.length) {
      grid.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">🔖</div>' +
          '<h3>No saved recipes yet</h3>' +
          '<p>Browse recipes and tap the heart to save them here.</p>' +
          '<a href="explore.html" class="btn btn-primary">Explore Recipes</a>' +
        '</div>';
      return;
    }
    grid.innerHTML = recipes.map(function (r) { return fbRecipeCard(r); }).join('');
    fbBindSaveButtons(grid);
    /* After unsaving on this page, re-render to remove the card */
    grid.querySelectorAll('.card-save').forEach(function (btn) {
      btn.addEventListener('click', function () { setTimeout(render, 350); });
    });
  }

  render();
}

/* ---------------- Collections page ---------------- */
function fbInitCollectionsPage() {
  const user = fbRequireUser();
  if (!user) return;

  const gridView = document.getElementById('collections-view');
  const detailView = document.getElementById('collection-detail');

  function collectionCard(col) {
    return (
      '<div class="collection-card">' +
        '<div class="col-icon">📁</div>' +
        '<h3>' + fbEscape(col.name) + '</h3>' +
        '<div class="col-count">' + (col.recipeIds || []).length + ' recipes</div>' +
        '<div class="col-actions">' +
          '<button class="btn btn-primary btn-sm" data-view="' + col.id + '">View</button>' +
          '<button class="btn btn-outline btn-sm" data-rename="' + col.id + '">Rename</button>' +
          '<button class="btn btn-danger btn-sm" data-delete="' + col.id + '">Delete</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderGrid() {
    gridView.style.display = 'block';
    detailView.style.display = 'none';
    const cols = fbGetUserCollections(user.id);
    const grid = document.getElementById('collections-grid');
    const cards = cols.map(collectionCard).join('') +
      '<div class="collection-card add-coll-card" id="new-collection-card">＋<br>Create New Collection</div>';
    grid.innerHTML = cards;

    document.getElementById('new-collection-card').addEventListener('click', openCreateModal);

    grid.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { renderDetail(b.getAttribute('data-view')); });
    });
    grid.querySelectorAll('[data-rename]').forEach(function (b) {
      b.addEventListener('click', function () { openRenameModal(b.getAttribute('data-rename')); });
    });
    grid.querySelectorAll('[data-delete]').forEach(function (b) {
      b.addEventListener('click', function () {
        const id = b.getAttribute('data-delete');
        fbConfirm('Delete Collection', 'This will delete the collection. Saved recipes themselves are not deleted. Continue?', function () {
          saveData(LS_KEYS.COLLECTIONS, (getData(LS_KEYS.COLLECTIONS) || []).filter(function (c) { return c.id !== id; }));
          fbToast('Collection deleted', 'info');
          renderGrid();
        });
      });
    });
  }

  function renderDetail(colId) {
    const col = (getData(LS_KEYS.COLLECTIONS) || []).find(function (c) { return c.id === colId; });
    if (!col) { renderGrid(); return; }

    gridView.style.display = 'none';
    detailView.style.display = 'block';
    document.getElementById('detail-title').textContent = col.name;
    document.getElementById('detail-count').textContent = (col.recipeIds || []).length + ' recipes';
    document.getElementById('detail-back').onclick = renderGrid;

    const recipes = fbGetRecipes().filter(function (r) { return (col.recipeIds || []).indexOf(r.id) !== -1; });
    const wrap = document.getElementById('collection-recipes');
    if (!recipes.length) {
      wrap.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">🍽️</div>' +
          '<h3>This collection is empty</h3>' +
          '<p>Open a recipe and use "Add to Collection" to fill it.</p>' +
          '<a href="explore.html" class="btn btn-primary">Explore Recipes</a>' +
        '</div>';
      return;
    }
    wrap.innerHTML = recipes.map(function (r) {
      const rating = fbGetRecipeRating(r.id);
      return (
        '<div class="recipe-row">' +
          '<img src="' + fbEscape(r.image) + '" alt="' + fbEscape(r.name) + '" onerror="this.src=\'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80\'">' +
          '<div>' +
            '<div class="row-title"><a href="recipe-details.html?id=' + encodeURIComponent(r.id) + '">' + fbEscape(r.name) + '</a></div>' +
            '<div class="row-sub">' + fbEscape(r.cuisine) + ' • ' + fbEscape(r.category) + ' • ' + (rating.count ? '★ ' + rating.avg.toFixed(1) : 'No ratings') + '</div>' +
          '</div>' +
          '<div class="row-actions">' +
            '<a class="btn btn-ghost btn-sm" href="recipe-details.html?id=' + encodeURIComponent(r.id) + '">View</a>' +
            '<button class="btn btn-danger btn-sm" data-remove="' + r.id + '">Remove</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    wrap.querySelectorAll('[data-remove]').forEach(function (b) {
      b.addEventListener('click', function () {
        const rid = b.getAttribute('data-remove');
        const all = getData(LS_KEYS.COLLECTIONS) || [];
        const idx = all.findIndex(function (c) { return c.id === colId; });
        if (idx !== -1) {
          all[idx].recipeIds = (all[idx].recipeIds || []).filter(function (x) { return x !== rid; });
          saveData(LS_KEYS.COLLECTIONS, all);
          fbToast('Recipe removed from collection', 'info');
          renderDetail(colId);
        }
      });
    });
  }

  /* -------- Modals -------- */
  function openCreateModal() {
    let overlay = document.getElementById('fb-coll-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'fb-coll-modal';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-head"><h3>Create New Collection</h3><button class="modal-close" data-close>&times;</button></div>' +
        '<div class="form-group"><label>Collection Name <span class="req">*</span></label>' +
        '<input type="text" id="new-coll-name" class="form-control" placeholder="e.g. Weekend Recipes" maxlength="40"></div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-ghost" data-close>Cancel</button>' +
          '<button class="btn btn-primary" id="create-coll-btn">Create</button>' +
        '</div>' +
      '</div>';
    overlay.classList.add('open');
    overlay.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { overlay.classList.remove('open'); });
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

    document.getElementById('create-coll-btn').addEventListener('click', function () {
      const name = document.getElementById('new-coll-name').value.trim();
      if (!name) { fbToast('Please enter a collection name', 'error'); return; }
      const all = getData(LS_KEYS.COLLECTIONS) || [];
      all.push({ id: fbGenerateId('coll'), name: name, userId: user.id, recipeIds: [], createdAt: fbGetToday() });
      saveData(LS_KEYS.COLLECTIONS, all);
      overlay.classList.remove('open');
      fbToast('Collection "' + name + '" created', 'success');
      renderGrid();
    });
  }

  function openRenameModal(colId) {
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    const col = all.find(function (c) { return c.id === colId; });
    if (!col) return;
    let overlay = document.getElementById('fb-coll-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'fb-coll-modal';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-head"><h3>Rename Collection</h3><button class="modal-close" data-close>&times;</button></div>' +
        '<div class="form-group"><label>Collection Name <span class="req">*</span></label>' +
        '<input type="text" id="rename-coll-name" class="form-control" value="' + fbEscape(col.name) + '" maxlength="40"></div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-ghost" data-close>Cancel</button>' +
          '<button class="btn btn-primary" id="rename-coll-btn">Save Changes</button>' +
        '</div>' +
      '</div>';
    overlay.classList.add('open');
    overlay.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { overlay.classList.remove('open'); });
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

    document.getElementById('rename-coll-btn').addEventListener('click', function () {
      const name = document.getElementById('rename-coll-name').value.trim();
      if (!name) { fbToast('Please enter a collection name', 'error'); return; }
      const idx = all.findIndex(function (c) { return c.id === colId; });
      all[idx].name = name;
      saveData(LS_KEYS.COLLECTIONS, all);
      overlay.classList.remove('open');
      fbToast('Collection renamed', 'success');
      renderGrid();
    });
  }

  renderGrid();
}
