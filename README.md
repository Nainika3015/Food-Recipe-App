# 🛒 CraveCart – Food Recipe & Meal Planning App

**Tagline:** *Discover. Create. Crave.*

CraveCart is a food recipe web application where users can browse, search, filter, save, cook and share recipes. Users can organise recipes into personal collections, publish their own recipes, and rate & review dishes. The application is divided into **two clearly separated business modules**:

1. **User Module** — signup, login, explore, save, collect, publish, rate, review, profile
2. **Admin Module** — separate protected portal to manage recipes, users, categories and reviews

The whole application is built with **only HTML, CSS and Vanilla JavaScript**, and every piece of data lives in the browser's **Local Storage**. No frameworks, no backend, no database.

---

## 📌 Problem Statement

Food lovers switch between blogs, videos and notes while cooking. Recipe sources are scattered, there is no single place to save personal favourites, community feedback on recipes is hard to find, and discovering new dishes by ingredient, cuisine or diet is clumsy.

CraveCart solves this as a single, self-contained web application: **60+ curated recipes** are centralised with search/filter/sort, users build their own cookbooks through saved recipes and collections, community ratings signal quality, and publishing is open to every registered user — all working offline in the browser.

## 🎯 Objectives

- Provide a clean, modern, responsive recipe-browsing experience
- Implement complete **CRUD** for recipes, collections, categories, users and reviews
- Demonstrate **role-based modules** (User vs Admin) with protected navigation
- Persist all data with **Local Storage** (no server, works offline)
- Practise real-world **vanilla JavaScript**: DOM rendering, filtering, sorting, form validation, modals and toasts

## ✨ Features (User Module)

- Signup / Login / Logout with validation and unique email
- Home page: hero search, Popular / Trending / Top Rated sections, category tiles, **live statistics** (recipe count, categories, community chefs — computed from Local Storage)
- Explore page: search by name / ingredient / cuisine / category / diet, filters (cuisine, diet, difficulty, max time), sorting (Highest Rated, Most Popular, Newest, Quickest)
- Recipe details: full ingredients with quantities, numbered steps, save, add to collection, star rating, review, share (copy link / WhatsApp / Web Share API)
- My Saved Recipes (personal bookmarks per user)
- Personal Collections: create, rename, delete, add/remove recipes, view
- Create Recipe: dynamic ingredient & step rows, edit and delete own recipes
- Ratings & Reviews: 1–5 stars, one rating per user per recipe, averages computed dynamically
- Profile: live stats and editable display name (synced to recipes and reviews)

## 🛡️ Admin Module

- Separate visual identity (dark sidebar) at `admin/admin-login.html`
- Credentials: **admin@cravecart.com / admin123** → redirects to Admin Dashboard
- Dashboard: Total Users, Recipes, Categories, Reviews, Saved Recipes — **all computed from Local Storage**, plus recent recipes, most rated recipes and recent users
- Manage Recipes: search, view (modal), edit, delete, add — handles all 60+ recipes
- Manage Users: search, view details, delete; shows saved/created counts and registration date
- Manage Categories: add, edit, delete with live recipe counts
- Manage Reviews: view, filter by rating, delete
- Route protection: unauthenticated visitors are redirected to Admin Login

## 👥 Demo Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| User | Nainika | nainika@cravecart.com | demo123 |
| User | Alisha | alisha@cravecart.com | demo123 |
| User | Swaroopa | swaroopa@cravecart.com | demo123 |
| Admin | Administrator | admin@cravecart.com | admin123 |

Each demo user has **different** saved recipes, collections (My Breakfast Favourites / Weekend Cravings, Healthy Meals / Dessert Corner, Quick Dinner Ideas / Party Snacks), two published recipes each, and their own ratings & reviews.

## 🗄️ Local Storage Implementation

