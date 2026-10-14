/**
 * AnnaLink — AnnaLink Impact
 * Reporting Dashboard, Dynamic Calculations, Category Breakdown & CSV Export
 */

let selectedPeriod = '7d';
let activeTableStatusFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Period filter change handler
  const periodSelect = document.getElementById('impactPeriodSelect');
  if (periodSelect) {
    periodSelect.addEventListener('change', (e) => {
      selectedPeriod = e.target.value;
      updateImpactDashboard();
    });
  }

  // Table status filter change handler
  const statusSelect = document.getElementById('impactStatusFilter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      activeTableStatusFilter = e.target.value;
      renderImpactTable();
    });
  }

  // Download CSV button
  const btnCsv = document.getElementById('btnDownloadCsv');
  if (btnCsv) {
    btnCsv.addEventListener('click', exportImpactCsv);
  }

  // Initial render
  updateImpactDashboard();
});

// Update all components of impact dashboard
function updateImpactDashboard() {
  const allListings = AnnaLinkData.getListings();

  // Period filtering logic
  const now = new Date('2026-10-14T23:59:59');
  const periodDays = selectedPeriod === '7d' ? 7 : (selectedPeriod === '30d' ? 30 : 90);

  const filteredListings = allListings.filter(item => {
    if (selectedPeriod === 'all') return true;
    const itemDate = new Date(item.createdDate);
    const diffDays = Math.ceil((now - itemDate) / (1000 * 60 * 60 * 24));
    return diffDays <= periodDays;
  });

  // Calculate metrics
  const totalOffered = filteredListings.reduce((sum, l) => sum + (Number(l.quantityOffered) || 0), 0);
  
  const collectedListings = filteredListings.filter(l => l.status === 'Collected');
  const totalCollected = collectedListings.reduce((sum, l) => sum + (Number(l.quantityCollected) || 0), 0);

  const acceptedListings = filteredListings.filter(l => ['Accepted', 'Awaiting pickup', 'Awaiting confirmation'].includes(l.status));
  const totalAccepted = acceptedListings.reduce((sum, l) => sum + (Number(l.quantityOffered) || 0), 0);

  const completionRate = totalOffered > 0 ? (totalCollected / totalOffered) * 100 : 0;
  const completedCount = collectedListings.length;
  const cancelledExpiredCount = filteredListings.filter(l => ['Cancelled', 'Expired'].includes(l.status)).length;
  const avoidedValue = Math.round(totalCollected * 87.324);

  // Update KPI DOM elements
  document.getElementById('metricOffered').textContent = `${Math.round(totalOffered * 10) / 10} kg`;
  document.getElementById('metricAccepted').textContent = `${Math.round(totalAccepted * 10) / 10} kg`;
  document.getElementById('metricCollected').textContent = `${Math.round(totalCollected * 10) / 10} kg`;
  document.getElementById('metricRate').textContent = `${Math.round(completionRate * 10) / 10}%`;
  document.getElementById('metricPickups').textContent = `${completedCount} Pickups`;
  document.getElementById('metricCancelledExpired').textContent = `${cancelledExpiredCount} Lots`;
  document.getElementById('metricAvoidedValue').textContent = Formatters.currency(avoidedValue);

  // Render SVG Trend Chart
  renderImpactChart(filteredListings);

  // Render Category Breakdown
  renderCategoryBreakdown(filteredListings);

  // Render Table
  renderImpactTable(filteredListings);
}

