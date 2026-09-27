/**
 * DXIGN CRM - DATA STORE & PERSISTENCE
 * Manages CRM leads, pipeline stages, auto-reply rules, follow-up sequences, and activity logs.
 * All state is persisted in localStorage with zero server fees or paid extensions.
 */

const STORAGE_KEY = 'dxign_crm_state_v1';

// Default Pipeline Stages
export const PIPELINE_STAGES = [
  { id: 'new', label: 'New Leads', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)' },
  { id: 'contacted', label: 'Contacted', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)' },
  { id: 'meeting', label: 'Meeting / Demo', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)' },
  { id: 'proposal', label: 'Proposal Sent', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' },
  { id: 'followup', label: 'Follow-up Needed', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.25)' },
  { id: 'won', label: 'Closed Won', color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
  { id: 'lost', label: 'Closed Lost', color: '#64748b', glow: 'rgba(100, 116, 139, 0.25)' }
];

// Default Realistic Seed Leads
const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Marcus Vance',
    company: 'Apex Design Studio',
    email: 'marcus@apexstudio.io',
    phone: '+14155552671',
    instagram: '@marcus.vance',
    stage: 'meeting',
    value: 8500,
    priority: 'hot',
    source: 'whatsapp',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastContactedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    nextFollowupDate: new Date(Date.now() + 3600000 * 6).toISOString(),
    notes: 'Interested in enterprise rebrand & CRM integration. Demo scheduled for Thursday.',
    tags: ['Design', 'Enterprise', 'WhatsApp'],
    history: [
      { type: 'created', text: 'Lead captured via WhatsApp direct inquiry', time: new Date(Date.now() - 3600000 * 48).toISOString() },
      { type: 'autoreply', text: 'Auto-reply sent: "Welcome to Dxign! Here is our design portfolio."', time: new Date(Date.now() - 3600000 * 48).toISOString() },
      { type: 'stage', text: 'Stage moved from New Leads to Meeting / Demo', time: new Date(Date.now() - 3600000 * 5).toISOString() }
    ]
  },
  {
    id: 'lead-2',
    name: 'Elena Rostova',
    company: 'Velox Logistics',
    email: 'elena@velox.global',
    phone: '+447911123456',
    instagram: '@elenarostovax',
    stage: 'proposal',
    value: 14200,
    priority: 'hot',
    source: 'instagram',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    lastContactedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    nextFollowupDate: new Date(Date.now() + 3600000 * 2).toISOString(), // Due soon!
    notes: 'Sent comprehensive proposal. Follow up on signature before end of week.',
    tags: ['Logistics', 'High-Ticket', 'Instagram DM'],
    history: [
      { type: 'created', text: 'Lead captured via Instagram DM inquiry', time: new Date(Date.now() - 3600000 * 72).toISOString() },
      { type: 'proposal', text: 'Custom scope proposal sent for $14,200', time: new Date(Date.now() - 3600000 * 24).toISOString() }
    ]
  },
  {
    id: 'lead-3',
    name: 'Julian Sterling',
    company: 'Sterling & Croft Capital',
    email: 'julian@sterlingcapital.com',
    phone: '+12125550198',
    instagram: '@julian.sterling',
    stage: 'followup',
    value: 22000,
    priority: 'hot',
    source: 'whatsapp',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    lastContactedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    nextFollowupDate: new Date(Date.now() - 3600000 * 2).toISOString(), // Overdue follow-up!
    notes: 'Reviewed pricing tier. Waiting for decision from board.',
    tags: ['FinTech', 'WhatsApp', 'VIP'],
    history: [
      { type: 'created', text: 'WhatsApp inbound message received', time: new Date(Date.now() - 3600000 * 96).toISOString() },
      { type: 'note', text: 'Spoke with CFO regarding security compliance', time: new Date(Date.now() - 3600000 * 40).toISOString() }
    ]
  },
  {
    id: 'lead-4',
    name: 'Amara Chen',
    company: 'Solstice Collective',
    email: 'amara@solstice.co',
    phone: '+6591234567',
    instagram: '@amara.design',
    stage: 'new',
    value: 6400,
    priority: 'warm',
    source: 'instagram',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    lastContactedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    nextFollowupDate: new Date(Date.now() + 3600000 * 21).toISOString(),
    notes: 'Discovered us from Instagram reel. Inquired about monthly retainer.',
    tags: ['Retainer', 'Instagram'],
    history: [
      { type: 'created', text: 'Automated lead creation from Instagram DM', time: new Date(Date.now() - 3600000 * 3).toISOString() },
      { type: 'autoreply', text: 'Instant Auto-Reply triggered: "Thanks for reaching out! Let\'s schedule a quick call."', time: new Date(Date.now() - 3600000 * 3).toISOString() }
    ]
  },
  {
    id: 'lead-5',
    name: 'David O\'Connor',
    company: 'Kestrel Biotech',
    email: 'doconnor@kestrelbio.com',
    phone: '+16175558932',
    instagram: '',
    stage: 'contacted',
    value: 18500,
    priority: 'warm',
    source: 'website',
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    lastContactedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    nextFollowupDate: new Date(Date.now() + 3600000 * 28).toISOString(),
    notes: 'Initial discovery call went well. Needs web application redesign.',
    tags: ['Biotech', 'Web Portal'],
    history: [
      { type: 'created', text: 'Website lead form submitted', time: new Date(Date.now() - 3600000 * 50).toISOString() }
    ]
  },
  {
    id: 'lead-6',
    name: 'Sophia Laurent',
    company: 'Atelier Laurent Paris',
    email: 'sophia@atelierlaurent.fr',
    phone: '+33612345678',
    instagram: '@sophialaurent_atelier',
    stage: 'won',
    value: 32000,
    priority: 'hot',
    source: 'whatsapp',
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString(),
    lastContactedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    nextFollowupDate: null,
    notes: 'Contract signed! Onboarding kick-off call scheduled.',
    tags: ['Luxury', 'Closed Won', 'WhatsApp'],
    history: [
      { type: 'created', text: 'WhatsApp inbound inquiry received', time: new Date(Date.now() - 3600000 * 180).toISOString() },
      { type: 'stage', text: 'Moved to Closed Won ($32,000)', time: new Date(Date.now() - 3600000 * 12).toISOString() }
    ]
  }
];

