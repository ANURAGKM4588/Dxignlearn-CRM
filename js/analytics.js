/**
 * DXIGN CRM - ANALYTICS & DASHBOARD METRICS
 * High-performance lightweight Canvas charts, KPI computations,
 * pipeline stage progress, and live activity streams.
 */

import { crmStore, PIPELINE_STAGES } from './data.js';

export function initAnalyticsModule() {
  updateDashboardMetrics();
  renderPipelineDistributionBar();
  renderUrgentDashboardFollowups();
  renderDashboardActivityFeed();
  renderCharts();
}

/* ==========================================================================
   METRIC COMPUTATIONS
   ========================================================================== */
export function updateDashboardMetrics() {
  const leads = crmStore.getLeads();

  // 1. Total Leads
  const totalLeadsEl = document.getElementById('metric-total-leads');
  if (totalLeadsEl) totalLeadsEl.textContent = leads.length;

  // 2. Total Pipeline Value
  const totalVal = leads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const pipelineValEl = document.getElementById('metric-pipeline-value');
  if (pipelineValEl) pipelineValEl.textContent = '$' + totalVal.toLocaleString();

  // 3. Conversion Rate (% Won)
  const wonCount = leads.filter(l => l.stage === 'won').length;
  const convRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;
  const convRateEl = document.getElementById('metric-conv-rate');
  if (convRateEl) convRateEl.textContent = convRate + '%';

  // 4. Follow-ups Due
  const now = new Date();
  const dueCount = leads.filter(l => {
    if (!l.nextFollowupDate) return false;
    const diff = new Date(l.nextFollowupDate) - now;
    return diff <= 86400000; // Overdue or due within 24h
  }).length;
  const dueEl = document.getElementById('metric-followups-due');
  if (dueEl) dueEl.textContent = dueCount;

  // 5. Total Auto-replies Fired
  const totalHits = crmStore.autoReplies.reduce((sum, r) => sum + (r.hits || 0), 0);
  const autoRepliesEl = document.getElementById('metric-autoreplies-fired');
  if (autoRepliesEl) autoRepliesEl.textContent = totalHits;
}

/* ==========================================================================
   INTERACTIVE PIPELINE DISTRIBUTION BAR
   ========================================================================== */
export function renderPipelineDistributionBar() {
  const barContainer = document.getElementById('pipeline-distribution-bar');
  const legendContainer = document.getElementById('pipeline-legend-container');
  if (!barContainer || !legendContainer) return;

  const leads = crmStore.getLeads();
  const total = leads.length || 1;

  const stageData = PIPELINE_STAGES.filter(s => s.id !== 'lost').map(stage => {
    const count = leads.filter(l => l.stage === stage.id).length;
    const pct = Math.round((count / total) * 100);
    return { ...stage, count, pct };
  });

  // Render Bar
  barContainer.innerHTML = stageData.map(st => `
    <div class="pipeline-segment" style="width: ${st.pct}%; background: ${st.color};" title="${st.label}: ${st.count} leads (${st.pct}%)"></div>
  `).join('');

  // Render Legend
  legendContainer.innerHTML = stageData.map(st => `
    <div class="legend-item">
      <span class="legend-dot" style="background: ${st.color};"></span>
      <span>${st.label} (${st.count})</span>
    </div>
  `).join('');
}

/* ==========================================================================
   URGENT FOLLOW-UPS ON DASHBOARD
   ========================================================================== */
