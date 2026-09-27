/**
 * DXIGN CRM - LEADS & PIPELINE MANAGEMENT
 * Interactive Kanban drag-and-drop board, filterable list table,
 * slide-over lead drawer, and 1-click WhatsApp launcher.
 */

import { crmStore, PIPELINE_STAGES, QUICK_TEMPLATES } from './data.js';

let currentFilter = {
  search: '',
  stage: 'all',
  priority: 'all',
  source: 'all'
};

let currentViewMode = 'kanban'; // 'kanban' | 'table'
let activeDrawerLeadId = null;

export function initLeadsModule() {
  setupFilterListeners();
  setupViewModeToggle();
  renderLeads();
  setupDrawerListeners();
  setupNewLeadModal();
}

function setupFilterListeners() {
  const searchInput = document.getElementById('lead-search-input');
  const stageFilter = document.getElementById('filter-stage');
  const priorityFilter = document.getElementById('filter-priority');
  const sourceFilter = document.getElementById('filter-source');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value.toLowerCase().trim();
      renderLeads();
    });
  }

  if (stageFilter) {
    stageFilter.addEventListener('change', (e) => {
      currentFilter.stage = e.target.value;
      renderLeads();
    });
  }

  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      currentFilter.priority = e.target.value;
      renderLeads();
    });
  }

  if (sourceFilter) {
    sourceFilter.addEventListener('change', (e) => {
      currentFilter.source = e.target.value;
      renderLeads();
    });
  }
}

function setupViewModeToggle() {
  const kanbanBtn = document.getElementById('btn-view-kanban');
  const tableBtn = document.getElementById('btn-view-table');
  const kanbanBoard = document.getElementById('kanban-board-container');
  const tableView = document.getElementById('table-view-container');

  if (kanbanBtn && tableBtn) {
    kanbanBtn.addEventListener('click', () => {
      currentViewMode = 'kanban';
      kanbanBtn.classList.add('active');
      tableBtn.classList.remove('active');
      kanbanBoard.style.display = 'grid';
      tableView.style.display = 'none';
      renderLeads();
    });

    tableBtn.addEventListener('click', () => {
      currentViewMode = 'table';
      tableBtn.classList.add('active');
      kanbanBtn.classList.remove('active');
      kanbanBoard.style.display = 'none';
      tableView.style.display = 'block';
      renderLeads();
    });
  }
}

export function renderLeads() {
  const allLeads = crmStore.getLeads();

  // Apply filtering
  const filtered = allLeads.filter(lead => {
    if (currentFilter.stage !== 'all' && lead.stage !== currentFilter.stage) return false;
    if (currentFilter.priority !== 'all' && lead.priority !== currentFilter.priority) return false;
    if (currentFilter.source !== 'all' && lead.source !== currentFilter.source) return false;

    if (currentFilter.search) {
      const q = currentFilter.search;
      const matchName = (lead.name || '').toLowerCase().includes(q);
      const matchComp = (lead.company || '').toLowerCase().includes(q);
      const matchEmail = (lead.email || '').toLowerCase().includes(q);
      const matchPhone = (lead.phone || '').toLowerCase().includes(q);
      const matchNotes = (lead.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchEmail && !matchPhone && !matchNotes) return false;
    }
    return true;
  });

  if (currentViewMode === 'kanban') {
    renderKanbanBoard(filtered);
  } else {
    renderTable(filtered);
  }
}

/* ==========================================================================
   KANBAN BOARD LOGIC & HTML5 DRAG-AND-DROP
   ========================================================================== */
function renderKanbanBoard(leads) {
  const container = document.getElementById('kanban-board-container');
  if (!container) return;

  // Render columns based on PIPELINE_STAGES (excluding 'lost' from main columns or keeping 5 core ones)
  const displayStages = PIPELINE_STAGES.filter(s => s.id !== 'lost');

  container.innerHTML = displayStages.map(stage => {
    const stageLeads = leads.filter(l => l.stage === stage.id);
    const stageTotalValue = stageLeads.reduce((acc, l) => acc + (Number(l.value) || 0), 0);

    return `
      <div class="kanban-column" data-stage="${stage.id}">
        <div class="column-header">
          <div class="column-title-group">
            <span class="column-color-indicator" style="background: ${stage.color}; box-shadow: 0 0 10px ${stage.glow}"></span>
            <span class="column-title">${stage.label}</span>
            <span class="column-count">${stageLeads.length}</span>
          </div>
          <div class="column-value">$${stageTotalValue.toLocaleString()}</div>
        </div>
        <div class="kanban-cards" data-stage-drop="${stage.id}">
          ${stageLeads.map(lead => createKanbanCardHTML(lead)).join('')}
          ${stageLeads.length === 0 ? '<div style="color: var(--text-dim); font-size: 0.76rem; text-align: center; padding: 24px 0; border: 1px dashed var(--glass-border); border-radius: var(--radius-sm);">Drop leads here</div>' : ''}
        </div>
      </div>
    `;
  }).join('');

  attachDragDropEvents();
  attachCardClickEvents();
}

