/**
 * DXIGN CRM - AUTO FOLLOW-UPS ENGINE
 * Automated follow-up sequence rules, scheduled follow-up queue,
 * template manager with variable replacement, and 1-click execution.
 */

import { crmStore, QUICK_TEMPLATES } from './data.js';

export function initFollowupsModule() {
  renderSequences();
  renderFollowupQueue();
  renderTemplates();
  setupNewSequenceModal();
}

/* ==========================================================================
   RENDER AUTOMATED SEQUENCES
   ========================================================================== */
export function renderSequences() {
  const container = document.getElementById('sequences-list-container');
  if (!container) return;

  const sequences = crmStore.sequences;

  container.innerHTML = sequences.map(seq => `
    <div class="sequence-card" data-id="${seq.id}">
      <div class="sequence-header">
        <div>
          <div class="sequence-title">${escapeHTML(seq.name)}</div>
          <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 4px;">
            Trigger: <span style="color: var(--accent-primary); font-weight: 600;">${seq.trigger.replace('_', ' ').toUpperCase()}</span>
            • Channel: <span style="color: var(--accent-whatsapp); font-weight: 600;">${seq.channel.toUpperCase()}</span>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" ${seq.active ? 'checked' : ''} onchange="window.toggleSequenceActive('${seq.id}', this.checked)">
          <span class="slider"></span>
        </label>
      </div>

      <div class="sequence-steps">
        ${seq.steps.map((step, idx) => `
          <div class="sequence-step-item">
            <span class="step-node"></span>
            <div>
              <span style="font-weight: 700; color: #fff;">Wait ${step.delayHours}h:</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">"${escapeHTML(step.text.slice(0, 80))}..."</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
        <button class="btn btn-sm btn-secondary" onclick="window.testSequenceNow('${seq.id}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Test Sequence
        </button>
      </div>
    </div>
  `).join('');
}

window.toggleSequenceActive = function(seqId, isActive) {
  const seq = crmStore.sequences.find(s => s.id === seqId);
  if (seq) {
    seq.active = isActive;
    crmStore.save();
    if (window.showToast) window.showToast(`Sequence "${seq.name}" ${isActive ? 'activated' : 'paused'}`, 'info');
  }
};

window.testSequenceNow = function(seqId) {
  const seq = crmStore.sequences.find(s => s.id === seqId);
  if (!seq) return;
  const lead = crmStore.getLeads()[0];
  if (!lead) {
    alert('Add a lead first to test sequences!');
    return;
  }
  const previewMsg = crmStore.renderTemplate(seq.steps[0].text, lead);
  alert(`Sequence Simulation for ${lead.name}:\n\nChannel: ${seq.channel.toUpperCase()}\nMessage: "${previewMsg}"\n\nTriggered automatically without paid APIs.`);
};

/* ==========================================================================
   SCHEDULED FOLLOW-UP QUEUE
   ========================================================================== */
export function renderFollowupQueue() {
  const container = document.getElementById('followup-queue-container');
  if (!container) return;

  const leads = crmStore.getLeads().filter(l => l.nextFollowupDate);

  // Sort by date ascending (most urgent first)
  leads.sort((a, b) => new Date(a.nextFollowupDate) - new Date(b.nextFollowupDate));

  if (leads.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-dim); border: 1px dashed var(--glass-border); border-radius: var(--radius-md);">
        No pending follow-ups scheduled. Click on any lead to schedule one!
      </div>
    `;
    return;
  }

  container.innerHTML = leads.map(lead => {
    const dueDate = new Date(lead.nextFollowupDate);
    const diffHours = Math.round((dueDate - new Date()) / 3600000);
    const isOverdue = diffHours < 0;
    const badgeText = isOverdue ? `${Math.abs(diffHours)}h Overdue` : diffHours === 0 ? 'Due Now' : `In ${diffHours}h`;
    const badgeColor = isOverdue ? 'var(--accent-danger)' : diffHours < 24 ? 'var(--accent-warning)' : 'var(--accent-cyan)';

    return `
      <div class="urgent-item">
        <div class="urgent-info">
          <div class="urgent-avatar" style="border-color: ${badgeColor}">${(lead.name || 'L')[0]}</div>
          <div>
            <div class="urgent-name">${escapeHTML(lead.name)} (${escapeHTML(lead.company || 'Direct')})</div>
            <div class="urgent-sub">
              <span style="color: ${badgeColor}; font-weight: 700;">● ${badgeText}</span>
              <span>• Value: $${Number(lead.value || 0).toLocaleString()}</span>
              <span>• Source: ${lead.source}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          ${lead.phone ? `
            <button class="btn btn-sm btn-whatsapp" onclick="window.openQuickWhatsAppModal('${lead.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Follow Up
            </button>
          ` : ''}
          <button class="btn btn-sm btn-secondary" onclick="window.completeFollowup('${lead.id}')" title="Mark as Completed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.completeFollowup = function(leadId) {
  crmStore.updateLead(leadId, { nextFollowupDate: null });
  crmStore.addLeadHistory(leadId, 'followup', 'Follow-up marked as completed');
  renderFollowupQueue();
  if (window.showToast) window.showToast('Follow-up cleared!', 'success');
};

/* ==========================================================================
   TEMPLATE MANAGEMENT
   ========================================================================== */
export function renderTemplates() {
  const container = document.getElementById('templates-list-container');
  if (!container) return;

  container.innerHTML = QUICK_TEMPLATES.map(tpl => `
    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; color: #fff; font-size: 0.88rem;">${escapeHTML(tpl.title)}</span>
        <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText('${tpl.text.replace(/'/g, "\\'")}'); window.showToast('Template copied!', 'info');">
          Copy
        </button>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">${escapeHTML(tpl.text)}</p>
    </div>
  `).join('');
}

/* ==========================================================================
   NEW SEQUENCE MODAL
   ========================================================================== */
function setupNewSequenceModal() {
  const modal = document.getElementById('modal-new-sequence');
  const openBtn = document.getElementById('btn-open-new-sequence');
  const closeBtn = document.getElementById('new-seq-btn-close');
  const form = document.getElementById('form-new-sequence');

  if (openBtn) openBtn.onclick = () => modal.classList.add('active');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('seq-name').value.trim();
      const trigger = document.getElementById('seq-trigger').value;
      const channel = document.getElementById('seq-channel').value;
      const delay = Number(document.getElementById('seq-delay').value) || 24;
      const text = document.getElementById('seq-text').value.trim();

      if (!name || !text) {
        alert('Please fill out sequence name and message text');
        return;
      }

      crmStore.sequences.push({
        id: 'seq-' + Date.now(),
        name,
        trigger,
        channel,
        active: true,
        steps: [{ delayHours: delay, text }]
      });

      crmStore.save();
      modal.classList.remove('active');
      renderSequences();
      if (window.showToast) window.showToast(`Sequence "${name}" created!`, 'success');
    });
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
