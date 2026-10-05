/* ============================================================
   CraveCart - recipes.js
   Recipe cards, save/unsave, explore page logic, home page
   renderers, create/edit recipe and my recipes
   ============================================================ */

/* ---------------- Category icons ---------------- */
function fbCatIcon(name) {
  const map = {
    'Indian': '🍛', 'Italian': '🍝', 'Chinese': '🥡', 'Mexican': '🌮',
    'Desserts': '🍰', 'Breakfast': '🍳', 'Healthy': '🥗', 'Vegetarian': '🥦',
    'Snacks': '🍿', 'Dinner': '🍽️', 'Lunch': '🍱', 'Drinks': '🥤'
  };
  return map[name] || '🍴';
}

/* ---------------- Recipe card HTML ---------------- */
function fbRecipeCard(recipe, options) {
  options = options || {};
  const user = fbGetCurrentUser();
  const isSaved = user && (user.savedRecipes || []).indexOf(recipe.id) !== -1;
  const rating = fbGetRecipeRating(recipe.id);
  const stars = '★★★★★'.slice(0, Math.round(rating.avg)) || '☆';
  const idAttr = 'save-btn-' + recipe.id;

  return (
    '<article class="recipe-card">' +
      '<div class="card-img-wrap">' +
        '<a href="recipe-details.html?id=' + encodeURIComponent(recipe.id) + '"><img src="' + fbEscape(recipe.image) + '" alt="' + fbEscape(recipe.name) + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80\'"></a>' +
        '<div class="card-badges">' +
          '<span class="badge badge-cuisine">' + fbEscape(recipe.cuisine) + '</span>' +
          '<span class="badge badge-time">⏱ ' + fbEscape(String(recipe.cookTime)) + ' min</span>' +
        '</div>' +
        '<button class="card-save' + (isSaved ? ' saved' : '') + '" id="' + idAttr + '" title="' + (isSaved ? 'Remove from saved' : 'Save recipe') + '">' + (isSaved ? '♥' : '♡') + '</button>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title"><a href="recipe-details.html?id=' + encodeURIComponent(recipe.id) + '">' + fbEscape(recipe.name) + '</a></h3>' +
        '<p class="card-desc">' + fbEscape(recipe.description) + '</p>' +
        '<div class="card-meta">' +
          '<span class="badge">' + fbEscape(recipe.category) + '</span>' +
          '<span class="badge badge-diet">' + fbEscape(recipe.dietaryPreference) + '</span>' +
          '<span class="badge badge-diff">' + fbEscape(recipe.difficulty) + '</span>' +
        '</div>' +
        '<div class="card-foot">' +
          '<span class="rating-line"><span class="stars">' + (rating.avg > 0 ? stars : '☆') + '</span> ' + (rating.avg > 0 ? rating.avg.toFixed(1) : 'New') + ' <span class="count">(' + rating.count + ')</span></span>' +
          '<a href="recipe-details.html?id=' + encodeURIComponent(recipe.id) + '" class="btn btn-primary btn-sm">View Recipe</a>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

/* Bind save buttons rendered by fbRecipeCard inside a container */
function fbBindSaveButtons(container) {
  container.querySelectorAll('.card-save').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const recipeId = btn.id.replace('save-btn-', '');
      fbToggleSave(recipeId, btn);
    });
  });
}

/* ---------------- Save / unsave ---------------- */
function fbToggleSave(recipeId, btnEl) {
  const user = fbGetCurrentUser();
  if (!user) {
    fbToast('Please login to save recipes', 'error');
    setTimeout(function () { window.location.href = 'login.html'; }, 900);
    return false;
  }
  const saved = user.savedRecipes || [];
  const idx = saved.indexOf(recipeId);
  if (idx === -1) {
    saved.push(recipeId);
    fbUpdateCurrentUser({ savedRecipes: saved });
    fbToast('Recipe saved to your collection', 'success');
  } else {
    saved.splice(idx, 1);
    fbUpdateCurrentUser({ savedRecipes: saved });
    fbToast('Recipe removed from saved', 'info');
  }
  if (btnEl) {
    const isSaved = idx === -1;
    btnEl.classList.toggle('saved', isSaved);
    btnEl.textContent = isSaved ? '♥' : '♡';
  }
  return idx === -1;
}

