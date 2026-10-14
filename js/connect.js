/**
 * AnnaLink — AnnaLink Connect
 * Surplus Food Coordination, Deterministic Matching, and Mutual Confirmation Workflow
 */

let activeListingIdForAction = null;
let currentFilterStatus = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters for ?action=new
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'new') {
    openModal('listSurplusModal');
  }

  // Initial render
  renderConnectListings();

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });

  // Filter listings by status
  const statusFilterEl = document.getElementById('connectStatusFilter');
  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', (e) => {
      currentFilterStatus = e.target.value;
      renderConnectListings();
    });
  }

  // Create Listing Form Submit
  const newListingForm = document.getElementById('newListingForm');
  if (newListingForm) {
    // Set default datetime values for convenience
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000);
    const deadlineTime = new Date(now.getTime() + 4 * 3600000);

    const pad = (n) => String(n).padStart(2, '0');
    const toIsoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const prepInput = document.getElementById('listingPrepTime');
    const startInput = document.getElementById('listingPickupStart');
    const endInput = document.getElementById('listingPickupEnd');

    if (prepInput) prepInput.value = toIsoLocal(now);
    if (startInput) startInput.value = toIsoLocal(startTime);
    if (endInput) endInput.value = toIsoLocal(deadlineTime);

    newListingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('listingTitle').value.trim();
      const category = document.getElementById('listingCategory').value;
      const qty = parseFloat(document.getElementById('listingQty').value);
      const unit = document.getElementById('listingUnit').value;
      const prepTime = document.getElementById('listingPrepTime').value;
      const availableStart = document.getElementById('listingPickupStart').value;
      const deadline = document.getElementById('listingPickupEnd').value;
      const location = document.getElementById('listingLocation').value.trim();
      const storageInfo = document.getElementById('listingStorage').value.trim();
      const contactPerson = document.getElementById('listingContact').value.trim();
      const safetyChecked = document.getElementById('listingSafetyCheck').checked;

      if (!safetyChecked) {
        showToast('Please confirm review of applicable food donation requirements', 'error');
        return;
      }

      if (!title || isNaN(qty) || qty <= 0 || !location || !contactPerson) {
        showToast('Please fill out all required fields correctly', 'error');
        return;
      }

      const newListing = {
        id: 'lst_' + Date.now(),
        title,
        category,
        quantityOffered: qty,
        quantityCollected: 0,
        unit,
        prepTime,
        availableStart,
        deadline,
        location,
        storageInfo: storageInfo || 'Clean hygienic food-grade container storage.',
        contactPerson,
        status: 'Open',
        matchedOrgId: null,
        matchedOrgName: null,
        matchScore: null,
        donorConfirmed: false,
        receiverConfirmed: false,
        donorConfirmedAt: null,
        receiverConfirmedAt: null,
        createdDate: new Date().toISOString().split('T')[0]
      };

      // Add to data layer
      AnnaLinkData.addListing(newListing);
      closeModal('listSurplusModal');
      newListingForm.reset();
      renderConnectListings();

      showToast(`Listed "${title}" (${qty} ${unit}) on AnnaLink Connect`, 'success');

      // Auto-open match suggestions for user review
      setTimeout(() => {
        openMatchesModal(newListing.id);
      }, 400);
    });
  }

  // Confirm Mutual Handoff Form Submit
  const handoffForm = document.getElementById('handoffConfirmForm');
  if (handoffForm) {
    handoffForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeListingIdForAction) return;

      const collectedQty = parseFloat(document.getElementById('actualCollectedQty').value);
      const donorSigned = document.getElementById('confirmDonorCheck').checked;
      const receiverSigned = document.getElementById('confirmReceiverCheck').checked;

      if (isNaN(collectedQty) || collectedQty <= 0) {
        showToast('Please enter a valid collected quantity', 'error');
        return;
      }

      if (!donorSigned || !receiverSigned) {
        showToast('Both donor and receiver confirmations are required to finalize collection', 'error');
        return;
      }

      const nowIso = new Date().toISOString();
      AnnaLinkData.updateListing(activeListingIdForAction, {
        status: 'Collected',
        quantityCollected: collectedQty,
        donorConfirmed: true,
        receiverConfirmed: true,
        donorConfirmedAt: nowIso,
        receiverConfirmedAt: nowIso
      });

      closeModal('handoffModal');
      renderConnectListings();
      showToast(`Successfully confirmed handoff of ${collectedQty} kg food!`, 'success');
    });
  }
});