export function renderUrgentDashboardFollowups() {
  const container = document.getElementById('dashboard-urgent-followups');
  if (!container) return;

  const leads = crmStore.getLeads().filter(l => l.nextFollowupDate);
  leads.sort((a, b) => new Date(a.nextFollowupDate) - new Date(b.nextFollowupDate));

  const top3 = leads.slice(0, 4);

  if (top3.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        ✨ All caught up! No urgent follow-ups right now.
      </div>
    `;
    return;
  }

  container.innerHTML = top3.map(lead => {
    const dueDate = new Date(lead.nextFollowupDate);
    const diffHours = Math.round((dueDate - new Date()) / 3600000);
    const isOverdue = diffHours < 0;

    return `
      <div class="urgent-item">
        <div class="urgent-info">
          <div class="urgent-avatar">${(lead.name || 'L')[0]}</div>
          <div>
            <div class="urgent-name">${escapeHTML(lead.name)}</div>
            <div class="urgent-sub">
              <span style="color: ${isOverdue ? 'var(--accent-danger)' : 'var(--accent-warning)'}; font-weight: 700;">
                ● ${isOverdue ? `${Math.abs(diffHours)}h Overdue` : `In ${diffHours}h`}
              </span>
              <span>• ${escapeHTML(lead.company || 'Direct')}</span>
            </div>
          </div>
        </div>
        <div>
          ${lead.phone ? `
            <button class="btn btn-sm btn-whatsapp" onclick="window.openQuickWhatsAppModal('${lead.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Follow Up
            </button>
          ` : `
            <button class="btn btn-sm btn-secondary" onclick="window.openLeadDrawer('${lead.id}')">View</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   LIVE DASHBOARD ACTIVITY FEED
   ========================================================================== */
export function renderDashboardActivityFeed() {
  const container = document.getElementById('dashboard-activity-feed');
  if (!container) return;

  const activities = crmStore.activityLogs.slice(0, 6);

  container.innerHTML = activities.map(act => {
    let iconSvg = '';
    if (act.type === 'whatsapp') {
      iconSvg = `<span style="color: var(--accent-whatsapp)">●</span>`;
    } else if (act.type === 'instagram') {
      iconSvg = `<span style="color: var(--accent-instagram)">●</span>`;
    } else {
      iconSvg = `<span style="color: var(--accent-primary)">●</span>`;
    }

    return `
      <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.82rem;">
        <div style="margin-top: 2px;">${iconSvg}</div>
        <div style="flex: 1;">
          <div style="color: #fff; font-weight: 500;">${escapeHTML(act.text)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">${timeAgo(act.time)}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   CANVAS CHARTS (Zero Dependencies, Ultra Fast)
   ========================================================================== */
export function renderCharts() {
  renderLeadSourceChart();
  renderVelocityChart();
}

function renderLeadSourceChart() {
  const canvas = document.getElementById('chart-lead-sources');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width = canvas.parentElement.clientWidth || 320;
  const height = canvas.height = 200;

  const leads = crmStore.getLeads();
  const counts = {
    whatsapp: leads.filter(l => l.source === 'whatsapp').length,
    instagram: leads.filter(l => l.source === 'instagram').length,
    website: leads.filter(l => l.source === 'website').length
  };
  const total = leads.length || 1;

  ctx.clearRect(0, 0, width, height);

  // Draw modern Donut Chart
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 25;
  const innerRadius = radius * 0.65;

  const data = [
    { label: 'WhatsApp', value: counts.whatsapp, color: '#25D366' },
    { label: 'Instagram', value: counts.instagram, color: '#E1306C' },
    { label: 'Website / Other', value: counts.website, color: '#6366f1' }
  ];

  let currentAngle = -0.5 * Math.PI;

  data.forEach(item => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = item.color + '40';
    ctx.fill();

    currentAngle += sliceAngle;
  });

  // Center text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total.toString(), centerX, centerY - 6);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillText('TOTAL LEADS', centerX, centerY + 14);
}

function renderVelocityChart() {
  const canvas = document.getElementById('chart-conversion-velocity');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width = canvas.parentElement.clientWidth || 320;
  const height = canvas.height = 200;

  ctx.clearRect(0, 0, width, height);

  // Gradient area chart
  const points = [22, 35, 48, 42, 68, 75, 92];
  const padding = 20;
  const stepX = (width - padding * 2) / (points.length - 1);
  const maxVal = 100;

  // Background gradient fill
  const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
  grad.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
  grad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  ctx.beginPath();
  ctx.moveTo(padding, height - padding);

  points.forEach((val, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (val / maxVal) * (height - padding * 2);
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.lineTo(width - padding, height - padding);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line stroke
  ctx.beginPath();
  points.forEach((val, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (val / maxVal) * (height - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
  ctx.shadowBlur = 12;
  ctx.stroke();

  // Dots
  ctx.shadowBlur = 0;
  points.forEach((val, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (val / maxVal) * (height - padding * 2);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

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