// Pre-built High-Converting Follow-Up Sequences (100% Free Engine)
const DEFAULT_SEQUENCES = [
  {
    id: 'seq-welcome',
    name: 'Immediate Lead Welcome & Qualifier',
    trigger: 'new_lead',
    channel: 'whatsapp',
    active: true,
    steps: [
      { delayHours: 0, text: 'Hi {{name}}, thanks for reaching out to Dxign! We received your request. Are you looking for product design, full-stack CRM build, or brand identity?' },
      { delayHours: 4, text: 'Hi {{name}}, just following up with our portfolio link: https://dxign.io/cases - let us know when you have 10 mins for a quick consultation!' }
    ]
  },
  {
    id: 'seq-proposal',
    name: 'Post-Proposal Decision Sequence',
    trigger: 'proposal_sent',
    channel: 'whatsapp',
    active: true,
    steps: [
      { delayHours: 24, text: 'Hi {{name}}, hope you had a chance to look over the proposal for {{company}} (${{deal_value}}). Did you have any questions on the deliverables or timeline?' },
      { delayHours: 72, text: 'Hi {{name}}, following up regarding the scope for {{company}}. We have two onboarding slots open for next month if you want to lock in the proposed timeline.' }
    ]
  },
  {
    id: 'seq-dormant',
    name: 'Dormant Lead Re-engagement',
    trigger: 'followup_needed',
    channel: 'whatsapp',
    active: true,
    steps: [
      { delayHours: 48, text: 'Hey {{name}}, checking in to see if you are still looking to move forward with this project, or if your priorities have shifted for now?' }
    ]
  }
];

