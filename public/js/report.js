/* Report Issue page logic */
(function () {
  'use strict';

  const form = document.getElementById('issue-form');
  const reportCard = document.getElementById('report-card');
  const successCard = document.getElementById('success-card');
  const trackingIdEl = document.getElementById('tracking-id');
  const submitBtn = document.getElementById('submit-btn');
  const reportAnotherBtn = document.getElementById('report-another');

  // Load stats on page load
  loadStats();

  async function loadStats() {
    try {
      const stats = await apiFetch('/issues/stats/summary');
      document.getElementById('stat-total').textContent = stats.total;
      const pending = stats.by_status.find(s => s.status === 'pending');
      const resolved = stats.by_status.find(s => s.status === 'resolved');
      document.getElementById('stat-pending').textContent = pending ? pending.count : 0;
      document.getElementById('stat-resolved').textContent = resolved ? resolved.count : 0;
    } catch (_e) { /* silently ignore */ }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    let valid = true;
    function check(id, errId, condition) {
      const errEl = document.getElementById(errId);
      if (!condition) {
        errEl.classList.add('visible');
        valid = false;
      } else {
        errEl.classList.remove('visible');
      }
    }

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const category = form.category.value;
    const district = form.district.value;
    const area = form.area.value.trim();

    check('title', 'err-title', title.length >= 5);
    check('description', 'err-description', description.length >= 10);
    check('category', 'err-category', !!category);
    check('district', 'err-district', !!district);
    check('area', 'err-area', area.length >= 2);

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting…';

    try {
      const body = {
        title,
        description,
        category,
        district,
        area,
        priority: form.priority.value || 'medium',
        reported_by: form.reported_by.value.trim() || undefined,
        contact: form.contact.value.trim() || undefined,
      };

      const issue = await apiFetch('/issues', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      trackingIdEl.textContent = `ID #${issue.id}`;
      reportCard.style.display = 'none';
      successCard.style.display = '';

    } catch (err) {
      const msgs = err.data && err.data.errors ? err.data.errors.join(', ') : (err.message || 'Failed to submit');
      showToast('Error: ' + msgs, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = '📨 Submit Report';
    }
  });

  reportAnotherBtn.addEventListener('click', () => {
    form.reset();
    successCard.style.display = 'none';
    reportCard.style.display = '';
    submitBtn.disabled = false;
    submitBtn.textContent = '📨 Submit Report';
    loadStats();
  });
})();
