/**
 * DXIGN CRM - OMNICHANNEL AUTOMATION & LIVE SIMULATOR
 * Connects WhatsApp and Instagram with 100% free protocols.
 * Includes rule-based auto-reply engine and an interactive live simulator.
 */

import { crmStore } from './data.js';
import { renderLeads } from './leads.js';

let activeSimulatorChannel = 'whatsapp'; // 'whatsapp' | 'instagram'

// Chat history in simulator
let chatHistory = {
  whatsapp: [
    { sender: 'customer', text: 'Hi! I saw your recent design portfolio on Behance.', time: '11:42 AM' },
    { sender: 'bot', text: 'Hi! Welcome to Dxign CRM. ✨ How can we help your business today? Feel free to ask about our CRM features, custom development, or request a quick consultation.', time: '11:42 AM' },
    { sender: 'customer', text: 'Can you tell me about your pricing for custom setups?', time: '11:43 AM' },
    { sender: 'bot', text: 'Hey there! 👋 Our customized CRM & design plans start from $2,500 for foundational builds and $6,000+ for enterprise setups. Would you like to see our complete price breakdown?', time: '11:43 AM' }
  ],
  instagram: [
    { sender: 'customer', text: 'Hey guys! Loved your latest post! Where can I see more portfolio work?', time: '10:15 AM' },
    { sender: 'bot', text: 'Check out our latest case studies, interactive UI designs, and client success stories here: https://dxign.io/work - let us know which aesthetic catches your eye!', time: '10:15 AM' }
  ]
};

export function initOmnichannelModule() {
  renderAutoReplyRules();
  setupSimulator();
  setupNewRuleModal();
  setupConnectionTabs();
}

/* ==========================================================================
   AUTO-REPLY RULES MANAGEMENT
   ========================================================================== */
export function renderAutoReplyRules() {
  const container = document.getElementById('autoreply-rules-list');
  if (!container) return;

  const rules = crmStore.autoReplies;

  container.innerHTML = rules.map(rule => `
    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; transition: all 0.2s;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: #fff; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px;">
              "${escapeHTML(rule.keyword)}"
            </span>
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${rule.channel === 'whatsapp' ? 'background: rgba(37,211,102,0.15); color: var(--accent-whatsapp);' : rule.channel === 'instagram' ? 'background: rgba(225,48,108,0.15); color: var(--accent-instagram);' : 'background: rgba(99,102,241,0.15); color: #818cf8;'}">
              ${rule.channel.toUpperCase()}
            </span>
            <span style="font-size: 0.75rem; color: var(--text-dim);">Matches: ${rule.matchType}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">${rule.hits || 0} trigger hits</span>
          <label class="switch">
            <input type="checkbox" ${rule.active ? 'checked' : ''} onchange="window.toggleAutoReplyRule('${rule.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; border-left: 3px solid var(--accent-primary);">
        "${escapeHTML(rule.replyText)}"
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 0.74rem; color: var(--text-dim);">
        <div>Auto-Action: <strong style="color: #fff;">${rule.action === 'create_lead' ? '✨ Capture as New Lead' : rule.action === 'tag_lead' ? `🏷️ Apply Tag: ${rule.tag}` : '📝 Log Activity'}</strong></div>
        <button class="btn btn-sm btn-secondary" onclick="window.deleteAutoReplyRule('${rule.id}')" style="color: var(--accent-danger); padding: 3px 8px;">Delete</button>
      </div>
    </div>
  `).join('');
}

window.toggleAutoReplyRule = function(ruleId, isActive) {
  const rule = crmStore.autoReplies.find(r => r.id === ruleId);
  if (rule) {
    rule.active = isActive;
    crmStore.save();
    if (window.showToast) window.showToast(`Auto-reply rule for "${rule.keyword}" ${isActive ? 'enabled' : 'disabled'}`, 'info');
  }
};

window.deleteAutoReplyRule = function(ruleId) {
  if (confirm('Delete this auto-reply rule?')) {
    crmStore.autoReplies = crmStore.autoReplies.filter(r => r.id !== ruleId);
    crmStore.save();
    renderAutoReplyRules();
    if (window.showToast) window.showToast('Rule deleted', 'warning');
  }
};

/* ==========================================================================
   INTERACTIVE LIVE CUSTOMER SIMULATOR
   ========================================================================== */
function setupSimulator() {
  const channelToggles = document.querySelectorAll('.simulator-channel-toggle');
  const chatForm = document.getElementById('simulator-form');
  const inputEl = document.getElementById('simulator-input');

  channelToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      channelToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSimulatorChannel = btn.dataset.channel;
      updateSimulatorUI();
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = inputEl.value.trim();
      if (!message) return;

      inputEl.value = '';
      sendSimulatorMessage(message);
    });
  }

  updateSimulatorUI();
}

function updateSimulatorUI() {
  const phoneAvatar = document.getElementById('sim-phone-avatar');
  const phoneName = document.getElementById('sim-phone-name');
  const phoneSubtitle = document.getElementById('sim-phone-subtitle');
  const phoneContainer = document.getElementById('sim-phone-window');

  if (activeSimulatorChannel === 'whatsapp') {
    phoneAvatar.style.background = '#25D366';
    phoneAvatar.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    phoneName.textContent = '+1 (555) 392-8172 (Prospect)';
    phoneSubtitle.textContent = 'WhatsApp Direct • 100% Free Link';
    phoneContainer.style.borderColor = 'rgba(37, 211, 102, 0.3)';
  } else {
    phoneAvatar.style.background = 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)';
    phoneAvatar.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    phoneName.textContent = '@alexander.studio (Prospect)';
    phoneSubtitle.textContent = 'Instagram DM • Free Graph API';
    phoneContainer.style.borderColor = 'rgba(225, 48, 108, 0.3)';
  }

  renderSimulatorMessages();
}