// WhatsApp & Instagram Auto-Reply Rules (Zero Cost, Keyword Driven)
const DEFAULT_AUTO_REPLIES = [
  {
    id: 'rule-pricing',
    keyword: 'pricing',
    matchType: 'contains', // 'contains' | 'exact' | 'regex'
    channel: 'all', // 'whatsapp' | 'instagram' | 'all'
    replyText: 'Hey there! 👋 Our customized CRM & design plans start from $2,500 for foundational builds and $6,000+ for enterprise setups. Would you like to see our complete price breakdown?',
    action: 'tag_lead',
    tag: 'Pricing Inquired',
    active: true,
    hits: 28
  },
  {
    id: 'rule-demo',
    keyword: 'demo',
    matchType: 'contains',
    channel: 'all',
    replyText: 'Awesome! We\'d love to give you a live 1-on-1 walkthrough. You can pick your preferred time directly here: https://dxign.io/calendar or reply with your available dates!',
    action: 'create_lead',
    tag: 'Demo Requested',
    active: true,
    hits: 41
  },
  {
    id: 'rule-quote',
    keyword: 'quote',
    matchType: 'contains',
    channel: 'whatsapp',
    replyText: 'Thanks for reaching out! To give you an exact quote, what are the top 3 features or goals your business needs? Let us know and we\'ll send an instant estimate.',
    action: 'create_lead',
    tag: 'Quote Request',
    active: true,
    hits: 19
  },
  {
    id: 'rule-greeting',
    keyword: 'hello',
    matchType: 'contains',
    channel: 'all',
    replyText: 'Hi! Welcome to Dxign CRM. ✨ How can we help your business today? Feel free to ask about our CRM features, custom development, or request a quick consultation.',
    action: 'log_activity',
    tag: 'Greeting',
    active: true,
    hits: 65
  },
  {
    id: 'rule-portfolio',
    keyword: 'portfolio',
    matchType: 'contains',
    channel: 'instagram',
    replyText: 'Check out our latest case studies, interactive UI designs, and client success stories here: https://dxign.io/work - let us know which aesthetic catches your eye!',
    action: 'tag_lead',
    tag: 'Portfolio Inquired',
    active: true,
    hits: 34
  }
];

// Ready-to-Send Quick Message Templates with Dynamic Variable Replacement
export const QUICK_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Instant Discovery Follow-up',
    text: 'Hi {{name}}, great connecting with you! To make sure we customize the CRM setup for {{company}}, what is your current team size and primary pipeline focus?'
  },
  {
    id: 'tpl-2',
    title: 'Post-Meeting Thank You',
    text: 'Hi {{name}}, thank you for your time during our demo today! As discussed, the proposal for ${{deal_value}} is prepared. Let me know when is best to review it together.'
  },
  {
    id: 'tpl-3',
    title: 'Friendly Proposal Check-in',
    text: 'Hey {{name}}, following up on the proposal we shared for {{company}}. Do you need any clarifications on the milestones or contract before we proceed?'
  },
  {
    id: 'tpl-4',
    title: 'Special Onboarding Offer',
    text: 'Hi {{name}}, we are finalizing our onboarding schedule for this month and would love to reserve your spot for {{company}}. Can we assist with any remaining questions?'
  }
];

// Data Store Class
class DataStore {
  constructor() {
    this.leads = [];
    this.sequences = [];
    this.autoReplies = [];
    this.templates = [];
    this.activityLogs = [];
    this.init();
  }