function createKanbanCardHTML(lead) {
  const isHot = lead.priority === 'hot';
  const isWarm = lead.priority === 'warm';
  const priorityClass = isHot ? 'priority-hot' : isWarm ? 'priority-warm' : 'priority-cold';

  let sourceBadge = '';
  if (lead.source === 'whatsapp') {
    sourceBadge = `<span class="lead-source-icon source-whatsapp">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      WhatsApp
    </span>`;
  } else if (lead.source === 'instagram') {
    sourceBadge = `<span class="lead-source-icon source-instagram">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      Instagram
    </span>`;
  } else {
    sourceBadge = `<span class="lead-source-icon source-web">Web</span>`;
  }

  // Follow-up status check
  let followupNotice = '';
  if (lead.nextFollowupDate) {
    const diff = new Date(lead.nextFollowupDate) - new Date();
    if (diff < 0) {
      followupNotice = `<span class="followup-alert" title="Follow-up Overdue!">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        Overdue
      </span>`;
    } else if (diff < 86400000) {
      followupNotice = `<span class="followup-alert" style="color: var(--accent-cyan)" title="Follow-up due within 24h">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        Due Today
      </span>`;
    }
  }

  return `
    <div class="lead-card" draggable="true" data-id="${lead.id}">
      <div class="lead-card-header">
        <div>
          <div class="lead-card-name">${escapeHTML(lead.name)}</div>
          <div class="lead-card-company">${escapeHTML(lead.company || 'Direct Contact')}</div>
        </div>
        ${sourceBadge}
      </div>

      <div class="lead-card-body">
        <div class="lead-card-value">$${Number(lead.value || 0).toLocaleString()}</div>
        <span class="priority-tag ${priorityClass}">${lead.priority}</span>
      </div>

      <div class="lead-card-footer">
        <div>${followupNotice || `<span style="color: var(--text-dim)">${timeAgo(lead.lastContactedAt || lead.createdAt)}</span>`}</div>
        <div class="card-actions-quick" onclick="event.stopPropagation()">
          ${lead.phone ? `
            <button class="btn-quick-icon" title="1-Click WhatsApp Follow-up" onclick="window.openQuickWhatsAppModal('${lead.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </button>
          ` : ''}
          <button class="btn-quick-icon" title="View Lead Details" onclick="window.openLeadDrawer('${lead.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachDragDropEvents() {
  const cards = document.querySelectorAll('.lead-card');
  const columns = document.querySelectorAll('.kanban-cards');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.closest('.kanban-column').classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.closest('.kanban-column').classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.closest('.kanban-column').classList.remove('drag-over');
      const leadId = e.dataTransfer.getData('text/plain');
      const targetStage = col.dataset.stageDrop;

      if (leadId && targetStage) {
        crmStore.updateLead(leadId, { stage: targetStage });
        renderLeads();
        if (window.playChime) window.playChime();
        if (window.showToast) window.showToast('Lead stage updated successfully', 'success');
      }
    });
  });
}

function attachCardClickEvents() {
  const cards = document.querySelectorAll('.lead-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      openLeadDrawer(card.dataset.id);
    });
  });
}

/* ==========================================================================
   TABLE VIEW LOGIC
   ========================================================================== */
function renderTable(leads) {
  const tbody = document.getElementById('table-leads-body');
  if (!tbody) return;

  if (leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 40px;">No leads matching current filters</td></tr>`;
    return;
  }

  tbody.innerHTML = leads.map(lead => {
    const stageObj = PIPELINE_STAGES.find(s => s.id === lead.stage) || { label: lead.stage, color: '#6366f1' };
    const priorityClass = lead.priority === 'hot' ? 'priority-hot' : lead.priority === 'warm' ? 'priority-warm' : 'priority-cold';

    return `
      <tr>
        <td>
          <div class="table-user-cell">
            <div class="urgent-avatar" style="width: 32px; height: 32px; font-size: 0.78rem;">${(lead.name || 'L')[0]}</div>
            <div>
              <div style="font-weight: 700; color: #fff; cursor: pointer;" onclick="window.openLeadDrawer('${lead.id}')">${escapeHTML(lead.name)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(lead.company || '-')}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="stage-badge" style="background: ${stageObj.color}25; color: ${stageObj.color}; border: 1px solid ${stageObj.color}40;">
            ${stageObj.label}
          </span>
        </td>
        <td style="font-family: var(--font-mono); font-weight: 700;">$${Number(lead.value || 0).toLocaleString()}</td>
        <td>
          <span class="priority-tag ${priorityClass}">${lead.priority}</span>
        </td>
        <td>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(lead.phone || lead.email || lead.instagram || '-')}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${lead.source}</div>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">
          ${lead.nextFollowupDate ? new Date(lead.nextFollowupDate).toLocaleDateString() : '<span style="color: var(--text-dim)">None</span>'}
        </td>
        <td>
          <div style="display: flex; gap: 8px;">
            ${lead.phone ? `
              <button class="btn btn-sm btn-whatsapp" onclick="window.openQuickWhatsAppModal('${lead.id}')" title="1-Click WhatsApp">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp
              </button>
            ` : ''}
            <button class="btn btn-sm btn-secondary" onclick="window.openLeadDrawer('${lead.id}')">View</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ==========================================================================
   SLIDE-OVER LEAD DRAWER
   ========================================================================== */
export function openLeadDrawer(leadId) {
  const lead = crmStore.getLeadById(leadId);
  if (!lead) return;

  activeDrawerLeadId = leadId;
  const drawer = document.getElementById('lead-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  document.getElementById('drawer-lead-name').textContent = lead.name;
  document.getElementById('drawer-lead-company').textContent = lead.company || 'Direct Contact';

  // Details
  document.getElementById('drawer-val-stage').innerHTML = `
    <select id="drawer-select-stage" class="form-select" style="padding: 4px 8px; font-size: 0.8rem;">
      ${PIPELINE_STAGES.map(s => `<option value="${s.id}" ${s.id === lead.stage ? 'selected' : ''}>${s.label}</option>`).join('')}
    </select>
  `;

  document.getElementById('drawer-val-value').textContent = '$' + Number(lead.value || 0).toLocaleString();
  document.getElementById('drawer-val-phone').textContent = lead.phone || 'Not provided';
  document.getElementById('drawer-val-instagram').textContent = lead.instagram || 'Not provided';
  document.getElementById('drawer-val-email').textContent = lead.email || 'Not provided';
  document.getElementById('drawer-val-source').textContent = lead.source.toUpperCase();
  document.getElementById('drawer-notes-input').value = lead.notes || '';

  // WhatsApp 1-Click Launch Button in Drawer
  const waBtn = document.getElementById('drawer-btn-whatsapp');
  if (waBtn) {
    if (lead.phone) {
      waBtn.style.display = 'inline-flex';
      waBtn.onclick = () => window.openQuickWhatsAppModal(lead.id);
    } else {
      waBtn.style.display = 'none';
    }
  }

  // Instagram profile link button
  const igBtn = document.getElementById('drawer-btn-instagram');
  if (igBtn) {
    if (lead.instagram) {
      igBtn.style.display = 'inline-flex';
      const cleanHandle = lead.instagram.replace('@', '');
      igBtn.onclick = () => window.open(`https://instagram.com/${cleanHandle}`, '_blank');
    } else {
      igBtn.style.display = 'none';
    }
  }

  // Activity Timeline
  renderDrawerTimeline(lead);

  // Bind stage change inside drawer
  const stageSelect = document.getElementById('drawer-select-stage');
  if (stageSelect) {
    stageSelect.addEventListener('change', (e) => {
      crmStore.updateLead(lead.id, { stage: e.target.value });
      renderLeads();
      renderDrawerTimeline(crmStore.getLeadById(lead.id));
      if (window.showToast) window.showToast('Lead stage updated', 'info');
    });
  }

  drawer.classList.add('active');
  backdrop.classList.add('active');
}