| Key | Contents |
|---|---|
| `cravecart_users` | Registered users (id, name, email, password, savedRecipes, createdRecipes, createdAt) |
| `cravecart_recipes` | All recipes (60+ samples + user submitted) |
| `cravecart_categories` | Recipe categories |
| `cravecart_reviews` | Ratings & reviews |
| `cravecart_collections` | Personal collections (id, name, userId, recipeIds) |
| `cravecart_currentUser` | Logged-in user's id (session) |
| `cravecart_adminLoggedIn` | Admin session flag (true/false) |
| `cravecart_seeded` | Sample-data seeding marker |

Reusable helpers live in `js/storage.js`: `getData()`, `saveData()`, `updateData()`, `deleteData()`. Old `freebuff_*` keys from a previous run are wiped automatically on first load.

## 🧭 Navigation Flow

```
USER:  Home → Signup → Login → Home → Explore → Recipe Details
       → Save / Collect / Rate → My Recipes → Profile → Logout
ADMIN: Admin Login → Dashboard → Recipes → Users → Categories
       → Reviews → Logout
```

Unauthorized access is redirected by JavaScript guards (`fbRequireUser`, `fbRequireAdmin`).

## 📁 Folder Structure

```
CraveCart/
│
├── index.html            (home)
├── login.html            (user login)
├── signup.html           (user registration)
├── explore.html          (browse + search + filter + sort)
├── recipe-details.html   (full recipe view + actions)
├── saved.html            (my saved recipes)
├── collections.html      (personal collections)
├── create-recipe.html    (create / edit recipe)
├── my-recipes.html       (my created recipes)
├── profile.html          (profile & stats)
│
├── admin/
│   ├── admin-login.html
│   ├── dashboard.html
│   ├── recipes.html
│   ├── users.html
│   ├── categories.html
│   └── reviews.html
│
├── css/
│   ├── style.css         (shared design system)
│   ├── auth.css          (login/signup)
│   ├── user.css          (user pages)
│   └── admin.css         (admin portal)
│
└── js/
    ├── storage.js        (Local Storage layer + 69 recipe seed)
    ├── auth.js           (signup/login/logout/guards/toasts)
    ├── navigation.js     (navbar, footer, confirm modal)
    ├── recipes.js        (cards, explore, home, create/edit)
    ├── collections.js    (saved page + collections CRUD)
    ├── reviews.js        (details page, ratings, share)
    ├── admin.js          (admin module)
    └── app.js            (page router)
```

## 🚀 How to Run

No installation, no build, no npm.

**Option 1 — double-click** `index.html` (everything works via `file://`, except clipboard copy).

**Option 2 — local server (recommended):**

```bash
node serve.js        # tiny zero-dependency static server
# then open http://localhost:8000/index.html
```

or any static server (`python -m http.server`, VS Code Live Server, etc.).

## 🧪 Testing Checklist (viva-ready)

1. Nainika / Alisha / Swaroopa login ✔  2. Admin login → dashboard ✔
3. User & admin logout ✔  4. Search "paneer" → 4+ recipes ✔
5. Filters: cuisine / diet / difficulty / time ✔  6. Sorts: rating / popular / newest / quickest ✔
7. Save & unsave ✔  8. Collections create/rename/delete/add/remove ✔
9. Create recipe (dynamic rows) ✔  10. Edit & delete own recipe ✔
11. Star rating + review, duplicate blocked ✔  12. Admin: recipes / users / categories / reviews ✔
13. Auth guards redirect ✔  14. Persistence after refresh ✔
15. Responsive: desktop / tablet / mobile ✔

## 🛠️ Technologies Used

- **HTML5** — semantic structure, 16 pages
- **CSS3** — CSS variables, Grid & Flexbox layouts, media queries, transitions (no frameworks)
- **Vanilla JavaScript (ES5-friendly)** — DOM manipulation, event handling, filtering/sorting logic, form validation
- **Local Storage** — all data & sessions

## 🔮 Future Enhancements

- Printable recipe cards & shopping lists
- Photo upload via file reader (base64) instead of image URLs
- Follow chefs and like reviews
- Import/export data as JSON backup
- Optional cloud sync when a backend is permitted

---

© 2026 CraveCart – built with HTML, CSS & Vanilla JavaScript.
