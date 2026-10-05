/* ============================================================
   CraveCart - app.js
   Page bootstrap: routes each HTML page to its init function
   based on <body data-page="...">, then updates the navbar.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  const page = document.body.getAttribute('data-page') || '';

  switch (page) {
    case 'home':
      /* Home is browsable by guests; navbar shows Login/Signup */
      fbInitHomePage();
      break;
    case 'explore':
      fbInitExplorePage();
      break;
    case 'recipe-details':
      fbInitRecipeDetailsPage();
      break;
    case 'saved':
      fbInitSavedPage();
      break;
    case 'collections':
      fbInitCollectionsPage();
      break;
    case 'create-recipe':
      fbInitCreateRecipePage();
      break;
    case 'my-recipes':
      fbInitMyRecipesPage();
      break;
    case 'profile':
      fbInitProfilePage();
      break;
    case 'login':
      /* already logged in? go home */
      if (fbGetCurrentUser()) { window.location.replace('index.html'); return; }
      break;
    case 'signup':
      if (fbGetCurrentUser()) { window.location.replace('index.html'); return; }
      break;
    case 'admin-login':
      if (fbIsAdminLoggedIn()) { window.location.replace('dashboard.html'); return; }
      break;
    case 'admin-dashboard':
      if (!fbRequireAdmin()) return;
      fbInitAdminDashboard();
      break;
    case 'admin-recipes':
      if (!fbRequireAdmin()) return;
      fbInitAdminRecipes();
      break;
    case 'admin-users':
      if (!fbRequireAdmin()) return;
      fbInitAdminUsers();
      break;
    case 'admin-categories':
      if (!fbRequireAdmin()) return;
      fbInitAdminCategories();
      break;
    case 'admin-reviews':
      if (!fbRequireAdmin()) return;
      fbInitAdminReviews();
      break;
  }

  /* Shared UI (auth pages do not load navigation.js, so guard the calls) */
  if (typeof fbRenderNavbar === 'function') fbRenderNavbar(fbNavbarKeyFor(page));
  if (typeof fbRenderFooter === 'function') fbRenderFooter();
});

/* Maps data-page value to the navbar link key to highlight */
function fbNavbarKeyFor(page) {
  const map = {
    'home': 'home',
    'explore': 'explore',
    'recipe-details': 'explore',
    'saved': 'saved',
    'collections': 'collections',
    'create-recipe': 'create',
    'my-recipes': 'myrecipes',
    'profile': 'profile'
  };
  return map[page] || '';
}
