/* ============================================================
   CraveCart - Food Recipe App
   storage.js : Core Local Storage layer + sample data seeding
   ============================================================ */

/* ---------- Local Storage keys ---------- */
const LS_KEYS = {
  USERS: 'cravecart_users',
  RECIPES: 'cravecart_recipes',
  CATEGORIES: 'cravecart_categories',
  REVIEWS: 'cravecart_reviews',
  COLLECTIONS: 'cravecart_collections',
  CURRENT_USER: 'cravecart_currentUser',
  ADMIN: 'cravecart_adminLoggedIn',
  SEEDED: 'cravecart_seeded'
};

/* ---------- Brand logo (food-themed chef hat, shared by all modules) ---------- */
const FBC_LOGO_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>';

/* Remove any legacy data from the old app name so CraveCart
   always starts with its own fresh, correct dataset. */
function fbWipeLegacyStorage() {
  ['freebuff_users', 'freebuff_recipes', 'freebuff_categories', 'freebuff_reviews',
   'freebuff_collections', 'freebuff_currentUser', 'freebuff_adminLoggedIn', 'freebuff_seeded']
    .forEach(function (k) { localStorage.removeItem(k); });
}

/* ---------- Generic helpers (reusable everywhere) ---------- */
function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('CraveCart: error reading "' + key + '"', e);
    return null;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('CraveCart: error saving "' + key + '"', e);
    return false;
  }
}

function updateData(key, callback) {
  const data = getData(key);
  if (data === null) return false;
  const result = callback(data);
  if (result !== undefined) saveData(key, result);
  return true;
}

function deleteData(key) {
  localStorage.removeItem(key);
}

/* ---------- Tiny id/date helpers ---------- */
function fbGenerateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
}

function fbGetToday() {
  return new Date().toISOString().slice(0, 10);
}

function fbFormatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fbTimeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return days + ' days ago';
  const months = Math.floor(days / 30);
  if (months < 12) return months + (months === 1 ? ' month ago' : ' months ago');
  const years = Math.floor(months / 12);
  return years + (years === 1 ? ' year ago' : ' years ago');
}

/* ---------- Auth helpers ---------- */
function fbGetCurrentUser() {
  const userId = getData(LS_KEYS.CURRENT_USER);
  if (!userId) return null;
  const users = getData(LS_KEYS.USERS) || [];
  return users.find(function (u) { return u.id === userId; }) || null;
}

function fbUpdateCurrentUser(patch) {
  const users = getData(LS_KEYS.USERS) || [];
  const userId = getData(LS_KEYS.CURRENT_USER);
  const idx = users.findIndex(function (u) { return u.id === userId; });
  if (idx === -1) return null;
  users[idx] = Object.assign({}, users[idx], patch);
  saveData(LS_KEYS.USERS, users);
  return users[idx];
}

function fbIsAdminLoggedIn() {
  return getData(LS_KEYS.ADMIN) === true;
}

/* ---------- Recipe helpers ---------- */
function fbGetRecipes() { return getData(LS_KEYS.RECIPES) || []; }
function fbGetRecipeById(id) { return fbGetRecipes().find(function (r) { return r.id === id; }) || null; }