// Render SVG Chart for Impact
function renderImpactChart(listings) {
  const container = document.getElementById('impactChartWrap');
  if (!container) return;

  // Aggregate by date
  const dateMap = {};
  listings.forEach(l => {
    const d = l.createdDate || '2026-10-14';
    if (!dateMap[d]) dateMap[d] = { date: d, offered: 0, collected: 0 };
    dateMap[d].offered += Number(l.quantityOffered) || 0;
    if (l.status === 'Collected') {
      dateMap[d].collected += Number(l.quantityCollected) || 0;
    }
  });

  const sortedDates = Object.keys(dateMap).sort();
  if (sortedDates.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-text-muted);">No records in period</div>';
    return;
  }

  const chartWidth = 560;
  const chartHeight = 170;
  const groupSpacing = chartWidth / sortedDates.length;
  const barWidth = Math.min(22, groupSpacing * 0.35);

  let maxVal = 40;
  sortedDates.forEach(d => {
    maxVal = Math.max(maxVal, dateMap[d].offered, dateMap[d].collected);
  });

  let svgElements = '';
  sortedDates.forEach((dateStr, idx) => {
    const xCenter = idx * groupSpacing + groupSpacing / 2;
    const entry = dateMap[dateStr];

    const offH = (entry.offered / maxVal) * chartHeight;
    const colH = (entry.collected / maxVal) * chartHeight;

    const offY = chartHeight - offH;
    const colY = chartHeight - colH;

    // Format readable short date
    const dParts = dateStr.split('-');
    const label = `${dParts[1]}/${dParts[2]}`;

    svgElements += `
      <g>
        <!-- Offered Bar -->
        <rect x="${xCenter - barWidth - 2}" y="${offY}" width="${barWidth}" height="${offH}" rx="4" fill="#CBD4CA" />
        <!-- Collected Bar -->
        <rect x="${xCenter + 2}" y="${colY}" width="${barWidth}" height="${colH}" rx="4" fill="#287A50" />
        <!-- Date Label -->
        <text x="${xCenter}" y="${chartHeight + 20}" font-size="11" fill="#6B756D" text-anchor="middle" font-family="system-ui">${label}</text>
      </g>
    `;
  });

  container.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight + 30}" preserveAspectRatio="none">
      <line x1="0" y1="0" x2="${chartWidth}" y2="0" stroke="#E3E8E2" stroke-dasharray="3,3" />
      <line x1="0" y1="${chartHeight * 0.5}" x2="${chartWidth}" y2="${chartHeight * 0.5}" stroke="#E3E8E2" stroke-dasharray="3,3" />
      <line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" stroke="#E3E8E2" />
      ${svgElements}
    </svg>
  `;
}

// Render Category Breakdown Progress Bars
function renderCategoryBreakdown(listings) {
  const container = document.getElementById('categoryBreakdownWrap');
  if (!container) return;

  const categories = ['Prepared Meals', 'Fresh Produce', 'Bakery & Grains', 'Dairy'];
  const catTotals = {
    'Prepared Meals': { offered: 0, collected: 0 },
    'Fresh Produce': { offered: 0, collected: 0 },
    'Bakery & Grains': { offered: 0, collected: 0 },
    'Dairy': { offered: 0, collected: 0 }
  };

  listings.forEach(l => {
    const cat = l.category || 'Prepared Meals';
    if (!catTotals[cat]) catTotals[cat] = { offered: 0, collected: 0 };
    catTotals[cat].offered += Number(l.quantityOffered) || 0;
    if (l.status === 'Collected') {
      catTotals[cat].collected += Number(l.quantityCollected) || 0;
    }
  });

  const totalOfferedAll = Object.values(catTotals).reduce((sum, c) => sum + c.offered, 0) || 1;

  container.innerHTML = categories.map(cat => {
    const data = catTotals[cat];
    const percentOfTotal = Math.round((data.offered / totalOfferedAll) * 100);
    const catRate = data.offered > 0 ? Math.round((data.collected / data.offered) * 100) : 0;

    return `
      <div style="margin-bottom: 16px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px;">
          <span>${cat}</span>
          <span style="color:var(--color-primary);">${data.collected} kg collected / ${data.offered} kg offered (${catRate}%)</span>
        </div>
        <div style="width:100%;height:8px;background:var(--color-border);border-radius:var(--radius-full);overflow:hidden;">
          <div style="width:${Math.min(percentOfTotal, 100)}%;height:100%;background:var(--color-secondary);border-radius:var(--radius-full);"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Detailed Impact Records Table
