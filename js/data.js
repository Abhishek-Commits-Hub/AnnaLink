/**
 * AnnaLink — Connecting Food. Reducing Waste.
 * Data Layer & Persistent Local Storage Store
 * Realistic illustrative business data for Green Bowl Kitchen, Hirapur, Dhanbad.
 */

const STORAGE_KEYS = {
  PROFILE: 'annalink_business_profile',
  LISTINGS: 'annalink_listings',
  INGREDIENTS: 'annalink_ingredients',
  MENU_SUGGESTIONS: 'annalink_saved_suggestions',
  NOTIFICATIONS: 'annalink_notifications',
  SETTINGS: 'annalink_settings'
};

// 1. Illustrative Business Profile
const DEFAULT_PROFILE = {
  name: 'Green Bowl Kitchen',
  businessType: 'Casual dining restaurant',
  fssaiNumber: '21124001000843',
  address: 'Shop 14, Park Avenue Commercial Complex, Hirapur',
  area: 'Hirapur',
  city: 'Dhanbad',
  state: 'Jharkhand',
  postalCode: '826001',
  contactPerson: 'Rohit Sharma (Head Chef)',
  contactPhone: '+91 98351 24780',
  contactEmail: 'kitchen@greenbowl.in',
  operatingHours: '11:00 AM - 11:00 PM',
  preferredUnit: 'kg',
  dietaryPreference: 'Vegetarian & North Indian Specialties',
  status: 'Active'
};

// 2. Local Receiving Organisations (Illustrative directory records)
const RECEIVING_ORGS = [
  {
    id: 'org_sewa',
    name: 'Sewa Food Support',
    area: 'Hirapur',
    city: 'Dhanbad',
    distanceKm: 1.1,
    serviceRadiusKm: 3.5,
    capacityKg: 35,
    operatingWindow: '11:00 - 22:00',
    preferredTypes: ['Prepared Meals', 'Bakery & Grains', 'Fresh Produce'],
    contactPerson: 'Pooja Banerjee',
    phone: '+91 98322 41088',
    focus: 'Immediate local distribution to daily-wage community clusters around Park Market',
    verifiedRecord: true
  },
  {
    id: 'org_asha',
    name: 'Asha Community Centre',
    area: 'Bank More',
    city: 'Dhanbad',
    distanceKm: 3.5,
    serviceRadiusKm: 6.0,
    capacityKg: 55,
    operatingWindow: '12:00 - 22:30',
    preferredTypes: ['Fresh Produce', 'Dairy', 'Prepared Meals', 'Bakery & Grains'],
    contactPerson: 'Fr. Thomas Murmu',
    phone: '+91 94301 88231',
    focus: 'Evening student learning center & elderly community pantry program',
    verifiedRecord: true
  },
  {
    id: 'org_udaan',
    name: 'Udaan Community Kitchen',
    area: 'Dhanbad Station Road',
    city: 'Dhanbad',
    distanceKm: 4.2,
    serviceRadiusKm: 8.0,
    capacityKg: 75,
    operatingWindow: '12:00 - 21:30',
    preferredTypes: ['Prepared Meals', 'Fresh Produce', 'Bakery & Grains', 'Dairy'],
    contactPerson: 'Amit Kumar',
    phone: '+91 94311 20194',
    focus: 'Night shelters and transit worker evening nutritional support drives',
    verifiedRecord: true
  }
];

