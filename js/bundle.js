/**
 * DXIGN - SMART AUTO-REPLY & 24H CONTEXT FOLLOW-UP ENGINE
 * Understands customer service inquiry, delivers tailored service pricing,
 * and automatically triggers a 24-hour context-aware follow-up if client doesn't reply.
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'dxign_smart_crm_v3';
  const MY_WHATSAPP = '917356413558';

  // Default Knowledge Base of Services ("എന്റെ സർവീസ് ലിസ്റ്റ്")
  const DEFAULT_SERVICES = [
    {
      id: 'srv-ai-video',
      name: 'AI Video Creation',
      keywords: ['video', 'ai video', 'reels', 'shorts', 'വീഡിയോ', 'animation', 'avatar', 'spokesperson'],
      price: '₹4,500 per video (or ₹18,000 for monthly 5-video package)',
      replyText: 'Hi! 👋 Thank you for inquiring about our AI Video Creation service. We create ultra-realistic high-converting AI videos, ads, and spokesperson reels. Our pricing starts from ₹4,500 per video (includes scriptwriting, AI voiceover, visuals, and editing). Would you like to see a sample video?',
      followupText: "Hi sir, hope you're doing well! Just following up regarding the AI Video Creation pricing we shared. Is the price okay for your budget? Let us know if you'd like to proceed or if you have any questions!"
    },
    {
      id: 'srv-web-dev',
      name: 'Website & Web App Development',
      keywords: ['website', 'web', 'app', 'സൈറ്റ്', 'developer', 'development', 'design', 'software'],
      price: '₹15,000 - ₹35,000 depending on features',
      replyText: 'Hello! 👋 Thanks for reaching out. For Website Development, we build modern, responsive, fast-loading business websites and landing pages. Basic business sites start at ₹15,000, and full custom web apps at ₹35,000+. What type of website are you looking to build?',
      followupText: 'Hi sir, checking in regarding your website inquiry! Did you have a chance to think over the project details? We have an open development slot this week if you would like to get started.'
    },
    {
      id: 'srv-social-ads',
      name: 'Social Media Ads & Marketing',
      keywords: ['ad', 'ads', 'marketing', 'instagram', 'facebook', 'leads', 'social media', 'മാർക്കറ്റിംഗ്'],
      price: '₹12,000/month management fee',
      replyText: 'Hi there! 👋 For Social Media Ads & Lead Generation, we manage your Meta ad campaigns, create high-converting creatives, and optimize for leads. Our monthly management is ₹12,000/month. What business or product are you advertising?',
      followupText: 'Hello! Just following up regarding your ad campaign inquiry. Are you ready to start running ads for your business, or would you like to discuss the strategy first?'
    },
    {
      id: 'srv-branding',
      name: 'Branding & Graphic Design',
      keywords: ['logo', 'brand', 'branding', 'poster', 'graphics', 'ലോഗോ', 'design'],
      price: '₹5,000 - ₹12,000',
      replyText: 'Hi! ✨ For Branding & Logo Design, we craft premium brand identities, logos, color palettes, and social media templates. Packages range from ₹5,000 to ₹12,000. Do you already have a brand name in mind?',
      followupText: "Hi sir! Checking in on your logo/branding project. Did you review our portfolio? Would love to know if you'd like to proceed!"
    }
  ];

  // Active Conversations with 24-hour Timers
  const DEFAULT_CONVERSATIONS = [
    {
      id: 'convo-1',
      clientName: 'Rahul Menon',
      contact: '+919447123456',
      serviceName: 'AI Video Creation',
      lastCustomerMessage: 'What is the price for AI video creation?',
      lastBotReply: 'Hi! 👋 Our AI Video Creation starts from ₹4,500 per video...',
      followupMessage: "Hi sir, hope you're doing well! Just following up regarding the AI Video Creation pricing we shared. Is the price okay for your budget? Let us know if you'd like to proceed or if you have any questions!",
      sentAt: new Date(Date.now() - 3600000 * 25).toISOString(), // 25 hours ago -> 24h passed!
      followupDueAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      status: 'followup_due'
    },
    {
      id: 'convo-2',
      clientName: 'Anjali Nair',
      contact: '@anjali.studio',
      serviceName: 'Website & Web App Development',
      lastCustomerMessage: 'Can you design a modern website for our clinic?',
      lastBotReply: 'Hello! For Website Development, basic sites start at ₹15,000...',
      followupMessage: 'Hi maam, checking in regarding your website inquiry! Did you have a chance to think over the project details?',
      sentAt: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
      followupDueAt: new Date(Date.now() + 3600000 * 18).toISOString(), // 18 hours remaining
      status: 'waiting'
    }
  ];

  let state = {
    services: DEFAULT_SERVICES,
    conversations: DEFAULT_CONVERSATIONS
  };

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.services) state.services = parsed.services;
        if (parsed.conversations) state.conversations = parsed.conversations;
      } catch (e) {
        state.services = DEFAULT_SERVICES;
        state.conversations = DEFAULT_CONVERSATIONS;
      }
    }
  }

  let automationEnabled = false; // Automation disabled as requested by user

  window.toggleMasterAutomation = function() {
    automationEnabled = !automationEnabled;
    updateAutomationUI();
    if (automationEnabled) {
      window.showToast('✅ Automation RESUMED! Auto-replies and 24h follow-up timers are active.', 'success');
    } else {
      window.showToast('⏸ Automation DISABLED! System is in Standby mode.', 'info');
    }
  };

  function updateAutomationUI() {
    const btn = document.getElementById('btn-master-automation');
    const dot = document.getElementById('automation-dot');
    const txt = document.getElementById('automation-status-text');
    if (!btn || !dot || !txt) return;

    if (automationEnabled) {
      btn.style.borderColor = 'rgba(37, 211, 102, 0.4)';
      btn.style.background = 'rgba(37, 211, 102, 0.12)';
      btn.style.color = 'var(--accent-wa)';
      dot.style.background = 'var(--accent-wa)';
      txt.textContent = 'Automation: ACTIVE ⚡';
    } else {
      btn.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      btn.style.background = 'rgba(245, 158, 11, 0.12)';
      btn.style.color = '#fbbf24';
      dot.style.background = '#f59e0b';
      txt.textContent = 'Automation: PAUSED ⏸';
    }
  }

  // --- RENDER 24-HOUR FOLLOW-UP QUEUE ---
  function renderConversations() {
    const container = document.getElementById('convo-list-container');
    const badge = document.getElementById('followup-count-badge');
    if (!container) return;

    const activeList = state.conversations.filter(c => c.status !== 'completed');
    const now = new Date();

    // Check timers
    activeList.forEach(c => {
      if (c.status === 'waiting' && new Date(c.followupDueAt) <= now) {
        c.status = 'followup_due';
      }
    });

    const dueCount = activeList.filter(c => c.status === 'followup_due').length;
    if (badge) badge.textContent = `${dueCount} Follow-up${dueCount === 1 ? '' : 's'} Due Now`;

    if (activeList.length === 0) {
      container.innerHTML = `
        <div style="padding: 32px; text-align: center; color: var(--text-dim); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          ✨ No pending follow-ups. Send a test message in the simulator to test!
        </div>
      `;
      return;
    }

    container.innerHTML = activeList.map(c => {
      const isDue = c.status === 'followup_due';
      const diffMs = new Date(c.followupDueAt) - now;
      const diffHours = Math.round(diffMs / 3600000);
      const diffMins = Math.round(diffMs / 60000);

      let timerBadge = '';
      if (isDue) {
        timerBadge = `<span class="timer-pill ready">⏱ 24h Passed (No Reply) - Send Follow-up!</span>`;
      } else {
        timerBadge = `<span class="timer-pill waiting">⏱ 24h Timer: ${diffHours > 0 ? diffHours + 'h remaining' : diffMins + 'm remaining'}</span>`;
      }

      const isWa = !c.contact.startsWith('@');
      let cleanPhone = c.contact.replace(/[^0-9]/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

      return `
        <div class="convo-card ${isDue ? 'urgent' : ''}" data-id="${c.id}">
          <div class="convo-header">
            <div>
              <div class="convo-client">${escapeHTML(c.clientName)} (${escapeHTML(c.contact)})</div>
              <div style="margin-top: 4px;">
                <span class="convo-service-pill">Service: ${escapeHTML(c.serviceName)}</span>
              </div>
            </div>
            <div>${timerBadge}</div>
          </div>

          <div class="convo-box">
            <div class="label">Client asked:</div>
            <div style="color: var(--text-muted); font-style: italic;">"${escapeHTML(c.lastCustomerMessage)}"</div>
          </div>

          <div class="convo-box" style="border-left: 3px solid ${isDue ? 'var(--accent-warning)' : 'var(--accent-wa)'};">
            <div class="label" style="color: ${isDue ? 'var(--accent-warning)' : 'var(--text-dim)'};">
              ${isDue ? '★ Recommended 24h Follow-up Message (Topic: ' + escapeHTML(c.serviceName) + '):' : 'Follow-up queued for 24h mark:'}
            </div>
            <div style="color: #fff; font-weight: 500;">"${escapeHTML(c.followupMessage)}"</div>
          </div>

          <div class="convo-actions">
            <div>
              ${isWa ? `
                <button class="btn btn-sm btn-wa" onclick="window.sendContextWhatsApp('${c.id}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  ${isDue ? 'Send 24h Follow-up Now' : 'Send Follow-up Early'}
                </button>
              ` : `
                <button class="btn btn-sm btn-secondary" onclick="window.open('https://instagram.com/${c.contact.replace('@','')}', '_blank')">
                  Open Instagram
                </button>
              `}
            </div>

            <div style="display: flex; gap: 6px;">
              ${!isDue ? `
                <button class="btn btn-sm btn-secondary" onclick="window.fastForwardOne('${c.id}')" title="Test: Fast-forward 24h for this lead">
                  ⏱ Fast-Forward 24h
                </button>
              ` : ''}
              <button class="btn btn-sm btn-secondary" onclick="window.completeConversation('${c.id}')">
                ✓ Client Replied / Done
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- ACTIONS ---
  window.sendContextWhatsApp = function(id) {
    const c = state.conversations.find(x => x.id === id);
    if (!c) return;

    let cleanPhone = c.contact.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const encodedText = encodeURIComponent(c.followupMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    window.open(waUrl, '_blank');
    window.showToast(`Opening WhatsApp with context follow-up for ${c.clientName}!`, 'success');
  };

  window.completeConversation = function(id) {
    const c = state.conversations.find(x => x.id === id);
    if (c) {
      c.status = 'completed';
      saveState();
      renderConversations();
      window.showToast(`Conversation marked as resolved!`, 'info');
    }
  };

  window.fastForwardOne = function(id) {
    const c = state.conversations.find(x => x.id === id);
    if (c) {
      c.status = 'followup_due';
      c.followupDueAt = new Date(Date.now() - 3600000).toISOString();
      saveState();
      renderConversations();
      window.playChime();
      window.showToast(`⏱ 24 Hours elapsed! Context follow-up ready for ${c.clientName}!`, 'warning');
    }
  };

  // --- RENDER SERVICES LIST ("എന്റെ സർവീസ് ലിസ്റ്റ്") ---
  function renderServices() {
    const container = document.getElementById('services-list-container');
    if (!container) return;

    container.innerHTML = state.services.map((srv, idx) => `
      <div class="service-item" data-id="${srv.id}">
        <div class="service-top">
          <div class="service-name">${idx + 1}. ${escapeHTML(srv.name)}</div>
          <div class="service-price">${escapeHTML(srv.price)}</div>
        </div>
        <div class="service-desc">
          <strong style="color: var(--text-main);">Bot Instant Reply:</strong> "${escapeHTML(srv.replyText)}"
        </div>
        <div class="service-followup-preview">
          <strong style="color: var(--accent-warning);">24h Auto Follow-up:</strong> "${escapeHTML(srv.followupText)}"
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 8px;">
          <button class="btn btn-sm btn-secondary" onclick="window.copyServiceWaLink('${srv.id}')" style="font-size: 0.72rem; color: var(--accent-wa); border-color: rgba(37,211,102,0.3);">
            📋 Copy WhatsApp Link
          </button>
          <button class="btn btn-sm btn-secondary" onclick="window.deleteService('${srv.id}')" style="color: var(--accent-danger); padding: 2px 6px;">Delete</button>
        </div>
      </div>
    `).join('');

    renderSuggestionChips();
  }

  window.copyServiceWaLink = function(srvId) {
    const srv = state.services.find(s => s.id === srvId);
    if (!srv) return;
    const text = encodeURIComponent(`Hi Dxign, can you tell me more about ${srv.name} pricing?`);
    const link = `https://wa.me/${MY_WHATSAPP}?text=${text}`;
    navigator.clipboard.writeText(link);
    window.showToast(`Copied WhatsApp suggestion link for "${srv.name}"!`, 'success');
  };

  window.deleteService = function(id) {
    if (confirm('Delete this service from knowledge base?')) {
      state.services = state.services.filter(s => s.id !== id);
      saveState();
      renderServices();
      window.showToast('Service removed', 'info');
    }
  };

  function setupServiceForm() {
    const toggleBtn = document.getElementById('btn-toggle-new-service');
    const box = document.getElementById('box-add-service');
    const saveBtn = document.getElementById('btn-save-service');

    if (toggleBtn && box) {
      toggleBtn.onclick = () => {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
      };
    }

    if (saveBtn) {
      saveBtn.onclick = () => {
        const name = document.getElementById('ns-name').value.trim();
        const price = document.getElementById('ns-price').value.trim();
        const reply = document.getElementById('ns-reply').value.trim();
        const followup = document.getElementById('ns-followup').value.trim();

        if (!name || !reply) {
          alert('Please provide Service Name and Auto-Reply message');
          return;
        }

        const keywords = name.toLowerCase().split(/\s+/);

        state.services.push({
          id: 'srv-' + Date.now(),
          name,
          keywords,
          price: price || 'Custom Quote',
          replyText: reply,
          followupText: followup || `Hi sir, just following up regarding our ${name} pricing. Is the price okay for your budget?`
        });

        saveState();
        document.getElementById('ns-name').value = '';
        document.getElementById('ns-price').value = '';
        document.getElementById('ns-reply').value = '';
        document.getElementById('ns-followup').value = '';
        box.style.display = 'none';
        renderServices();
        window.showToast(`Service "${name}" added to knowledge base!`, 'success');
      };
    }
  }

  // --- SMART INBOUND UNDERSTANDING (MATCHING EXACT SERVICE) ---
  function analyzeInquiry(messageText) {
    const textLower = messageText.trim().toLowerCase();

    // 0. Welcome Greeting / Menu Request
    if (['hi', 'hello', 'hey', 'start', 'menu', 'options', 'help', 'ഹായ്', 'ഹലോ'].includes(textLower)) {
      return {
        id: 'srv-menu',
        name: 'Welcome Suggestion Menu',
        replyText: `✨ *Welcome to Dxign!* ✨\nHow can we help your business today?\n\nReply with a number to get instant details & pricing:\n[ 1 ] 🎬 AI Video Creation (Reels & Ads)\n[ 2 ] 🌐 Website & Web App Development\n[ 3 ] 📈 Social Media Ads & Lead Generation\n[ 4 ] 🎨 Branding & Logo Design\n[ 5 ] 📞 Speak directly with Anurag (+91 7356413558)\n[ 6 ] 📸 Instagram Profile (@dxign.learn)\n\n_Or simply reply in English or Malayalam with your question!_`,
        followupText: 'Hi sir! Anurag from Dxign here. Just checking in to see if you have any questions regarding our services?'
      };
    }

    // 1. Check for number option matches (e.g. "1", "2", "option 1", "#1")
    const numMatch = textLower.match(/^[#]?(\d+)/);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10) - 1;
      if (idx >= 0 && idx < state.services.length) {
        return state.services[idx];
      } else if (idx === 4 || textLower.includes('anurag')) {
        return {
          id: 'srv-direct',
          name: 'Direct Founder Chat',
          replyText: 'Hi! 😊 Anurag here from Dxign. I will be connecting with you directly in a few minutes. You can also call me directly at +91 7356413558.',
          followupText: 'Hi! Anurag here from Dxign. Just following up to see if you had any questions regarding your project?'
        };
      } else if (idx === 5 || textLower.includes('insta') || textLower.includes('instagram')) {
        return {
          id: 'srv-instagram',
          name: 'Instagram Profile',
          replyText: '📸 *Dxign Instagram*: Visit https://www.instagram.com/dxign.learn to explore our latest creative projects, AI video samples, and designs!',
          followupText: 'Hi! Did you have a chance to check out our Instagram portfolio at @dxign.learn? Let us know what project you have in mind!'
        };
      }
    }

    // 2. Check for "Talk to Anurag / Human / Call"
    if (textLower.includes('anurag') || textLower.includes('human') || textLower.includes('call') || textLower.includes('talk') || textLower.includes('direct') || textLower.includes('phone')) {
      return {
        id: 'srv-direct',
        name: 'Direct Founder Chat',
        replyText: 'Hi! 😊 Anurag here from Dxign. I will be connecting with you directly in a few minutes. You can also call or voice note me anytime at +91 7356413558.',
        followupText: 'Hi! Anurag here from Dxign. Just following up to see if you had any questions regarding your project?'
      };
    }

    // 3. Check for Instagram
    if (textLower.includes('insta') || textLower.includes('instagram') || textLower.includes('@dxign')) {
      return {
        id: 'srv-instagram',
        name: 'Instagram Profile',
        replyText: '📸 *Dxign Instagram*: Visit https://www.instagram.com/dxign.learn to explore our latest creative projects, AI video samples, and designs!',
        followupText: 'Hi! Did you have a chance to check out our Instagram portfolio at @dxign.learn? Let us know what project you have in mind!'
      };
    }

    // 4. Check each service keywords
    for (const srv of state.services) {
      for (const kw of srv.keywords) {
        if (textLower.includes(kw.toLowerCase())) {
          return srv;
        }
      }
    }

    // Default to first service if no exact keyword match
    return state.services[0];
  }

  // --- CLIENT-SIDE SUGGESTION CHIPS (WhatsApp Quick Buttons) ---
  function renderSuggestionChips() {
    const container = document.getElementById('sim-suggestions-container');
    if (!container) return;

    const chipsHtml = `
      <button type="button" class="suggestion-chip" onclick="window.sendSuggestionPrompt('Hi')">
        <span>👋</span> "Hi" (Show Menu)
      </button>
    ` + state.services.map((srv, idx) => {
      const prompt = `Tell me about ${srv.name} pricing`;
      const icon = srv.name.toLowerCase().includes('video') ? '🎬' :
                   srv.name.toLowerCase().includes('web') ? '🌐' :
                   srv.name.toLowerCase().includes('ad') ? '📈' : '✨';
      return `
        <button type="button" class="suggestion-chip" onclick="window.sendSuggestionPrompt('${escapeHTML(prompt)}')">
          <span>${icon}</span> ${escapeHTML(srv.name)}
        </button>
      `;
    }).join('') + `
      <button type="button" class="suggestion-chip" onclick="window.sendSuggestionPrompt('What is your Instagram?')">
        <span>📸</span> Instagram
      </button>
      <button type="button" class="suggestion-chip human" onclick="window.sendSuggestionPrompt('Can I talk to Anurag directly?')">
        <span>📞</span> Talk to Anurag
      </button>
    `;

    container.innerHTML = chipsHtml;
  }

  window.sendSuggestionPrompt = function(promptText) {
    const input = document.getElementById('sim-input-text');
    if (input) {
      input.value = promptText;
      document.getElementById('sim-chat-form').dispatchEvent(new Event('submit'));
    }
  };

  // --- LIVE SMARTPHONE SIMULATOR ---
  let simChat = [
    { sender: 'client', text: 'Hi, can you tell me the pricing for AI video creation?' },
    { sender: 'bot', text: 'Hi! 👋 Thank you for inquiring about our AI Video Creation service. We create ultra-realistic high-converting AI videos, ads, and spokesperson reels. Our pricing starts from ₹4,500 per video (includes scriptwriting, AI voiceover, visuals, and editing). Would you like to see a sample video?' }
  ];

  function renderSimChat() {
    const container = document.getElementById('sim-chat-area');
    if (!container) return;

    container.innerHTML = simChat.map(m => `
      <div class="chat-bubble ${m.sender === 'client' ? 'in' : m.sender === 'followup' ? 'followup' : 'out'}">
        <div>${escapeHTML(m.text)}</div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  function setupSimulator() {
    const form = document.getElementById('sim-chat-form');
    const input = document.getElementById('sim-input-text');
    const fastForwardBtn = document.getElementById('btn-sim-fast-forward');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        // 1. Client message arrives
        simChat.push({ sender: 'client', text });

        // If automation is paused, do not auto-reply or arm timers
        if (!automationEnabled) {
          simChat.push({ sender: 'followup', text: '⏸ [Automation Paused]: Auto-replies and 24h timers are currently in Standby mode. Click "Automation: PAUSED ⏸" in the top bar to resume.' });
          renderSimChat();
          window.showToast('Automation is disabled (Standby mode).', 'info');
          return;
        }

        renderSimChat();

        // 2. System analyzes message against knowledge base
        const matchedService = analyzeInquiry(text);

        // 3. Bot responds with exact service reply
        setTimeout(() => {
          simChat.push({ sender: 'bot', text: matchedService.replyText });
          renderSimChat();

          // 4. Auto-arm 24-hour follow-up timer for this client!
          const simClientName = 'Inbound Prospect (' + (matchedService.name.slice(0, 10)) + ')';
          const newConvo = {
            id: 'convo-' + Date.now(),
            clientName: simClientName,
            contact: '+9194471' + Math.floor(10000 + Math.random() * 90000),
            serviceName: matchedService.name,
            lastCustomerMessage: text,
            lastBotReply: matchedService.replyText,
            followupMessage: matchedService.followupText,
            sentAt: new Date().toISOString(),
            followupDueAt: new Date(Date.now() + 3600000 * 24).toISOString(), // 24 hours later
            status: 'waiting'
          };

          state.conversations.unshift(newConvo);
          saveState();
          renderConversations();
          window.playChime();
          window.showToast(`✨ Replied with ${matchedService.name} details! 24h follow-up timer started.`, 'success');
        }, 500);
      };
    }

    // Fast-Forward all active waiting conversations to test the 24h trigger!
    if (fastForwardBtn) {
      fastForwardBtn.onclick = () => {
        const waiting = state.conversations.filter(c => c.status === 'waiting');
        if (waiting.length === 0) {
          window.showToast('Send a test message first to create a 24h timer!', 'info');
          return;
        }

        waiting.forEach(c => {
          c.status = 'followup_due';
          c.followupDueAt = new Date(Date.now() - 3600000).toISOString();
        });

        // Add 24h follow-up message to the simulator phone UI to visualize
        const lastConvo = waiting[0];
        simChat.push({
          sender: 'followup',
          text: `[24h Auto Follow-up triggered]: "${lastConvo.followupMessage}"`
        });

        saveState();
        renderConversations();
        renderSimChat();
        window.playChime();
        window.showToast(`⏱ 24 Hours simulated! Follow-up is now due for ${waiting.length} client(s)!`, 'warning');
      };
    }

    renderSimChat();
    renderSuggestionChips();
  }

  window.testPrompt = function(promptText) {
    const input = document.getElementById('sim-input-text');
    if (input) {
      input.value = promptText;
      document.getElementById('sim-chat-form').dispatchEvent(new Event('submit'));
    }
  };

  // --- HELPERS ---
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t));
  }

  window.playChime = function() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  window.showToast = function(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 2800);
  };

  // --- BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateAutomationUI();
    renderConversations();
    renderServices();
    setupServiceForm();
    setupSimulator();

    // Check timer every 10 seconds
    setInterval(renderConversations, 10000);
  });

})();
