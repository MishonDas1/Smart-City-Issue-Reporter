'use strict';

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Use an in-memory-style temp DB for tests
const TEST_DB = path.join(__dirname, '..', 'test-issues.db');
process.env.DB_PATH = TEST_DB;

const app = require('../src/app');

afterAll(() => {
  const { closeDb } = require('../src/db');
  closeDb();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/issues – validation', () => {
  it('rejects empty body with 400', async () => {
    const res = await request(app).post('/api/issues').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects short title', async () => {
    const res = await request(app).post('/api/issues').send({
      title: 'Hi',
      description: 'A long enough description here',
      category: 'road',
      district: 'Dhaka',
      area: 'Mirpur',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.includes('title'))).toBe(true);
  });

  it('rejects invalid category', async () => {
    const res = await request(app).post('/api/issues').send({
      title: 'Valid title here',
      description: 'A long enough description here',
      category: 'spaceship',
      district: 'Dhaka',
      area: 'Mirpur',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.includes('category'))).toBe(true);
  });

  it('rejects missing district', async () => {
    const res = await request(app).post('/api/issues').send({
      title: 'Valid title here',
      description: 'A long enough description here',
      category: 'road',
      area: 'Mirpur',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.includes('district'))).toBe(true);
  });
});

describe('POST /api/issues – success & GET', () => {
  let createdId;

  it('creates an issue and returns 201', async () => {
    const res = await request(app).post('/api/issues').send({
      title: 'Deep pothole on road',
      description: 'Large pothole causing accidents near the school junction.',
      category: 'road',
      district: 'Dhaka',
      area: 'Mirpur-10',
      priority: 'high',
      reported_by: 'Karim',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('pending');
    expect(res.body.category).toBe('road');
    createdId = res.body.id;
  });

  it('retrieves the created issue by id', async () => {
    const res = await request(app).get(`/api/issues/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.title).toBe('Deep pothole on road');
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  it('returns 404 for non-existent issue', async () => {
    const res = await request(app).get('/api/issues/99999');
    expect(res.status).toBe(404);
  });

  it('lists issues and includes the created one', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
    expect(res.body.data.some(i => i.id === createdId)).toBe(true);
  });

  it('filters issues by status', async () => {
    const res = await request(app).get('/api/issues?status=pending');
    expect(res.status).toBe(200);
    res.body.data.forEach(i => expect(i.status).toBe('pending'));
  });

  it('filters issues by category', async () => {
    const res = await request(app).get('/api/issues?category=road');
    expect(res.status).toBe(200);
    res.body.data.forEach(i => expect(i.category).toBe('road'));
  });
});

describe('PATCH /api/issues/:id/status', () => {
  let issueId;

  beforeAll(async () => {
    const res = await request(app).post('/api/issues').send({
      title: 'Broken streetlight issue',
      description: 'Streetlight on main road has been broken for two weeks.',
      category: 'electricity',
      district: 'Chittagong',
      area: 'Agrabad',
    });
    issueId = res.body.id;
  });

  it('updates status to in_progress', async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .send({ status: 'in_progress', note: 'Assigned to electrical team' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('records status history', async () => {
    const res = await request(app).get(`/api/issues/${issueId}`);
    expect(res.status).toBe(200);
    expect(res.body.history.length).toBe(1);
    expect(res.body.history[0].new_status).toBe('in_progress');
    expect(res.body.history[0].note).toBe('Assigned to electrical team');
  });

  it('updates status to resolved', async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .send({ status: 'resolved', note: 'Fixed by maintenance crew' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
  });

  it('rejects duplicate status update', async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .send({ status: 'resolved' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .send({ status: 'unknown' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent issue', async () => {
    const res = await request(app)
      .patch('/api/issues/99999/status')
      .send({ status: 'resolved' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/issues/stats/summary', () => {
  it('returns summary statistics', async () => {
    const res = await request(app).get('/api/issues/stats/summary');
    expect(res.status).toBe(200);
    expect(typeof res.body.total).toBe('number');
    expect(Array.isArray(res.body.by_status)).toBe(true);
    expect(Array.isArray(res.body.by_category)).toBe(true);
    expect(Array.isArray(res.body.by_priority)).toBe(true);
    expect(typeof res.body.resolved_last_7_days).toBe('number');
  });
});

describe('GET /api/issues – pagination', () => {
  it('respects page and limit params', async () => {
    const res = await request(app).get('/api/issues?page=1&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.pagination.limit).toBe(1);
    expect(res.body.pagination.page).toBe(1);
  });
});