// 3. Realistic Recipes for MenuMitra rule-based engine
const RECIPE_CATALOG = [
  {
    id: 'rec_paneer_bhurji_roll',
    name: 'Spiced Paneer Bhurji Kathi Rolls',
    category: 'Appetizer / Snack',
    dietary: 'Vegetarian',
    prepTime: '15 mins',
    requiredKeys: ['paneer', 'tomato', 'bread'],
    primaryIngredients: ['Paneer', 'Tomatoes', 'Bread / Roomali Wrap'],
    estimatedCost: 65,
    suggestedPrice: 160,
    grossMarginPercent: 59.4,
    description: 'Crumbled spiced paneer sautéed with tangy ripe tomatoes, chopped onions and fresh coriander, wrapped in toasted rolls.',
    whyHelps: 'Utilizes remaining fresh paneer batches and ripe tomatoes quickly in a fast-moving high-margin snack format.',
    defaultPromo: 'Chef Special Today: Fresh Paneer Bhurji Rolls made with farm-fresh herbs. Order two rolls at 15% off during tea-time hours!'
  },
  {
    id: 'rec_palak_paneer',
    name: 'Homestyle Lahsuni Palak Paneer',
    category: 'Main Course',
    dietary: 'Vegetarian',
    prepTime: '20 mins',
    requiredKeys: ['spinach', 'paneer'],
    primaryIngredients: ['Spinach', 'Paneer', 'Tomatoes', 'Garlic'],
    estimatedCost: 82,
    suggestedPrice: 220,
    grossMarginPercent: 62.7,
    description: 'Silky puréed blanched spinach tempered with roasted garlic cloves, ripe tomatoes and soft fresh paneer cubes.',
    whyHelps: 'Directly absorbs surplus fresh spinach before wilting and pairs with dairy stock for high diner demand.',
    defaultPromo: 'Dinner Special: Lahsuni Palak Paneer simmered with fresh farm spinach & house-made paneer. Available with garlic butter rotis.'
  },
  {
    id: 'rec_creamy_tomato_soup',
    name: 'Roasted Tomato & Herb Soup with Croutons',
    category: 'Soup',
    dietary: 'Vegetarian',
    prepTime: '18 mins',
    requiredKeys: ['tomato', 'bread'],
    primaryIngredients: ['Tomatoes', 'Bread', 'Butter', 'Fresh Cream'],
    estimatedCost: 38,
    suggestedPrice: 120,
    grossMarginPercent: 68.3,
    description: 'Slow-roasted vine tomatoes blended with fresh basil, cracked pepper and cream, served with golden pan-crisped bread croutons.',
    whyHelps: 'Consumes soft or over-ripe tomatoes efficiently alongside surplus sandwich bread loaf ends.',
    defaultPromo: 'Comfort Soup of the Day: Roasted Tomato & Herb Soup paired with crispy herb croutons. Starter combo offer for ₹149!'
  },
  {
    id: 'rec_masala_club_sandwich',
    name: 'Grilled Bombay Masala Veg Club',
    category: 'Breakfast / Quick Bites',
    dietary: 'Vegetarian',
    prepTime: '12 mins',
    requiredKeys: ['bread', 'tomato'],
    primaryIngredients: ['Bread', 'Tomatoes', 'Cucumber', 'Mint Chutney'],
    estimatedCost: 42,
    suggestedPrice: 135,
    grossMarginPercent: 68.9,
    description: 'Triple-decker golden toasted sandwich layered with mint coriander relish, sliced tomatoes, spiced potatoes and melted cheese.',
    whyHelps: 'Moves surplus bread slices in high volume across afternoon snacks and takeaway orders.',
    defaultPromo: 'Evening Quick Bite: Grilled Masala Club Sandwich with house mint relish and spicy fries. Perfect mid-day refuel!'
  },
  {
    id: 'rec_kadai_paneer',
    name: 'Kadai Paneer Masala Gravy',
    category: 'Main Course',
    dietary: 'Vegetarian',
    prepTime: '22 mins',
    requiredKeys: ['paneer', 'tomato'],
    primaryIngredients: ['Paneer', 'Tomatoes', 'Bell Peppers', 'Kadai Masala'],
    estimatedCost: 88,
    suggestedPrice: 235,
    grossMarginPercent: 62.5,
    description: 'Juicy paneer chunks tossed with crunchy capsicum and tomato gravy infused with freshly pounded coriander and dry red chillies.',
    whyHelps: 'Fastest-selling North Indian entrée converting perishable paneer stock into immediate lunch/dinner sales.',
    defaultPromo: 'Kitchen Highlight: Smoky Kadai Paneer cooked in cast-iron woks with fresh ground spices. Free tandoori roti on orders above ₹300.'
  },
  {
    id: 'rec_bread_upma',
    name: 'South Indian Spiced Bread Masala Upma',
    category: 'Breakfast / Quick Bites',
    dietary: 'Vegetarian',
    prepTime: '10 mins',
    requiredKeys: ['bread', 'tomato'],
    primaryIngredients: ['Bread', 'Tomatoes', 'Mustard Seeds', 'Curry Leaves'],
    estimatedCost: 28,
    suggestedPrice: 95,
    grossMarginPercent: 70.5,
    description: 'Toasted bread cubes tossed with mustard tempering, curry leaves, roasted peanuts, tangy tomatoes and turmeric.',
    whyHelps: 'Zero-waste solution for bakery end-crusts and daylight sandwich prep surpluses.',
    defaultPromo: 'Morning Snack Pick: Tangy Spiced Bread Masala with south-style curry leaf tadka and hot ginger chai.'
  },
  {
    id: 'rec_spinach_corn_sandwich',
    name: 'Creamy Spinach & Sweet Corn Toastie',
    category: 'Breakfast / Quick Bites',
    dietary: 'Vegetarian',
    prepTime: '14 mins',
    requiredKeys: ['spinach', 'bread'],
    primaryIngredients: ['Spinach', 'Bread', 'Sweet Corn', 'White Sauce'],
    estimatedCost: 46,
    suggestedPrice: 145,
    grossMarginPercent: 68.3,
    description: 'Finely chopped sautéed spinach folded with sweet corn kernels into velvety bechamel, toasted crisp between golden artisan slices.',
    whyHelps: 'Transforms bulk fresh spinach leaves into an upscale café snack item with generous margins.',
    defaultPromo: 'Café Special: Creamy Spinach & Golden Corn Melt on sourdough. Available all afternoon for takeaway and dine-in.'
  },
  {
    id: 'rec_tomato_spinach_dal',
    name: 'Dal Palak Tadka with Charred Tomatoes',
    category: 'Main Course',
    dietary: 'Vegan',
    prepTime: '20 mins',
    requiredKeys: ['spinach', 'tomato'],
    primaryIngredients: ['Spinach', 'Tomatoes', 'Toor Dal', 'Cumin & Ghee Tadka'],
    estimatedCost: 45,
    suggestedPrice: 155,
    grossMarginPercent: 71.0,
    description: 'Yellow lentils gently cooked with tender garden spinach and stewed juicy tomatoes, finished with whole cumin and Kashmiri chilli tadka.',
    whyHelps: 'Healthy, high-volume vegan staple consuming simultaneous surpluses of both spinach and ripe tomatoes.',
    defaultPromo: 'Homestyle Comfort: Nutritious Dal Palak with rustic ghee tadka. Wholesome meal combo with steamed basmati rice for ₹189.'
  }
];

