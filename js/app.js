/**
 * DXIGN CRM - MAIN APPLICATION CONTROLLER
 * Handles view routing, global search (Cmd+K), audio chimes,
 * notifications, data exports, and initializations.
 */

import { crmStore } from './data.js';
import { initLeadsModule, renderLeads } from './leads.js';
import { initFollowupsModule } from './followups.js';
import { initOmnichannelModule } from './omnichannel.js';
import { initAnalyticsModule, updateDashboardMetrics } from './analytics.js';

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupGlobalSearch();
  setupSettingsModule();
  setupAudioChime();
  setupToastSystem();

  // Initialize sub-modules
  initLeadsModule();
  initFollowupsModule();
  initOmnichannelModule();
  initAnalyticsModule();

  // Handle window resizing for responsive charts
  window.addEventListener('resize', () => {
    initAnalyticsModule();
  });
});

/* ==========================================================================
   VIEW NAVIGATION ROUTING
   ========================================================================== */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-target]');
  const sections = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.dataset.target;

      // Update Nav active class
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update section display
      sections.forEach(sec => sec.classList.remove('active'));
      const activeSec = document.getElementById(targetId);
      if (activeSec) {
        activeSec.classList.add('active');
        // Trigger specific section refreshes
        if (targetId === 'view-dashboard') {
          initAnalyticsModule();
        } else if (targetId === 'view-leads') {
          renderLeads();
        } else if (targetId === 'view-followups') {
          initFollowupsModule();
        }
      }

      // Close mobile menu if open
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');
    });
  });

  // Mobile hamburger menu toggle
  const mobileToggle = document.getElementById('btn-mobile-menu');
  const sidebar = document.querySelector('.sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

/* ==========================================================================
   GLOBAL SEARCH MODAL (CMD+K / CTRL+K)
   ========================================================================== */
function setupGlobalSearch() {
  const searchModal = document.getElementById('modal-global-search');
  const searchInput = document.getElementById('global-search-modal-input');
  const resultsContainer = document.getElementById('global-search-results');
  const triggerBtns = document.querySelectorAll('.trigger-global-search');

  const openSearch = () => {
    if (!searchModal) return;
    searchModal.classList.add('active');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
      renderSearchResults('');
    }
  };

  const closeSearch = () => {
    if (!searchModal) return;
    searchModal.classList.remove('active');
  };

  triggerBtns.forEach(btn => btn.addEventListener('click', openSearch));

  // Keyboard shortcut listener: Cmd/Ctrl + K or Escape to close
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchModal.classList.contains('active')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.toLowerCase().trim());
    });
  }

  // Close when clicking modal backdrop
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    const leads = crmStore.getLeads();

    const matches = leads.filter(l => {
      if (!query) return true;
      return (l.name || '').toLowerCase().includes(query) ||
             (l.company || '').toLowerCase().includes(query) ||
             (l.phone || '').toLowerCase().includes(query) ||
             (l.instagram || '').toLowerCase().includes(query) ||
             (l.notes || '').toLowerCase().includes(query);
    }).slice(0, 6);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No matching leads found</div>`;
      return;
    }

    resultsContainer.innerHTML = matches.map(l => `
      <div class="search-result-item" onclick="window.handleSearchSelect('${l.id}')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="urgent-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">${(l.name || 'L')[0]}</div>
          <div>
            <div style="font-weight: 700; color: #fff; font-size: 0.88rem;">${l.name}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${l.company || 'Direct'} • $${Number(l.value || 0).toLocaleString()}</div>
          </div>
        </div>
        <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-primary); font-weight: 700; background: rgba(99,102,241,0.15); padding: 3px 8px; border-radius: 4px;">
          ${l.stage}
        </div>
      </div>
    `).join('');
  }

  window.handleSearchSelect = function(leadId) {
    closeSearch();
    window.openLeadDrawer(leadId);
  };
}

/* ==========================================================================
   SETTINGS & DATA MANAGEMENT (Export, Import, Reset)
   ========================================================================== */
function setupSettingsModule() {
  const exportBtn = document.getElementById('btn-export-crm-json');
  const importInput = document.getElementById('input-import-crm-json');
  const resetBtn = document.getElementById('btn-reset-crm-data');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        leads: crmStore.leads,
        sequences: crmStore.sequences,
        autoReplies: crmStore.autoReplies,
        exportDate: new Date().toISOString()
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dxign_crm_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (window.showToast) window.showToast('CRM data backup downloaded!', 'success');
    });
  }

  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.leads && Array.isArray(imported.leads)) {
            crmStore.leads = imported.leads;
            if (imported.sequences) crmStore.sequences = imported.sequences;
            if (imported.autoReplies) crmStore.autoReplies = imported.autoReplies;
            crmStore.save();
            renderLeads();
            updateDashboardMetrics();
            if (window.showToast) window.showToast('CRM data restored successfully!', 'success');
          } else {
            alert('Invalid CRM backup file format');
          }
        } catch (err) {
          alert('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset CRM to clean sample database? Any unsaved changes will be refreshed.')) {
        crmStore.loadDefaults();
        renderLeads();
        initFollowupsModule();
        initOmnichannelModule();
        initAnalyticsModule();
        if (window.showToast) window.showToast('CRM reset to fresh sample data', 'info');
      }
    });
  }
}

/* ==========================================================================
   WEB AUDIO API CHIME (Subtle & Zero External Audio Files)
   ========================================================================== */
function setupAudioChime() {
  let audioCtx = null;

  window.playChime = function() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext disallowed before user interaction
    }
  };
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */
function setupToastSystem() {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = `●`;
    if (type === 'success') icon = `✓`;
    if (type === 'warning') icon = `!`;

    toast.innerHTML = `
      <span style="font-weight: 800; font-size: 1rem;">${icon}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };
}