function renderImpactTable(preFilteredListings) {
  const tbody = document.getElementById('impactTableBody');
  if (!tbody) return;

  const listings = preFilteredListings || AnnaLinkData.getListings();

  const filtered = listings.filter(l => {
    if (activeTableStatusFilter === 'all') return true;
    if (activeTableStatusFilter === 'Collected') return l.status === 'Collected';
    if (activeTableStatusFilter === 'in_progress') return ['Accepted', 'Awaiting pickup', 'Awaiting confirmation'].includes(l.status);
    if (activeTableStatusFilter === 'cancelled_expired') return ['Cancelled', 'Expired'].includes(l.status);
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:32px;color:var(--color-text-muted);">
          No collection records found matching selected filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    let badgeClass = 'badge-neutral';
    if (l.status === 'Open') badgeClass = 'badge-open';
    else if (l.status === 'Collected') badgeClass = 'badge-collected';
    else if (l.status === 'Accepted' || l.status === 'Awaiting pickup') badgeClass = 'badge-accepted';
    else if (l.status === 'Cancelled' || l.status === 'Expired') badgeClass = 'badge-cancelled';

    return `
      <tr>
        <td>
          <div style="font-weight:600;color:var(--color-text-main);">${l.title}</div>
          <div style="font-size:11.5px;color:var(--color-text-light);">Ref: #${l.id}</div>
        </td>
        <td>${l.category}</td>
        <td>${l.createdDate}</td>
        <td><strong>${l.quantityOffered} ${l.unit}</strong></td>
        <td>
          ${l.status === 'Collected' 
            ? `<strong style="color:var(--color-secondary);">${l.quantityCollected} ${l.unit}</strong>` 
            : '<span style="color:var(--color-text-light);">0 kg</span>'}
        </td>
        <td><span class="badge ${badgeClass}">${l.status}</span></td>
        <td style="font-size:13px;">${l.matchedOrgName || '—'}</td>
      </tr>
    `;
  }).join('');
}

// Export Report as CSV
function exportImpactCsv() {
  const now = new Date('2026-10-14T23:59:59');
  const periodDays = selectedPeriod === '7d' ? 7 : (selectedPeriod === '30d' ? 30 : (selectedPeriod === '90d' ? 90 : null));

  let listings = AnnaLinkData.getListings();

  if (selectedPeriod !== 'all' && periodDays !== null) {
    listings = listings.filter(item => {
      const itemDate = new Date(item.createdDate);
      const diffDays = Math.ceil((now - itemDate) / (1000 * 60 * 60 * 24));
      return diffDays <= periodDays;
    });
  }

  listings = listings.filter(l => {
    if (activeTableStatusFilter === 'all') return true;
    if (activeTableStatusFilter === 'Collected') return l.status === 'Collected';
    if (activeTableStatusFilter === 'in_progress') return ['Accepted', 'Awaiting pickup', 'Awaiting confirmation'].includes(l.status);
    if (activeTableStatusFilter === 'open') return l.status === 'Open';
    if (activeTableStatusFilter === 'cancelled_expired') return ['Cancelled', 'Expired'].includes(l.status);
    return true;
  });

  if (listings.length === 0) {
    showToast('No records available to export', 'error');
    return;
  }

  // Build CSV Header
  const headers = [
    'Listing ID',
    'Food Title',
    'Category',
    'Date Listed',
    'Quantity Offered (kg)',
    'Quantity Collected (kg)',
    'Status',
    'Receiving Organisation',
    'Donor Confirmed At',
    'Receiver Confirmed At',
    'Location'
  ];

  // Build CSV Rows
  const rows = listings.map(l => [
    `"${l.id}"`,
    `"${(l.title || '').replace(/"/g, '""')}"`,
    `"${l.category || ''}"`,
    `"${l.createdDate || ''}"`,
    l.quantityOffered || 0,
    l.quantityCollected || 0,
    `"${l.status || ''}"`,
    `"${(l.matchedOrgName || 'N/A').replace(/"/g, '""')}"`,
    `"${l.donorConfirmedAt || ''}"`,
    `"${l.receiverConfirmedAt || ''}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  
  // Create Blob & Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AnnaLink_Impact_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Impact CSV report downloaded successfully', 'success');
}