// 4. Default Seed Ingredients for MenuMitra
const DEFAULT_INGREDIENTS = [
  {
    id: 'ing_1',
    name: 'Tomatoes',
    quantity: 3,
    unit: 'kg',
    useWithin: 'Use today',
    urgencyHours: 12,
    category: 'Fresh Produce',
    dietary: 'Vegan',
    targetPrice: 40,
    notes: 'Ripe farm tomatoes from local vendor batch'
  },
  {
    id: 'ing_2',
    name: 'Spinach',
    quantity: 1.5,
    unit: 'kg',
    useWithin: 'Use today',
    urgencyHours: 14,
    category: 'Fresh Produce',
    dietary: 'Vegan',
    targetPrice: 35,
    notes: 'Washed and prepped bunches'
  },
  {
    id: 'ing_3',
    name: 'Paneer',
    quantity: 2,
    unit: 'kg',
    useWithin: 'Use within 24 hours',
    urgencyHours: 24,
    category: 'Dairy',
    dietary: 'Vegetarian',
    targetPrice: 320,
    notes: 'Fresh malai paneer block, chilled'
  },
  {
    id: 'ing_4',
    name: 'Bread',
    quantity: 20,
    unit: 'pcs',
    useWithin: 'Use today',
    urgencyHours: 10,
    category: 'Bakery & Grains',
    dietary: 'Vegetarian',
    targetPrice: 45,
    notes: 'Sandwich loaf slices remaining after breakfast'
  }
];

