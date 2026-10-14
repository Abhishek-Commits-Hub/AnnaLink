/**
 * AnnaLink — Connecting Food. Reducing Waste.
 * Shared Application Shell, Navigation, Notifications & Utilities
 */

// Toast Notifications Helper
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Inline SVG icon based on type
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `
    <span style="display:inline-flex;align-items:center;">${iconSvg}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.2s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }, duration);
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Ensure all scrollable containers inside the modal reset to the top
    modal.scrollTop = 0;
    const modalBox = modal.querySelector('.modal-box');
    if (modalBox) modalBox.scrollTop = 0;
    const modalBodies = modal.querySelectorAll('.modal-body');
    modalBodies.forEach(mb => {
      mb.scrollTop = 0;
    });
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Formatters
const Formatters = {
  currency(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  },
  number(num) {
    return Number(num || 0).toLocaleString('en-IN');
  },
  datetime(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  },
  date(dateString) {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }
};

// Clipboard copy helper
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage, 'success');
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage, 'success');
  } catch (err) {
    showToast('Could not copy automatically. Please select text manually.', 'error');
  }
  document.body.removeChild(textArea);
}

// Render dynamic notifications dropdown
function renderNotifications() {
  const notifs = AnnaLinkData.getNotifications();
  const unreadCount = notifs.filter(n => !n.read).length;
  
  const badgeEl = document.getElementById('notifBadge');
  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = 'flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  const listEl = document.getElementById('notifList');
  if (!listEl) return;

  if (notifs.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 13px;">
        No notifications right now.
      </div>
    `;
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <a href="${n.link || '#'}" class="notification-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon-circle">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.description}</div>
        <div class="notif-time">${n.timestamp}</div>
      </div>
    </a>
  `).join('');
}

// Initialize Application UI
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggleBtn = document.getElementById('mobileNavToggle');
  const sidebar = document.querySelector('.sidebar');
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });
  }

  // Notification Bell Dropdown
  const notifBtn = document.getElementById('notifBtn');
  const notifMenu = document.getElementById('notifMenu');
  if (notifBtn && notifMenu) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!notifMenu.contains(e.target) && !notifBtn.contains(e.target)) {
        notifMenu.classList.remove('show');
      }
    });
  }

  // Mark all notifications read
  const markReadBtn = document.getElementById('markReadBtn');
  if (markReadBtn) {
    markReadBtn.addEventListener('click', () => {
      AnnaLinkData.markNotificationsAsRead();
      renderNotifications();
      showToast('Notifications marked as read', 'info');
    });
  }

  // Setup modal close handlers on click overlay or close button
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // ESC key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show').forEach(m => {
        m.classList.remove('show');
      });
      document.body.style.overflow = '';
      const notifMenu = document.getElementById('notifMenu');
      if (notifMenu) notifMenu.classList.remove('show');
    }
  });

  // Render initial notifications
  renderNotifications();
});