// Render all listings in Connect
function renderConnectListings() {
  const allListings = AnnaLinkData.getListings();
  const availablePane = document.getElementById('availableListingsContainer');
  const myListingsBody = document.getElementById('myListingsTableBody');

  // Filter listings
  const filteredListings = allListings.filter(l => {
    if (currentFilterStatus === 'all') return true;
    if (currentFilterStatus === 'active') return ['Open', 'Accepted', 'Awaiting pickup', 'Awaiting confirmation'].includes(l.status);
    return l.status === currentFilterStatus;
  });

  // Render "Available Surplus" Cards
  if (availablePane) {
    if (filteredListings.length === 0) {
      availablePane.innerHTML = `
        <div class="empty-state" style="background:#FFFFFF;border-radius:var(--radius-lg);border:1px solid var(--color-border);width:100%;">
          <div class="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
          <div class="empty-title">No Listings Match Filter</div>
          <div class="empty-desc">There are no surplus food records matching "${currentFilterStatus}".</div>
          <button type="button" class="btn btn-primary btn-sm" onclick="openModal('listSurplusModal')">
            Create New Surplus Listing
          </button>
        </div>
      `;
    } else {
      availablePane.innerHTML = filteredListings.map(listing => renderListingCard(listing)).join('');
    }
  }

  // Render "My Listings" Management Table
  if (myListingsBody) {
    if (allListings.length === 0) {
      myListingsBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:32px;color:var(--color-text-muted);">
            No surplus food listings created yet.
          </td>
        </tr>
      `;
    } else {
      myListingsBody.innerHTML = allListings.map(l => {
        let badgeClass = 'badge-neutral';
        if (l.status === 'Open') badgeClass = 'badge-open';
        else if (l.status === 'Collected') badgeClass = 'badge-collected';
        else if (l.status === 'Accepted' || l.status === 'Awaiting pickup') badgeClass = 'badge-accepted';
        else if (l.status === 'Cancelled' || l.status === 'Expired') badgeClass = 'badge-cancelled';

        const qtyDisplay = l.status === 'Collected' 
          ? `<strong>${l.quantityCollected} ${l.unit}</strong> <span style="font-size:11px;color:var(--color-text-light);">(offered ${l.quantityOffered})</span>`
          : `<strong>${l.quantityOffered} ${l.unit}</strong>`;

        return `
          <tr>
            <td>
              <div style="font-weight:600;color:var(--color-text-main);">${l.title}</div>
              <div style="font-size:11.5px;color:var(--color-text-light);">${l.category} • Created ${l.createdDate}</div>
            </td>
            <td>${qtyDisplay}</td>
            <td><span class="badge ${badgeClass}">${l.status}</span></td>
            <td>${l.matchedOrgName || '<span style="color:var(--color-text-light);">None selected</span>'}</td>
            <td style="font-size:12.5px;color:var(--color-text-muted);">${Formatters.datetime(l.deadline)}</td>
            <td>
              <div style="display:flex;gap:6px;">
                ${renderTableActions(l)}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Generate single listing card HTML
function renderListingCard(listing) {
  let badgeClass = 'badge-neutral';
  if (listing.status === 'Open') badgeClass = 'badge-open';
  else if (listing.status === 'Collected') badgeClass = 'badge-collected';
  else if (listing.status === 'Accepted' || listing.status === 'Awaiting pickup') badgeClass = 'badge-accepted';
  else if (listing.status === 'Cancelled' || listing.status === 'Expired') badgeClass = 'badge-cancelled';

  // Mutual confirmation status indicators
  let confirmationPipelineHtml = '';
  if (['Accepted', 'Awaiting pickup', 'Awaiting confirmation', 'Collected'].includes(listing.status)) {
    const isDonorDone = listing.donorConfirmed;
    const isRecDone = listing.receiverConfirmed;

    confirmationPipelineHtml = `
      <div class="confirmation-pipeline">
        <div style="flex:1;">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:4px;">
            Mutual Handoff Verification
          </div>
          <div style="display:flex;align-items:center;gap:18px;">
            <div class="step-indicator ${isDonorDone ? 'done' : ''}">
              <div class="step-circle">${isDonorDone ? '✓' : '1'}</div>
              <span>Donor Release ${isDonorDone ? '(Confirmed)' : '(Pending)'}</span>
            </div>
            <div style="color:var(--color-border-hover);">→</div>
            <div class="step-indicator ${isRecDone ? 'done' : ''}">
              <div class="step-circle">${isRecDone ? '✓' : '2'}</div>
              <span>Receiver Intake ${isRecDone ? '(Confirmed)' : '(Pending)'}</span>
            </div>
          </div>
        </div>
        <div>
          ${listing.status !== 'Collected' ? `
            <button type="button" class="btn btn-secondary btn-sm" onclick="openHandoffModal('${listing.id}')">
              Verify Mutual Handoff
            </button>
          ` : `
            <span class="badge badge-collected">Completed Collection</span>
          `}
        </div>
      </div>
    `;
  }

  return `
    <div class="listing-card" id="listing_${listing.id}">
      <div class="listing-card-header">
        <div>
          <span class="badge ${badgeClass}" style="margin-bottom:6px;">${listing.status}</span>
          <h3 class="listing-card-title">${listing.title}</h3>
          <p style="font-size:13px;color:var(--color-text-muted);">
            Category: <strong>${listing.category}</strong> • Listed: ${Formatters.datetime(listing.availableStart)}
          </p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:22px;font-weight:700;color:var(--color-text-main);">
            ${listing.status === 'Collected' ? listing.quantityCollected : listing.quantityOffered} ${listing.unit}
          </div>
          <div style="font-size:12px;color:var(--color-text-light);">
            ${listing.status === 'Collected' ? 'Verified Collected' : 'Offered Quantity'}
          </div>
        </div>
      </div>

      <div class="listing-card-grid">
        <div class="listing-detail-item">
          <span class="listing-detail-lbl">Collection Deadline</span>
          <span class="listing-detail-val">${Formatters.datetime(listing.deadline)}</span>
        </div>
        <div class="listing-detail-item">
          <span class="listing-detail-lbl">Pickup Location</span>
          <span class="listing-detail-val" title="${listing.location}">${listing.location}</span>
        </div>
        <div class="listing-detail-item">
          <span class="listing-detail-lbl">Receiving Partner</span>
          <span class="listing-detail-val">${listing.matchedOrgName || 'Open for matching'}</span>
        </div>
        <div class="listing-detail-item">
          <span class="listing-detail-lbl">Kitchen Contact</span>
          <span class="listing-detail-val">${listing.contactPerson}</span>
        </div>
      </div>

      <div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:14px;font-size:12.5px;color:var(--color-text-muted);">
        <strong>Storage & Handling:</strong> ${listing.storageInfo}
      </div>

      ${confirmationPipelineHtml}

      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid var(--color-border);">
        <div style="font-size:12px;color:var(--color-text-light);">
          ID: ${listing.id}
        </div>
        <div style="display:flex;gap:8px;">
          ${renderCardButtons(listing)}
        </div>
      </div>
    </div>
  `;
}

// Generate contextual action buttons for card
function renderCardButtons(listing) {
  if (listing.status === 'Open') {
    return `
      <button type="button" class="btn btn-secondary btn-sm" onclick="openMatchesModal('${listing.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
        View Matched Receivers
      </button>
      <button type="button" class="btn btn-outline btn-sm" onclick="cancelListing('${listing.id}')">
        Cancel Listing
      </button>
    `;
  } else if (listing.status === 'Accepted' || listing.status === 'Awaiting pickup') {
    return `
      <button type="button" class="btn btn-primary btn-sm" onclick="openHandoffModal('${listing.id}')">
        Confirm Handoff
      </button>
      <button type="button" class="btn btn-outline btn-sm" onclick="cancelListing('${listing.id}')">
        Cancel
      </button>
    `;
  } else if (listing.status === 'Collected') {
    return `
      <button type="button" class="btn btn-outline btn-sm" onclick="viewListingHistory('${listing.id}')">
        View Handoff Receipt
      </button>
    `;
  } else {
    return `
      <button type="button" class="btn btn-outline btn-sm" onclick="viewListingHistory('${listing.id}')">
        View Record
      </button>
    `;
  }
}

// Actions for Table Row
function renderTableActions(listing) {
  if (listing.status === 'Open') {
    return `
      <button type="button" class="btn btn-secondary btn-sm" onclick="openMatchesModal('${listing.id}')">Matches</button>
      <button type="button" class="btn btn-outline btn-sm" onclick="cancelListing('${listing.id}')">Cancel</button>
    `;
  } else if (listing.status === 'Accepted' || listing.status === 'Awaiting pickup') {
    return `
      <button type="button" class="btn btn-primary btn-sm" onclick="openHandoffModal('${listing.id}')">Confirm Handoff</button>
    `;
  } else {
    return `
      <button type="button" class="btn btn-outline btn-sm" onclick="viewListingHistory('${listing.id}')">Details</button>
    `;
  }
}

// Open Matched Receiving Organisations Modal
window.openMatchesModal = function(listingId) {
  activeListingIdForAction = listingId;
  const listings = AnnaLinkData.getListings();
  const listing = listings.find(l => l.id === listingId);
  if (!listing) return;

  const titleEl = document.getElementById('matchesModalListingTitle');
  const container = document.getElementById('matchesListContainer');

  if (titleEl) {
    titleEl.textContent = `Matching Receivers for: ${listing.title} (${listing.quantityOffered} ${listing.unit})`;
  }

  // Calculate deterministic match rankings
  const rankedMatches = AnnaLinkData.calculateMatchesForListing(listing);

  if (container) {
    container.innerHTML = rankedMatches.map(m => `
      <div class="org-match-card">
        <div class="org-match-info">
          <div class="org-name-wrap">
            <span class="org-name">${m.org.name}</span>
            <span class="org-score-badge">${m.score}% Indicative Match</span>
          </div>
          <div style="font-size:12.5px;color:var(--color-text-muted);">
            ${m.org.area}, ${m.org.city} • Capacity: ${m.org.capacityKg} kg/day • Hours: ${m.org.operatingWindow}
          </div>
          <div style="font-size:12px;color:var(--color-primary);margin-top:4px;">
            <strong>Focus:</strong> ${m.org.focus}
          </div>
          <ul class="org-reasons-list">
            ${m.reasons.map(r => `<li class="org-reason-tag">✓ ${r}</li>`).join('')}
          </ul>
        </div>
        <div>
          <button type="button" class="btn btn-primary btn-sm" onclick="assignOrgToListing('${listing.id}', '${m.org.id}', '${m.org.name}', ${m.score})">
            Accept & Connect
          </button>
        </div>
      </div>
    `).join('');
  }

  openModal('matchesModal');
};

// Accept match with organisation
window.assignOrgToListing = function(listingId, orgId, orgName, matchScore) {
  AnnaLinkData.updateListing(listingId, {
    status: 'Awaiting pickup',
    matchedOrgId: orgId,
    matchedOrgName: orgName,
    matchScore
  });

  closeModal('matchesModal');
  renderConnectListings();
  showToast(`Connected with ${orgName}. Status updated to "Awaiting pickup"`, 'success');
};

// Open Handoff Modal
window.openHandoffModal = function(listingId) {
  activeListingIdForAction = listingId;
  const listings = AnnaLinkData.getListings();
  const listing = listings.find(l => l.id === listingId);
  if (!listing) return;

  const titleEl = document.getElementById('handoffModalTitle');
  const orgNameEl = document.getElementById('handoffReceiverName');
  const offeredEl = document.getElementById('handoffOfferedQty');
  const actualQtyInput = document.getElementById('actualCollectedQty');

  if (titleEl) titleEl.textContent = `Mutual Handoff Verification: ${listing.title}`;
  if (orgNameEl) orgNameEl.textContent = listing.matchedOrgName || 'Designated Receiving Partner';
  if (offeredEl) offeredEl.textContent = `${listing.quantityOffered} ${listing.unit}`;
  if (actualQtyInput) actualQtyInput.value = listing.quantityOffered;

  // Uncheck verification boxes by default
  const donorCheck = document.getElementById('confirmDonorCheck');
  const receiverCheck = document.getElementById('confirmReceiverCheck');
  if (donorCheck) donorCheck.checked = false;
  if (receiverCheck) receiverCheck.checked = false;

  openModal('handoffModal');
};

// Cancel listing
window.cancelListing = function(listingId) {
  if (confirm('Are you sure you want to cancel this surplus food listing?')) {
    AnnaLinkData.updateListing(listingId, {
      status: 'Cancelled',
      cancellationReason: 'Cancelled by kitchen team.'
    });
    renderConnectListings();
    showToast('Surplus listing marked as Cancelled', 'info');
  }
};

// View listing history / receipt
window.viewListingHistory = function(listingId) {
  const listings = AnnaLinkData.getListings();
  const listing = listings.find(l => l.id === listingId);
  if (!listing) return;

  const content = `
    <div style="font-size:13.5px;line-height:1.6;">
      <div style="padding:12px;background:var(--color-bg);border-radius:var(--radius-md);margin-bottom:14px;border:1px solid var(--color-border);">
        <div style="font-size:16px;font-weight:700;">${listing.title}</div>
        <div style="color:var(--color-text-muted);">${listing.category} • Ref #${listing.id}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
        <div><strong>Status:</strong> <span class="badge badge-collected">${listing.status}</span></div>
        <div><strong>Partner:</strong> ${listing.matchedOrgName || 'N/A'}</div>
        <div><strong>Quantity Offered:</strong> ${listing.quantityOffered} ${listing.unit}</div>
        <div><strong>Quantity Collected:</strong> ${listing.quantityCollected || 0} ${listing.unit}</div>
        <div><strong>Donor Confirmed:</strong> ${listing.donorConfirmedAt ? Formatters.datetime(listing.donorConfirmedAt) : 'Pending'}</div>
        <div><strong>Receiver Confirmed:</strong> ${listing.receiverConfirmedAt ? Formatters.datetime(listing.receiverConfirmedAt) : 'Pending'}</div>
      </div>
      <div style="font-size:12px;color:var(--color-text-muted);background:var(--color-mint-light);padding:10px;border-radius:var(--radius-sm);border:1px solid rgba(40,122,80,0.2);">
        Recorded in persistent local storage. Both parties agreed to applicable food handling responsibility.
      </div>
    </div>
  `;

  const bodyEl = document.getElementById('historyModalBody');
  if (bodyEl) bodyEl.innerHTML = content;
  openModal('historyModal');
};