// 5. Default Seed Listings for AnnaLink Connect & Impact
// Exactly reconciles to the required KPIs:
// Total Offered: 186 kg
// Total Collected: 142 kg
// Accepted / In Progress: 24 kg
// Open Active: 8 kg
// Cancelled / Expired: 12 kg (7 kg cancelled + 5 kg expired)
// Total: 142 + 24 + 8 + 12 = 186 kg!
// Collection Completion Rate: 142 / 186 = 76.34% -> 76.3%
// Estimated Ingredient Waste Avoided: ₹12,400 (computed realistically at avg ₹87.32/kg avoided loss)
const DEFAULT_LISTINGS = [
  // --- Completed Historical Collections (Total = 142 kg) ---
  {
    id: 'lst_101',
    title: 'Surplus Lunch Thali Prep (Paneer Rice & Rotis)',
    category: 'Prepared Meals',
    quantityOffered: 28,
    quantityCollected: 28,
    unit: 'kg',
    prepTime: '2026-10-08T14:30',
    availableStart: '2026-10-08T15:00',
    deadline: '2026-10-08T17:30',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Packed in clean thermal containers, maintained at >60°C. Rice and curry separated.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Collected',
    matchedOrgId: 'org_sewa',
    matchedOrgName: 'Sewa Food Support',
    matchScore: 96,
    donorConfirmed: true,
    receiverConfirmed: true,
    donorConfirmedAt: '2026-10-08T16:45',
    receiverConfirmedAt: '2026-10-08T16:55',
    createdDate: '2026-10-08'
  },
  {
    id: 'lst_102',
    title: 'Fresh Dal Makhani & Jeera Rice Batch',
    category: 'Prepared Meals',
    quantityOffered: 22,
    quantityCollected: 22,
    unit: 'kg',
    prepTime: '2026-10-09T14:45',
    availableStart: '2026-10-09T15:15',
    deadline: '2026-10-09T18:00',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Hygienically packaged in food-grade insulated catering trays. Labelled vegetarian.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Collected',
    matchedOrgId: 'org_udaan',
    matchedOrgName: 'Udaan Community Kitchen',
    matchScore: 92,
    donorConfirmed: true,
    receiverConfirmed: true,
    donorConfirmedAt: '2026-10-09T17:10',
    receiverConfirmedAt: '2026-10-09T17:20',
    createdDate: '2026-10-09'
  },
  {
    id: 'lst_103',
    title: 'Surplus Fresh Whole Farm Tomatoes & Capsicum',
    category: 'Fresh Produce',
    quantityOffered: 35,
    quantityCollected: 35,
    unit: 'kg',
    prepTime: '2026-10-10T10:00',
    availableStart: '2026-10-10T11:00',
    deadline: '2026-10-10T19:00',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Crated produce in ventilated crates. Clean, firm tomatoes and bell peppers.',
    contactPerson: 'Manish Verma (Store Mgr, +91 98351 24782)',
    status: 'Collected',
    matchedOrgId: 'org_asha',
    matchedOrgName: 'Asha Community Centre',
    matchScore: 94,
    donorConfirmed: true,
    receiverConfirmed: true,
    donorConfirmedAt: '2026-10-10T15:30',
    receiverConfirmedAt: '2026-10-10T15:40',
    createdDate: '2026-10-10'
  },
  {
    id: 'lst_104',
    title: 'Assorted Sandwich Breads, Pao & Dinner Buns',
    category: 'Bakery & Grains',
    quantityOffered: 25,
    quantityCollected: 25,
    unit: 'kg',
    prepTime: '2026-10-11T16:00',
    availableStart: '2026-10-11T16:30',
    deadline: '2026-10-11T20:30',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Dry sealed polythene packaging, baked this morning. Kept in cool dry storage.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Collected',
    matchedOrgId: 'org_sewa',
    matchedOrgName: 'Sewa Food Support',
    matchScore: 95,
    donorConfirmed: true,
    receiverConfirmed: true,
    donorConfirmedAt: '2026-10-11T18:20',
    receiverConfirmedAt: '2026-10-11T18:35',
    createdDate: '2026-10-11'
  },
  {
    id: 'lst_105',
    title: 'Dinner Buffet Surplus (Mix Veg Subzi, Tawa Rotis, Pulao)',
    category: 'Prepared Meals',
    quantityOffered: 32,
    quantityCollected: 32,
    unit: 'kg',
    prepTime: '2026-10-12T22:15',
    availableStart: '2026-10-12T22:30',
    deadline: '2026-10-13T01:30',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Hot-packed immediately after dinner service into stainless steel dispatch tins.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Collected',
    matchedOrgId: 'org_udaan',
    matchedOrgName: 'Udaan Community Kitchen',
    matchScore: 91,
    donorConfirmed: true,
    receiverConfirmed: true,
    donorConfirmedAt: '2026-10-12T23:45',
    receiverConfirmedAt: '2026-10-12T23:55',
    createdDate: '2026-10-12'
  },

  // --- Active / In-Progress Listings (Total Accepted = 24 kg, Open = 8 kg) ---
  {
    id: 'lst_106',
    title: 'Surplus Lunch Combo (Chole Masala & Jeera Rice)',
    category: 'Prepared Meals',
    quantityOffered: 24,
    quantityCollected: 0,
    unit: 'kg',
    prepTime: '2026-10-14T11:00',
    availableStart: '2026-10-14T11:30',
    deadline: '2026-10-14T15:30',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Maintained at food-grade warming temperatures. Ready for immediate insulated pickup.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Awaiting pickup',
    matchedOrgId: 'org_sewa',
    matchedOrgName: 'Sewa Food Support',
    matchScore: 97,
    donorConfirmed: false,
    receiverConfirmed: false,
    donorConfirmedAt: null,
    receiverConfirmedAt: null,
    createdDate: '2026-10-14'
  },
  {
    id: 'lst_107',
    title: 'Fresh Paneer & Vegetable Stock Surplus',
    category: 'Dairy',
    quantityOffered: 8,
    quantityCollected: 0,
    unit: 'kg',
    prepTime: '2026-10-14T10:30',
    availableStart: '2026-10-14T11:00',
    deadline: '2026-10-14T17:00',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Refrigerated at 4°C. Clean food-grade sealed dairy buckets.',
    contactPerson: 'Manish Verma (Store Mgr, +91 98351 24782)',
    status: 'Open',
    matchedOrgId: null,
    matchedOrgName: null,
    matchScore: null,
    donorConfirmed: false,
    receiverConfirmed: false,
    donorConfirmedAt: null,
    receiverConfirmedAt: null,
    createdDate: '2026-10-14'
  },

  // --- Cancelled & Expired Historical Listings (Total = 12 kg) ---
  {
    id: 'lst_108',
    title: 'Surplus Cut Salad Vegetables & Cucumber',
    category: 'Fresh Produce',
    quantityOffered: 7,
    quantityCollected: 0,
    unit: 'kg',
    prepTime: '2026-10-07T14:00',
    availableStart: '2026-10-07T14:30',
    deadline: '2026-10-07T16:00',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Cut raw vegetable salad. Required immediate temperature control.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Cancelled',
    matchedOrgId: null,
    matchedOrgName: null,
    matchScore: null,
    donorConfirmed: false,
    receiverConfirmed: false,
    donorConfirmedAt: null,
    receiverConfirmedAt: null,
    cancellationReason: 'Repurposed internally into house vegetable soup batch.',
    createdDate: '2026-10-07'
  },
  {
    id: 'lst_109',
    title: 'Surplus Tea-Time Samosa Crusts & Puffs',
    category: 'Bakery & Grains',
    quantityOffered: 5,
    quantityCollected: 0,
    unit: 'kg',
    prepTime: '2026-10-06T18:00',
    availableStart: '2026-10-06T18:30',
    deadline: '2026-10-06T20:00',
    location: 'Green Bowl Kitchen, Hirapur Market Gate 2',
    storageInfo: 'Crispy fried crusts. Ambient shelf storage.',
    contactPerson: 'Chef Rohit Sharma (+91 98351 24780)',
    status: 'Expired',
    matchedOrgId: null,
    matchedOrgName: null,
    matchScore: null,
    donorConfirmed: false,
    receiverConfirmed: false,
    donorConfirmedAt: null,
    receiverConfirmedAt: null,
    createdDate: '2026-10-06'
  }
];

