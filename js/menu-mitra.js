/**
 * AnnaLink — MenuMitra AI
 * Local Rule-Based Dish Suggestion Engine & Kitchen Inventory Coordinator
 */

const MenuMitraEngine = {
  // Extract normalized search tokens from ingredients list
  extractTokens(ingredients) {
    const tokens = new Set();
    ingredients.forEach(item => {
      const name = (item.name || '').toLowerCase().trim();
      if (name.includes('tomato')) tokens.add('tomato');
      if (name.includes('spinach') || name.includes('palak')) tokens.add('spinach');
      if (name.includes('paneer') || name.includes('cottage cheese')) tokens.add('paneer');
      if (name.includes('bread') || name.includes('loaf') || name.includes('pao') || name.includes('bun')) tokens.add('bread');
      if (name.includes('potato') || name.includes('aloo')) tokens.add('potato');
      if (name.includes('capsicum') || name.includes('bell pepper') || name.includes('shimla')) tokens.add('capsicum');
      if (name.includes('onion') || name.includes('pyaz')) tokens.add('onion');
      if (name.includes('corn')) tokens.add('corn');
      if (name.includes('dal') || name.includes('lentil')) tokens.add('dal');
    });
    return tokens;
  },

  // Match ingredients against recipe catalog
  generateSuggestions(ingredients, filters = {}) {
    const catalog = AnnaLinkData.getRecipeCatalog();
    const tokens = this.extractTokens(ingredients);
    
    if (tokens.size === 0) {
      return [];
    }

    const matches = [];

    catalog.forEach(recipe => {
      // 1. Dietary filter check
      if (filters.dietary && filters.dietary !== 'all') {
        if (filters.dietary === 'Vegan' && recipe.dietary !== 'Vegan') {
          return;
        }
        if (filters.dietary === 'Vegetarian') {
          const vegetarianDietaries = ['Vegetarian', 'Vegan'];
          if (!vegetarianDietaries.includes(recipe.dietary)) {
            return;
          }
        }
      }

      // 2. Category filter check
      if (filters.category && filters.category !== 'all') {
        if (recipe.category !== filters.category) {
          return;
        }
      }

      // 3. Match keys against tokens
      const matchedKeys = recipe.requiredKeys.filter(k => tokens.has(k));
      const matchScore = (matchedKeys.length / recipe.requiredKeys.length) * 100;

      // Only include recipes where at least one key ingredient matches
      if (matchedKeys.length > 0) {
        // Find which entered ingredients were utilized
        const usedIngredientsList = ingredients.filter(ing => {
          const lower = (ing.name || '').toLowerCase();
          return matchedKeys.some(k => lower.includes(k));
        });

        // Compute tailored indicative numbers if user specified target selling price
        let sellingPrice = recipe.suggestedPrice;
        let marginPercent = recipe.grossMarginPercent;
        if (filters.targetPrice && Number(filters.targetPrice) > recipe.estimatedCost) {
          sellingPrice = Number(filters.targetPrice);
          marginPercent = Math.round(((sellingPrice - recipe.estimatedCost) / sellingPrice) * 1000) / 10;
        }

        matches.push({
          ...recipe,
          suggestedPrice: sellingPrice,
          grossMarginPercent: marginPercent,
          matchScore: Math.round(matchScore),
          matchedKeys,
          usedIngredients: usedIngredientsList
        });
      }
    });

    // Sort by best match score, then highest margin
    matches.sort((a, b) => b.matchScore - a.matchScore || b.grossMarginPercent - a.grossMarginPercent);
    return matches;
  }
};

