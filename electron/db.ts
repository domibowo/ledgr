import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  const userDataPath = app.getPath('userData')
  const dbDir = path.join(userDataPath, 'data')
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

  const dbPath = path.join(dbDir, 'ledgr.db')
  _db = new Database(dbPath)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  migrate(_db)
  return _db
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT NOT NULL UNIQUE,
      run_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const ran = new Set(
    (db.prepare('SELECT name FROM migrations').all() as { name: string }[]).map(r => r.name)
  )

  const steps: { name: string; sql: string }[] = [
    {
      name: '001_companies',
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
          id                 TEXT PRIMARY KEY,
          name               TEXT NOT NULL,
          legal_name         TEXT,
          npwp               TEXT,
          address            TEXT,
          phone              TEXT,
          email              TEXT,
          logo_path          TEXT,
          currency           TEXT NOT NULL DEFAULT 'IDR',
          fiscal_year_start  INTEGER NOT NULL DEFAULT 1,
          tax_rate           REAL NOT NULL DEFAULT 0.11,
          is_active          INTEGER NOT NULL DEFAULT 1,
          created_at         TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `,
    },
    {
      name: '002_accounts',
      sql: `
        CREATE TABLE IF NOT EXISTS accounts (
          id             TEXT PRIMARY KEY,
          company_id     TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          code           TEXT NOT NULL,
          name           TEXT NOT NULL,
          name_en        TEXT,
          type           TEXT NOT NULL CHECK(type IN ('ASSET','LIABILITY','EQUITY','INCOME','EXPENSE')),
          sub_type       TEXT,
          parent_id      TEXT REFERENCES accounts(id),
          is_header      INTEGER NOT NULL DEFAULT 0,
          normal_balance TEXT NOT NULL CHECK(normal_balance IN ('DEBIT','CREDIT')),
          description    TEXT,
          is_active      INTEGER NOT NULL DEFAULT 1,
          created_at     TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(company_id, code)
        );
        CREATE INDEX IF NOT EXISTS idx_accounts_company ON accounts(company_id);
      `,
    },
    {
      name: '003_periods',
      sql: `
        CREATE TABLE IF NOT EXISTS periods (
          id          TEXT PRIMARY KEY,
          company_id  TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          name        TEXT NOT NULL,
          start_date  TEXT NOT NULL,
          end_date    TEXT NOT NULL,
          is_closed   INTEGER NOT NULL DEFAULT 0,
          closed_at   TEXT,
          created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_periods_company ON periods(company_id);
      `,
    },
    {
      name: '004_journal_entries',
      sql: `
        CREATE TABLE IF NOT EXISTS journal_entries (
          id           TEXT PRIMARY KEY,
          company_id   TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          period_id    TEXT REFERENCES periods(id),
          entry_number TEXT NOT NULL,
          date         TEXT NOT NULL,
          description  TEXT NOT NULL,
          reference    TEXT,
          entry_type   TEXT NOT NULL DEFAULT 'MANUAL'
                         CHECK(entry_type IN ('MANUAL','IMPORT','RECURRING','ADJUSTMENT')),
          is_posted    INTEGER NOT NULL DEFAULT 0,
          posted_at    TEXT,
          created_by   TEXT,
          created_at   TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(company_id, entry_number)
        );
        CREATE INDEX IF NOT EXISTS idx_je_company_date ON journal_entries(company_id, date);
      `,
    },
    {
      name: '005_journal_lines',
      sql: `
        CREATE TABLE IF NOT EXISTS journal_lines (
          id          TEXT PRIMARY KEY,
          entry_id    TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
          account_id  TEXT NOT NULL REFERENCES accounts(id),
          type        TEXT NOT NULL CHECK(type IN ('DEBIT','CREDIT')),
          amount      REAL NOT NULL CHECK(amount >= 0),
          description TEXT,
          sort_order  INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_jl_entry ON journal_lines(entry_id);
        CREATE INDEX IF NOT EXISTS idx_jl_account ON journal_lines(account_id);
      `,
    },
    {
      name: '006_report_history',
      sql: `
        CREATE TABLE IF NOT EXISTS report_history (
          id           TEXT PRIMARY KEY,
          company_id   TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          report_type  TEXT NOT NULL,
          period_label TEXT NOT NULL,
          file_name    TEXT,
          file_path    TEXT,
          generated_at TEXT NOT NULL DEFAULT (datetime('now')),
          sent_to_email TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_rh_company ON report_history(company_id);
      `,
    },
  ]

  const insertMigration = db.prepare('INSERT INTO migrations (name) VALUES (?)')

  for (const step of steps) {
    if (ran.has(step.name)) continue
    db.exec(step.sql)
    insertMigration.run(step.name)
  }
}
