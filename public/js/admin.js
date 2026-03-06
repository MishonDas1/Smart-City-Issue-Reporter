/* Admin Panel page logic */
(function () {
  'use strict';

  let currentPage = 1;
  const PAGE_SIZE = 20;
  let currentFilters = {};
  let editingIssueId = null;

  const tableBody = document.getElementById('table-body');
  const paginationEl = document.getElementById('pagination');

  const updateModal = document.getElementById('update-modal');
  const detailModal = document.getElementById('detail-modal');
  const modalClose = document.getElementById('modal-close');
  const detailClose = document.getElementById('detail-close');
  const modalIssueInfo = document.getElementById('modal-issue-info');
  const newStatusSel = document.getElementById('new-status');
  const statusNote = document.getElementById('status-note');
  const modalSave = document.getElementById('modal-save');
  const modalCancel = document.getElementById('modal-cancel');

  const fStatus = document.getElementById('f-status');
  const fCategory = document.getElementById('f-category');
  const fPriority = document.getElementById('f-priority');
  const btnReset = document.getElementById('btn-reset-filters');

  init();

  function init() {
    loadStats();
    loadIssues();

    [fStatus, fCategory, fPriority].forEach(el => el.addEventListener('change', onFilterChange));
    btnReset.addEventListener('click', () => {
      fStatus.value = fCategory.value = fPriority.value = '';
      onFilterChange();
    });

    modalClose.addEventListener('click', closeUpdateModal);
    modalCancel.addEventListener('click', closeUpdateModal);
    updateModal.addEventListener('click', e => { if (e.target === updateModal) closeUpdateModal(); });
    detailClose.addEventListener('click', () => detailModal.classList.add('hidden'));
    detailModal.addEventListener('click', e => { if (e.target === detailModal) detailModal.classList.add('hidden'); });

    modalSave.addEventListener('click', saveStatusUpdate);
  }

  function onFilterChange() {
    currentFilters = {};
    if (fStatus.value)   currentFilters.status   = fStatus.value;
    if (fCategory.value) currentFilters.category = fCategory.value;
    if (fPriority.value) currentFilters.priority = fPriority.value;
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
    } catch (_e) { /* silently ignore */ }
  }

  async function loadIssues() {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr>`;
    paginationEl.innerHTML = '';

    const params = new URLSearchParams({ page: currentPage, limit: PAGE_SIZE, ...currentFilters });
    try {
      const res = await apiFetch(`/issues?${params}`);
      renderTable(res.data);
      renderPagination(res.pagination, paginationEl);
    } catch (_e) {
      tableBody.innerHTML = `<tr><td colspan="8" style="color:var(--red);padding:1rem;">Failed to load issues.</td></tr>`;
    }
  }

  function renderTable(issues) {
    if (!issues || issues.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted);">No issues found.</td></tr>`;
      return;
    }
    tableBody.innerHTML = issues.map(issue => `
      <tr>
        <td><strong>#${issue.id}</strong></td>
        <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(issue.title)}">${escapeHtml(issue.title)}</td>
        <td>${CAT_LABELS[issue.category] || issue.category}</td>
        <td>${escapeHtml(issue.district)}, ${escapeHtml(issue.area)}</td>
        <td>${priorityLabel(issue.priority)}</td>
        <td>${statusBadge(issue.status)}</td>
        <td style="white-space:nowrap;">${formatDate(issue.created_at)}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-outline btn-sm" data-action="view" data-id="${issue.id}">View</button>
          <button class="btn btn-primary btn-sm" style="margin-left:4px;" data-action="edit" data-id="${issue.id}" data-title="${escapeHtml(issue.title)}" data-status="${issue.status}">Update</button>
        </td>
      </tr>`).join('');

    tableBody.querySelectorAll('button[data-action]').forEach(btn => {
      if (btn.dataset.action === 'edit') {
        btn.addEventListener('click', () => openUpdateModal(btn.dataset.id, btn.dataset.title, btn.dataset.status));
      } else if (btn.dataset.action === 'view') {
        btn.addEventListener('click', () => openDetail(btn.dataset.id));
      }
    });
  }

  function renderPagination({ page, pages }, container) {
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

  function openUpdateModal(id, title, currentStatus) {
    editingIssueId = id;
    modalIssueInfo.innerHTML = `<strong>#${id}</strong> — ${escapeHtml(title)}<br/><small style="color:var(--muted);">Current status: ${statusBadge(currentStatus)}</small>`;
    newStatusSel.value = currentStatus;
    statusNote.value = '';
    updateModal.classList.remove('hidden');
  }

  function closeUpdateModal() {
    updateModal.classList.add('hidden');
    editingIssueId = null;
  }

  async function saveStatusUpdate() {
    if (!editingIssueId) return;
    const status = newStatusSel.value;
    const note = statusNote.value.trim();

    modalSave.disabled = true;
    modalSave.textContent = 'Saving…';

    try {
      await apiFetch(`/issues/${editingIssueId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: note || undefined }),
      });
      showToast('Status updated successfully!', 'success');
      closeUpdateModal();
      loadIssues();
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      modalSave.disabled = false;
      modalSave.textContent = 'Save Changes';
    }
  }

  async function openDetail(id) {
    const detailTitle = document.getElementById('detail-title');
    const detailBody = document.getElementById('detail-body');
    detailModal.classList.remove('hidden');
    detailTitle.textContent = 'Loading…';
    detailBody.innerHTML = '<div class="spinner"></div>';
    try {
      const issue = await apiFetch(`/issues/${id}`);
      renderDetailModal(issue, detailBody, detailTitle);
    } catch (_e) {
      detailBody.innerHTML = '<p style="color:var(--red);">Failed to load issue details.</p>';
    }
  }
})();