// UI State Management for MenuMitra
let currentIngredients = [];
let currentSuggestions = [];
let activeEditingDishId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Load initial ingredients from persistent data
  currentIngredients = AnnaLinkData.getIngredients();
  renderIngredientChips();

  // Run initial suggestions with prefilled ingredients
  runSuggestionEngine();

  // Form Submission: Add Ingredient
  const addIngForm = document.getElementById('addIngredientForm');
  if (addIngForm) {
    addIngForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ingName').value.trim();
      const qty = parseFloat(document.getElementById('ingQty').value);
      const unit = document.getElementById('ingUnit').value;
      const useWithin = document.getElementById('ingUseWithin').value;
      const category = document.getElementById('ingCategory').value;
      const dietary = document.getElementById('ingDietary').value;
      const targetPrice = document.getElementById('ingTargetPrice').value;

      if (!name || isNaN(qty) || qty <= 0) {
        showToast('Please enter a valid ingredient name and quantity', 'error');
        return;
      }

      const newIng = {
        id: 'ing_' + Date.now(),
        name,
        quantity: qty,
        unit,
        useWithin,
        category,
        dietary,
        targetPrice: targetPrice ? Number(targetPrice) : null
      };

      currentIngredients.push(newIng);
      AnnaLinkData.saveIngredients(currentIngredients);
      renderIngredientChips();
      
      // Reset form fields
      addIngForm.reset();
      document.getElementById('ingUseWithin').value = 'Use today';
      document.getElementById('ingUnit').value = 'kg';

      showToast(`Added ${name} (${qty} ${unit}) to active ingredients`, 'success');
      runSuggestionEngine();
    });
  }

  // Trigger Suggestion Button
  const btnGenerate = document.getElementById('btnGenerateSuggestions');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      runSuggestionEngine();
      showToast('Generated fresh dish suggestions', 'success');
    });
  }

  // Filter change handlers
  const filterCategory = document.getElementById('filterCategory');
  const filterDietary = document.getElementById('filterDietary');
  if (filterCategory) filterCategory.addEventListener('change', runSuggestionEngine);
  if (filterDietary) filterDietary.addEventListener('change', runSuggestionEngine);

  // Save edited promotional message from modal
  const btnSavePromo = document.getElementById('btnSavePromoModal');
  if (btnSavePromo) {
    btnSavePromo.addEventListener('click', () => {
      const newText = document.getElementById('editPromoTextarea').value.trim();
      if (!newText) {
        showToast('Promotional message cannot be empty', 'error');
        return;
      }

      if (activeEditingDishId) {
        const dish = currentSuggestions.find(d => d.id === activeEditingDishId);
        if (dish) {
          dish.defaultPromo = newText;
          renderSuggestions();
          closeModal('editPromoModal');
          showToast('Updated promotional message', 'success');
        }
      }
    });
  }
});