function fbGetRecipeRating(recipeId) {
  const reviews = (getData(LS_KEYS.REVIEWS) || []).filter(function (rv) { return rv.recipeId === recipeId; });
  if (!reviews.length) return { avg: 0, count: 0 };
  const total = reviews.reduce(function (sum, rv) { return sum + Number(rv.rating || 0); }, 0);
  return { avg: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

/* Escape user text before inserting into HTML */
function fbEscape(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- Demo users: Nainika, Alisha, Swaroopa ---------- */
function fbGetDemoUsers() {
  return [
    {
      id: 'user_demo1', name: 'Nainika', email: 'nainika@cravecart.com', password: 'demo123',
      savedRecipes: ['recipe_1', 'recipe_14', 'recipe_28', 'recipe_29', 'recipe_52', 'recipe_59'],
      createdRecipes: ['recipe_64', 'recipe_65'],
      createdAt: '2026-01-05'
    },
    {
      id: 'user_demo2', name: 'Alisha', email: 'alisha@cravecart.com', password: 'demo123',
      savedRecipes: ['recipe_44', 'recipe_48', 'recipe_49', 'recipe_31', 'recipe_54', 'recipe_13'],
      createdRecipes: ['recipe_66', 'recipe_67'],
      createdAt: '2026-01-18'
    },
    {
      id: 'user_demo3', name: 'Swaroopa', email: 'swaroopa@cravecart.com', password: 'demo123',
      savedRecipes: ['recipe_21', 'recipe_41', 'recipe_37', 'recipe_46', 'recipe_58', 'recipe_61'],
      createdRecipes: ['recipe_68', 'recipe_69'],
      createdAt: '2026-02-02'
    }
  ];
}

/* ---------- Demo collections (different per user) ---------- */
function fbGetDemoCollections() {
  return [
    { id: 'coll_d1', name: 'My Breakfast Favourites', userId: 'user_demo1', recipeIds: ['recipe_1', 'recipe_2', 'recipe_4', 'recipe_5', 'recipe_6'], createdAt: '2026-01-10' },
    { id: 'coll_d2', name: 'Weekend Cravings', userId: 'user_demo1', recipeIds: ['recipe_12', 'recipe_28', 'recipe_41', 'recipe_51'], createdAt: '2026-01-22' },
    { id: 'coll_d3', name: 'Healthy Meals', userId: 'user_demo2', recipeIds: ['recipe_44', 'recipe_45', 'recipe_46', 'recipe_48', 'recipe_50'], createdAt: '2026-01-25' },
    { id: 'coll_d4', name: 'Dessert Corner', userId: 'user_demo2', recipeIds: ['recipe_51', 'recipe_54', 'recipe_55', 'recipe_58'], createdAt: '2026-02-04' },
    { id: 'coll_d5', name: 'Quick Dinner Ideas', userId: 'user_demo3', recipeIds: ['recipe_35', 'recipe_29', 'recipe_16', 'recipe_43'], createdAt: '2026-02-09' },
    { id: 'coll_d6', name: 'Party Snacks', userId: 'user_demo3', recipeIds: ['recipe_21', 'recipe_41', 'recipe_42', 'recipe_25', 'recipe_27'], createdAt: '2026-02-16' }
  ];
}

/* ---------- Sample recipes (63 curated + 6 chef-created = 69) ---------- */
function fbGetSampleRecipes() {
  const U = 'https://images.unsplash.com/';
  const Q = '?w=800&q=80';
  const img = function (id) { return U + id + Q; };
  /* Wikimedia Commons helper — Special:FilePath redirects to the real file; width thumbs it */
  const wiki = function (file) { return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=800'; };

  const R = [];
  function add(o) { R.push(o); }

  /* ============ BREAKFAST (1-8) ============ */
  add({
    id: 'recipe_1', name: 'Masala Dosa',
    description: 'Crispy golden rice crepes stuffed with a spicy potato masala, served with sambar and coconut chutney. A classic South Indian breakfast loved across the country.',
    image: img('photo-1668236543090-82eba5ee5976'),
    cuisine: 'South Indian', category: 'Breakfast', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 25, servings: 2, difficulty: 'Medium', tags: ['breakfast', 'south indian', 'crispy'],
    ingredients: [
      { name: 'Dosa batter (fermented rice & urad dal)', quantity: '2', unit: 'cups' },
      { name: 'Potatoes, boiled and mashed', quantity: '3', unit: 'medium' },
      { name: 'Onion, finely chopped', quantity: '1', unit: 'large' },
      { name: 'Green chillies, chopped', quantity: '2', unit: 'nos' },
      { name: 'Mustard seeds', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Curry leaves', quantity: '8-10', unit: 'leaves' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Boil the potatoes until soft, peel and mash them coarsely.',
      'Heat oil in a pan, splutter mustard seeds, add curry leaves, green chillies and onion; sauté until translucent.',
      'Add turmeric and the mashed potatoes with salt; mix well and cook for 3-4 minutes. Keep the masala warm.',
      'Heat a flat dosa pan on medium heat and lightly grease it with oil.',
      'Pour a ladle of dosa batter and spread it into a thin circle.',
      'Drizzle oil around the edges and cook until golden and crisp.',
      'Place the potato masala on one half, fold the dosa over and serve hot with sambar and coconut chutney.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-01', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_2', name: 'Idli Sambar',
    description: 'Steamed rice-and-urad-dal idlis served with lentil sambar loaded with vegetables and a hint of tamarind. Light, healthy and comforting.',
    image: img('photo-1589301760014-d929f3979dbc'),
    cuisine: 'South Indian', category: 'Breakfast', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 20, servings: 3, difficulty: 'Easy', tags: ['steamed', 'healthy', 'south indian'],
    ingredients: [
      { name: 'Idli batter', quantity: '2', unit: 'cups' },
      { name: 'Toor dal (split pigeon peas)', quantity: '1', unit: 'cup' },
      { name: 'Mixed vegetables (drumstick, carrot, brinjal)', quantity: '1', unit: 'cup' },
      { name: 'Tamarind pulp', quantity: '2', unit: 'tbsp' },
      { name: 'Sambar powder', quantity: '2', unit: 'tbsp' },
      { name: 'Mustard seeds & curry leaves', quantity: '1', unit: 'tsp' },
      { name: 'Oil or ghee', quantity: '1', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Pressure-cook toor dal until soft and mash it smoothly.',
      'Boil the vegetables with tamarind pulp, sambar powder and salt.',
      'Add the mashed dal and simmer 8-10 minutes, adjusting the consistency with water.',
      'Temper with mustard seeds, curry leaves and ghee; pour over the sambar.',
      'Grease idli plates, pour batter and steam for 10-12 minutes.',
      'Serve hot idlis with sambar and coconut chutney.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-12', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_3', name: 'Vegetable Upma',
    description: 'Fluffy roasted semolina cooked with crunchy vegetables, ginger and curry leaves — a 20-minute South Indian breakfast that keeps you full all morning.',
    image: wiki('Upma.jpg'),
    cuisine: 'South Indian', category: 'Breakfast', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 15, servings: 2, difficulty: 'Easy', tags: ['semolina', 'quick', 'south indian'],
    ingredients: [
      { name: 'Rava (semolina), roasted', quantity: '1', unit: 'cup' },
      { name: 'Water', quantity: '2.5', unit: 'cups' },
      { name: 'Onion, chopped', quantity: '1', unit: 'medium' },
      { name: 'Carrot, beans & peas, chopped', quantity: '1/2', unit: 'cup' },
      { name: 'Ginger, grated', quantity: '1', unit: 'tsp' },
      { name: 'Mustard seeds & urad dal', quantity: '1', unit: 'tsp' },
      { name: 'Curry leaves & green chillies', quantity: 'a few', unit: '' },
      { name: 'Ghee or oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Heat ghee in a kadai; splutter mustard seeds, urad dal, curry leaves and green chillies.',
      'Sauté onion and ginger until soft, then add the vegetables and cook for 4-5 minutes.',
      'Pour in the water with salt and bring to a rolling boil.',
      'Lower the heat and add roasted rava in a slow stream, stirring constantly to avoid lumps.',
      'Cover and cook on low heat for 5 minutes until the water is absorbed.',
      'Fluff with a fork, finish with a squeeze of lemon and serve hot with coconut chutney.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-06', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_4', name: 'Poha',
    description: 'Soft flattened rice tossed with onion, potato, peanuts and a bright squeeze of lime — Indore-style breakfast ready in fifteen minutes.',
    image: wiki('Kanda_poha.jpg'),
    cuisine: 'Indian', category: 'Breakfast', dietaryPreference: 'Vegan',
    prepTime: 10, cookTime: 10, servings: 2, difficulty: 'Easy', tags: ['quick', 'light', 'flattened rice'],
    ingredients: [
      { name: 'Thick poha (flattened rice)', quantity: '2', unit: 'cups' },
      { name: 'Onion, finely chopped', quantity: '1', unit: 'medium' },
      { name: 'Potato, diced small', quantity: '1', unit: 'medium' },
      { name: 'Peanuts, roasted', quantity: '1/4', unit: 'cup' },
      { name: 'Mustard seeds & curry leaves', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Green chillies', quantity: '2', unit: 'nos' },
      { name: 'Lemon & coriander to serve', quantity: '', unit: '' },
      { name: 'Oil & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Rinse poha in a colander until just softened; sprinkle salt and turmeric and set aside.',
      'Fry peanuts in oil until golden; remove and keep aside.',
      'In the same oil splutter mustard seeds and curry leaves, then sauté onion, green chillies and potato until cooked.',
      'Gently fold in the poha and cook for 2-3 minutes on low heat.',
      'Turn off the heat, add lime juice and half the peanuts.',
      'Serve warm topped with the remaining peanuts and fresh coriander.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-14', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_5', name: 'Aloo Paratha',
    description: 'Golden whole-wheat flatbreads stuffed with a spicy mashed-potato filling and roasted in ghee — the ultimate Punjabi breakfast.',
    image: wiki('Aloo_paratha.jpg'),
    cuisine: 'Indian', category: 'Breakfast', dietaryPreference: 'Vegetarian',
    prepTime: 25, cookTime: 20, servings: 3, difficulty: 'Medium', tags: ['flatbread', 'punjabi', 'stuffed'],
    ingredients: [
      { name: 'Whole wheat flour', quantity: '2', unit: 'cups' },
      { name: 'Potatoes, boiled and mashed', quantity: '3', unit: 'medium' },
      { name: 'Onion, grated', quantity: '1', unit: 'small' },
      { name: 'Green chillies, chopped', quantity: '2', unit: 'nos' },
      { name: 'Coriander leaves, chopped', quantity: '2', unit: 'tbsp' },
      { name: 'Ajwain (carom seeds)', quantity: '1/2', unit: 'tsp' },
      { name: 'Red chilli powder & garam masala', quantity: '1', unit: 'tsp each' },
      { name: 'Ghee for roasting', quantity: 'as needed', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Knead a soft dough with flour, water and salt; rest it for 20 minutes.',
      'Mix mashed potatoes, onion, chillies, coriander, ajwain, spice powders and salt for the stuffing.',
      'Roll a dough ball into a small disc, place 2 tbsp of stuffing in the centre and seal.',
      'Roll gently into a 6-inch paratha, dusting with flour as needed.',
      'Roast on a hot tawa with ghee until both sides are golden with brown spots.',
      'Serve hot with curd, butter or pickle.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-16', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_6', name: 'Pancakes',
    description: 'Fluffy, golden pancakes made with a simple batter, stacked high and finished with maple syrup and butter.',
    image: img('photo-1567620905732-2d1ec7ab7445'),
    cuisine: 'American', category: 'Breakfast', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 15, servings: 2, difficulty: 'Easy', tags: ['breakfast', 'sweet', 'kids'],
    ingredients: [
      { name: 'All-purpose flour', quantity: '1', unit: 'cup' },
      { name: 'Milk', quantity: '3/4', unit: 'cup' },
      { name: 'Egg', quantity: '1', unit: 'nos' },
      { name: 'Sugar', quantity: '2', unit: 'tbsp' },
      { name: 'Baking powder', quantity: '1', unit: 'tsp' },
      { name: 'Butter, melted', quantity: '2', unit: 'tbsp' },
      { name: 'Maple syrup', quantity: 'to serve', unit: '' },
      { name: 'Salt', quantity: 'a pinch', unit: '' }
    ],
    instructions: [
      'Whisk flour, sugar, baking powder and salt in a bowl.',
      'In another bowl whisk milk, egg and melted butter.',
      'Combine wet and dry ingredients until just mixed (small lumps are fine).',
      'Pour a ladle of batter onto a greased pan on medium heat.',
      'Cook until bubbles appear, flip and cook the other side until golden.',
      'Stack and serve with butter and maple syrup.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-25', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_7', name: 'French Toast',
    description: 'Thick brioche-style bread slices soaked in cinnamon-vanilla custard and pan-fried until caramelised — weekend brunch in ten minutes.',
    image: img('photo-1484723091739-30a097e8f929'),
    cuisine: 'American', category: 'Breakfast', dietaryPreference: 'Non-Vegetarian',
    prepTime: 5, cookTime: 10, servings: 2, difficulty: 'Easy', tags: ['brunch', 'sweet', 'quick'],
    ingredients: [
      { name: 'Thick bread slices', quantity: '4', unit: 'nos' },
      { name: 'Eggs', quantity: '2', unit: 'nos' },
      { name: 'Milk', quantity: '1/2', unit: 'cup' },
      { name: 'Sugar', quantity: '1', unit: 'tbsp' },
      { name: 'Cinnamon powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Vanilla extract', quantity: '1/2', unit: 'tsp' },
      { name: 'Butter', quantity: '2', unit: 'tbsp' },
      { name: 'Honey or maple syrup & berries', quantity: 'to serve', unit: '' }
    ],
    instructions: [
      'Whisk eggs, milk, sugar, cinnamon and vanilla in a shallow dish.',
      'Dip each bread slice for 10 seconds per side so it soaks the custard.',
      'Melt butter in a pan over medium heat.',
      'Cook the slices 2-3 minutes per side until golden and puffed.',
      'Dust with powdered sugar and serve with honey and fresh berries.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-27', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_8', name: 'Masala Omelette',
    description: 'Fluffy three-egg omelette whipped with onion, tomato, chillies and coriander — the street-side Indian breakfast protein hit.',
    image: img('photo-1510693206972-df098062cb71'),
    cuisine: 'Indian', category: 'Breakfast', dietaryPreference: 'Non-Vegetarian',
    prepTime: 5, cookTime: 8, servings: 1, difficulty: 'Easy', tags: ['eggs', 'protein', 'quick'],
    ingredients: [
      { name: 'Eggs', quantity: '3', unit: 'nos' },
      { name: 'Onion, finely chopped', quantity: '1/2', unit: 'medium' },
      { name: 'Tomato, finely chopped', quantity: '1', unit: 'small' },
      { name: 'Green chillies, chopped', quantity: '1', unit: 'nos' },
      { name: 'Coriander leaves', quantity: '1', unit: 'tbsp' },
      { name: 'Turmeric & red chilli powder', quantity: '1/4', unit: 'tsp each' },
      { name: 'Milk', quantity: '1', unit: 'tbsp' },
      { name: 'Butter or oil', quantity: '1', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Whisk eggs with milk, salt, turmeric and chilli powder until frothy.',
      'Stir in onion, tomato, green chillies and coriander.',
      'Melt butter in a non-stick pan on medium heat.',
      'Pour the egg mixture and tilt to spread evenly.',
      'Cook 2-3 minutes until the edges lift, then flip and cook 1 more minute.',
      'Fold, slide onto a plate and serve with buttered toast.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-01', updatedAt: null, isSample: true
  });

  /* ============ INDIAN MAINS (9-20) ============ */
  add({
    id: 'recipe_9', name: 'Paneer Tikka',
    description: 'Char-grilled cubes of paneer marinated in spiced hung-curd yogurt with capsicum and onion, cooked until smoky. A favourite Indian starter.',
    image: wiki('Paneer tikka 1.jpg'),
    cuisine: 'Indian', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 15, servings: 3, difficulty: 'Easy', tags: ['starter', 'grilled', 'party'],
    ingredients: [
      { name: 'Paneer, cut into cubes', quantity: '250', unit: 'g' },
      { name: 'Hung curd / thick yogurt', quantity: '1/2', unit: 'cup' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Red chilli powder', quantity: '1', unit: 'tsp' },
      { name: 'Garam masala', quantity: '1/2', unit: 'tsp' },
      { name: 'Chaat masala', quantity: '1', unit: 'tsp' },
      { name: 'Capsicum & onion, cubed', quantity: '1 each', unit: '' },
      { name: 'Lemon juice', quantity: '1', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Whisk hung curd with ginger-garlic paste, red chilli powder, garam masala, chaat masala, lemon juice and salt.',
      'Add paneer cubes, capsicum and onion; coat well and marinate for 30 minutes.',
      'Thread paneer, capsicum and onion onto skewers alternately.',
      'Grill in an oven at 200°C for 12-15 minutes, turning once, or pan-fry on medium heat until charred.',
      'Sprinkle chaat masala and serve hot with mint chutney and onion rings.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-03', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_10', name: 'Paneer Butter Masala',
    description: 'Soft paneer cubes swimming in a velvety tomato-cashew gravy with butter, cream and kasuri methi — restaurant luxury at home.',
    image: wiki('Paneer butter masala 3.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 30, servings: 4, difficulty: 'Medium', tags: ['curry', 'paneer', 'creamy'],
    ingredients: [
      { name: 'Paneer, cubed', quantity: '250', unit: 'g' },
      { name: 'Tomatoes, chopped', quantity: '4', unit: 'medium' },
      { name: 'Cashew nuts, soaked', quantity: '15', unit: 'nos' },
      { name: 'Onion, chopped', quantity: '1', unit: 'medium' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Fresh cream', quantity: '1/4', unit: 'cup' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Kashmiri chilli, garam masala', quantity: '1', unit: 'tsp each' },
      { name: 'Kasuri methi & sugar', quantity: '1', unit: 'tsp each' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Boil tomatoes, onion and cashews in a little water until soft; cool and blend into a smooth puree.',
      'Melt butter and sauté ginger-garlic paste for a minute.',
      'Add the puree, chilli powder, garam masala, sugar and salt; cook 10-12 minutes until the butter separates.',
      'Add paneer cubes and a splash of hot water to loosen the gravy; simmer 5 minutes.',
      'Crush kasuri methi over the curry and stir in cream.',
      'Serve hot with naan, roti or jeera rice.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-04', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_11', name: 'Butter Chicken',
    description: 'Tandoori-style chicken simmered in a silky tomato-butter gravy finished with cream and kasuri methi. Indias most famous curry.',
    image: wiki('Chicken makhani.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Non-Vegetarian',
    prepTime: 25, cookTime: 40, servings: 4, difficulty: 'Medium', tags: ['curry', 'chicken', 'famous'],
    ingredients: [
      { name: 'Chicken, boneless cubes', quantity: '500', unit: 'g' },
      { name: 'Yogurt', quantity: '1/2', unit: 'cup' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Kashmiri red chilli powder', quantity: '1', unit: 'tsp' },
      { name: 'Tomato puree', quantity: '2', unit: 'cups' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Fresh cream', quantity: '1/2', unit: 'cup' },
      { name: 'Kasuri methi (dried fenugreek)', quantity: '1', unit: 'tsp' },
      { name: 'Garam masala', quantity: '1', unit: 'tsp' },
      { name: 'Sugar & salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Marinate chicken in yogurt, ginger-garlic paste, chilli powder and salt for 1 hour.',
      'Grill or pan-sear the marinated chicken until lightly charred; set aside.',
      'Melt butter, add tomato puree and cook for 10 minutes until it darkens and thickens.',
      'Add garam masala, sugar and salt; stir in the grilled chicken pieces.',
      'Simmer for 10 minutes, crush kasuri methi over the gravy and stir in fresh cream.',
      'Serve hot with naan, roti or jeera rice.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-08', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_12', name: 'Chicken Biryani',
    description: 'Layered basmati rice and marinated chicken dum-cooked with saffron, mint and fried onions — a festive one-pot celebration.',
    image: wiki('Chicken biryani 02-06-2015 (India).jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Non-Vegetarian',
    prepTime: 40, cookTime: 50, servings: 5, difficulty: 'Hard', tags: ['rice', 'biryani', 'celebration'],
    ingredients: [
      { name: 'Basmati rice, soaked', quantity: '3', unit: 'cups' },
      { name: 'Chicken, bone-in pieces', quantity: '750', unit: 'g' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Biryani masala', quantity: '3', unit: 'tbsp' },
      { name: 'Onions, thinly sliced', quantity: '3', unit: 'large' },
      { name: 'Ginger-garlic paste', quantity: '2', unit: 'tbsp' },
      { name: 'Mint & coriander leaves', quantity: '1', unit: 'cup' },
      { name: 'Saffron soaked in milk', quantity: 'a pinch', unit: '' },
      { name: 'Ghee', quantity: '4', unit: 'tbsp' },
      { name: 'Whole spices & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Marinate chicken with yogurt, biryani masala, ginger-garlic paste and salt for 2 hours.',
      'Fry sliced onions until deep golden to make birista.',
      'Cook rice with whole spices until 70% done; drain.',
      'In a heavy pot layer marinated chicken, mint, coriander and birista.',
      'Top with rice, saffron milk and ghee; seal with foil and a tight lid.',
      'Dum-cook on the lowest heat for 20-25 minutes, then rest 10 minutes before fluffing.',
      'Serve with raita and mirchi ka salan.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-05', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_13', name: 'Vegetable Biryani',
    description: 'Fragrant basmati rice layered with spiced mixed vegetables, fried onions and fresh mint, then dum-cooked on low heat. A celebration classic.',
    image: wiki('Veg_biryani.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 30, cookTime: 45, servings: 4, difficulty: 'Hard', tags: ['rice', 'celebration', 'aromatic'],
    ingredients: [
      { name: 'Basmati rice, soaked 30 min', quantity: '2', unit: 'cups' },
      { name: 'Mixed vegetables (carrot, beans, peas, potato)', quantity: '2', unit: 'cups' },
      { name: 'Onion, thinly sliced', quantity: '2', unit: 'large' },
      { name: 'Yogurt', quantity: '1/2', unit: 'cup' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Biryani masala', quantity: '2', unit: 'tbsp' },
      { name: 'Whole spices (bay leaf, cinnamon, cloves, cardamom)', quantity: '1', unit: 'tsp' },
      { name: 'Mint & coriander leaves', quantity: '1/2', unit: 'cup' },
      { name: 'Ghee', quantity: '3', unit: 'tbsp' },
      { name: 'Saffron soaked in warm milk', quantity: 'a pinch', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Fry sliced onions until deep golden and set aside (birista).',
      'Cook rice with whole spices and salt until 75% done; drain.',
      'Sauté ginger-garlic paste, add vegetables, biryani masala and yogurt; cook until vegetables are tender.',
      'In a heavy pot layer half the rice, then the vegetable masala, mint, coriander and fried onions.',
      'Add the remaining rice on top, drizzle saffron milk and ghee.',
      'Seal the pot with foil or a tight lid and dum-cook on the lowest heat for 15-20 minutes.',
      'Gently fluff and serve hot with raita and pickle.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-05', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_14', name: 'Chole (Chickpea Curry)',
    description: 'Dark, tangy Punjabi chickpea curry slow-simmered with tea-infused water, anardana and freshly ground chole masala.',
    image: img('photo-1543353071-873f17a7a088'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 15, cookTime: 40, servings: 4, difficulty: 'Easy', tags: ['curry', 'protein', 'punjabi'],
    ingredients: [
      { name: 'Chickpeas, soaked overnight', quantity: '1.5', unit: 'cups' },
      { name: 'Onion, finely chopped', quantity: '2', unit: 'large' },
      { name: 'Tomatoes, pureed', quantity: '3', unit: 'medium' },
      { name: 'Chole masala', quantity: '2', unit: 'tbsp' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Tea bag (for dark colour)', quantity: '1', unit: 'nos' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Pressure-cook soaked chickpeas with a tea bag and salt until soft.',
      'Heat oil, splutter cumin seeds, sauté onions until golden brown.',
      'Add ginger-garlic paste and tomato puree; cook until oil separates.',
      'Add chole masala and the cooked chickpeas with some cooking water.',
      'Simmer for 15-20 minutes until the gravy thickens.',
      'Garnish with onion rings, lemon and coriander; serve with bhature or rice.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-10', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_15', name: 'Rajma Masala',
    description: 'Kidney beans simmered in a thick onion-tomato masala until creamy — the Himalayan comfort food that pairs perfectly with hot rice.',
    image: wiki('Rajma.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 10, cookTime: 35, servings: 4, difficulty: 'Easy', tags: ['beans', 'protein', 'comfort'],
    ingredients: [
      { name: 'Rajma (kidney beans), soaked overnight', quantity: '1', unit: 'cup' },
      { name: 'Onion, finely chopped', quantity: '2', unit: 'medium' },
      { name: 'Tomatoes, pureed', quantity: '3', unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Coriander, cumin & garam masala', quantity: '1', unit: 'tsp each' },
      { name: 'Red chilli powder', quantity: '1', unit: 'tsp' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Pressure-cook soaked rajma with salt until completely soft (about 20 minutes).',
      'Heat oil and sauté onions until deep golden brown.',
      'Add ginger-garlic paste, then the tomato puree and dry spices; cook until oil separates.',
      'Add the cooked rajma with its cooking water.',
      'Mash a few beans against the pot to thicken the gravy and simmer 15 minutes.',
      'Rest 10 minutes, garnish with coriander and serve with steamed rice.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-13', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_16', name: 'Dal Tadka',
    description: 'Silky yellow dal tempered with ghee, garlic, cumin and red chillies — the fragrant finishing sizzle makes this a timeless favourite.',
    image: wiki('Dal Tadka-Delhi.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 25, servings: 4, difficulty: 'Easy', tags: ['dal', 'ghee', 'everyday'],
    ingredients: [
      { name: 'Toor dal (split pigeon peas)', quantity: '1', unit: 'cup' },
      { name: 'Tomato, chopped', quantity: '1', unit: 'medium' },
      { name: 'Turmeric powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Garlic cloves, sliced', quantity: '5', unit: 'nos' },
      { name: 'Dried red chillies', quantity: '2', unit: 'nos' },
      { name: 'Asafoetida (hing)', quantity: 'a pinch', unit: '' },
      { name: 'Coriander leaves & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Pressure-cook dal with turmeric, tomato and salt until soft; whisk smooth.',
      'Simmer the dal for 5 minutes, adding water to a pourable consistency.',
      'In a small pan heat ghee; add cumin seeds until they darken.',
      'Add sliced garlic and fry until golden, then dried chillies and hing.',
      'Pour the sizzling tadka over the dal and immediately cover.',
      'Garnish with coriander and serve with rice or roti.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-11', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_17', name: 'Palak Paneer',
    description: 'Blended spinach gravy with pan-seared paneer cubes, garlic and a whisper of cream — iron-rich, vibrant green and delicious.',
    image: wiki('Palak Paneer (Cottage cheese in spinach gravy).jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 25, servings: 3, difficulty: 'Medium', tags: ['spinach', 'paneer', 'healthy'],
    ingredients: [
      { name: 'Spinach (palak), blanched', quantity: '400', unit: 'g' },
      { name: 'Paneer, cubed', quantity: '200', unit: 'g' },
      { name: 'Onion, chopped', quantity: '1', unit: 'medium' },
      { name: 'Tomato, chopped', quantity: '1', unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Green chillies', quantity: '2', unit: 'nos' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Fresh cream', quantity: '2', unit: 'tbsp' },
      { name: 'Ghee & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes, then refresh in ice water.',
      'Blend spinach with green chillies into a coarse puree to keep the colour bright.',
      'Sauté cumin, onion and ginger-garlic paste in ghee until golden.',
      'Add tomato and cook until soft, then stir in the spinach puree and salt.',
      'Simmer 6-8 minutes; add a little water if too thick.',
      'Pan-sear paneer cubes lightly and fold them in with cream.',
      'Serve hot with roti, naan or jeera rice.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-17', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_18', name: 'Aloo Gobi',
    description: 'Potatoes and cauliflower tossed in a dry turmeric-cumin masala with ginger and coriander — a homely everyday sabzi.',
    image: wiki('Aloo gobi.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 15, cookTime: 25, servings: 3, difficulty: 'Easy', tags: ['potato', 'cauliflower', 'everyday'],
    ingredients: [
      { name: 'Cauliflower, florets', quantity: '1', unit: 'medium' },
      { name: 'Potatoes, cubed', quantity: '2', unit: 'medium' },
      { name: 'Onion, chopped', quantity: '1', unit: 'medium' },
      { name: 'Ginger, grated', quantity: '1', unit: 'tsp' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric, coriander & garam masala', quantity: '1', unit: 'tsp each' },
      { name: 'Green chillies', quantity: '1', unit: 'nos' },
      { name: 'Oil & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Heat oil and splutter cumin seeds with grated ginger.',
      'Sauté onion until translucent, then add potatoes and cook 5 minutes.',
      'Add cauliflower florets, turmeric, coriander powder and salt; toss well.',
      'Cover and cook on low heat for 12-15 minutes, stirring occasionally.',
      'Sprinkle garam masala and green chilli; cook uncovered 3 minutes for a dry finish.',
      'Garnish with coriander and serve with roti or dal-rice.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-19', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_19', name: 'Vegetable Pulao',
    description: 'One-pot fragrant rice cooked with whole spices, mixed vegetables and ghee — quicker than biryani and just as satisfying.',
    image: wiki('Pulao Vegetable Methi India.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 20, servings: 3, difficulty: 'Easy', tags: ['rice', 'one pot', 'mild'],
    ingredients: [
      { name: 'Basmati rice, soaked', quantity: '1.5', unit: 'cups' },
      { name: 'Mixed vegetables, chopped', quantity: '1', unit: 'cup' },
      { name: 'Onion, sliced', quantity: '1', unit: 'medium' },
      { name: 'Whole spices (bay leaf, cardamom, cinnamon, cloves)', quantity: '1', unit: 'tsp' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tsp' },
      { name: 'Ghee or oil', quantity: '2', unit: 'tbsp' },
      { name: 'Mint leaves', quantity: 'a few', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Heat ghee and fry whole spices until fragrant.',
      'Sauté sliced onion until golden, then add ginger-garlic paste and vegetables.',
      'Cook vegetables for 3 minutes, then add drained rice and stir gently.',
      'Pour in 2.5 cups hot water with salt and mint.',
      'Cover and cook on low heat until the rice is done, about 12 minutes.',
      'Rest 5 minutes, fluff with a fork and serve with raita.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-21', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_20', name: 'Chicken Curry',
    description: 'A homestyle chicken curry with a deep onion-tomato base, whole spices and slow simmering — the kind grandma makes.',
    image: wiki('Chicken Curry 5.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Non-Vegetarian',
    prepTime: 20, cookTime: 40, servings: 4, difficulty: 'Medium', tags: ['chicken', 'curry', 'homestyle'],
    ingredients: [
      { name: 'Chicken, curry-cut', quantity: '750', unit: 'g' },
      { name: 'Onions, thinly sliced', quantity: '3', unit: 'medium' },
      { name: 'Tomatoes, pureed', quantity: '3', unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: '2', unit: 'tbsp' },
      { name: 'Turmeric, red chilli & coriander powder', quantity: '1', unit: 'tsp each' },
      { name: 'Garam masala', quantity: '1', unit: 'tsp' },
      { name: 'Whole spices (bay leaf, cardamom, cinnamon)', quantity: '1', unit: 'tsp' },
      { name: 'Oil & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Marinate chicken with turmeric, chilli powder and salt for 30 minutes.',
      'Brown onions in oil with whole spices until deeply golden.',
      'Add ginger-garlic paste and cook 2 minutes, then the tomato puree.',
      'Cook until the oil separates, then add the chicken and seal on high heat.',
      'Add hot water to just cover and simmer 25 minutes until tender.',
      'Finish with garam masala and coriander; serve with rice or roti.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-23', updatedAt: null, isSample: true
  });

  /* ============ SNACKS (21-27) ============ */
  add({
    id: 'recipe_21', name: 'Samosa',
    description: 'Flaky triangular pastries stuffed with spiced potato-pea filling, fried until blistered and golden — Indias favourite tea-time snack.',
    image: wiki('Samosa fried.JPG'),
    cuisine: 'Indian', category: 'Snacks', dietaryPreference: 'Vegan',
    prepTime: 40, cookTime: 30, servings: 6, difficulty: 'Medium', tags: ['fried', 'tea time', 'street food'],
    ingredients: [
      { name: 'All-purpose flour (maida)', quantity: '2', unit: 'cups' },
      { name: 'Oil or ghee (for dough)', quantity: '4', unit: 'tbsp' },
      { name: 'Potatoes, boiled and cubed', quantity: '3', unit: 'medium' },
      { name: 'Green peas', quantity: '1/2', unit: 'cup' },
      { name: 'Cumin, coriander & garam masala', quantity: '1', unit: 'tsp each' },
      { name: 'Ginger & green chillies, chopped', quantity: '1', unit: 'tbsp' },
      { name: 'Ajwain (carom seeds)', quantity: '1/2', unit: 'tsp' },
      { name: 'Oil for deep frying', quantity: 'as needed', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Rub oil and ajwain into the flour until crumbly; add water gradually and knead a stiff dough. Rest 30 minutes.',
      'Sauté ginger and chillies, then add potatoes, peas, spice powders and salt; cook 5 minutes and cool.',
      'Roll dough into ovals, cut in half and form cones.',
      'Fill each cone with the potato masala and seal the edge with water.',
      'Deep fry on low-medium heat until golden and crisp.',
      'Serve hot with tamarind and mint chutneys.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-09', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_22', name: 'Aloo Tikki',
    description: 'Crisp potato patties with a molten spiced-lentil centre, shallow-fried and served with chutneys — the heart of any chaat platter.',
    image: wiki('Aloo_tikki.jpg'),
    cuisine: 'Indian', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 20, servings: 4, difficulty: 'Easy', tags: ['chaat', 'fried', 'street food'],
    ingredients: [
      { name: 'Potatoes, boiled', quantity: '4', unit: 'medium' },
      { name: 'Bread slices, soaked and squeezed', quantity: '2', unit: 'nos' },
      { name: 'Ginger & green chillies, chopped', quantity: '1', unit: 'tbsp' },
      { name: 'Coriander leaves', quantity: '2', unit: 'tbsp' },
      { name: 'Red chilli powder & chaat masala', quantity: '1', unit: 'tsp each' },
      { name: 'Cornflour', quantity: '2', unit: 'tbsp' },
      { name: 'Oil for shallow frying', quantity: 'as needed', unit: '' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Mash potatoes until completely smooth with no lumps.',
      'Mix in bread, ginger, chillies, coriander, spices, salt and cornflour.',
      'Shape into thick round patties and chill for 15 minutes to firm up.',
      'Shallow fry on medium heat until deep golden on both sides.',
      'Serve hot with tamarind chutney, mint chutney and a sprinkle of chaat masala.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-24', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_23', name: 'Vegetable Spring Rolls',
    description: 'Crackly golden rolls packed with a crunchy cabbage-carrot stir fry — baked or fried, perfect for party platters.',
    image: wiki('Golden Vegetable Spring Rolls Served with Dipping Sauce.jpg'),
    cuisine: 'Chinese', category: 'Snacks', dietaryPreference: 'Vegan',
    prepTime: 25, cookTime: 20, servings: 4, difficulty: 'Medium', tags: ['party', 'crispy', 'starter'],
    ingredients: [
      { name: 'Spring roll sheets', quantity: '10', unit: 'nos' },
      { name: 'Cabbage, shredded', quantity: '1', unit: 'cup' },
      { name: 'Carrot & capsicum, julienned', quantity: '1', unit: 'cup' },
      { name: 'Spring onions, chopped', quantity: '3', unit: 'nos' },
      { name: 'Garlic, minced', quantity: '3', unit: 'cloves' },
      { name: 'Soy sauce', quantity: '1', unit: 'tbsp' },
      { name: 'Vinegar & white pepper', quantity: '1', unit: 'tsp each' },
      { name: 'Cornflour paste for sealing', quantity: '2', unit: 'tbsp' },
      { name: 'Oil & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Stir-fry garlic, then all vegetables on high heat for 2-3 minutes — they must stay crunchy.',
      'Season with soy sauce, vinegar, white pepper and salt; cool completely.',
      'Place 2 tbsp filling on a sheet, fold the sides and roll tightly, sealing with cornflour paste.',
      'Deep fry at 180°C until golden, or brush with oil and bake at 200°C for 20 minutes.',
      'Cut diagonally and serve hot with sweet chilli sauce.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-26', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_24', name: 'French Fries',
    description: 'Double-fried potato batons with a shattering crust and fluffy centre, finished with salt — impossible to eat just one.',
    image: img('photo-1573080496219-bb080dd4f877'),
    cuisine: 'American', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 15, servings: 3, difficulty: 'Easy', tags: ['fried', 'kids', 'snack'],
    ingredients: [
      { name: 'Large potatoes', quantity: '3', unit: 'nos' },
      { name: 'Cold water', quantity: '4', unit: 'cups' },
      { name: 'Oil for frying', quantity: 'as needed', unit: '' },
      { name: 'Salt & black pepper', quantity: 'to taste', unit: '' },
      { name: 'Ketchup to serve', quantity: '', unit: '' }
    ],
    instructions: [
      'Peel potatoes and cut into even 1 cm batons.',
      'Soak in cold water for 30 minutes to remove excess starch; drain and pat very dry.',
      'First fry at 160°C for 5-6 minutes until soft but pale; drain.',
      'Raise oil to 190°C and fry again for 2-3 minutes until deeply golden.',
      'Drain on a rack, season generously with salt while hot.',
      'Serve immediately with ketchup or mayo.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-28', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_25', name: 'Masala Corn',
    description: 'Sweet corn kernels tossed in butter, chaat masala and lime — a five-minute street-style cup that beats any packet of chips.',
    image: wiki('Masala corn by be hungry.jpg'),
    cuisine: 'Indian', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 5, cookTime: 5, servings: 2, difficulty: 'Easy', tags: ['quick', 'street food', '5 minute'],
    ingredients: [
      { name: 'Sweet corn kernels (fresh or frozen)', quantity: '2', unit: 'cups' },
      { name: 'Butter', quantity: '2', unit: 'tbsp' },
      { name: 'Chaat masala', quantity: '1', unit: 'tsp' },
      { name: 'Red chilli powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Lime juice', quantity: '1', unit: 'tbsp' },
      { name: 'Coriander leaves', quantity: '1', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Boil or steam the corn kernels for 3-4 minutes until tender; drain well.',
      'Melt butter in a pan and add the hot corn.',
      'Toss with chaat masala, chilli powder and salt.',
      'Finish with lime juice and coriander; serve warm in cups.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-02', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_26', name: 'Paneer Pakora',
    description: 'Thick gram-flour batter hugging soft paneer slices, fried until lacy and crisp — monsoon evening perfection with mint chutney.',
    image: wiki('Pakoras in Jaipur.jpg'),
    cuisine: 'Indian', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 15, servings: 3, difficulty: 'Easy', tags: ['fried', 'monsoon', 'tea time'],
    ingredients: [
      { name: 'Paneer, thick slices', quantity: '200', unit: 'g' },
      { name: 'Gram flour (besan)', quantity: '1', unit: 'cup' },
      { name: 'Rice flour (for crispness)', quantity: '2', unit: 'tbsp' },
      { name: 'Red chilli & turmeric powder', quantity: '1/2', unit: 'tsp each' },
      { name: 'Ajwain (carom seeds)', quantity: '1/2', unit: 'tsp' },
      { name: 'Ginger paste', quantity: '1', unit: 'tsp' },
      { name: 'Water', quantity: '3/4', unit: 'cup' },
      { name: 'Oil for frying & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Whisk besan, rice flour, spices, ginger, salt and water into a smooth, thick batter.',
      'Rest the batter for 10 minutes to lighten it.',
      'Heat oil to 175°C — a drop of batter should sizzle and rise.',
      'Dip paneer slices in the batter and fry 3-4 at a time until golden.',
      'Drain on paper towels and serve hot with mint chutney.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-04', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_27', name: 'Bruschetta',
    description: 'Toasted garlic baguette slices piled with juicy marinated tomatoes and basil — an Italian classic that takes ten minutes.',
    image: img('photo-1572695157366-5e585ab2b69f'),
    cuisine: 'Italian', category: 'Snacks', dietaryPreference: 'Vegan',
    prepTime: 10, cookTime: 8, servings: 4, difficulty: 'Easy', tags: ['italian', 'starter', 'no cook topping'],
    ingredients: [
      { name: 'Baguette, sliced diagonally', quantity: '1', unit: 'nos' },
      { name: 'Ripe tomatoes, diced', quantity: '3', unit: 'medium' },
      { name: 'Garlic cloves, halved', quantity: '2', unit: 'nos' },
      { name: 'Fresh basil, torn', quantity: '6', unit: 'leaves' },
      { name: 'Olive oil (extra virgin)', quantity: '3', unit: 'tbsp' },
      { name: 'Balsamic vinegar', quantity: '1', unit: 'tsp' },
      { name: 'Salt & black pepper', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Mix tomatoes, basil, olive oil, balsamic, salt and pepper; rest for 10 minutes.',
      'Toast baguette slices at 200°C for 5-6 minutes until crisp.',
      'Rub each hot toast with the cut side of garlic.',
      'Spoon the tomato mixture on top just before serving.',
      'Drizzle with a little more olive oil and serve immediately.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-06', updatedAt: null, isSample: true
  });

  /* ============ ITALIAN (28-34) ============ */
  add({
    id: 'recipe_28', name: 'Margherita Pizza',
    description: 'The Italian classic: thin crust, San Marzano-style tomato sauce, fresh mozzarella and basil leaves, baked until blistered.',
    image: img('photo-1604382354936-07c5d9983bd3'),
    cuisine: 'Italian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 30, cookTime: 15, servings: 2, difficulty: 'Medium', tags: ['pizza', 'baked', 'classic'],
    ingredients: [
      { name: 'Pizza dough', quantity: '300', unit: 'g' },
      { name: 'Tomato sauce / passata', quantity: '1/2', unit: 'cup' },
      { name: 'Fresh mozzarella, torn', quantity: '150', unit: 'g' },
      { name: 'Fresh basil leaves', quantity: '8-10', unit: 'leaves' },
      { name: 'Olive oil', quantity: '1', unit: 'tbsp' },
      { name: 'Oregano & salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Preheat oven to the highest setting (250°C) with a tray or stone inside.',
      'Stretch the dough into a thin 10-inch round.',
      'Spread tomato sauce, scatter mozzarella and drizzle olive oil.',
      'Bake for 10-12 minutes until the crust is golden and cheese is bubbling.',
      'Top with fresh basil, slice and serve hot.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-18', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_29', name: 'Pasta Alfredo',
    description: 'Fettuccine tossed in a rich sauce of butter, cream and freshly grated parmesan, with a crack of black pepper. Italian comfort food at its best.',
    image: img('photo-1608219992759-8d74ed8d76eb'),
    cuisine: 'Italian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 20, servings: 2, difficulty: 'Easy', tags: ['pasta', 'creamy', 'italian'],
    ingredients: [
      { name: 'Fettuccine pasta', quantity: '200', unit: 'g' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Fresh cream', quantity: '1', unit: 'cup' },
      { name: 'Parmesan cheese, grated', quantity: '1', unit: 'cup' },
      { name: 'Garlic, minced', quantity: '3', unit: 'cloves' },
      { name: 'Black pepper', quantity: '1/2', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Boil pasta in salted water until al dente; reserve 1/2 cup pasta water.',
      'Melt butter and sauté minced garlic until fragrant.',
      'Pour in cream and simmer gently for 3-4 minutes.',
      'Add parmesan and pepper; stir until melted into a smooth sauce.',
      'Toss in the pasta with a splash of pasta water until glossy.',
      'Serve immediately with extra parmesan on top.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-15', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_30', name: 'Arrabbiata Pasta',
    description: 'Pasta in a fiery tomato-garlic sauce with chilli flakes and olive oil — bold, spicy and ready in twenty minutes.',
    image: wiki('Penne Arrabbiata.jpg'),
    cuisine: 'Italian', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 10, cookTime: 20, servings: 2, difficulty: 'Easy', tags: ['pasta', 'spicy', 'tomato'],
    ingredients: [
      { name: 'Penne pasta', quantity: '200', unit: 'g' },
      { name: 'Tomatoes, chopped or passata', quantity: '2', unit: 'cups' },
      { name: 'Garlic, sliced', quantity: '4', unit: 'cloves' },
      { name: 'Red chilli flakes', quantity: '1', unit: 'tsp' },
      { name: 'Olive oil', quantity: '3', unit: 'tbsp' },
      { name: 'Parsley or basil', quantity: 'a few', unit: 'leaves' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Boil penne in salted water until al dente; reserve pasta water.',
      'Warm olive oil with sliced garlic and chilli flakes until the garlic turns golden.',
      'Add tomatoes, season with salt and simmer 10-12 minutes until thickened.',
      'Toss the pasta into the sauce with a splash of pasta water.',
      'Serve with torn herbs and a drizzle of raw olive oil.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-20', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_31', name: 'Pesto Pasta',
    description: 'Basil-pine nut pesto folded through hot spaghetti with parmesan — bright, herby and devastatingly simple.',
    image: img('photo-1473093295043-cdd812d0e601'),
    cuisine: 'Italian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 15, servings: 2, difficulty: 'Easy', tags: ['pasta', 'basil', 'herby'],
    ingredients: [
      { name: 'Spaghetti', quantity: '200', unit: 'g' },
      { name: 'Fresh basil leaves', quantity: '2', unit: 'cups' },
      { name: 'Pine nuts (or walnuts)', quantity: '1/4', unit: 'cup' },
      { name: 'Parmesan, grated', quantity: '1/2', unit: 'cup' },
      { name: 'Garlic cloves', quantity: '2', unit: 'nos' },
      { name: 'Olive oil', quantity: '1/2', unit: 'cup' },
      { name: 'Salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Toast pine nuts in a dry pan until golden and fragrant.',
      'Blend basil, garlic, nuts, parmesan and salt; stream in olive oil until smooth.',
      'Cook spaghetti until al dente and reserve some pasta water.',
      'Toss the hot pasta with pesto and a little pasta water to coat silkily.',
      'Top with extra parmesan and pine nuts and serve.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-22', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_32', name: 'Lasagna',
    description: 'Layers of pasta sheets, slow-cooked bolognese-style sauce and creamy béchamel baked under a golden cheese blanket — the showstopper.',
    image: img('photo-1619895092538-128341789043'),
    cuisine: 'Italian', category: 'Dinner', dietaryPreference: 'Non-Vegetarian',
    prepTime: 40, cookTime: 45, servings: 6, difficulty: 'Hard', tags: ['baked', 'cheese', 'special'],
    ingredients: [
      { name: 'Lasagna sheets', quantity: '9', unit: 'nos' },
      { name: 'Minced chicken or beef', quantity: '400', unit: 'g' },
      { name: 'Tomato passata', quantity: '2', unit: 'cups' },
      { name: 'Onion & garlic, chopped', quantity: '1 each', unit: '' },
      { name: 'Butter, flour & milk (for béchamel)', quantity: '2 tbsp + 2 tbsp + 2 cups', unit: '' },
      { name: 'Mozzarella, grated', quantity: '2', unit: 'cups' },
      { name: 'Parmesan, grated', quantity: '1/2', unit: 'cup' },
      { name: 'Italian herbs & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Brown the mince with onion and garlic; add passata and herbs and simmer 20 minutes.',
      'Make béchamel: melt butter, whisk in flour, then gradually whisk in milk until thick.',
      'Cook lasagna sheets until just pliable (or use no-boil sheets).',
      'Layer sauce, sheets, béchamel and cheese; repeat three times.',
      'Finish with mozzarella and parmesan on top.',
      'Bake at 180°C for 35-40 minutes until bubbling and golden; rest 10 minutes before slicing.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-29', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_33', name: 'Garlic Bread',
    description: 'Crusty baguette halves loaded with garlic-herb butter and mozzarella, toasted until the edges shatter — the perfect pasta side.',
    image: img('photo-1619535860434-ba1d8fa12536'),
    cuisine: 'Italian', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 12, servings: 4, difficulty: 'Easy', tags: ['baked', 'garlic', 'side'],
    ingredients: [
      { name: 'Baguette or French loaf', quantity: '1', unit: 'nos' },
      { name: 'Butter, softened', quantity: '100', unit: 'g' },
      { name: 'Garlic, finely minced', quantity: '6', unit: 'cloves' },
      { name: 'Parsley or coriander, chopped', quantity: '2', unit: 'tbsp' },
      { name: 'Mozzarella, grated (optional)', quantity: '1/2', unit: 'cup' },
      { name: 'Chilli flakes & salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Mix softened butter, garlic, herbs, salt and chilli flakes into a paste.',
      'Cut the loaf in half lengthwise and spread the butter generously.',
      'Sprinkle mozzarella on top if using.',
      'Bake at 200°C for 10-12 minutes until golden and bubbling.',
      'Slice and serve hot with pasta or soup.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-07', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_34', name: 'Mushroom Pasta',
    description: 'Earthy mushrooms seared deep and folded into a garlicky white-wine cream sauce with thyme — elegant weeknight pasta.',
    image: wiki('Creamy Mushroom Pasta.jpg'),
    cuisine: 'Italian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 20, servings: 2, difficulty: 'Easy', tags: ['mushroom', 'creamy', 'weeknight'],
    ingredients: [
      { name: 'Pasta (fettuccine or penne)', quantity: '200', unit: 'g' },
      { name: 'Mushrooms, sliced', quantity: '300', unit: 'g' },
      { name: 'Garlic, minced', quantity: '4', unit: 'cloves' },
      { name: 'Fresh cream', quantity: '3/4', unit: 'cup' },
      { name: 'Parmesan, grated', quantity: '1/2', unit: 'cup' },
      { name: 'Butter', quantity: '2', unit: 'tbsp' },
      { name: 'Thyme (fresh or dried)', quantity: '1', unit: 'tsp' },
      { name: 'Salt & pepper', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Cook pasta in salted water; reserve a cup of pasta water.',
      'Sear mushrooms in hot butter without stirring for 3 minutes to brown, then add garlic and thyme.',
      'Pour in cream and simmer 3-4 minutes; add parmesan.',
      'Toss in pasta with splashes of pasta water until glossy.',
      'Season and serve with cracked pepper and herbs.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-09', updatedAt: null, isSample: true
  });

  /* ============ CHINESE (35-38) ============ */
  add({
    id: 'recipe_35', name: 'Vegetable Fried Rice',
    description: 'Wok-tossed rice with crunchy vegetables, soy sauce and a dash of sesame oil — quick, high-heat Chinese street-style fried rice.',
    image: img('photo-1512058564366-18510be2db19'),
    cuisine: 'Chinese', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 15, cookTime: 15, servings: 3, difficulty: 'Easy', tags: ['rice', 'wok', 'quick'],
    ingredients: [
      { name: 'Cooked rice, cooled', quantity: '3', unit: 'cups' },
      { name: 'Carrot, beans & capsicum, chopped', quantity: '1.5', unit: 'cups' },
      { name: 'Spring onions, chopped', quantity: '4', unit: 'nos' },
      { name: 'Garlic, minced', quantity: '4', unit: 'cloves' },
      { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Vinegar', quantity: '1', unit: 'tsp' },
      { name: 'Sesame oil', quantity: '1', unit: 'tbsp' },
      { name: 'White pepper & salt', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Heat oil in a wok on high heat; sauté garlic and spring onion whites.',
      'Add chopped vegetables and stir-fry for 3-4 minutes on high heat.',
      'Add the cooled rice and toss continuously.',
      'Season with soy sauce, vinegar, white pepper and salt.',
      'Finish with spring onion greens and a drizzle of sesame oil; serve hot.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-20', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_36', name: 'Chicken Fried Rice',
    description: 'Street-style wok rice with seared chicken, egg ribbons and smoky soy — better than the takeaway on your street.',
    image: wiki('Fried rice with chicken (17234644521).jpg'),
    cuisine: 'Chinese', category: 'Dinner', dietaryPreference: 'Non-Vegetarian',
    prepTime: 15, cookTime: 20, servings: 3, difficulty: 'Easy', tags: ['rice', 'chicken', 'wok'],
    ingredients: [
      { name: 'Cooked rice, cooled', quantity: '3', unit: 'cups' },
      { name: 'Chicken breast, small cubes', quantity: '250', unit: 'g' },
      { name: 'Eggs, beaten', quantity: '2', unit: 'nos' },
      { name: 'Spring onions & garlic', quantity: '1 bunch + 4 cloves', unit: '' },
      { name: 'Soy sauce', quantity: '2.5', unit: 'tbsp' },
      { name: 'Vinegar & white pepper', quantity: '1 tsp + 1/2 tsp', unit: '' },
      { name: 'Oil & salt', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Marinate chicken with 1 tbsp soy sauce and pepper for 15 minutes.',
      'Sear the chicken in a very hot wok until cooked through; remove.',
      'Scramble the eggs in the same wok and set aside.',
      'Stir-fry garlic and spring onion whites, then add rice and toss on high heat.',
      'Return chicken and egg, season with remaining soy, vinegar and salt.',
      'Finish with greens and serve piping hot.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-02-26', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_37', name: 'Hakka Noodles',
    description: 'Springy noodles tossed with julienned vegetables on screaming-high heat — Indo-Chinese comfort at its smoky best.',
    image: wiki('Chowmein.jpg'),
    cuisine: 'Chinese', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 15, cookTime: 15, servings: 2, difficulty: 'Easy', tags: ['noodles', 'indo-chinese', 'wok'],
    ingredients: [
      { name: 'Hakka / chow mein noodles', quantity: '200', unit: 'g' },
      { name: 'Carrot, capsicum & cabbage, julienned', quantity: '2', unit: 'cups' },
      { name: 'Spring onions', quantity: '4', unit: 'nos' },
      { name: 'Garlic, minced', quantity: '4', unit: 'cloves' },
      { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Green chilli sauce', quantity: '1', unit: 'tsp' },
      { name: 'Vinegar', quantity: '1', unit: 'tsp' },
      { name: 'Oil & white pepper', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Boil noodles until just cooked, rinse in cold water and toss with a little oil.',
      'Stir-fry garlic and vegetables on the highest heat for 2 minutes only.',
      'Add the noodles, soy, chilli sauce and vinegar.',
      'Toss continuously for 2 minutes so the noodles char slightly.',
      'Add spring onion greens, give one final toss and serve immediately.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-03', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_38', name: 'Gobi Manchurian',
    description: 'Crisp cauliflower florets glazed in a sticky, tangy-sweet Manchurian sauce with garlic and spring onion — the party legend.',
    image: wiki('Gobi_Manchurian.jpg'),
    cuisine: 'Chinese', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 20, servings: 3, difficulty: 'Medium', tags: ['indo-chinese', 'party', 'crispy'],
    ingredients: [
      { name: 'Cauliflower, florets', quantity: '1', unit: 'medium' },
      { name: 'Cornflour & maida', quantity: '4 tbsp + 3 tbsp', unit: '' },
      { name: 'Garlic & ginger, minced', quantity: '2', unit: 'tbsp' },
      { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Red chilli sauce', quantity: '1', unit: 'tbsp' },
      { name: 'Tomato sauce', quantity: '1', unit: 'tbsp' },
      { name: 'Vinegar & sugar', quantity: '1 tsp + 1 tsp', unit: '' },
      { name: 'Spring onions & oil', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Whisk cornflour, maida, salt and water into a thick batter; coat the florets.',
      'Deep fry until golden and crisp; drain.',
      'Sauté garlic, ginger and spring onion whites in a little oil.',
      'Add soy, chilli sauce, tomato sauce, vinegar, sugar and 1/4 cup water; simmer until glossy.',
      'Toss the fried florets through the sauce to coat, garnish with greens and serve immediately.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-05', updatedAt: null, isSample: true
  });

  /* ============ MEXICAN (39-43) ============ */
  add({
    id: 'recipe_39', name: 'Tacos',
    description: 'Crisp corn tortillas loaded with spiced bean filling, fresh salsa, crunchy lettuce, cheese and a squeeze of lime.',
    image: img('photo-1551504734-5ee1c4a1479b'),
    cuisine: 'Mexican', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 15, servings: 4, difficulty: 'Easy', tags: ['mexican', 'street food', 'party'],
    ingredients: [
      { name: 'Taco shells or tortillas', quantity: '8', unit: 'nos' },
      { name: 'Kidney beans or rajma, cooked', quantity: '1', unit: 'cup' },
      { name: 'Onion & tomato, finely chopped', quantity: '1 each', unit: '' },
      { name: 'Taco seasoning', quantity: '2', unit: 'tbsp' },
      { name: 'Lettuce, shredded', quantity: '1', unit: 'cup' },
      { name: 'Cheese, grated', quantity: '1/2', unit: 'cup' },
      { name: 'Sour cream & salsa', quantity: 'as needed', unit: '' },
      { name: 'Lime wedges', quantity: '4', unit: 'nos' }
    ],
    instructions: [
      'Warm taco shells in the oven for 3-4 minutes.',
      'Sauté onion, add beans and taco seasoning; mash lightly and cook 5 minutes.',
      'Fill each shell with the warm bean mixture.',
      'Top with lettuce, onion, tomato, cheese and salsa.',
      'Add a spoon of sour cream, squeeze lime and serve immediately.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-02-22', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_40', name: 'Burrito Bowl',
    description: 'Deconstructed burrito in a bowl: cilantro-lime rice, spiced beans, corn salsa, guacamole and a chipotle-style drizzle.',
    image: wiki('Burrito_Bowl.jpg'),
    cuisine: 'Mexican', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 20, cookTime: 20, servings: 2, difficulty: 'Easy', tags: ['bowl', 'healthy-ish', 'meal prep'],
    ingredients: [
      { name: 'Cooked rice, warm', quantity: '2', unit: 'cups' },
      { name: 'Black beans or rajma', quantity: '1', unit: 'cup' },
      { name: 'Sweet corn kernels', quantity: '1/2', unit: 'cup' },
      { name: 'Avocado, mashed', quantity: '1', unit: 'nos' },
      { name: 'Tomato & onion salsa', quantity: '1', unit: 'cup' },
      { name: 'Lime & coriander (for rice)', quantity: '1 + 2 tbsp', unit: '' },
      { name: 'Cumin, chilli powder & salt', quantity: '1 tsp each', unit: '' },
      { name: 'Hot sauce', quantity: 'to serve', unit: '' }
    ],
    instructions: [
      'Toss warm rice with lime juice, chopped coriander and salt.',
      'Warm beans with cumin, chilli powder and a splash of water; mash slightly.',
      'Mix corn with chopped tomato, onion and lime for the salsa.',
      'Mash avocado with salt and a squeeze of lime for quick guacamole.',
      'Build the bowl: rice, beans, corn salsa, guacamole.',
      'Drizzle with hot sauce and serve immediately.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-08', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_41', name: 'Nachos',
    description: 'Loaded tortilla chips under a storm of molten cheese, jalapeños, salsa and sour cream — the ultimate sharing snack.',
    image: img('photo-1513456852971-30c0b8199d4d'),
    cuisine: 'Mexican', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 10, servings: 3, difficulty: 'Easy', tags: ['cheese', 'party', 'sharing'],
    ingredients: [
      { name: 'Tortilla chips', quantity: '200', unit: 'g' },
      { name: 'Cheddar or processed cheese, grated', quantity: '1.5', unit: 'cups' },
      { name: 'Jalapeño slices', quantity: '1/4', unit: 'cup' },
      { name: 'Salsa', quantity: '1/2', unit: 'cup' },
      { name: 'Sour cream', quantity: '1/4', unit: 'cup' },
      { name: 'Onion & tomato, diced', quantity: '1/2 each', unit: '' },
      { name: 'Coriander to garnish', quantity: 'a few', unit: 'leaves' }
    ],
    instructions: [
      'Preheat the oven to 200°C.',
      'Spread half the chips on a tray and top with a layer of cheese, then repeat.',
      'Scatter jalapeños, onion and tomato.',
      'Bake 5-7 minutes until the cheese is fully melted.',
      'Dollop salsa and sour cream, garnish with coriander and serve straight from the tray.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-10', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_42', name: 'Quesadilla',
    description: 'Golden tortillas oozing with cheese, peppers and beans, crisped in a pan and cut into dippable wedges.',
    image: wiki('Quesadilla.jpg'),
    cuisine: 'Mexican', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 15, servings: 2, difficulty: 'Easy', tags: ['cheese', 'quick', 'pan'],
    ingredients: [
      { name: 'Flour tortillas', quantity: '4', unit: 'nos' },
      { name: 'Cheese, grated', quantity: '1.5', unit: 'cups' },
      { name: 'Capsicum & onion, sliced', quantity: '1', unit: 'cup' },
      { name: 'Cooked beans (optional)', quantity: '1/2', unit: 'cup' },
      { name: 'Butter', quantity: '2', unit: 'tbsp' },
      { name: 'Salsa to dip', quantity: '', unit: '' },
      { name: 'Salt & pepper', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Sauté capsicum and onion until slightly charred; season.',
      'Sprinkle cheese over one tortilla, add vegetables and beans, then more cheese.',
      'Top with a second tortilla to close.',
      'Cook on a buttered pan over medium heat until golden, then flip carefully.',
      'Cut into wedges and serve hot with salsa and sour cream.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-11', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_43', name: 'Mexican Rice',
    description: 'Fluffy tomato rice studded with corn and peas, simmered with cumin and chipotle-style heat — the perfect burrito-bowl base.',
    image: wiki('Mexican rice and beans.jpg'),
    cuisine: 'Mexican', category: 'Dinner', dietaryPreference: 'Vegan',
    prepTime: 10, cookTime: 25, servings: 3, difficulty: 'Easy', tags: ['rice', 'tomato', 'side'],
    ingredients: [
      { name: 'Long grain rice, rinsed', quantity: '1.5', unit: 'cups' },
      { name: 'Tomatoes, blended', quantity: '3', unit: 'medium' },
      { name: 'Onion, chopped', quantity: '1', unit: 'small' },
      { name: 'Garlic, minced', quantity: '3', unit: 'cloves' },
      { name: 'Sweet corn & peas', quantity: '1/2', unit: 'cup' },
      { name: 'Cumin powder', quantity: '1', unit: 'tsp' },
      { name: 'Chilli powder', quantity: '1', unit: 'tsp' },
      { name: 'Oil, vegetable stock & salt', quantity: '2 tbsp + 3 cups', unit: '' }
    ],
    instructions: [
      'Toast the dry rice in oil until lightly golden.',
      'Sauté onion and garlic, then add blended tomato and spices.',
      'Cook until the tomato darkens and thickens.',
      'Add stock, corn, peas and salt; stir once.',
      'Cover and simmer 18-20 minutes until the rice is tender.',
      'Rest 5 minutes, fluff with a fork and serve with lime.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-12', updatedAt: null, isSample: true
  });

  /* ============ HEALTHY (44-50) ============ */
  add({
    id: 'recipe_44', name: 'Caesar Salad',
    description: 'Crisp romaine leaves coated in creamy caesar dressing with golden homemade croutons and parmesan shavings — a classic American side salad.',
    image: img('photo-1546793665-c74683f339c1'),
    cuisine: 'American', category: 'Healthy', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 10, servings: 2, difficulty: 'Easy', tags: ['salad', 'healthy', 'low carb'],
    ingredients: [
      { name: 'Romaine lettuce, chopped', quantity: '1', unit: 'large head' },
      { name: 'Bread cubes (for croutons)', quantity: '2', unit: 'cups' },
      { name: 'Parmesan cheese, grated', quantity: '1/2', unit: 'cup' },
      { name: 'Mayonnaise', quantity: '3', unit: 'tbsp' },
      { name: 'Lemon juice', quantity: '1', unit: 'tbsp' },
      { name: 'Garlic, minced', quantity: '2', unit: 'cloves' },
      { name: 'Olive oil, salt & pepper', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Toss bread cubes with olive oil and bake at 180°C until golden.',
      'Whisk mayonnaise, lemon juice, garlic, salt and pepper into a dressing.',
      'Toss lettuce with the dressing until every leaf is coated.',
      'Top with croutons and parmesan.',
      'Serve immediately while the croutons are crunchy.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-02', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_45', name: 'Greek Salad',
    description: 'Chunky cucumbers, tomatoes, olives and feta dressed in oregano-lemon olive oil — a no-cook Mediterranean classic.',
    image: img('photo-1540189549336-e6e99c3679fe'),
    cuisine: 'Italian', category: 'Healthy', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['salad', 'feta', 'no cook'],
    ingredients: [
      { name: 'Cucumber, chunked', quantity: '1', unit: 'large' },
      { name: 'Tomatoes, chunked', quantity: '3', unit: 'medium' },
      { name: 'Red onion, thinly sliced', quantity: '1/2', unit: 'nos' },
      { name: 'Feta cheese, cubed', quantity: '100', unit: 'g' },
      { name: 'Black olives', quantity: '1/4', unit: 'cup' },
      { name: 'Olive oil (extra virgin)', quantity: '3', unit: 'tbsp' },
      { name: 'Lemon juice & dried oregano', quantity: '1 tbsp + 1 tsp', unit: '' },
      { name: 'Salt & pepper', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Combine cucumber, tomatoes, onion and olives in a wide bowl.',
      'Whisk olive oil, lemon juice, oregano, salt and pepper.',
      'Pour the dressing over the vegetables and toss gently.',
      'Crown with feta cubes and a final sprinkle of oregano.',
      'Serve at room temperature with warm pita.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-13', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_46', name: 'Vegetable Soup',
    description: 'A light, warming garden vegetable soup with a tomato base — low calorie, vegan and ready in thirty minutes.',
    image: wiki('Vegetable_soup.jpg'),
    cuisine: 'American', category: 'Healthy', dietaryPreference: 'Low Calorie',
    prepTime: 10, cookTime: 20, servings: 3, difficulty: 'Easy', tags: ['soup', 'vegan', 'light'],
    ingredients: [
      { name: 'Carrot, beans & peas, chopped', quantity: '1.5', unit: 'cups' },
      { name: 'Tomato, chopped', quantity: '2', unit: 'medium' },
      { name: 'Onion, chopped', quantity: '1', unit: 'medium' },
      { name: 'Garlic, minced', quantity: '3', unit: 'cloves' },
      { name: 'Vegetable stock or water', quantity: '4', unit: 'cups' },
      { name: 'Olive oil', quantity: '1', unit: 'tbsp' },
      { name: 'Herbs (basil/oregano), salt & pepper', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Heat olive oil and sauté onion and garlic until soft.',
      'Add tomatoes and cook until mushy.',
      'Add chopped vegetables and stock; bring to a boil.',
      'Simmer 15 minutes until vegetables are tender.',
      'Season with herbs, salt and pepper; serve warm with crusty bread.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-05', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_47', name: 'Tomato Soup',
    description: 'Velvety roasted tomato soup with a hint of basil and cream — the grilled-cheese sandwiches best friend.',
    image: img('photo-1604152135912-04a022e23696'),
    cuisine: 'American', category: 'Healthy', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 25, servings: 3, difficulty: 'Easy', tags: ['soup', 'comfort', 'tomato'],
    ingredients: [
      { name: 'Ripe tomatoes, halved', quantity: '8', unit: 'nos' },
      { name: 'Garlic cloves', quantity: '5', unit: 'nos' },
      { name: 'Onion, quartered', quantity: '1', unit: 'medium' },
      { name: 'Vegetable stock', quantity: '2', unit: 'cups' },
      { name: 'Fresh basil', quantity: '8', unit: 'leaves' },
      { name: 'Cream (optional)', quantity: '2', unit: 'tbsp' },
      { name: 'Olive oil, salt & pepper', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Toss tomatoes, garlic and onion with oil and salt; roast at 200°C for 25 minutes.',
      'Squeeze the garlic out of its skins into the tray.',
      'Blend everything with stock and basil until silky.',
      'Simmer 5 minutes, adjust seasoning and stir in cream if using.',
      'Serve hot with garlic bread or grilled cheese.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-14', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_48', name: 'Quinoa Bowl',
    description: 'Protein-rich quinoa loaded with roasted chickpeas, avocado, cherry tomatoes and a lemon-tahini drizzle — meal-prep gold.',
    image: img('photo-1512621776951-a57141f2eefd'),
    cuisine: 'American', category: 'Healthy', dietaryPreference: 'High Protein',
    prepTime: 15, cookTime: 20, servings: 2, difficulty: 'Easy', tags: ['quinoa', 'meal prep', 'protein'],
    ingredients: [
      { name: 'Quinoa, rinsed', quantity: '1', unit: 'cup' },
      { name: 'Chickpeas, cooked', quantity: '1', unit: 'cup' },
      { name: 'Avocado, sliced', quantity: '1', unit: 'nos' },
      { name: 'Cherry tomatoes, halved', quantity: '1', unit: 'cup' },
      { name: 'Cucumber, diced', quantity: '1/2', unit: 'nos' },
      { name: 'Tahini (or peanut butter)', quantity: '2', unit: 'tbsp' },
      { name: 'Lemon juice & olive oil', quantity: '1 tbsp + 1 tbsp', unit: '' },
      { name: 'Smoked paprika, cumin & salt', quantity: '1 tsp each', unit: '' }
    ],
    instructions: [
      'Cook quinoa in 2 cups salted water until fluffy, about 15 minutes.',
      'Toss chickpeas with paprika, cumin, oil and salt; roast at 200°C for 20 minutes.',
      'Whisk tahini with lemon juice and water until pourable.',
      'Assemble bowls with quinoa, chickpeas, avocado, tomatoes and cucumber.',
      'Drizzle with tahini dressing and serve warm or cold.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-15', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_49', name: 'Avocado Toast',
    description: 'Crunchy sourdough under a thick layer of lemony smashed avocado, chilli flakes and sesame — the fifteen-gram-protein breakfast.',
    image: wiki('Avocado_toast.jpg'),
    cuisine: 'American', category: 'Breakfast', dietaryPreference: 'Vegan',
    prepTime: 5, cookTime: 5, servings: 1, difficulty: 'Easy', tags: ['toast', 'avocado', 'quick'],
    ingredients: [
      { name: 'Sourdough bread', quantity: '2', unit: 'slices' },
      { name: 'Ripe avocado', quantity: '1', unit: 'nos' },
      { name: 'Lemon juice', quantity: '1', unit: 'tsp' },
      { name: 'Chilli flakes', quantity: 'a pinch', unit: '' },
      { name: 'Sesame or hemp seeds', quantity: '1', unit: 'tsp' },
      { name: 'Olive oil, salt & pepper', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Toast the bread until deeply golden and crisp.',
      'Smash avocado with lemon juice, salt and pepper — keep it chunky.',
      'Pile the avocado onto the hot toast.',
      'Finish with olive oil, chilli flakes and seeds.',
      'Serve immediately before the toast softens.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-16', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_50', name: 'Grilled Vegetable Bowl',
    description: 'Smoky char-grilled zucchini, peppers and mushrooms over herbed couscous with a balsamic drizzle — sunshine in a bowl.',
    image: img('photo-1543339308-43e59d6b73a6'),
    cuisine: 'American', category: 'Healthy', dietaryPreference: 'Vegan',
    prepTime: 15, cookTime: 15, servings: 2, difficulty: 'Easy', tags: ['grilled', 'vegan', 'bowl'],
    ingredients: [
      { name: 'Zucchini, thick sliced', quantity: '1', unit: 'nos' },
      { name: 'Red & yellow peppers, quartered', quantity: '2', unit: 'nos' },
      { name: 'Mushrooms, halved', quantity: '150', unit: 'g' },
      { name: 'Couscous', quantity: '3/4', unit: 'cup' },
      { name: 'Olive oil, salt & pepper', quantity: '3 tbsp', unit: '' },
      { name: 'Balsamic vinegar', quantity: '1', unit: 'tbsp' },
      { name: 'Fresh herbs (parsley/basil)', quantity: 'a handful', unit: '' }
    ],
    instructions: [
      'Toss vegetables with olive oil, salt and pepper.',
      'Grill on high heat 3-4 minutes per side until charred and tender.',
      'Meanwhile pour boiling water over couscous, cover and rest for 5 minutes; fluff with a fork.',
      'Whisk balsamic with a spoon of olive oil for the drizzle.',
      'Serve vegetables over couscous, scatter herbs and drizzle the dressing.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-17', updatedAt: null, isSample: true
  });

  /* ============ DESSERTS (51-58) ============ */
  add({
    id: 'recipe_51', name: 'Chocolate Cake',
    description: 'A moist, rich one-bowl chocolate cake with deep cocoa flavour, perfect for birthdays with a dusting of cocoa or chocolate ganache.',
    image: img('photo-1578985545062-69928b1d9587'),
    cuisine: 'American', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 35, servings: 8, difficulty: 'Medium', tags: ['baking', 'chocolate', 'birthday'],
    ingredients: [
      { name: 'All-purpose flour', quantity: '1.5', unit: 'cups' },
      { name: 'Cocoa powder', quantity: '1/2', unit: 'cup' },
      { name: 'Sugar', quantity: '1', unit: 'cup' },
      { name: 'Baking soda', quantity: '1', unit: 'tsp' },
      { name: 'Egg', quantity: '2', unit: 'nos' },
      { name: 'Milk', quantity: '1', unit: 'cup' },
      { name: 'Oil', quantity: '1/2', unit: 'cup' },
      { name: 'Vanilla extract', quantity: '1', unit: 'tsp' },
      { name: 'Hot water', quantity: '1/2', unit: 'cup' }
    ],
    instructions: [
      'Preheat oven to 180°C and grease an 8-inch cake tin.',
      'Sift flour, cocoa, baking soda and sugar together.',
      'Whisk eggs, milk, oil and vanilla; combine with the dry mix.',
      'Add hot water last; the batter will be thin — that is the secret to moistness.',
      'Bake for 30-35 minutes until a skewer comes out clean.',
      'Cool completely before frosting or dusting with cocoa.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-02-28', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_52', name: 'Gulab Jamun',
    description: 'Melt-in-mouth milk dumplings soaked in cardamom-rose syrup — the king of Indian festival desserts.',
    image: wiki('Gulab_jamun.jpg'),
    cuisine: 'Indian', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 30, servings: 6, difficulty: 'Medium', tags: ['syrup', 'festival', 'milk'],
    ingredients: [
      { name: 'Khoya (milk solids), grated', quantity: '1.5', unit: 'cups' },
      { name: 'All-purpose flour (maida)', quantity: '3', unit: 'tbsp' },
      { name: 'Baking soda', quantity: 'a pinch', unit: '' },
      { name: 'Sugar', quantity: '2', unit: 'cups' },
      { name: 'Water', quantity: '2', unit: 'cups' },
      { name: 'Cardamom powder & rose water', quantity: '1 tsp + 1 tsp', unit: '' },
      { name: 'Ghee or oil for frying', quantity: 'as needed', unit: '' },
      { name: 'Milk, if dough is dry', quantity: '2', unit: 'tbsp' }
    ],
    instructions: [
      'Boil sugar, water, cardamom and rose water into a light syrup; keep warm.',
      'Knead khoya with maida and baking soda into a soft, smooth dough.',
      'Shape into 18-20 crack-free balls.',
      'Fry on low-medium heat until deep golden — patience here keeps them soft inside.',
      'Drain and drop straight into the warm syrup.',
      'Soak 2 hours and serve at room temperature, garnished with pistachios.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-18', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_53', name: 'Rasmalai',
    description: 'Cloud-soft chenna discs floating in creamy saffron-cardamom milk, crowned with pistachios — a chilled festive masterpiece.',
    image: wiki('Rasmalai.jpg'),
    cuisine: 'Indian', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 30, cookTime: 40, servings: 6, difficulty: 'Hard', tags: ['milk', 'saffron', 'chilled'],
    ingredients: [
      { name: 'Full-fat milk', quantity: '1.5', unit: 'litres' },
      { name: 'Lemon juice (to split milk)', quantity: '3', unit: 'tbsp' },
      { name: 'Sugar', quantity: '3/4', unit: 'cup' },
      { name: 'Saffron strands', quantity: 'a pinch', unit: '' },
      { name: 'Cardamom powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Pistachios & almonds, sliced', quantity: '2', unit: 'tbsp' },
      { name: 'Ice cubes', quantity: 'for shocking', unit: '' }
    ],
    instructions: [
      'Boil milk, split with lemon juice, strain the chenna and wash under cold water.',
      'Squeeze the chenna gently and knead until completely smooth.',
      'Shape into flat discs and boil in light sugar syrup for 12-15 minutes.',
      'In another pot reduce remaining milk with sugar, saffron and cardamom to half.',
      'Squeeze the cooled discs and soak them in the reduced milk.',
      'Chill 2 hours, garnish with nuts and serve cold.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-19', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_54', name: 'Fudgy Brownie',
    description: 'Crackly-topped, chocolate-dense brownies with a molten middle — the fudgiest square you will bake all year.',
    image: img('photo-1606313564200-e75d5e30476c'),
    cuisine: 'American', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 30, servings: 9, difficulty: 'Easy', tags: ['chocolate', 'baking', 'fudgy'],
    ingredients: [
      { name: 'Dark chocolate, chopped', quantity: '200', unit: 'g' },
      { name: 'Butter', quantity: '120', unit: 'g' },
      { name: 'Sugar', quantity: '3/4', unit: 'cup' },
      { name: 'Eggs', quantity: '2', unit: 'nos' },
      { name: 'All-purpose flour', quantity: '1/2', unit: 'cup' },
      { name: 'Cocoa powder', quantity: '1/4', unit: 'cup' },
      { name: 'Vanilla extract', quantity: '1', unit: 'tsp' },
      { name: 'Salt', quantity: 'a pinch', unit: '' }
    ],
    instructions: [
      'Melt chocolate and butter together; cool slightly.',
      'Whisk eggs and sugar until pale and thick — this creates the crackly top.',
      'Fold in the chocolate mix and vanilla.',
      'Sift in flour, cocoa and salt; fold until just combined.',
      'Bake at 170°C for 25-28 minutes — the centre should still wobble slightly.',
      'Cool fully before slicing into squares.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-20', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_55', name: 'New York Cheesecake',
    description: 'Dense, creamy baked cheesecake on a buttery biscuit base with a tangy-sweet finish — a slice of Manhattan.',
    image: img('photo-1533134242443-d4fd215305ad'),
    cuisine: 'American', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 25, cookTime: 55, servings: 8, difficulty: 'Hard', tags: ['baked', 'cream cheese', 'special'],
    ingredients: [
      { name: 'Digestive biscuits, crushed', quantity: '200', unit: 'g' },
      { name: 'Butter, melted', quantity: '100', unit: 'g' },
      { name: 'Cream cheese, room temp', quantity: '500', unit: 'g' },
      { name: 'Sugar', quantity: '150', unit: 'g' },
      { name: 'Eggs', quantity: '3', unit: 'nos' },
      { name: 'Fresh cream', quantity: '100', unit: 'ml' },
      { name: 'Vanilla extract & lemon zest', quantity: '1 tsp + 1 tsp', unit: '' }
    ],
    instructions: [
      'Mix crushed biscuits with butter; press into a lined springform and chill.',
      'Beat cream cheese and sugar until smooth — do not overmix.',
      'Add eggs one at a time, then cream, vanilla and lemon zest.',
      'Pour over the base and bake in a water bath at 160°C for 50-55 minutes.',
      'Turn off the oven and let it cool inside for 1 hour to prevent cracks.',
      'Chill overnight and serve with berry compote.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-21', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_56', name: 'Fruit Custard',
    description: 'Chilled vanilla custard folded with seasonal fruit — the nostalgic Indian dessert that ends every family dinner.',
    image: img('photo-1488477181946-6428a0291777'),
    cuisine: 'Indian', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 15, servings: 4, difficulty: 'Easy', tags: ['chilled', 'fruit', 'nostalgic'],
    ingredients: [
      { name: 'Milk', quantity: '2.5', unit: 'cups' },
      { name: 'Custard powder (vanilla)', quantity: '3', unit: 'tbsp' },
      { name: 'Sugar', quantity: '4', unit: 'tbsp' },
      { name: 'Apple, banana, grapes & pomegranate', quantity: '2', unit: 'cups' },
      { name: 'Cold milk (for slurry)', quantity: '1/4', unit: 'cup' }
    ],
    instructions: [
      'Boil milk with sugar, stirring to dissolve.',
      'Mix custard powder with cold milk into a smooth slurry.',
      'Pour the slurry into the hot milk, whisking constantly.',
      'Simmer 3-4 minutes until the custard coats the spoon.',
      'Cool completely, then chill for 1 hour.',
      'Fold in chopped fruit just before serving so it stays fresh.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-22', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_57', name: 'Mango Pudding',
    description: 'Silky Hong Kong-style mango pudding set with fresh mango puree and evaporated milk — two ingredients away from a tropical holiday.',
    image: wiki('Mango pudding by avlxyz in Melbourne.jpg'),
    cuisine: 'Chinese', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 5, servings: 4, difficulty: 'Easy', tags: ['mango', 'no bake', 'chilled'],
    ingredients: [
      { name: 'Ripe mango, cubed', quantity: '2', unit: 'cups' },
      { name: 'Evaporated milk (or fresh cream)', quantity: '1', unit: 'cup' },
      { name: 'Gelatine powder (or china grass)', quantity: '2', unit: 'tsp' },
      { name: 'Hot water', quantity: '1/4', unit: 'cup' },
      { name: 'Sugar', quantity: '3', unit: 'tbsp' },
      { name: 'Mango cubes to top', quantity: '1/2', unit: 'cup' }
    ],
    instructions: [
      'Dissolve gelatine and sugar in hot water; stir until clear.',
      'Blend mango cubes to a smooth puree.',
      'Whisk puree, evaporated milk and the gelatine mix together.',
      'Pour into moulds and chill for 3 hours until set.',
      'Unmould and top with fresh mango cubes.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-23', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_58', name: 'Ice Cream Sundae',
    description: 'A towering sundae of vanilla scoops, warm chocolate fudge, roasted nuts and a cherry on top — assembled in five minutes.',
    image: wiki('Strawberry Ice Cream Sundae (26853326784).jpg'),
    cuisine: 'American', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 5, cookTime: 5, servings: 2, difficulty: 'Easy', tags: ['no bake', 'kids', 'chocolate'],
    ingredients: [
      { name: 'Vanilla ice cream', quantity: '4', unit: 'scoops' },
      { name: 'Dark chocolate, chopped', quantity: '100', unit: 'g' },
      { name: 'Fresh cream', quantity: '1/4', unit: 'cup' },
      { name: 'Roasted nuts, chopped', quantity: '2', unit: 'tbsp' },
      { name: 'Wafer sticks', quantity: '2', unit: 'nos' },
      { name: 'Cherries & sprinkles', quantity: 'to top', unit: '' }
    ],
    instructions: [
      'Warm the cream and stir in the chocolate until it becomes glossy fudge sauce.',
      'Place two scoops of ice cream in each serving glass.',
      'Pour warm fudge generously over the scoops.',
      'Add nuts, sprinkles and wafer sticks.',
      'Crown with a cherry and serve at once.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-24', updatedAt: null, isSample: true
  });

  /* ============ DRINKS (59-63) ============ */
  add({
    id: 'recipe_59', name: 'Mango Smoothie',
    description: 'A thick, tropical mango smoothie blended with yogurt and a touch of honey — a two-minute sunshine breakfast drink.',
    image: wiki('Fresh-mango-smoothie 01.jpg'),
    cuisine: 'Indian', category: 'Drinks', dietaryPreference: 'Gluten Free',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['drink', 'mango', 'quick'],
    ingredients: [
      { name: 'Ripe mango, cubed', quantity: '2', unit: 'cups' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Milk', quantity: '1/2', unit: 'cup' },
      { name: 'Honey', quantity: '1', unit: 'tbsp' },
      { name: 'Ice cubes', quantity: '4-5', unit: 'nos' }
    ],
    instructions: [
      'Add mango, yogurt, milk and honey to a blender.',
      'Blend until completely smooth and thick.',
      'Add ice cubes and pulse once or twice.',
      'Pour into glasses and serve chilled, topped with mango chunks.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-08', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_60', name: 'Strawberry Smoothie',
    description: 'Blushed-pink strawberries whipped with banana and yogurt — creamy, bright and secretly healthy.',
    image: wiki('Glass of strawberry smoothie (6828826294).jpg'),
    cuisine: 'American', category: 'Drinks', dietaryPreference: 'Gluten Free',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['drink', 'strawberry', 'breakfast'],
    ingredients: [
      { name: 'Strawberries (fresh or frozen)', quantity: '2', unit: 'cups' },
      { name: 'Banana, ripe', quantity: '1', unit: 'nos' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Milk', quantity: '1/2', unit: 'cup' },
      { name: 'Honey or dates', quantity: '1 tbsp / 2 nos', unit: '' }
    ],
    instructions: [
      'Hull the strawberries and chop the banana.',
      'Blend everything on high until completely smooth.',
      'Adjust sweetness and thickness with honey and milk.',
      'Pour into tall glasses and serve immediately.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-25', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_61', name: 'Cold Coffee',
    description: 'Café-style frothy cold coffee blended strong, sweet and icy — the afternoon survival drink.',
    image: img('photo-1461023058943-07fcbe16d735'),
    cuisine: 'American', category: 'Drinks', dietaryPreference: 'Vegetarian',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['coffee', 'iced', 'frothy'],
    ingredients: [
      { name: 'Chilled milk', quantity: '2', unit: 'cups' },
      { name: 'Instant coffee powder', quantity: '2', unit: 'tbsp' },
      { name: 'Sugar', quantity: '2', unit: 'tbsp' },
      { name: 'Ice cubes', quantity: '6', unit: 'nos' },
      { name: 'Vanilla ice cream (optional)', quantity: '1', unit: 'scoop' }
    ],
    instructions: [
      'Dissolve coffee and sugar in 2 tbsp warm milk.',
      'Add to a blender with chilled milk and ice cubes.',
      'Blend on high for 30 seconds until frothy and doubled.',
      'Pour into tall glasses; crown with a scoop of ice cream if desired.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-26', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_62', name: 'Chocolate Milkshake',
    description: 'Thick, diner-style chocolate milkshake made with real cocoa and a scoop of ice cream — childhood in a glass.',
    image: img('photo-1577805947697-89e18249d767'),
    cuisine: 'American', category: 'Drinks', dietaryPreference: 'Vegetarian',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['shake', 'chocolate', 'kids'],
    ingredients: [
      { name: 'Chilled milk', quantity: '2', unit: 'cups' },
      { name: 'Chocolate ice cream', quantity: '2', unit: 'scoops' },
      { name: 'Cocoa powder', quantity: '2', unit: 'tbsp' },
      { name: 'Sugar', quantity: '1', unit: 'tbsp' },
      { name: 'Chocolate shavings to top', quantity: '1', unit: 'tbsp' }
    ],
    instructions: [
      'Blend milk, ice cream, cocoa and sugar until thick.',
      'Taste and adjust the chocolate/sugar balance.',
      'Pour into chilled glasses.',
      'Top with chocolate shavings and serve with a straw.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-27', updatedAt: null, isSample: true
  });

  add({
    id: 'recipe_63', name: 'Lemon Mint Cooler',
    description: 'Sparkling lemonade muddled with fresh mint — the three-ingredient refresher that beats the worst summer heat.',
    image: img('photo-1523677011781-c91d1bbe2f9e'),
    cuisine: 'Indian', category: 'Drinks', dietaryPreference: 'Vegan',
    prepTime: 5, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['drink', 'summer', 'mint'],
    ingredients: [
      { name: 'Lemon juice, fresh', quantity: '4', unit: 'tbsp' },
      { name: 'Mint leaves', quantity: '12', unit: 'leaves' },
      { name: 'Sugar or honey', quantity: '2', unit: 'tbsp' },
      { name: 'Chilled soda or water', quantity: '2', unit: 'cups' },
      { name: 'Ice cubes & lemon slices', quantity: 'to serve', unit: '' }
    ],
    instructions: [
      'Muddle mint leaves with sugar in a jug to release the oils.',
      'Add lemon juice and stir until the sugar dissolves.',
      'Top with chilled soda or water and stir once.',
      'Serve over ice with a mint sprig and lemon wheel.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-28', updatedAt: null, isSample: true
  });

  /* ============ CHEF-CREATED (64-69, belong to demo users) ============ */
  add({
    id: 'recipe_64', name: 'Dhaba Style Dal Fry',
    description: 'Smoky roadside-dhaba dal finished with a sizzling ghee tadka and a coal smoke infusion — bold, rustic and unforgettable.',
    image: wiki('Dal tadka and chapati.jpg'),
    cuisine: 'Indian', category: 'Dinner', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 30, servings: 4, difficulty: 'Easy', tags: ['dhaba', 'dal', 'smoky'],
    ingredients: [
      { name: 'Mixed dal (toor, moong, chana)', quantity: '1', unit: 'cup' },
      { name: 'Onion, chopped', quantity: '1', unit: 'medium' },
      { name: 'Tomatoes, chopped', quantity: '2', unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Ghee', quantity: '3', unit: 'tbsp' },
      { name: 'Cumin & kasuri methi', quantity: '1 tsp + 1 tsp', unit: '' },
      { name: 'Dried red chillies', quantity: '2', unit: 'nos' },
      { name: 'Salt & coriander', quantity: 'to taste', unit: '' }
    ],
    instructions: [
      'Pressure-cook the dals with turmeric and salt until soft.',
      'In ghee, brown onions, add ginger-garlic paste and tomatoes; cook until mushy.',
      'Add the cooked dal with water and simmer 10 minutes.',
      'Crush kasuri methi between palms and add.',
      'Finish with a tadka of cumin and red chillies in ghee, poured over hot.',
      'Rest 5 minutes and serve with roti or rice.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-15', updatedAt: null, isSample: false
  });

  add({
    id: 'recipe_65', name: 'Masala Makhana',
    description: 'Roasted fox nuts crackle-fried in ghee with turmeric, pepper and a pinch of chaat masala — the crunchy guilt-free munch.',
    image: wiki('Roasted and spiced Foxnuts (Phool Makhana).jpg'),
    cuisine: 'Indian', category: 'Snacks', dietaryPreference: 'Vegan',
    prepTime: 5, cookTime: 10, servings: 3, difficulty: 'Easy', tags: ['makhana', 'roasted', 'guilt free'],
    ingredients: [
      { name: 'Makhana (fox nuts)', quantity: '2', unit: 'cups' },
      { name: 'Ghee or coconut oil', quantity: '2', unit: 'tbsp' },
      { name: 'Turmeric & black pepper', quantity: '1/2 tsp each', unit: '' },
      { name: 'Chaat masala', quantity: '1', unit: 'tsp' },
      { name: 'Rock salt (sendha namak)', quantity: '1/2', unit: 'tsp' }
    ],
    instructions: [
      'Heat ghee in a heavy pan on low heat.',
      'Add makhana and roast 8-10 minutes until crisp — test one; it should crunch.',
      'Sprinkle turmeric and pepper and toss.',
      'Finish with chaat masala and rock salt.',
      'Cool completely and store airtight for up to a week.'
    ],
    author: 'user_demo1', authorName: 'Nainika', createdAt: '2026-03-18', updatedAt: null, isSample: false
  });

  add({
    id: 'recipe_66', name: 'Overnight Oats & Berry Bowl',
    description: 'Creamy rolled oats soaked overnight in milk and chia, layered with berries and a honey drizzle — breakfast that makes itself.',
    image: wiki('Protein overnight oats.jpg'),
    cuisine: 'American', category: 'Breakfast', dietaryPreference: 'Vegetarian',
    prepTime: 10, cookTime: 0, servings: 2, difficulty: 'Easy', tags: ['overnight', 'oats', 'no cook'],
    ingredients: [
      { name: 'Rolled oats', quantity: '1', unit: 'cup' },
      { name: 'Milk (dairy or plant)', quantity: '1', unit: 'cup' },
      { name: 'Chia seeds', quantity: '1', unit: 'tbsp' },
      { name: 'Honey or maple syrup', quantity: '1', unit: 'tbsp' },
      { name: 'Mixed berries', quantity: '1', unit: 'cup' },
      { name: 'Nuts & seeds to top', quantity: '2', unit: 'tbsp' }
    ],
    instructions: [
      'Stir oats, milk, chia and honey together in a jar.',
      'Cover and refrigerate overnight (or at least 4 hours).',
      'In the morning, stir and loosen with a splash of milk.',
      'Layer with berries and nuts in serving glasses.',
      'Drizzle with more honey and serve cold.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-19', updatedAt: null, isSample: false
  });

  add({
    id: 'recipe_67', name: 'Beetroot Hummus Toast',
    description: 'Vivid pink beetroot hummus on toasted multigrain with cucumber ribbons and sesame — a rainbow open sandwich.',
    image: wiki('Hummus with beetroot and paprika (Poznan).jpg'),
    cuisine: 'American', category: 'Healthy', dietaryPreference: 'Vegan',
    prepTime: 15, cookTime: 10, servings: 2, difficulty: 'Easy', tags: ['hummus', 'beetroot', 'vegan'],
    ingredients: [
      { name: 'Cooked beetroot, cubed', quantity: '1', unit: 'cup' },
      { name: 'Chickpeas, cooked', quantity: '1', unit: 'cup' },
      { name: 'Tahini', quantity: '2', unit: 'tbsp' },
      { name: 'Lemon juice & garlic', quantity: '1 tbsp + 1 clove', unit: '' },
      { name: 'Multigrain bread', quantity: '4', unit: 'slices' },
      { name: 'Cucumber, ribboned', quantity: '1/2', unit: 'nos' },
      { name: 'Sesame seeds & olive oil', quantity: 'to finish', unit: '' }
    ],
    instructions: [
      'Blend beetroot, chickpeas, tahini, lemon, garlic and salt into a smooth hummus.',
      'Toast the bread until crisp.',
      'Spread a thick layer of the hummus on each slice.',
      'Top with cucumber ribbons and a drizzle of olive oil.',
      'Finish with sesame seeds and cracked pepper.'
    ],
    author: 'user_demo2', authorName: 'Alisha', createdAt: '2026-03-21', updatedAt: null, isSample: false
  });

  add({
    id: 'recipe_68', name: 'Chilli Paneer Dry',
    description: 'Indo-Chinese favourite: paneer batons tossed with charred peppers in a sticky chilli-garlic glaze — done in twenty minutes.',
    image: wiki('Chilly Paneer 01.jpg'),
    cuisine: 'Chinese', category: 'Snacks', dietaryPreference: 'Vegetarian',
    prepTime: 15, cookTime: 15, servings: 3, difficulty: 'Easy', tags: ['indo-chinese', 'paneer', 'spicy'],
    ingredients: [
      { name: 'Paneer, thick batons', quantity: '250', unit: 'g' },
      { name: 'Capsicum & onion, cubes', quantity: '1 each', unit: '' },
      { name: 'Garlic, minced & green chillies', quantity: '1 tbsp + 2', unit: '' },
      { name: 'Soy sauce', quantity: '1.5', unit: 'tbsp' },
      { name: 'Red chilli sauce', quantity: '1', unit: 'tbsp' },
      { name: 'Vinegar & sugar', quantity: '1 tsp + 1/2 tsp', unit: '' },
      { name: 'Cornflour (for coating)', quantity: '3', unit: 'tbsp' },
      { name: 'Spring onions & oil', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Toss paneer with cornflour and salt; shallow fry until golden.',
      'In the same pan, char onion and capsicum on high heat; remove.',
      'Sauté garlic and green chillies for 30 seconds.',
      'Add soy, chilli sauce, vinegar, sugar and 2 tbsp water; simmer until sticky.',
      'Return paneer and vegetables; toss to coat.',
      'Garnish with spring onion greens and serve hot.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-20', updatedAt: null, isSample: false
  });

  add({
    id: 'recipe_69', name: 'Chocolate Mousse Cups',
    description: 'Airy three-ingredient chocolate mousse set in little cups — an elegant no-bake dessert that looks far harder than it is.',
    image: wiki('Chocolate_mousse.jpg'),
    cuisine: 'American', category: 'Desserts', dietaryPreference: 'Vegetarian',
    prepTime: 20, cookTime: 5, servings: 4, difficulty: 'Medium', tags: ['no bake', 'chocolate', 'elegant'],
    ingredients: [
      { name: 'Dark chocolate, chopped', quantity: '150', unit: 'g' },
      { name: 'Fresh cream, chilled', quantity: '1', unit: 'cup' },
      { name: 'Sugar', quantity: '2', unit: 'tbsp' },
      { name: 'Vanilla extract', quantity: '1/2', unit: 'tsp' },
      { name: 'Berries & cocoa to garnish', quantity: 'as needed', unit: '' }
    ],
    instructions: [
      'Melt chocolate gently and let it cool to room temperature.',
      'Whip chilled cream with sugar and vanilla to soft peaks.',
      'Fold one-third of the cream into the chocolate to lighten it.',
      'Gently fold in the remaining cream — keep the air in.',
      'Spoon into cups and chill for 2 hours.',
      'Garnish with berries and a dust of cocoa before serving.'
    ],
    author: 'user_demo3', authorName: 'Swaroopa', createdAt: '2026-03-22', updatedAt: null, isSample: false
  });

  return R;
}

/* ---------- Default categories ---------- */
function fbGetDefaultCategories() {
  return [
    { id: 'cat_1', name: 'Indian', description: 'Flavour-packed dishes from across India' },
    { id: 'cat_2', name: 'Italian', description: 'Pasta, pizza and Mediterranean comfort food' },
    { id: 'cat_3', name: 'Chinese', description: 'Wok-tossed noodles, rice and stir-fries' },
    { id: 'cat_4', name: 'Mexican', description: 'Tacos, burritos and zesty street food' },
    { id: 'cat_5', name: 'Desserts', description: 'Cakes, sweets and sweet endings' },
    { id: 'cat_6', name: 'Breakfast', description: 'Start your day the delicious way' },
    { id: 'cat_7', name: 'Healthy', description: 'Light, nutritious and wholesome bowls' },
    { id: 'cat_8', name: 'Vegetarian', description: 'Meat-free dishes full of flavour' },
    { id: 'cat_9', name: 'Snacks', description: 'Quick bites and party starters' },
    { id: 'cat_10', name: 'Dinner', description: 'Hearty meals to end the day' },
    { id: 'cat_11', name: 'Drinks', description: 'Smoothies, coolers and café classics' }
  ];
}

/* ---------- Sample reviews (from Nainika, Alisha, Swaroopa) ---------- */
function fbGetSampleReviews() {
  return [
    { id: 'review_1', recipeId: 'recipe_1', userId: 'user_demo2', userName: 'Alisha', rating: 5, review: 'Perfect crispy dosa! The masala inside was spicy and delicious. Will make again this weekend.', date: '2026-02-15' },
    { id: 'review_2', recipeId: 'recipe_1', userId: 'user_demo3', userName: 'Swaroopa', rating: 4, review: 'Great recipe. The batter spread took a little practice but the result was restaurant quality.', date: '2026-02-20' },
    { id: 'review_3', recipeId: 'recipe_2', userId: 'user_demo2', userName: 'Alisha', rating: 5, review: 'Cloud-soft idlis and the sambar tastes straight from a Bangalore kitchen.', date: '2026-02-18' },
    { id: 'review_4', recipeId: 'recipe_3', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'Really easy to follow and tasted amazing!', date: '2026-02-21' },
    { id: 'review_5', recipeId: 'recipe_6', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'Fluffiest pancakes ever. My little sister approved!', date: '2026-02-26' },
    { id: 'review_6', recipeId: 'recipe_11', userId: 'user_demo3', userName: 'Swaroopa', rating: 5, review: 'Rich, creamy and better than takeaway. Kasuri methi makes all the difference.', date: '2026-02-25' },
    { id: 'review_7', recipeId: 'recipe_11', userId: 'user_demo1', userName: 'Nainika', rating: 4, review: 'Very good curry. I used less butter and it still turned out amazing.', date: '2026-03-01' },
    { id: 'review_8', recipeId: 'recipe_14', userId: 'user_demo2', userName: 'Alisha', rating: 4, review: 'Tangy and spicy chole. The tea-bag trick gives perfect colour.', date: '2026-03-03' },
    { id: 'review_9', recipeId: 'recipe_29', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'Creamy pasta done right. My kids loved it!', date: '2026-03-04' },
    { id: 'review_10', recipeId: 'recipe_29', userId: 'user_demo3', userName: 'Swaroopa', rating: 5, review: 'The instructions were simple and clear.', date: '2026-03-06' },
    { id: 'review_11', recipeId: 'recipe_28', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'Blisters on the crust like a wood-fired oven. Fantastic.', date: '2026-03-07' },
    { id: 'review_12', recipeId: 'recipe_35', userId: 'user_demo2', userName: 'Alisha', rating: 5, review: 'Perfect recipe for a quick dinner.', date: '2026-03-09' },
    { id: 'review_13', recipeId: 'recipe_39', userId: 'user_demo1', userName: 'Nainika', rating: 4, review: 'Fun taco night with friends. Double the salsa next time.', date: '2026-03-10' },
    { id: 'review_14', recipeId: 'recipe_6', userId: 'user_demo3', userName: 'Swaroopa', rating: 4, review: 'Simple pantry ingredients, big results. Swap maple with honey and it still works.', date: '2026-03-11' },
    { id: 'review_15', recipeId: 'recipe_51', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'Baked this for a birthday — moist and chocolaty. Hot water tip is genius.', date: '2026-03-12' },
    { id: 'review_16', recipeId: 'recipe_44', userId: 'user_demo2', userName: 'Alisha', rating: 4, review: 'Fresh and crunchy. I added grilled chicken and it was a full meal.', date: '2026-03-15' },
    { id: 'review_17', recipeId: 'recipe_59', userId: 'user_demo3', userName: 'Swaroopa', rating: 5, review: 'Two minutes and better than any juice bar. Perfect summer drink.', date: '2026-03-16' },
    { id: 'review_18', recipeId: 'recipe_12', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'The dum method worked beautifully. Worth every minute of marination.', date: '2026-03-17' },
    { id: 'review_19', recipeId: 'recipe_37', userId: 'user_demo2', userName: 'Alisha', rating: 4, review: 'Great heat on the wok. Noodles had that real hakka bite.', date: '2026-03-18' },
    { id: 'review_20', recipeId: 'recipe_41', userId: 'user_demo3', userName: 'Swaroopa', rating: 4, review: 'Movie-night hit. Extra jalapeños for the brave.', date: '2026-03-19' },
    { id: 'review_21', recipeId: 'recipe_52', userId: 'user_demo2', userName: 'Alisha', rating: 5, review: 'Soft jamuns, syrupy centres. Festival vibes at home.', date: '2026-03-20' },
    { id: 'review_22', recipeId: 'recipe_48', userId: 'user_demo3', userName: 'Swaroopa', rating: 5, review: 'Meal-prepped three days of lunches. The tahini drizzle is addictive.', date: '2026-03-21' },
    { id: 'review_23', recipeId: 'recipe_64', userId: 'user_demo2', userName: 'Alisha', rating: 5, review: 'Nainikas dhaba dal tastes exactly like the highway dhabas. Smoky and rich!', date: '2026-03-20' },
    { id: 'review_24', recipeId: 'recipe_66', userId: 'user_demo3', userName: 'Swaroopa', rating: 4, review: 'Made Alishas oats before my morning class. Zero effort, full stomach.', date: '2026-03-22' },
    { id: 'review_25', recipeId: 'recipe_68', userId: 'user_demo1', userName: 'Nainika', rating: 5, review: 'Swaroopas chilli paneer vanished in five minutes at our study group.', date: '2026-03-23' },
    { id: 'review_26', recipeId: 'recipe_5', userId: 'user_demo3', userName: 'Swaroopa', rating: 5, review: 'Butter-roasted parathas came out perfect on the first try.', date: '2026-03-23' }
  ];
}

/* ---------- First-run seeding ---------- */
function fbSeedIfNeeded() {
  fbWipeLegacyStorage();

  if (localStorage.getItem(LS_KEYS.SEEDED) === 'true') return;

  if (!getData(LS_KEYS.USERS)) saveData(LS_KEYS.USERS, fbGetDemoUsers());
  if (!getData(LS_KEYS.RECIPES)) saveData(LS_KEYS.RECIPES, fbGetSampleRecipes());
  if (!getData(LS_KEYS.CATEGORIES)) saveData(LS_KEYS.CATEGORIES, fbGetDefaultCategories());
  if (!getData(LS_KEYS.REVIEWS)) saveData(LS_KEYS.REVIEWS, fbGetSampleReviews());
  if (!getData(LS_KEYS.COLLECTIONS)) saveData(LS_KEYS.COLLECTIONS, fbGetDemoCollections());
  if (getData(LS_KEYS.CURRENT_USER) === null) saveData(LS_KEYS.CURRENT_USER, null);
  if (getData(LS_KEYS.ADMIN) === null) saveData(LS_KEYS.ADMIN, false);

  saveData(LS_KEYS.SEEDED, 'true');
}

fbSeedIfNeeded();