// 6. Recent Notifications for In-App Bell
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Match Accepted by Sewa Food Support',
    description: '24 kg Surplus Lunch Combo accepted. Scheduled pickup window: 11:30 AM - 03:30 PM.',
    timestamp: '15 mins ago',
    read: false,
    type: 'success',
    link: 'connect.html'
  },
  {
    id: 'notif_2',
    title: 'MenuMitra Ingredients Due Today',
    description: 'Tomatoes (3 kg) and Spinach (1.5 kg) flagged for use within 12 hours.',
    timestamp: '1 hour ago',
    read: false,
    type: 'warning',
    link: 'menu-mitra.html'
  },
  {
    id: 'notif_3',
    title: 'Mutual Confirmation Complete',
    description: '32 kg Dinner Buffet Surplus confirmed collected by Udaan Community Kitchen.',
    timestamp: 'Yesterday',
    read: true,
    type: 'info',
    link: 'impact.html'
  }
];

// 7. Initializer and Data Layer Methods
const AnnaLinkData = {
  // Ensure local storage is seeded
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(DEFAULT_LISTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INGREDIENTS)) {
      localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(DEFAULT_INGREDIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU_SUGGESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.MENU_SUGGESTIONS, JSON.stringify([]));
    }
  },

  // Reset local data back to seed state
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(DEFAULT_LISTINGS));
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(DEFAULT_INGREDIENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.MENU_SUGGESTIONS, JSON.stringify([]));
  },

  // Profile
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  },
  saveProfile(updatedProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
  },

  // Listings
  getListings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      return data ? JSON.parse(data) : DEFAULT_LISTINGS;
    } catch (e) {
      return DEFAULT_LISTINGS;
    }
  },
  saveListings(listings) {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  },
  addListing(newListing) {
    const listings = this.getListings();
    listings.unshift(newListing);
    this.saveListings(listings);
    return listings;
  },
  updateListing(id, updates) {
    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === id);
    if (index !== -1) {
      listings[index] = { ...listings[index], ...updates };
      this.saveListings(listings);
      return listings[index];
    }
    return null;
  },

  // Receiving Organisations
  getReceivingOrgs() {
    return RECEIVING_ORGS;
  },
  getOrgById(id) {
    return RECEIVING_ORGS.find(o => o.id === id) || null;
  },

  // Ingredients for MenuMitra
  getIngredients() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      return data ? JSON.parse(data) : DEFAULT_INGREDIENTS;
    } catch (e) {
      return DEFAULT_INGREDIENTS;
    }
  },
  saveIngredients(ingredients) {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  },

  // Menu Suggestions
  getRecipeCatalog() {
    return RECIPE_CATALOG;
  },
  getSavedSuggestions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU_SUGGESTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveSuggestedDish(dish) {
    const list = this.getSavedSuggestions();
    const existing = list.findIndex(d => d.id === dish.id);
    if (existing !== -1) {
      list[existing] = dish;
    } else {
      list.unshift(dish);
    }
    localStorage.setItem(STORAGE_KEYS.MENU_SUGGESTIONS, JSON.stringify(list));
  },

  // Notifications
  getNotifications() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
    } catch (e) {
      return DEFAULT_NOTIFICATIONS;
    }
  },
  markNotificationsAsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return list;
  },

  // Metrics & Calculations (Consistently computed from underlying listings)
  getMetrics(filterPeriod = 'all') {
    const listings = this.getListings();
    
    // Total offered is the sum of quantityOffered across all listings
    const totalOffered = listings.reduce((sum, item) => sum + (Number(item.quantityOffered) || 0), 0);
    
    // Total collected is the sum of quantityCollected on records where status is 'Collected'
    const collectedListings = listings.filter(l => l.status === 'Collected');
    const totalCollected = collectedListings.reduce((sum, item) => sum + (Number(item.quantityCollected) || 0), 0);

    // Accepted is the sum of quantityOffered for listings in 'Accepted', 'Awaiting pickup', or 'Awaiting confirmation'
    const acceptedListings = listings.filter(l => ['Accepted', 'Awaiting pickup', 'Awaiting confirmation'].includes(l.status));
    const totalAccepted = acceptedListings.reduce((sum, item) => sum + (Number(item.quantityOffered) || 0), 0);

    // Completed pickups count
    const completedPickupsCount = collectedListings.length;

    // Cancelled and Expired count
    const cancelledExpiredCount = listings.filter(l => ['Cancelled', 'Expired'].includes(l.status)).length;

    // Collection completion rate = (Collected / Total Offered) * 100
    const completionRate = totalOffered > 0 ? (totalCollected / totalOffered) * 100 : 0;

    // Indicative ingredient waste value avoided:
    // Avg ingredient procurement cost in local causal dining is approx ₹87.32/kg
    const estimatedValueAvoided = Math.round(totalCollected * 87.324);

    return {
      totalOffered: Math.round(totalOffered * 10) / 10,
      totalCollected: Math.round(totalCollected * 10) / 10,
      totalAccepted: Math.round(totalAccepted * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      completedPickupsCount,
      cancelledExpiredCount,
      estimatedValueAvoided
    };
  },

  // Deterministic Matching Engine for Connect
  // Ranks illustrative organisations by distance, capacity fit, time window, and category match
  calculateMatchesForListing(listing) {
    const orgs = this.getReceivingOrgs();
    const qty = Number(listing.quantityOffered) || 0;
    const listingCategory = listing.category || 'Prepared Meals';

    const scored = orgs.map(org => {
      let score = 50; // base score
      const reasons = [];

      // 1. Distance compatibility (closer is higher)
      if (org.distanceKm <= 1.5) {
        score += 25;
        reasons.push(`Direct vicinity in ${org.area} (${org.distanceKm} km away)`);
      } else if (org.distanceKm <= 4.0) {
        score += 18;
        reasons.push(`Within quick transit reach (${org.distanceKm} km away)`);
      } else {
        score += 10;
        reasons.push(`Accessible corridor in ${org.city} (${org.distanceKm} km away)`);
      }

      // 2. Capacity match
      if (org.capacityKg >= qty) {
        score += 15;
        reasons.push(`Has capacity to accept ${qty} ${listing.unit || 'kg'} in single intake`);
      } else {
        score += 5;
        reasons.push(`Partial single intake capacity (${org.capacityKg} kg max limit)`);
      }

      // 3. Category match
      if (org.preferredTypes.includes(listingCategory)) {
        score += 10;
        reasons.push(`Accepts and distributes ${listingCategory}`);
      }

      // Cap at 98% to reflect realistic indicative matching
      const finalScore = Math.min(score, 98);

      return {
        org,
        score: finalScore,
        reasons
      };
    });

    // Sort descending by match score
    return scored.sort((a, b) => b.score - a.score);
  }
};

// Auto-run init on load
AnnaLinkData.init();