// Render ingredient chips
function renderIngredientChips() {
  const container = document.getElementById('ingredientChipsContainer');
  const countBadge = document.getElementById('ingredientCountBadge');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${currentIngredients.length} active`;
  }

  if (currentIngredients.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 13.5px; background: var(--color-bg); border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
        No ingredients added yet. Add ingredients using the form to generate suggestions.
      </div>
    `;
    return;
  }

  container.innerHTML = currentIngredients.map(ing => `
    <div class="ingredient-chip-row" data-id="${ing.id}">
      <div class="ingredient-chip-info">
        <div>
          <span class="ingredient-name">${ing.name}</span>
          <span class="ingredient-qty">• ${ing.quantity} ${ing.unit}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="ingredient-deadline">${ing.useWithin}</span>
        <button type="button" class="btn btn-outline btn-sm btn-icon-only" onclick="removeIngredient('${ing.id}')" title="Remove ingredient">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Remove ingredient
window.removeIngredient = function(id) {
  currentIngredients = currentIngredients.filter(ing => ing.id !== id);
  AnnaLinkData.saveIngredients(currentIngredients);
  renderIngredientChips();
  runSuggestionEngine();
  showToast('Ingredient removed', 'info');
};

// Execute suggestion engine
function runSuggestionEngine() {
  const categoryFilter = document.getElementById('filterCategory') ? document.getElementById('filterCategory').value : 'all';
  const dietaryFilter = document.getElementById('filterDietary') ? document.getElementById('filterDietary').value : 'all';

  const filters = {
    category: categoryFilter,
    dietary: dietaryFilter
  };

  currentSuggestions = MenuMitraEngine.generateSuggestions(currentIngredients, filters);
  renderSuggestions();
}

// Render suggestion cards
function renderSuggestions() {
  const container = document.getElementById('suggestionsGrid');
  const statusIndicator = document.getElementById('engineStatusIndicator');
  if (!container) return;

  if (statusIndicator) {
    if (currentSuggestions.length > 0) {
      statusIndicator.innerHTML = `
        <span class="status-dot"></span>
        <span style="font-weight:600;color:var(--color-primary);">${currentSuggestions.length} Suggestions Ready</span>
      `;
    } else {
      statusIndicator.innerHTML = `
        <span style="color:var(--color-text-muted);">No suggestions match current inputs</span>
      `;
    }
  }

  // Handle empty state if no recipes matched
  if (currentSuggestions.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; background: #FFFFFF; border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
        <div class="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        </div>
        <div class="empty-title">No Recipe Matches Found</div>
        <div class="empty-desc">
          None of your current ingredients or active category filters matched our predefined recipe catalog.
          Try adding staple kitchen items such as tomatoes, spinach, paneer or bread, or adjust your dietary filters.
        </div>
        <div style="display:flex;gap:12px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="restoreDefaultIngredients()">
            Load Suggested Staples
          </button>
          <a href="connect.html?action=new" class="btn btn-primary btn-sm">
            List Surplus in Connect Instead
          </a>
        </div>
      </div>
    `;
    return;
  }

  // Render cards
  container.innerHTML = currentSuggestions.map(dish => {
    const ingredientsUsedText = dish.primaryIngredients.join(', ');

    return `
      <div class="dish-card" id="card_${dish.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span class="dish-category">${dish.category} • ${dish.dietary}</span>
          <span class="badge badge-collected" style="font-size:11px;">${dish.matchScore}% Ingredient Fit</span>
        </div>

        <h3 class="dish-title">${dish.name}</h3>
        <p class="dish-desc">${dish.description}</p>

        <div class="dish-why-helps">
          <strong>Why this helps:</strong> ${dish.whyHelps}
        </div>

        <div class="dish-meta-row">
          <span class="dish-meta-label">Ingredients Used</span>
          <span class="dish-meta-val" style="font-size:12.5px;max-width:180px;text-align:right;">${ingredientsUsedText}</span>
        </div>

        <div class="dish-meta-row">
          <span class="dish-meta-label">Est. Prep Time</span>
          <span class="dish-meta-val">${dish.prepTime}</span>
        </div>

        <div class="dish-meta-row">
          <span class="dish-meta-label">Indicative Food Cost</span>
          <span class="dish-meta-val">${Formatters.currency(dish.estimatedCost)}</span>
        </div>

        <div class="dish-meta-row">
          <span class="dish-meta-label">Suggested Price</span>
          <span class="dish-meta-val">
            ${Formatters.currency(dish.suggestedPrice)} 
            <span class="dish-margin-pill">(${dish.grossMarginPercent}% margin)</span>
          </span>
        </div>

        <div style="margin: 16px 0 8px 0;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-text-light); margin-bottom: 6px;">
            Suggested Promotion
          </div>
          <div class="promo-message-box">
            <div id="promo_text_${dish.id}" style="line-height:1.35;">${dish.defaultPromo}</div>
            <div class="promo-actions">
              <button type="button" class="btn btn-outline btn-sm" onclick="openPromoModal('${dish.id}')" style="font-size:11.5px;padding:4px 8px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Edit Message
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="copyPromo('${dish.id}')" style="font-size:11.5px;padding:4px 8px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy Text
              </button>
            </div>
          </div>
        </div>

        <div class="dish-card-actions">
          <button type="button" class="btn btn-outline btn-sm" style="flex:1;" onclick="openDishDetailModal('${dish.id}')">
            View Details
          </button>
          <button type="button" class="btn btn-primary btn-sm" style="flex:1.2;" onclick="markDishAdded('${dish.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Approve for Menu
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Open Promo Editor Modal
window.openPromoModal = function(dishId) {
  activeEditingDishId = dishId;
  const dish = currentSuggestions.find(d => d.id === dishId);
  if (!dish) return;

  const modal = document.getElementById('editPromoModal');
  const textarea = document.getElementById('editPromoTextarea');
  const dishTitle = document.getElementById('promoModalDishTitle');

  if (modal && textarea) {
    if (dishTitle) dishTitle.textContent = dish.name;
    textarea.value = dish.defaultPromo;
    openModal('editPromoModal');
  }
};

// Copy promotional message
window.copyPromo = function(dishId) {
  const dish = currentSuggestions.find(d => d.id === dishId);
  if (!dish) return;
  copyToClipboard(dish.defaultPromo, `Copied promotion for "${dish.name}"`);
};

// View Details Modal
window.openDishDetailModal = function(dishId) {
  const dish = currentSuggestions.find(d => d.id === dishId);
  if (!dish) return;

  const titleEl = document.getElementById('detailModalTitle');
  const bodyEl = document.getElementById('detailModalBody');

  if (titleEl) titleEl.textContent = dish.name;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="margin-bottom:16px;">
        <span class="badge badge-neutral">${dish.category}</span>
        <span class="badge badge-collected" style="margin-left:6px;">${dish.dietary}</span>
        <span class="badge badge-open" style="margin-left:6px;">Prep: ${dish.prepTime}</span>
      </div>

      <p style="font-size:14px;color:var(--color-text-main);line-height:1.5;margin-bottom:16px;">
        ${dish.description}
      </p>

      <div class="card" style="margin-bottom:16px;background:var(--color-bg);border-color:var(--color-border);">
        <div class="card-body" style="padding:14px;">
          <h4 style="font-size:13px;font-weight:600;margin-bottom:6px;">Kitchen Waste Impact</h4>
          <p style="font-size:13px;color:var(--color-text-muted);">${dish.whyHelps}</p>
        </div>
      </div>

      <div style="background:var(--color-mint-light);border:1px solid rgba(40,122,80,0.2);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;">
        <h4 style="font-size:13px;font-weight:600;color:var(--color-primary);margin-bottom:8px;">Indicative Cost & Revenue Economics</h4>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;text-align:center;">
          <div style="background:#fff;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--color-border);">
            <div style="font-size:11px;color:var(--color-text-muted);">Est. Ingredient Cost</div>
            <div style="font-size:16px;font-weight:700;">${Formatters.currency(dish.estimatedCost)}</div>
          </div>
          <div style="background:#fff;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--color-border);">
            <div style="font-size:11px;color:var(--color-text-muted);">Suggested Price</div>
            <div style="font-size:16px;font-weight:700;">${Formatters.currency(dish.suggestedPrice)}</div>
          </div>
          <div style="background:#fff;padding:8px;border-radius:var(--radius-sm);border:1px solid var(--color-border);">
            <div style="font-size:11px;color:var(--color-text-muted);">Indicative Margin</div>
            <div style="font-size:16px;font-weight:700;color:var(--color-secondary);">${dish.grossMarginPercent}%</div>
          </div>
        </div>
      </div>

      <div class="notice-box" style="margin-bottom:0;">
        <svg class="notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>Suggestions and cost estimates are indicative. Review ingredient quality, food-safety requirements, recipe suitability and actual costs before use.</div>
      </div>
    `;
  }

  openModal('dishDetailModal');
};