  init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.leads = parsed.leads || DEFAULT_LEADS;
        this.sequences = parsed.sequences || DEFAULT_SEQUENCES;
        this.autoReplies = parsed.autoReplies || DEFAULT_AUTO_REPLIES;
        this.templates = parsed.templates || QUICK_TEMPLATES;
        this.activityLogs = parsed.activityLogs || [];
      } catch (e) {
        console.error('Failed to parse stored CRM data, loading defaults', e);
        this.loadDefaults();
      }
    } else {
      this.loadDefaults();
    }
  }

  loadDefaults() {
    this.leads = JSON.parse(JSON.stringify(DEFAULT_LEADS));
    this.sequences = JSON.parse(JSON.stringify(DEFAULT_SEQUENCES));
    this.autoReplies = JSON.parse(JSON.stringify(DEFAULT_AUTO_REPLIES));
    this.templates = JSON.parse(JSON.stringify(QUICK_TEMPLATES));
    this.activityLogs = [
      { id: 'act-1', type: 'system', text: 'Dxign CRM initialized in 100% Free Mode', time: new Date().toISOString() },
      { id: 'act-2', type: 'whatsapp', text: 'WhatsApp direct connection ready (wa.me & free QR bridge)', time: new Date().toISOString() },
      { id: 'act-3', type: 'instagram', text: 'Instagram DM automation webhook simulator online', time: new Date().toISOString() }
    ];
    this.save();
  }

  save() {
    try {
      const payload = {
        leads: this.leads,
        sequences: this.sequences,
        autoReplies: this.autoReplies,
        templates: this.templates,
        activityLogs: this.activityLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // --- Leads Operations ---
  getLeads() {
    return this.leads;
  }

  getLeadById(id) {
    return this.leads.find(l => l.id === id);
  }

  addLead(leadData) {
    const newLead = {
      id: 'lead-' + Date.now(),
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString(),
      history: [
        { type: 'created', text: `Lead created (${leadData.source || 'Direct'})`, time: new Date().toISOString() }
      ],
      tags: leadData.tags || [],
      notes: leadData.notes || '',
      stage: leadData.stage || 'new',
      value: Number(leadData.value) || 0,
      priority: leadData.priority || 'warm',
      ...leadData
    };
    this.leads.unshift(newLead);
    this.logActivity('lead', `New lead added: ${newLead.name} (${newLead.company || 'Individual'})`);
    this.save();
    return newLead;
  }

  updateLead(id, updates) {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx !== -1) {
      const prevStage = this.leads[idx].stage;
      this.leads[idx] = { ...this.leads[idx], ...updates };

      if (updates.stage && updates.stage !== prevStage) {
        const stageObj = PIPELINE_STAGES.find(s => s.id === updates.stage);
        this.addLeadHistory(id, 'stage', `Stage updated to ${stageObj ? stageObj.label : updates.stage}`);
        this.logActivity('stage', `${this.leads[idx].name} moved to ${stageObj ? stageObj.label : updates.stage}`);
      }

      this.save();
      return this.leads[idx];
    }
    return null;
  }

  deleteLead(id) {
    const lead = this.getLeadById(id);
    this.leads = this.leads.filter(l => l.id !== id);
    if (lead) {
      this.logActivity('lead', `Deleted lead: ${lead.name}`);
    }
    this.save();
  }

  addLeadHistory(leadId, type, text) {
    const lead = this.getLeadById(leadId);
    if (lead) {
      if (!lead.history) lead.history = [];
      lead.history.unshift({ type, text, time: new Date().toISOString() });
      this.save();
    }
  }

  // --- Auto-Reply Engine Evaluation ---
  evaluateAutoReply(channel, incomingText) {
    const textLower = incomingText.toLowerCase().trim();
    for (const rule of this.autoReplies) {
      if (!rule.active) continue;
      if (rule.channel !== 'all' && rule.channel !== channel) continue;

      let matches = false;
      const kw = rule.keyword.toLowerCase().trim();

      if (rule.matchType === 'contains' && textLower.includes(kw)) {
        matches = true;
      } else if (rule.matchType === 'exact' && textLower === kw) {
        matches = true;
      }

      if (matches) {
        rule.hits = (rule.hits || 0) + 1;
        this.save();
        return rule;
      }
    }
    return null;
  }

  // --- Activity Logging ---
  logActivity(type, text) {
    const entry = {
      id: 'act-' + Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      text,
      time: new Date().toISOString()
    };
    this.activityLogs.unshift(entry);
    if (this.activityLogs.length > 50) this.activityLogs.pop();
    this.save();
    return entry;
  }

  // Replace dynamic template variables
  renderTemplate(templateText, lead) {
    if (!lead) return templateText;
    return templateText
      .replace(/{{name}}/g, lead.name || 'there')
      .replace(/{{company}}/g, lead.company || 'your team')
      .replace(/{{deal_value}}/g, lead.value ? lead.value.toLocaleString() : '0')
      .replace(/{{phone}}/g, lead.phone || '')
      .replace(/{{instagram}}/g, lead.instagram || '');
  }
}

export const crmStore = new DataStore();
