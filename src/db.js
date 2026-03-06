'use strict';

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'issues.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      category    TEXT    NOT NULL CHECK(category IN ('road','water','electricity','waste','sewage','other')),
      district    TEXT    NOT NULL,
      area        TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','resolved')),
      priority    TEXT    NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
      reported_by TEXT,
      contact     TEXT,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS status_history (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id   INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      old_status TEXT    NOT NULL,
      new_status TEXT    NOT NULL,
      note       TEXT,
      changed_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `);
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