// Approve dish for menu
window.markDishAdded = function(dishId) {
  const dish = currentSuggestions.find(d => d.id === dishId);
  if (!dish) return;

  AnnaLinkData.saveSuggestedDish({
    ...dish,
    approvedAt: new Date().toISOString()
  });

  showToast(`"${dish.name}" approved and flagged for today's kitchen menu`, 'success');
};

// Restore default sample ingredients if needed
window.restoreDefaultIngredients = function() {
  currentIngredients = [
    { id: 'ing_1', name: 'Tomatoes', quantity: 3, unit: 'kg', useWithin: 'Use today', category: 'Fresh Produce', dietary: 'Vegan' },
    { id: 'ing_2', name: 'Spinach', quantity: 1.5, unit: 'kg', useWithin: 'Use today', category: 'Fresh Produce', dietary: 'Vegan' },
    { id: 'ing_3', name: 'Paneer', quantity: 2, unit: 'kg', useWithin: 'Use within 24 hours', category: 'Dairy', dietary: 'Vegetarian' },
    { id: 'ing_4', name: 'Bread', quantity: 20, unit: 'pcs', useWithin: 'Use today', category: 'Bakery & Grains', dietary: 'Vegetarian' }
  ];
  AnnaLinkData.saveIngredients(currentIngredients);
  renderIngredientChips();
  runSuggestionEngine();
  showToast('Standard kitchen ingredients restored', 'info');
};

// Plan selection feedback
window.selectPricingPlan = function(planName) {
  showToast(`Selected "${planName}". Account subscription request logged for Green Bowl Kitchen.`, 'success');
};