function fbIsSaved(recipeId) {
  const user = fbGetCurrentUser();
  return !!(user && (user.savedRecipes || []).indexOf(recipeId) !== -1);
}

/* ---------------- Explore page ---------------- */
function fbInitExplorePage() {
  const user = fbRequireUser();
  if (!user) return;

  const grid = document.getElementById('explore-grid');
  const searchInput = document.getElementById('explore-search');
  const cuisineSel = document.getElementById('filter-cuisine');
  const dietSel = document.getElementById('filter-diet');
  const diffSel = document.getElementById('filter-difficulty');
  const sortSel = document.getElementById('filter-sort');
  const maxTimeInput = document.getElementById('filter-maxtime');
  const resetBtn = document.getElementById('filter-reset');
  const countEl = document.getElementById('result-count');
  const activeWrap = document.getElementById('active-filters');
  const catsWrap = document.getElementById('explore-cats');

  /* Pre-fill search from ?q= (hero search lands here) */
  const urlQ = new URLSearchParams(window.location.search).get('q');
  if (urlQ) searchInput.value = urlQ;

  /* Category quick chips */
  const categories = getData(LS_KEYS.CATEGORIES) || [];
  if (catsWrap) {
    catsWrap.innerHTML = categories.map(function (c) {
      return '<button class="badge badge-chip" data-cat="' + fbEscape(c.name) + '">' + fbCatIcon(c.name) + ' ' + fbEscape(c.name) + '</button>';
    }).join('');
    catsWrap.querySelectorAll('[data-cat]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.classList.toggle('active');
        renderExplore();
      });
    });
  }

  function readFilters() {
    const selectedCats = [];
    if (catsWrap) {
      catsWrap.querySelectorAll('[data-cat].active').forEach(function (chip) {
        selectedCats.push(chip.getAttribute('data-cat'));
      });
    }
    return {
      q: (searchInput.value || '').trim().toLowerCase(),
      cuisine: cuisineSel.value,
      diet: dietSel.value,
      difficulty: diffSel.value,
      sort: sortSel.value,
      maxTime: parseInt(maxTimeInput.value, 10) || 0,
      cats: selectedCats
    };
  }

  function renderExplore() {
    const f = readFilters();
    let list = fbGetRecipes();

    if (f.q) {
      list = list.filter(function (r) {
        const inName = r.name.toLowerCase().indexOf(f.q) !== -1;
        const inDesc = r.description.toLowerCase().indexOf(f.q) !== -1;
        const inCuisine = r.cuisine.toLowerCase().indexOf(f.q) !== -1;
        const inCat = r.category.toLowerCase().indexOf(f.q) !== -1;
        const inDiet = r.dietaryPreference.toLowerCase().indexOf(f.q) !== -1;
        const inTags = (r.tags || []).some(function (t) { return t.toLowerCase().indexOf(f.q) !== -1; });
        const inIngr = (r.ingredients || []).some(function (i) {
          return i.name.toLowerCase().indexOf(f.q) !== -1;
        });
        return inName || inDesc || inCuisine || inCat || inDiet || inTags || inIngr;
      });
    }
    if (f.cuisine) list = list.filter(function (r) { return r.cuisine === f.cuisine; });
    if (f.diet) list = list.filter(function (r) { return r.dietaryPreference === f.diet; });
    if (f.difficulty) list = list.filter(function (r) { return r.difficulty === f.difficulty; });
    if (f.maxTime) list = list.filter(function (r) { return (Number(r.prepTime) + Number(r.cookTime)) <= f.maxTime; });
    if (f.cats.length) list = list.filter(function (r) { return f.cats.indexOf(r.category) !== -1; });

    if (f.sort === 'rating') {
      list.sort(function (a, b) { return fbGetRecipeRating(b.id).avg - fbGetRecipeRating(a.id).avg; });
    } else if (f.sort === 'popular') {
      list.sort(function (a, b) { return fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count; });
    } else if (f.sort === 'newest') {
      list.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    } else if (f.sort === 'time') {
      list.sort(function (a, b) {
        return (Number(a.prepTime) + Number(a.cookTime)) - (Number(b.prepTime) + Number(b.cookTime));
      });
    }

    countEl.textContent = list.length + ' recipe' + (list.length === 1 ? '' : 's') + ' found';

    /* Active filter chips */
    const chips = [];
    if (f.q) chips.push('Search: "' + f.q + '"');
    if (f.cuisine) chips.push('Cuisine: ' + f.cuisine);
    if (f.diet) chips.push('Diet: ' + f.diet);
    if (f.difficulty) chips.push('Difficulty: ' + f.difficulty);
    if (f.maxTime) chips.push('Max time: ' + f.maxTime + ' min');
    if (f.cats.length) chips.push('Categories: ' + f.cats.join(', '));
    activeWrap.innerHTML = chips.map(function (c) { return '<span class="badge badge-danger">' + fbEscape(c) + ' ✕</span>'; }).join('');

    if (!list.length) {
      grid.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">🔍</div>' +
          '<h3>No recipes found</h3>' +
          '<p>Try different keywords or reset the filters.</p>' +
          '<button class="btn btn-outline" onclick="fbResetExploreFilters()">Reset Filters</button>' +
        '</div>';
      return;
    }

    grid.innerHTML = list.map(function (r) { return fbRecipeCard(r); }).join('');
    fbBindSaveButtons(grid);
  }

  window.fbResetExploreFilters = function () {
    searchInput.value = '';
    cuisineSel.value = '';
    dietSel.value = '';
    diffSel.value = '';
    sortSel.value = 'rating';
    maxTimeInput.value = '';
    if (catsWrap) catsWrap.querySelectorAll('[data-cat].active').forEach(function (c) { c.classList.remove('active'); });
    renderExplore();
  };
  resetBtn.addEventListener('click', window.fbResetExploreFilters);

  let debounceTimer = null;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderExplore, 250);
  });
  [cuisineSel, dietSel, diffSel, sortSel, maxTimeInput].forEach(function (el) {
    el.addEventListener('change', renderExplore);
  });

  renderExplore();
}

