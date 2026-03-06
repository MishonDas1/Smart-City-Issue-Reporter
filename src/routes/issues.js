'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

const VALID_CATEGORIES = ['road', 'water', 'electricity', 'waste', 'sewage', 'other'];
const VALID_STATUSES = ['pending', 'in_progress', 'resolved'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// GET /api/issues  – list all issues with optional filters
router.get('/', (req, res) => {
  const db = getDb();
  const { status, category, district, priority, page = '1', limit = '20' } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status && VALID_STATUSES.includes(status)) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (district) {
    conditions.push('district LIKE ?');
    params.push(`%${district}%`);
  }
  if (priority && VALID_PRIORITIES.includes(priority)) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) as count FROM issues ${where}`).get(...params).count;
  const issues = db.prepare(
    `SELECT * FROM issues ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limitNum, offset);

  res.json({
    data: issues,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/issues/:id  – get a single issue with its history
router.get('/:id', (req, res) => {
  const db = getDb();
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  const history = db
    .prepare('SELECT * FROM status_history WHERE issue_id = ? ORDER BY changed_at ASC')
    .all(req.params.id);
  res.json({ ...issue, history });
});

// POST /api/issues  – report a new issue
router.post('/', (req, res) => {
  const { title, description, category, district, area, priority, reported_by, contact } =
    req.body || {};

  const errors = [];
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.push('title must be at least 5 characters');
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('description must be at least 10 characters');
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!district || typeof district !== 'string' || district.trim().length < 2) {
    errors.push('district is required');
  }
  if (!area || typeof area !== 'string' || area.trim().length < 2) {
    errors.push('area is required');
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO issues (title, description, category, district, area, priority, reported_by, contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    title.trim(),
    description.trim(),
    category,
    district.trim(),
    area.trim(),
    priority || 'medium',
    reported_by ? String(reported_by).trim() : null,
    contact ? String(contact).trim() : null
  );

  const created = db.prepare('SELECT * FROM issues WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// PATCH /api/issues/:id/status  – update status (admin action)
router.patch('/:id/status', (req, res) => {
  const { status, note } = req.body || {};

  if (!status || !VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const db = getDb();
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  if (issue.status === status) {
    return res.status(400).json({ error: 'Status is already set to the requested value' });
  }

  const updateTx = db.transaction(() => {
    db.prepare(
      `UPDATE issues SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = ?`
    ).run(status, req.params.id);

    db.prepare(
      'INSERT INTO status_history (issue_id, old_status, new_status, note) VALUES (?, ?, ?, ?)'
    ).run(req.params.id, issue.status, status, note ? String(note).trim() : null);
  });

  updateTx();

  const updated = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// GET /api/stats  – aggregated statistics for dashboard
router.get('/stats/summary', (req, res) => {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) as count FROM issues').get().count;
  const byStatus = db
    .prepare('SELECT status, COUNT(*) as count FROM issues GROUP BY status')
    .all();
  const byCategory = db
    .prepare('SELECT category, COUNT(*) as count FROM issues GROUP BY category')
    .all();
  const byPriority = db
    .prepare('SELECT priority, COUNT(*) as count FROM issues GROUP BY priority')
    .all();
  const recentResolved = db
    .prepare(
      `SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'
       AND updated_at >= strftime('%Y-%m-%dT%H:%M:%SZ','now','-7 days')`
    )
    .get().count;

  res.json({
    total,
    by_status: byStatus,
    by_category: byCategory,
    by_priority: byPriority,
    resolved_last_7_days: recentResolved,
  });
});

module.exports = router;
