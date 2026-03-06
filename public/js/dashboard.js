/* Public Dashboard page logic */
(function () {
  'use strict';

  let currentPage = 1;
  const PAGE_SIZE = 15;
  let currentFilters = {};

  const listWrap = document.getElementById('issue-list-wrap');
  const paginationEl = document.getElementById('pagination');
  const modal = document.getElementById('detail-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  const fStatus = document.getElementById('f-status');
  const fCategory = document.getElementById('f-category');
  const fPriority = document.getElementById('f-priority');
  const fDistrict = document.getElementById('f-district');
  const btnReset = document.getElementById('btn-reset-filters');

  init();

  function init() {
    loadStats();
    loadIssues();

    [fStatus, fCategory, fPriority].forEach(el => el.addEventListener('change', onFilterChange));
    let districtTimer;
    fDistrict.addEventListener('input', () => {
      clearTimeout(districtTimer);
      districtTimer = setTimeout(onFilterChange, 400);
    });
    btnReset.addEventListener('click', () => {
      fStatus.value = fCategory.value = fPriority.value = fDistrict.value = '';
      onFilterChange();
    });

    modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  function onFilterChange() {
    currentFilters = {};
    if (fStatus.value)   currentFilters.status   = fStatus.value;
    if (fCategory.value) currentFilters.category = fCategory.value;
    if (fPriority.value) currentFilters.priority = fPriority.value;
    if (fDistrict.value) currentFilters.district = fDistrict.value;
    currentPage = 1;
    loadIssues();
  }

  async function loadStats() {
    try {
      const stats = await apiFetch('/issues/stats/summary');
      document.getElementById('s-total').textContent   = stats.total;
      const pending  = stats.by_status.find(s => s.status === 'pending');
      const progress = stats.by_status.find(s => s.status === 'in_progress');
      const resolved = stats.by_status.find(s => s.status === 'resolved');
      document.getElementById('s-pending').textContent  = pending  ? pending.count  : 0;
      document.getElementById('s-progress').textContent = progress ? progress.count : 0;
      document.getElementById('s-resolved').textContent = resolved ? resolved.count : 0;
      document.getElementById('s-week').textContent     = stats.resolved_last_7_days;

      // Category bars
      const catEl = document.getElementById('cat-chart');
      catEl.innerHTML = stats.by_category.length
        ? stats.by_category.map(c =>
            buildBar(CAT_LABELS[c.category] || c.category, c.count, stats.total, `cat-${c.category}`)
          ).join('')
        : '<p style="color:var(--muted);font-size:0.9rem;">No data yet.</p>';

      // Priority bars
      const colors = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' };
      const priEl = document.getElementById('pri-chart');
      priEl.innerHTML = stats.by_priority.length
        ? stats.by_priority.map(p =>
            buildBar(p.priority.charAt(0).toUpperCase() + p.priority.slice(1), p.count, stats.total, colors[p.priority] || '')
          ).join('')
        : '<p style="color:var(--muted);font-size:0.9rem;">No data yet.</p>';

    } catch (_e) { /* silently ignore */ }
  }

  async function loadIssues() {
    listWrap.innerHTML = '<div class="spinner"></div>';
    paginationEl.innerHTML = '';

    const params = new URLSearchParams({
      page: currentPage,
      limit: PAGE_SIZE,
      ...currentFilters,
    });

    try {
      const res = await apiFetch(`/issues?${params}`);
      renderList(res.data, listWrap);
      renderPagination(res.pagination, paginationEl);
    } catch (_e) {
      listWrap.innerHTML = '<p style="color:var(--red);padding:1rem;">Failed to load issues.</p>';
    }
  }

  function renderList(issues, container) {
    if (!issues || issues.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>No issues found matching the current filters.</p></div>`;
      return;
    }

    const html = issues.map(issue => `
      <div class="issue-item ${issue.status}" data-id="${issue.id}" role="button" tabindex="0">
        <div class="issue-header">
          <h3>${escapeHtml(issue.title)}</h3>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
            ${statusBadge(issue.status)}
            ${priorityLabel(issue.priority)}
          </div>
        </div>
        <div class="issue-meta">
          <span>${CAT_LABELS[issue.category] || issue.category}</span>
          <span>📍 ${escapeHtml(issue.district)}, ${escapeHtml(issue.area)}</span>
          <span>🕐 ${formatDate(issue.created_at)}</span>
          <span style="opacity:0.7">#${issue.id}</span>
        </div>
      </div>`).join('');

    container.innerHTML = `<div class="issue-list">${html}</div>`;

    container.querySelectorAll('.issue-item').forEach(el => {
      el.addEventListener('click', () => openDetail(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') openDetail(el.dataset.id); });
    });
  }

  function renderPagination({ total, page, pages }, container) {
    if (pages <= 1) return;
    let html = '';
    html += `<button ${page <= 1 ? 'disabled' : ''} data-p="${page - 1}">‹ Prev</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="${i === page ? 'active' : ''}" data-p="${i}">${i}</button>`;
    }
    html += `<button ${page >= pages ? 'disabled' : ''} data-p="${page + 1}">Next ›</button>`;
    container.innerHTML = html;
    container.querySelectorAll('button[data-p]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.p, 10);
        loadIssues();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  async function openDetail(id) {
    modal.classList.remove('hidden');
    modalTitle.textContent = 'Loading…';
    modalBody.innerHTML = '<div class="spinner"></div>';
    try {
      const issue = await apiFetch(`/issues/${id}`);
      renderDetailModal(issue, modalBody, modalTitle);
    } catch (_e) {
      modalBody.innerHTML = '<p style="color:var(--red);">Failed to load issue details.</p>';
    }
  }
})();