/* ---------------- Home page renderers ---------------- */
function fbInitHomePage() {
  const recipes = fbGetRecipes();
  const categories = getData(LS_KEYS.CATEGORIES) || [];

  function renderInto(id, list) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    if (!list.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><h3>Nothing here yet</h3><p>Check back soon!</p></div>';
      return;
    }
    wrap.innerHTML = list.map(function (r) { return fbRecipeCard(r); }).join('');
    fbBindSaveButtons(wrap);
  }

  /* Popular: most reviewed, then newest (real popularity signal) */
  const popular = recipes.slice().sort(function (a, b) {
    const rc = fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count;
    return rc !== 0 ? rc : (new Date(b.createdAt) - new Date(a.createdAt));
  }).slice(0, 4);
  renderInto('popular-grid', popular);

  /* Trending: most rated */
  const trending = recipes.slice().sort(function (a, b) {
    return fbGetRecipeRating(b.id).count - fbGetRecipeRating(a.id).count;
  }).slice(0, 4);
  renderInto('trending-grid', trending);

  /* Top rated */
  const topRated = recipes.slice().sort(function (a, b) {
    return fbGetRecipeRating(b.id).avg - fbGetRecipeRating(a.id).avg;
  }).slice(0, 4);
  renderInto('toprated-grid', topRated);

  /* Categories */
  const catsWrap = document.getElementById('categories-grid');
  if (catsWrap) {
    catsWrap.innerHTML = categories.map(function (c) {
      /* Cuisine-type categories count by cuisine too, so they never look empty */
      const cuisineNames = ['Indian', 'Italian', 'Chinese', 'Mexican'];
      const count = recipes.filter(function (r) {
        return r.category === c.name ||
               (cuisineNames.indexOf(c.name) !== -1 && r.cuisine === c.name) ||
               (c.name === 'Vegetarian' && (r.dietaryPreference === 'Vegetarian' || r.dietaryPreference === 'Vegan'));
      }).length;
      return (
        '<a class="cat-card" href="explore.html">' +
          '<div class="cat-icon">' + fbCatIcon(c.name) + '</div>' +
          '<div class="cat-name">' + fbEscape(c.name) + '</div>' +
          '<div class="cat-count">' + count + ' recipes</div>' +
        '</a>'
      );
    }).join('');
  }

  /* Hero search -> explore with query */
  const heroSearch = document.getElementById('hero-search');
  const heroForm = document.getElementById('hero-search-form');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = encodeURIComponent(heroSearch.value.trim());
      window.location.href = 'explore.html' + (q ? '?q=' + q : '');
    });
  }

  /* Stats — all computed live from Local Storage */
  const users = getData(LS_KEYS.USERS) || [];
  const chefsCount = users.filter(function (u) { return (fbGetRecipes().filter(function (r) { return r.author === u.id; })).length > 0; }).length;
  const statRecipes = document.getElementById('stat-recipes');
  const statUsers = document.getElementById('stat-users');
  const statCats = document.getElementById('stat-cats');
  if (statRecipes) statRecipes.textContent = recipes.length + '+';
  if (statUsers) statUsers.textContent = chefsCount + '+';
  if (statCats) statCats.textContent = categories.length + '+';

}