function renderDrawerTimeline(lead) {
  const container = document.getElementById('drawer-timeline-container');
  if (!container) return;

  const history = lead.history || [];
  container.innerHTML = history.map(item => `
    <div class="timeline-item">
      <span class="timeline-dot ${item.type === 'autoreply' || item.type === 'whatsapp' ? 'whatsapp' : item.type === 'instagram' ? 'instagram' : ''}"></span>
      <div style="font-weight: 600; color: #fff; font-size: 0.84rem;">${escapeHTML(item.text)}</div>
      <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">${new Date(item.time).toLocaleString()}</div>
    </div>
  `).join('');
}

function setupDrawerListeners() {
  const closeBtn = document.getElementById('drawer-btn-close');
  const backdrop = document.getElementById('drawer-backdrop');
  const saveNotesBtn = document.getElementById('drawer-btn-save-notes');
  const deleteBtn = document.getElementById('drawer-btn-delete-lead');

  const closeDrawer = () => {
    document.getElementById('lead-drawer').classList.remove('active');
    backdrop.classList.remove('active');
    activeDrawerLeadId = null;
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', () => {
      if (!activeDrawerLeadId) return;
      const notes = document.getElementById('drawer-notes-input').value;
      crmStore.updateLead(activeDrawerLeadId, { notes });
      crmStore.addLeadHistory(activeDrawerLeadId, 'note', 'Updated lead notes');
      renderDrawerTimeline(crmStore.getLeadById(activeDrawerLeadId));
      if (window.showToast) window.showToast('Notes saved successfully', 'success');
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!activeDrawerLeadId) return;
      if (confirm('Are you sure you want to delete this lead?')) {
        crmStore.deleteLead(activeDrawerLeadId);
        closeDrawer();
        renderLeads();
        if (window.showToast) window.showToast('Lead deleted', 'warning');
      }
    });
  }
}

