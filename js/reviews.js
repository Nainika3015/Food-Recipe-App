/* ============================================================
   CraveCart - reviews.js
   Recipe details page: full info, actions (save / collection /
   share), star ratings and reviews with 1-rating-per-user rule
   ============================================================ */

let fbSelectedRating = 0;

function fbInitRecipeDetailsPage() {
  const user = fbRequireUser();
  if (!user) return;

  const recipeId = new URLSearchParams(window.location.search).get('id');
  const recipe = fbGetRecipeById(recipeId);
  const wrap = document.getElementById('recipe-detail-root');

  if (!recipe) {
    wrap.innerHTML =
      '<div class="container section-pad"><div class="empty-state">' +
        '<div class="empty-icon">🥄</div>' +
        '<h3>Recipe not found</h3>' +
        '<p>This recipe may have been deleted.</p>' +
        '<a href="explore.html" class="btn btn-primary">Back to Explore</a>' +
      '</div></div>';
    return;
  }

  const total = Number(recipe.prepTime) + Number(recipe.cookTime);
  const rating = fbGetRecipeRating(recipe.id);
  const isSaved = fbIsSaved(recipe.id);

  const starsFor = function (n) { return '★★★★★'.slice(0, n) + '★★★★★'.slice(n); };

  wrap.innerHTML =
    '<section class="detail-hero">' +
      '<div class="container">' +
        '<div class="breadcrumb"><a href="explore.html">Explore</a> › ' + fbEscape(recipe.category) + ' › ' + fbEscape(recipe.name) + '</div>' +
        '<div class="detail-layout">' +
          '<div>' +
            '<img class="detail-img" src="' + fbEscape(recipe.image) + '" alt="' + fbEscape(recipe.name) + '" onerror="this.src=\'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80\'">' +
          '</div>' +
          '<div class="detail-info">' +
            '<div class="detail-badges">' +
              '<span class="badge badge-cuisine">' + fbEscape(recipe.cuisine) + '</span>' +
              '<span class="badge">' + fbEscape(recipe.category) + '</span>' +
              '<span class="badge badge-diet">' + fbEscape(recipe.dietaryPreference) + '</span>' +
              '<span class="badge badge-diff">' + fbEscape(recipe.difficulty) + '</span>' +
            '</div>' +
            '<h1>' + fbEscape(recipe.name) + '</h1>' +
            '<p class="by-line">By <strong>' + fbEscape(recipe.authorName || 'Unknown Chef') + '</strong> · Added ' + fbFormatDate(recipe.createdAt) + '</p>' +
            '<p class="detail-desc">' + fbEscape(recipe.description) + '</p>' +
            '<div class="detail-meta-grid">' +
              '<div class="meta-box"><div class="m-val">' + fbEscape(String(recipe.prepTime)) + ' min</div><div class="m-lbl">Prep Time</div></div>' +
              '<div class="meta-box"><div class="m-val">' + fbEscape(String(recipe.cookTime)) + ' min</div><div class="m-lbl">Cook Time</div></div>' +
              '<div class="meta-box"><div class="m-val">' + total + ' min</div><div class="m-lbl">Total Time</div></div>' +
              '<div class="meta-box"><div class="m-val">' + fbEscape(String(recipe.servings)) + '</div><div class="m-lbl">Servings</div></div>' +
              '<div class="meta-box"><div class="m-val">' + fbEscape(recipe.difficulty) + '</div><div class="m-lbl">Difficulty</div></div>' +
              '<div class="meta-box"><div class="m-val">' + (rating.avg > 0 ? rating.avg.toFixed(1) : '—') + '</div><div class="m-lbl">Avg Rating (' + rating.count + ')</div></div>' +
            '</div>' +
            '<div class="detail-actions">' +
              '<button class="btn btn-primary" id="detail-save-btn">' + (isSaved ? '♥ Remove from Saved' : '♡ Save Recipe') + '</button>' +
              '<button class="btn btn-outline" id="detail-coll-btn">📁 Add to Collection</button>' +
              '<button class="btn btn-ghost" id="detail-rate-btn">⭐ Rate Recipe</button>' +
              '<button class="btn btn-ghost" id="detail-share-btn">🔗 Share Recipe</button>' +
            '</div>' +
            ((recipe.tags || []).length ?
              '<div class="tag-row mt-2">' + recipe.tags.map(function (t) { return '<span class="tag-chip">#' + fbEscape(t) + '</span>'; }).join('') + '</div>'
              : '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div class="container">' +
      '<section class="detail-section">' +
        '<h2>🥘 Ingredients</h2>' +
        '<div class="detail-cols">' +
          '<div>' +
            '<div class="ing-list">' +
              (recipe.ingredients || []).map(function (i) {
                return '<div class="ing-item"><span>' + fbEscape(i.name) + '</span><span class="qty">' + fbEscape(i.quantity) + (i.unit ? ' ' + fbEscape(i.unit) : '') + '</span></div>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h2 style="font-size:1.3rem; margin-bottom:16px;">👨‍🍳 Instructions</h2>' +
            '<div class="step-list">' +
              (recipe.instructions || []).map(function (s) { return '<div class="step-item">' + fbEscape(s) + '</div>'; }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="detail-section" id="reviews">' +
        '<h2>⭐ Ratings &amp; Reviews</h2>' +
        '<div class="rating-summary">' +
          '<div class="rating-big">' +
            '<div class="big-num">' + (rating.avg > 0 ? rating.avg.toFixed(1) : '—') + '</div>' +
            '<div class="stars">' + (rating.avg > 0 ? starsFor(Math.round(rating.avg)) : '☆☆☆☆☆') + '</div>' +
            '<div class="count-lbl">' + rating.count + ' rating' + (rating.count === 1 ? '' : 's') + '</div>' +
          '</div>' +
          '<div>' +
            '<h3 style="margin-bottom:4px;">Rate this recipe</h3>' +
            '<p class="small muted">' + (alreadyReviewed() ? 'You rated this recipe ★' + myRating() + '. One rating per user.' : 'Click a star, add an optional comment and submit.') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="review-form">' +
          '<div class="star-input" id="star-input">' +
            [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-star="' + n + '">★</button>'; }).join('') +
          '</div>' +
          '<div class="form-group"><textarea id="review-text" class="form-control" placeholder="Share your cooking experience (optional)..." maxlength="400"></textarea></div>' +
          '<button class="btn btn-primary" id="submit-review-btn">Submit Review</button>' +
        '</div>' +
        '<div id="reviews-list"></div>' +
      '</section>' +
    '</div>';

  /* -------- Save / remove -------- */
  document.getElementById('detail-save-btn').addEventListener('click', function () {
    const becameSaved = fbToggleSave(recipe.id, null);
    this.textContent = becameSaved ? '♥ Remove from Saved' : '♡ Save Recipe';
  });

  /* -------- Add to collection modal -------- */
  document.getElementById('detail-coll-btn').addEventListener('click', function () {
    openAddToCollectionModal(recipe);
  });

  /* -------- Rate recipe scroll -------- */
  document.getElementById('detail-rate-btn').addEventListener('click', function () {
    document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
  });

  /* -------- Share modal -------- */
  document.getElementById('detail-share-btn').addEventListener('click', function () {
    openShareModal(recipe);
  });

  /* -------- Star input -------- */
  const starInput = document.getElementById('star-input');
  starInput.querySelectorAll('[data-star]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      fbSelectedRating = parseInt(btn.getAttribute('data-star'), 10);
      paintStars();
    });
  });
  function paintStars() {
    starInput.querySelectorAll('[data-star]').forEach(function (b, i) {
      b.classList.toggle('active', i < fbSelectedRating);
    });
  }

  /* -------- Submit review -------- */
  document.getElementById('submit-review-btn').addEventListener('click', function () {
    const text = document.getElementById('review-text').value.trim();

    if (fbSelectedRating === 0) {
      fbToast('Please select a star rating first', 'error');
      return;
    }
    if (alreadyReviewed()) {
      fbToast('You have already rated this recipe', 'error');
      return;
    }

    const reviews = getData(LS_KEYS.REVIEWS) || [];
    reviews.push({
      id: fbGenerateId('review'),
      recipeId: recipe.id,
      userId: user.id,
      userName: user.name,
      rating: fbSelectedRating,
      review: text,
      date: fbGetToday()
    });
    saveData(LS_KEYS.REVIEWS, reviews);
    fbToast('Review submitted. Thank you!', 'success');
    fbSelectedRating = 0;
    document.getElementById('review-text').value = '';
    setTimeout(function () { window.location.reload(); }, 900);
  });

  function alreadyReviewed() {
    return (getData(LS_KEYS.REVIEWS) || []).some(function (rv) {
      return rv.recipeId === recipe.id && rv.userId === user.id;
    });
  }
  function myRating() {
    const mine = (getData(LS_KEYS.REVIEWS) || []).find(function (rv) {
      return rv.recipeId === recipe.id && rv.userId === user.id;
    });
    return mine ? mine.rating : 0;
  }

  /* -------- Render reviews list -------- */
  function renderReviews() {
    const list = (getData(LS_KEYS.REVIEWS) || [])
      .filter(function (rv) { return rv.recipeId === recipe.id; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    const el = document.getElementById('reviews-list');
    if (!list.length) {
      el.innerHTML = '<p class="muted">No reviews yet. Be the first to rate this recipe!</p>';
      return;
    }
    el.innerHTML = list.map(function (rv) {
      return (
        '<div class="review-item">' +
          '<div class="review-head">' +
            '<div class="review-avatar">' + fbEscape((rv.userName || 'U').charAt(0).toUpperCase()) + '</div>' +
            '<div><div class="review-name">' + fbEscape(rv.userName || 'Anonymous') + '</div>' +
            '<div class="review-stars">' + starsFor(rv.rating) + '</div></div>' +
            '<span class="review-date">' + fbFormatDate(rv.date) + '</span>' +
          '</div>' +
          (rv.review ? '<p class="review-text">' + fbEscape(rv.review) + '</p>' : '') +
        '</div>'
      );
    }).join('');
  }
  renderReviews();
}

/* -------- Add to collection modal -------- */
function openAddToCollectionModal(recipe) {
  const user = fbGetCurrentUser();
  const myCols = fbGetUserCollections(user.id);

  let overlay = document.getElementById('fb-addcoll-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fb-addcoll-modal';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  const itemsHtml = myCols.length
    ? myCols.map(function (c) {
        const has = (c.recipeIds || []).indexOf(recipe.id) !== -1;
        return (
          '<label class="filter-check" style="padding:10px 12px; border:1.5px solid var(--border); border-radius:10px; margin-bottom:8px;">' +
            '<input type="checkbox" data-coll="' + c.id + '"' + (has ? ' checked' : '') + '> <strong>' + fbEscape(c.name) + '</strong>' +
            '<span class="muted small" style="margin-left:auto;">' + (c.recipeIds || []).length + ' recipes</span>' +
          '</label>'
        );
      }).join('')
    : '<p class="muted small">You have no collections yet — create your first one below.</p>';

  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-head"><h3>Add "' + fbEscape(recipe.name) + '" to Collection</h3><button class="modal-close" data-close>&times;</button></div>' +
      itemsHtml +
      '<div class="form-group mt-2"><label>Or create a new collection</label>' +
      '<div style="display:flex; gap:8px;"><input type="text" id="quick-coll-name" class="form-control" placeholder="Collection name" maxlength="40">' +
      '<button type="button" class="btn btn-outline" id="quick-coll-btn">Create</button></div></div>' +
      '<div class="modal-actions"><button class="btn btn-primary" data-close>Done</button></div>' +
    '</div>';
  overlay.classList.add('open');

  overlay.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { overlay.classList.remove('open'); });
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

  overlay.querySelectorAll('[data-coll]').forEach(function (chk) {
    chk.addEventListener('change', function () {
      const colId = chk.getAttribute('data-coll');
      const all = getData(LS_KEYS.COLLECTIONS) || [];
      const idx = all.findIndex(function (c) { return c.id === colId; });
      if (idx === -1) return;
      all[idx].recipeIds = all[idx].recipeIds || [];
      if (chk.checked) {
        if (all[idx].recipeIds.indexOf(recipe.id) === -1) {
          all[idx].recipeIds.push(recipe.id);
          fbToast('Added to "' + all[idx].name + '"', 'success');
        }
      } else {
        all[idx].recipeIds = all[idx].recipeIds.filter(function (x) { return x !== recipe.id; });
        fbToast('Removed from "' + all[idx].name + '"', 'info');
      }
      saveData(LS_KEYS.COLLECTIONS, all);
    });
  });

  document.getElementById('quick-coll-btn').addEventListener('click', function () {
    const name = document.getElementById('quick-coll-name').value.trim();
    if (!name) { fbToast('Please enter a collection name', 'error'); return; }
    const all = getData(LS_KEYS.COLLECTIONS) || [];
    const col = { id: fbGenerateId('coll'), name: name, userId: user.id, recipeIds: [recipe.id], createdAt: fbGetToday() };
    all.push(col);
    saveData(LS_KEYS.COLLECTIONS, all);
    fbToast('Collection "' + name + '" created and recipe added', 'success');
    openAddToCollectionModal(recipe); /* re-render with new collection */
  });
}

/* -------- Share modal -------- */
function openShareModal(recipe) {
  const url = window.location.href;
  const text = 'Check out this recipe: ' + recipe.name + ' on CraveCart!';

  let overlay = document.getElementById('fb-share-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fb-share-modal';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-head"><h3>Share "' + fbEscape(recipe.name) + '"</h3><button class="modal-close" data-close>&times;</button></div>' +
      '<div style="display:flex; flex-direction:column; gap:10px;">' +
        '<button class="btn btn-primary btn-block" id="share-copy">🔗 Copy Recipe Link</button>' +
        '<a class="btn btn-outline btn-block" style="text-decoration:none;" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(text + ' ' + url) + '">💬 Share on WhatsApp</a>' +
        '<button class="btn btn-ghost btn-block" id="share-native" style="' + (navigator.share ? '' : 'display:none;') + '">📤 More Share Options</button>' +
      '</div>' +
    '</div>';
  overlay.classList.add('open');

  overlay.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { overlay.classList.remove('open'); });
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });

  document.getElementById('share-copy').addEventListener('click', function () {
    copyToClipboard(url);
  });

  const nativeBtn = document.getElementById('share-native');
  if (nativeBtn) {
    nativeBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: recipe.name, text: text, url: url }).catch(function () { /* user cancelled */ });
      }
    });
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      fbToast('Recipe link copied to clipboard', 'success');
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    fbToast('Recipe link copied to clipboard', 'success');
  } catch (e) {
    fbToast('Could not copy link', 'error');
  }
  ta.remove();
}
