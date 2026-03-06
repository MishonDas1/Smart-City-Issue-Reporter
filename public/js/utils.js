/* Shared utilities for Smart City Issue Reporter frontend */

const API = '/api';

const CAT_LABELS = {
  road: '🛣️ Road & Pavement',
  water: '💧 Water Supply',
  electricity: '⚡ Electricity',
  waste: '🗑️ Waste Management',
  sewage: '🚰 Sewage & Drainage',
  other: '📌 Other',
};

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

function statusBadge(status) {
  const cls = status === 'in_progress' ? 'badge-progress' : `badge-${status}`;
  return `<span class="badge ${cls}">${STATUS_LABELS[status] || status}</span>`;
}

function priorityLabel(p) {
  return `<span class="priority-${p}">${p.charAt(0).toUpperCase() + p.slice(1)}</span>`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function showToast(message, type = 'default') {
  const container = document.getElementById('toasts');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'API error'), { data, status: res.status });
  return data;
}

function buildBar(label, count, total, colorClass) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `
    <div style="margin-bottom:0.6rem;">
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:2px;">
        <span>${label}</span><span style="font-weight:600;">${count} (${pct}%)</span>
      </div>
      <div style="background:var(--border);border-radius:4px;height:10px;overflow:hidden;">
        <div class="${colorClass}" style="height:100%;width:${pct}%;background:currentColor;transition:width 0.4s;"></div>
      </div>
    </div>`;
}

function renderDetailModal(issue, bodyEl, titleEl) {
  titleEl.textContent = `#${issue.id} — ${issue.title}`;
  const history = issue.history || [];
  bodyEl.innerHTML = `
    <p style="font-size:0.9rem;color:var(--muted);margin-bottom:1rem;">
      ${CAT_LABELS[issue.category] || issue.category} &bull;
      ${issue.district}, ${issue.area} &bull;
      Reported on ${formatDate(issue.created_at)}
    </p>
    <p style="margin-bottom:1rem;">${escapeHtml(issue.description)}</p>
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.25rem;">
      ${statusBadge(issue.status)}
      ${priorityLabel(issue.priority)}
      ${issue.reported_by ? `<span style="font-size:0.85rem;color:var(--muted);">👤 ${escapeHtml(issue.reported_by)}</span>` : ''}
    </div>
    <h3 style="font-size:0.95rem;margin-bottom:0.5rem;color:var(--dark);">Status History</h3>
    ${history.length === 0
      ? '<p style="font-size:0.85rem;color:var(--muted);">No status changes yet.</p>'
      : `<ul class="history-list">${history.map(h =>
          `<li><strong>${STATUS_LABELS[h.old_status]} → ${STATUS_LABELS[h.new_status]}</strong>
           ${h.note ? ` — ${escapeHtml(h.note)}` : ''}
           <br/><span style="color:var(--muted);font-size:0.78rem;">${formatDate(h.changed_at)}</span></li>`
        ).join('')}</ul>`
    }`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