/* ==========================================================================
   1-CLICK FREE WHATSAPP LAUNCHER MODAL
   ========================================================================== */
export function openQuickWhatsAppModal(leadId) {
  const lead = crmStore.getLeadById(leadId);
  if (!lead) return;

  const modal = document.getElementById('modal-quick-whatsapp');
  if (!modal) return;

  document.getElementById('wa-modal-lead-name').textContent = lead.name;
  document.getElementById('wa-modal-lead-phone').textContent = lead.phone || 'No phone number';

  const selectTpl = document.getElementById('wa-modal-template-select');
  const msgArea = document.getElementById('wa-modal-message');

  // Populate templates
  selectTpl.innerHTML = `<option value="">-- Choose High-Converting Template --</option>` +
    QUICK_TEMPLATES.map(tpl => `<option value="${tpl.id}">${tpl.title}</option>`).join('');

  // Default to first template
  const defaultText = crmStore.renderTemplate(QUICK_TEMPLATES[0].text, lead);
  msgArea.value = defaultText;

  selectTpl.onchange = (e) => {
    const tpl = QUICK_TEMPLATES.find(t => t.id === e.target.value);
    if (tpl) {
      msgArea.value = crmStore.renderTemplate(tpl.text, lead);
    }
  };

  // Launch button
  const launchBtn = document.getElementById('wa-modal-btn-send');
  launchBtn.onclick = () => {
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(msgArea.value);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    // Open WhatsApp Web / App directly for 100% free message delivery!
    window.open(waUrl, '_blank');

    // Record in lead history & activity
    crmStore.addLeadHistory(lead.id, 'whatsapp', `Sent WhatsApp follow-up: "${msgArea.value.slice(0, 40)}..."`);
    crmStore.logActivity('whatsapp', `WhatsApp message sent to ${lead.name}`);
    crmStore.updateLead(lead.id, { lastContactedAt: new Date().toISOString() });

    modal.classList.remove('active');
    renderLeads();
    if (window.showToast) window.showToast('Opening WhatsApp with pre-filled follow-up!', 'success');
  };

  modal.classList.add('active');
}

/* ==========================================================================
   NEW LEAD MODAL
   ========================================================================== */
function setupNewLeadModal() {
  const modal = document.getElementById('modal-new-lead');
  const openBtns = document.querySelectorAll('.btn-open-new-lead');
  const closeBtn = document.getElementById('new-lead-btn-close');
  const form = document.getElementById('form-new-lead');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('nl-name').value.trim();
      const company = document.getElementById('nl-company').value.trim();
      const email = document.getElementById('nl-email').value.trim();
      const phone = document.getElementById('nl-phone').value.trim();
      const instagram = document.getElementById('nl-instagram').value.trim();
      const value = document.getElementById('nl-value').value.trim();
      const stage = document.getElementById('nl-stage').value;
      const priority = document.getElementById('nl-priority').value;
      const source = document.getElementById('nl-source').value;
      const notes = document.getElementById('nl-notes').value.trim();

      if (!name) {
        alert('Please provide a lead name');
        return;
      }

      crmStore.addLead({
        name,
        company,
        email,
        phone,
        instagram,
        value: Number(value) || 0,
        stage,
        priority,
        source,
        notes
      });

      modal.classList.remove('active');
      renderLeads();
      if (window.showToast) window.showToast(`Lead "${name}" successfully created!`, 'success');
    });
  }
}

// Helpers
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const sec = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

// Attach to window for inline onclick handlers
window.openLeadDrawer = openLeadDrawer;
window.openQuickWhatsAppModal = openQuickWhatsAppModal;