/* ---------------- Create / Edit recipe ---------------- */
function fbInitCreateRecipePage() {
  const user = fbRequireUser();
  if (!user) return;

  const editingId = new URLSearchParams(window.location.search).get('edit');
  const form = document.getElementById('create-recipe-form');
  const ingList = document.getElementById('ing-list');
  const stepList = document.getElementById('step-list');
  const heading = document.getElementById('page-title');
  const submitBtn = document.getElementById('submit-btn');

  /* Populate category select from Local Storage */
  const catSel = document.getElementById('cr-category');
  const categories = getData(LS_KEYS.CATEGORIES) || [];
  catSel.innerHTML = '<option value="">Select category</option>' + categories.map(function (c) {
    return '<option value="' + fbEscape(c.name) + '">' + fbEscape(c.name) + '</option>';
  }).join('');

  function addIngredientRow(data) {
    data = data || {};
    const row = document.createElement('div');
    row.className = 'dyn-row';
    row.innerHTML =
      '<input type="text" class="ing-name" placeholder="Ingredient name" value="' + fbEscape(data.name || '') + '">' +
      '<input type="text" class="ing-qty" placeholder="Qty" value="' + fbEscape(data.quantity || '') + '">' +
      '<input type="text" class="ing-unit" placeholder="Unit" value="' + fbEscape(data.unit || '') + '">' +
      '<button type="button" class="dyn-remove" title="Remove">×</button>';
    row.querySelector('.dyn-remove').addEventListener('click', function () { row.remove(); });
    ingList.appendChild(row);
  }

  function addStepRow(data) {
    data = data || {};
    const row = document.createElement('div');
    row.className = 'dyn-row single';
    row.innerHTML =
      '<span class="step-num-badge"></span>' +
      '<input type="text" class="step-text" placeholder="Describe this step..." value="' + fbEscape(data || '') + '">' +
      '<button type="button" class="dyn-remove" title="Remove">×</button>';
    row.querySelector('.dyn-remove').addEventListener('click', function () { row.remove(); });
    stepList.appendChild(row);
    renumberSteps();
  }

  function renumberSteps() {
    stepList.querySelectorAll('.step-num-badge').forEach(function (b, i) { b.textContent = (i + 1) + '.'; });
  }

  document.getElementById('add-ing').addEventListener('click', function () { addIngredientRow(); });
  document.getElementById('add-step').addEventListener('click', function () { addStepRow(); });

  /* Edit mode: preload values */
  if (editingId) {
    const recipe = fbGetRecipeById(editingId);
    if (!recipe || recipe.author !== user.id) {
      fbToast('Recipe not found or not yours to edit', 'error');
      setTimeout(function () { window.location.href = 'my-recipes.html'; }, 1000);
      return;
    }
    heading.textContent = 'Edit Recipe';
    submitBtn.textContent = 'Update Recipe';
    document.getElementById('cr-name').value = recipe.name;
    document.getElementById('cr-desc').value = recipe.description;
    document.getElementById('cr-image').value = recipe.image;
    document.getElementById('cr-cuisine').value = recipe.cuisine;
    document.getElementById('cr-category').value = recipe.category;
    document.getElementById('cr-diet').value = recipe.dietaryPreference;
    document.getElementById('cr-prep').value = recipe.prepTime;
    document.getElementById('cr-cook').value = recipe.cookTime;
    document.getElementById('cr-servings').value = recipe.servings;
    document.getElementById('cr-difficulty').value = recipe.difficulty;
    document.getElementById('cr-tags').value = (recipe.tags || []).join(', ');
    (recipe.ingredients || []).forEach(function (i) { addIngredientRow(i); });
    (recipe.instructions || []).forEach(function (s) { addStepRow(s); });
  } else {
    addIngredientRow();
    addIngredientRow();
    addIngredientRow();
    addStepRow();
    addStepRow();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('cr-name').value.trim();
    const desc = document.getElementById('cr-desc').value.trim();
    const image = document.getElementById('cr-image').value.trim();
    const cuisine = document.getElementById('cr-cuisine').value;
    const category = document.getElementById('cr-category').value;
    const diet = document.getElementById('cr-diet').value;
    const prepTime = parseInt(document.getElementById('cr-prep').value, 10);
    const cookTime = parseInt(document.getElementById('cr-cook').value, 10);
    const servings = parseInt(document.getElementById('cr-servings').value, 10);
    const difficulty = document.getElementById('cr-difficulty').value;
    const tags = document.getElementById('cr-tags').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean);

    const ingredients = [];
    ingList.querySelectorAll('.dyn-row').forEach(function (row) {
      const n = row.querySelector('.ing-name').value.trim();
      if (!n) return;
      ingredients.push({
        name: n,
        quantity: row.querySelector('.ing-qty').value.trim(),
        unit: row.querySelector('.ing-unit').value.trim()
      });
    });

    const instructions = [];
    stepList.querySelectorAll('.step-text').forEach(function (inp) {
      const v = inp.value.trim();
      if (v) instructions.push(v);
    });

    /* Validation */
    let valid = true;
    if (!name) { fbToast('Recipe name is required', 'error'); valid = false; }
    else if (desc.length < 10) { fbToast('Description must be at least 10 characters', 'error'); valid = false; }
    else if (!image) { fbToast('Image URL is required', 'error'); valid = false; }
    else if (!cuisine) { fbToast('Please select a cuisine', 'error'); valid = false; }
    else if (!category) { fbToast('Please select a category', 'error'); valid = false; }
    else if (!diet) { fbToast('Please select a dietary preference', 'error'); valid = false; }
    else if (isNaN(prepTime) || prepTime < 0) { fbToast('Preparation time must be a number', 'error'); valid = false; }
    else if (isNaN(cookTime) || cookTime < 0) { fbToast('Cooking time must be a number', 'error'); valid = false; }
    else if (isNaN(servings) || servings < 1) { fbToast('Servings must be at least 1', 'error'); valid = false; }
    else if (ingredients.length < 2) { fbToast('Add at least 2 ingredients', 'error'); valid = false; }
    else if (instructions.length < 2) { fbToast('Add at least 2 instruction steps', 'error'); valid = false; }
    if (!valid) return;

    const recipes = fbGetRecipes();

    if (editingId) {
      const idx = recipes.findIndex(function (r) { return r.id === editingId; });
      if (idx === -1) { fbToast('Recipe not found', 'error'); return; }
      recipes[idx] = Object.assign({}, recipes[idx], {
        name: name, description: desc, image: image, cuisine: cuisine, category: category,
        dietaryPreference: diet, prepTime: prepTime, cookTime: cookTime, servings: servings,
        difficulty: difficulty, tags: tags, ingredients: ingredients, instructions: instructions,
        updatedAt: fbGetToday()
      });
      saveData(LS_KEYS.RECIPES, recipes);
      fbToast('Recipe updated successfully!', 'success');
      setTimeout(function () { window.location.href = 'my-recipes.html'; }, 900);
    } else {
      const newRecipe = {
        id: fbGenerateId('recipe'),
        name: name, description: desc, image: image, cuisine: cuisine, category: category,
        dietaryPreference: diet, prepTime: prepTime, cookTime: cookTime, servings: servings,
        difficulty: difficulty, tags: tags, ingredients: ingredients, instructions: instructions,
        author: user.id, authorName: user.name, createdAt: fbGetToday(), updatedAt: null, isSample: false
      };
      recipes.push(newRecipe);
      saveData(LS_KEYS.RECIPES, recipes);

      const users = getData(LS_KEYS.USERS) || [];
      const uIdx = users.findIndex(function (u) { return u.id === user.id; });
      if (uIdx !== -1) {
        users[uIdx].createdRecipes = users[uIdx].createdRecipes || [];
        users[uIdx].createdRecipes.push(newRecipe.id);
        saveData(LS_KEYS.USERS, users);
      }
      fbToast('Recipe created successfully!', 'success');
      setTimeout(function () { window.location.href = 'my-recipes.html'; }, 900);
    }
  });
}