function renderSimulatorMessages() {
  const container = document.getElementById('sim-messages-container');
  if (!container) return;

  const msgs = chatHistory[activeSimulatorChannel] || [];

  container.innerHTML = msgs.map(m => {
    const isCustomer = m.sender === 'customer';
    const bubbleClass = isCustomer ? 'incoming' : (activeSimulatorChannel === 'whatsapp' ? 'outgoing' : 'outgoing instagram-outgoing');

    return `
      <div class="chat-bubble ${bubbleClass}">
        <div>${escapeHTML(m.text)}</div>
        <div class="bubble-meta">
          <span>${m.time}</span>
          ${!isCustomer ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function sendSimulatorMessage(text) {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Add incoming customer message
  chatHistory[activeSimulatorChannel].push({
    sender: 'customer',
    text,
    time: now
  });
  renderSimulatorMessages();

  // 2. Evaluate auto-reply rule
  const matchedRule = crmStore.evaluateAutoReply(activeSimulatorChannel, text);

  // Show typing indicator in UI
  const container = document.getElementById('sim-messages-container');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-bubble ' + (activeSimulatorChannel === 'whatsapp' ? 'outgoing' : 'outgoing instagram-outgoing');
  typingEl.style.opacity = '0.7';
  typingEl.innerHTML = `<em>Auto-Reply Engine typing...</em>`;
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typingEl.remove();

    let replyMessage = matchedRule ? matchedRule.replyText : "Thanks for your message! Our team received your inquiry and will follow up shortly.";

    // 3. Add bot auto-reply
    chatHistory[activeSimulatorChannel].push({
      sender: 'bot',
      text: replyMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderSimulatorMessages();

    // 4. Lead Capture / Action execution
    const simName = activeSimulatorChannel === 'whatsapp' ? 'WhatsApp Prospect (555-392)' : 'Alexander Studio';
    const simPhone = activeSimulatorChannel === 'whatsapp' ? '+15553928172' : '';
    const simIg = activeSimulatorChannel === 'instagram' ? '@alexander.studio' : '';

    // Check if lead already exists or create new
    let existingLead = crmStore.getLeads().find(l => 
      (simPhone && l.phone === simPhone) || (simIg && l.instagram === simIg)
    );

    if (!existingLead) {
      existingLead = crmStore.addLead({
        name: simName,
        company: 'Inbound Inquiry',
        phone: simPhone,
        instagram: simIg,
        source: activeSimulatorChannel,
        stage: 'new',
        value: 4500,
        priority: 'hot',
        notes: `Auto-captured from ${activeSimulatorChannel.toUpperCase()}. Initial inquiry: "${text}"`,
        tags: [activeSimulatorChannel.toUpperCase(), matchedRule ? matchedRule.tag : 'Inbound']
      });
      if (window.showToast) window.showToast(`✨ New Lead automatically captured from ${activeSimulatorChannel.toUpperCase()}!`, 'success');
    } else {
      crmStore.addLeadHistory(existingLead.id, activeSimulatorChannel, `Customer: "${text}" | Auto-reply sent`);
      if (matchedRule && matchedRule.tag && !existingLead.tags.includes(matchedRule.tag)) {
        existingLead.tags.push(matchedRule.tag);
        crmStore.save();
      }
    }

    renderAutoReplyRules();
    renderLeads();
    if (window.playChime) window.playChime();

  }, 650);
}

/* ==========================================================================
   NEW AUTO-REPLY RULE MODAL
   ========================================================================== */
function setupNewRuleModal() {
  const modal = document.getElementById('modal-new-autoreply');
  const openBtn = document.getElementById('btn-open-new-autoreply');
  const closeBtn = document.getElementById('new-rule-btn-close');
  const form = document.getElementById('form-new-autoreply');

  if (openBtn) openBtn.onclick = () => modal.classList.add('active');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const keyword = document.getElementById('rule-keyword').value.trim();
      const channel = document.getElementById('rule-channel').value;
      const matchType = document.getElementById('rule-match').value;
      const action = document.getElementById('rule-action').value;
      const tag = document.getElementById('rule-tag').value.trim();
      const replyText = document.getElementById('rule-reply-text').value.trim();

      if (!keyword || !replyText) {
        alert('Please specify keyword and reply text');
        return;
      }

      crmStore.autoReplies.push({
        id: 'rule-' + Date.now(),
        keyword,
        channel,
        matchType,
        action,
        tag: tag || 'Inquiry',
        replyText,
        active: true,
        hits: 0
      });

      crmStore.save();
      modal.classList.remove('active');
      renderAutoReplyRules();
      if (window.showToast) window.showToast(`Auto-reply rule for "${keyword}" created!`, 'success');
    });
  }
}

/* ==========================================================================
   FREE CONNECTION TABS
   ========================================================================== */
function setupConnectionTabs() {
  const tabBtns = document.querySelectorAll('.conn-tab-btn');
  const tabPanes = document.querySelectorAll('.conn-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.target);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