/* ---------------- My Recipes page ---------------- */
function fbInitMyRecipesPage() {
  const user = fbRequireUser();
  if (!user) return;

  const list = document.getElementById('my-recipes-list');

  function render() {
    const recipes = fbGetRecipes().filter(function (r) { return r.author === user.id; });
    if (!recipes.length) {
      list.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">📝</div>' +
          '<h3>No recipes yet</h3>' +
          '<p>Share your first recipe with the CraveCart community.</p>' +
          '<a href="create-recipe.html" class="btn btn-primary">+ Create Your First Recipe</a>' +
        '</div>';
      return;
    }
    list.innerHTML = recipes.map(function (r) {
      const rating = fbGetRecipeRating(r.id);
      return (
        '<div class="recipe-row">' +
          '<img src="' + fbEscape(r.image) + '" alt="' + fbEscape(r.name) + '" onerror="this.src=\'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80\'">' +
          '<div>' +
            '<div class="row-title">' + fbEscape(r.name) + '</div>' +
            '<div class="row-sub">' + fbEscape(r.cuisine) + ' • ' + fbEscape(r.category) + ' • ' + fbEscape(String(r.cookTime)) + ' min • ' + (rating.count ? '★ ' + rating.avg.toFixed(1) + ' (' + rating.count + ')' : 'No ratings yet') + '</div>' +
          '</div>' +
          '<div class="row-actions">' +
            '<a class="btn btn-ghost btn-sm" href="recipe-details.html?id=' + encodeURIComponent(r.id) + '">View</a>' +
            '<a class="btn btn-outline btn-sm" href="create-recipe.html?edit=' + encodeURIComponent(r.id) + '">Edit</a>' +
            '<button class="btn btn-danger btn-sm" data-del="' + fbEscape(r.id) + '">Delete</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    list.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-del');
        fbConfirm('Delete Recipe', 'Are you sure you want to permanently delete this recipe?', function () {
          let all = fbGetRecipes();
          all = all.filter(function (r) { return r.id !== id; });
          saveData(LS_KEYS.RECIPES, all);

          /* Remove recipe id from every user's saved & created lists */
          const users = getData(LS_KEYS.USERS) || [];
          users.forEach(function (u) {
            u.savedRecipes = (u.savedRecipes || []).filter(function (rid) { return rid !== id; });
            u.createdRecipes = (u.createdRecipes || []).filter(function (rid) { return rid !== id; });
          });
          saveData(LS_KEYS.USERS, users);

          /* Remove its reviews */
          saveData(LS_KEYS.REVIEWS, (getData(LS_KEYS.REVIEWS) || []).filter(function (rv) { return rv.recipeId !== id; }));

          /* Remove from all collections */
          const cols = getData(LS_KEYS.COLLECTIONS) || [];
          cols.forEach(function (c) { c.recipeIds = (c.recipeIds || []).filter(function (rid) { return rid !== id; }); });
          saveData(LS_KEYS.COLLECTIONS, cols);

          fbToast('Recipe deleted', 'info');
          render();
        });
      });
    });
  }

  render();
}
