import { app, ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Database from "better-sqlite3";
import fs from "node:fs";
let _db = null;
function getDb() {
  if (_db) return _db;
  const userDataPath = app.getPath("userData");
  const dbDir = path.join(userDataPath, "data");
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, "ledgr.db");
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  return _db;
}
function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT NOT NULL UNIQUE,
      run_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const ran = new Set(
    db.prepare("SELECT name FROM migrations").all().map((r) => r.name)
  );
  const steps = [
    {
      name: "001_companies",
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
      `
    },
    {
      name: "002_accounts",
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
      `
    },
    {
      name: "003_periods",
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
      `
    },
    {
      name: "004_journal_entries",
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
      `
    },
    {
      name: "005_journal_lines",
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
      `
    },
    {
      name: "006_report_history",
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
      `
    }
  ];
  const insertMigration = db.prepare("INSERT INTO migrations (name) VALUES (?)");
  for (const step of steps) {
    if (ran.has(step.name)) continue;
    db.exec(step.sql);
    insertMigration.run(step.name);
  }
}
function registerCompanyHandlers() {
  const db = () => getDb();
  ipcMain.handle("companies:list", () => {
    return db().prepare("SELECT * FROM companies ORDER BY name").all();
  });
  ipcMain.handle("companies:get", (_e, id) => {
    return db().prepare("SELECT * FROM companies WHERE id = ?").get(id) ?? null;
  });
  ipcMain.handle("companies:upsert", (_e, row) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const exists = db().prepare("SELECT id FROM companies WHERE id = ?").get(row.id);
    if (exists) {
      db().prepare(`
        UPDATE companies SET
          name=@name, legal_name=@legal_name, npwp=@npwp, address=@address,
          phone=@phone, email=@email, currency=@currency,
          fiscal_year_start=@fiscal_year_start, tax_rate=@tax_rate,
          is_active=@is_active, updated_at=@updated_at
        WHERE id=@id
      `).run({ ...row, updated_at: now });
    } else {
      db().prepare(`
        INSERT INTO companies
          (id, name, legal_name, npwp, address, phone, email, currency,
           fiscal_year_start, tax_rate, is_active, created_at, updated_at)
        VALUES
          (@id, @name, @legal_name, @npwp, @address, @phone, @email, @currency,
           @fiscal_year_start, @tax_rate, @is_active, @created_at, @updated_at)
      `).run({ ...row, created_at: now, updated_at: now });
    }
    return { ok: true };
  });
  ipcMain.handle("companies:delete", (_e, id) => {
    db().prepare("DELETE FROM companies WHERE id = ?").run(id);
    return { ok: true };
  });
}
function registerAccountHandlers() {
  const db = () => getDb();
  ipcMain.handle("accounts:list", (_e, companyId) => {
    return db().prepare("SELECT * FROM accounts WHERE company_id = ? ORDER BY code").all(companyId);
  });
  ipcMain.handle("accounts:upsert", (_e, row) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const exists = db().prepare("SELECT id FROM accounts WHERE id = ?").get(row.id);
    if (exists) {
      db().prepare(`
        UPDATE accounts SET
          code=@code, name=@name, name_en=@name_en, type=@type,
          sub_type=@sub_type, parent_id=@parent_id, is_header=@is_header,
          normal_balance=@normal_balance, description=@description, is_active=@is_active
        WHERE id=@id
      `).run(row);
    } else {
      db().prepare(`
        INSERT INTO accounts
          (id, company_id, code, name, name_en, type, sub_type, parent_id,
           is_header, normal_balance, description, is_active, created_at)
        VALUES
          (@id, @company_id, @code, @name, @name_en, @type, @sub_type, @parent_id,
           @is_header, @normal_balance, @description, @is_active, @created_at)
      `).run({ name_en: null, sub_type: null, parent_id: null, description: null, ...row, created_at: now });
    }
    return { ok: true };
  });
  ipcMain.handle("accounts:delete", (_e, id) => {
    db().prepare("DELETE FROM accounts WHERE id = ?").run(id);
    return { ok: true };
  });
  ipcMain.handle("accounts:bulk-insert", (_e, rows) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db().prepare(`
      INSERT OR REPLACE INTO accounts
        (id, company_id, code, name, name_en, type, sub_type, parent_id,
         is_header, normal_balance, description, is_active, created_at)
      VALUES
        (@id, @company_id, @code, @name, @name_en, @type, @sub_type, @parent_id,
         @is_header, @normal_balance, @description, @is_active, @created_at)
    `);
    const insert = db().transaction((items) => {
      for (const r of items) stmt.run({ name_en: null, sub_type: null, parent_id: null, description: null, ...r, created_at: now });
    });
    insert(rows);
    return { ok: true, count: rows.length };
  });
}
function registerJournalHandlers() {
  const db = () => getDb();
  ipcMain.handle("journal:list", (_e, companyId, filters) => {
    let sql = `
      SELECT je.*,
        (SELECT SUM(amount) FROM journal_lines WHERE entry_id = je.id AND type = 'DEBIT')  AS total_debit,
        (SELECT SUM(amount) FROM journal_lines WHERE entry_id = je.id AND type = 'CREDIT') AS total_credit
      FROM journal_entries je
      WHERE je.company_id = ?
    `;
    const params = [companyId];
    if (filters == null ? void 0 : filters.from) {
      sql += " AND je.date >= ?";
      params.push(filters.from);
    }
    if (filters == null ? void 0 : filters.to) {
      sql += " AND je.date <= ?";
      params.push(filters.to);
    }
    if (filters == null ? void 0 : filters.search) {
      sql += " AND (je.description LIKE ? OR je.entry_number LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    sql += " ORDER BY je.date DESC, je.entry_number DESC";
    return db().prepare(sql).all(...params);
  });
  ipcMain.handle("journal:get", (_e, id) => {
    const entry = db().prepare("SELECT * FROM journal_entries WHERE id = ?").get(id);
    if (!entry) return null;
    const lines = db().prepare(`
      SELECT jl.*, a.code AS account_code, a.name AS account_name
      FROM journal_lines jl
      LEFT JOIN accounts a ON a.id = jl.account_id
      WHERE jl.entry_id = ?
      ORDER BY jl.sort_order
    `).all(id);
    return { ...entry, lines };
  });
  ipcMain.handle("journal:upsert", (_e, entry, lines) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const exists = db().prepare("SELECT id FROM journal_entries WHERE id = ?").get(entry.id);
    const upsertEntry = db().transaction(() => {
      if (exists) {
        db().prepare(`
          UPDATE journal_entries SET
            period_id=@period_id, entry_number=@entry_number, date=@date,
            description=@description, reference=@reference, entry_type=@entry_type,
            is_posted=@is_posted, posted_at=@posted_at, updated_at=@updated_at
          WHERE id=@id
        `).run({ ...entry, updated_at: now });
        db().prepare("DELETE FROM journal_lines WHERE entry_id = ?").run(entry.id);
      } else {
        db().prepare(`
          INSERT INTO journal_entries
            (id, company_id, period_id, entry_number, date, description, reference,
             entry_type, is_posted, posted_at, created_by, created_at, updated_at)
          VALUES
            (@id, @company_id, @period_id, @entry_number, @date, @description, @reference,
             @entry_type, @is_posted, @posted_at, @created_by, @created_at, @updated_at)
        `).run({ ...entry, created_at: now, updated_at: now });
      }
      const lineStmt = db().prepare(`
        INSERT INTO journal_lines (id, entry_id, account_id, type, amount, description, sort_order)
        VALUES (@id, @entry_id, @account_id, @type, @amount, @description, @sort_order)
      `);
      for (const line of lines) lineStmt.run(line);
    });
    upsertEntry();
    return { ok: true };
  });
  ipcMain.handle("journal:delete", (_e, id) => {
    db().prepare("DELETE FROM journal_entries WHERE id = ?").run(id);
    return { ok: true };
  });
  ipcMain.handle("journal:bulk-insert", (_e, entries, lines) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const bulk = db().transaction(() => {
      db().pragma("foreign_keys = OFF");
      const eStmt = db().prepare(`
        INSERT OR IGNORE INTO journal_entries
          (id, company_id, period_id, entry_number, date, description, reference,
           entry_type, is_posted, created_at, updated_at)
        VALUES
          (@id, @company_id, @period_id, @entry_number, @date, @description, @reference,
           @entry_type, @is_posted, @created_at, @updated_at)
      `);
      for (const e of entries) eStmt.run({ ...e, created_at: now, updated_at: now });
      const lStmt = db().prepare(`
        INSERT OR IGNORE INTO journal_lines (id, entry_id, account_id, type, amount, description, sort_order)
        VALUES (@id, @entry_id, @account_id, @type, @amount, @description, @sort_order)
      `);
      for (const l of lines) lStmt.run(l);
      db().pragma("foreign_keys = ON");
    });
    bulk();
    return { ok: true, count: entries.length };
  });
  ipcMain.handle("journal:ledger", (_e, companyId, accountId, from, to) => {
    let sql = `
      SELECT jl.*, je.date, je.entry_number, je.description AS entry_desc, je.reference
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.entry_id
      WHERE je.company_id = ? AND jl.account_id = ?
    `;
    const params = [companyId, accountId];
    if (from) {
      sql += " AND je.date >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND je.date <= ?";
      params.push(to);
    }
    sql += " ORDER BY je.date, je.entry_number";
    return db().prepare(sql).all(...params);
  });
}
function registerReportHandlers() {
  const db = () => getDb();
  ipcMain.handle("reports:history-list", (_e, companyId) => {
    return db().prepare("SELECT * FROM report_history WHERE company_id = ? ORDER BY generated_at DESC").all(companyId);
  });
  ipcMain.handle("reports:history-add", (_e, row) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    db().prepare(`
      INSERT INTO report_history (id, company_id, report_type, period_label, file_name, file_path, generated_at, sent_to_email)
      VALUES (@id, @company_id, @report_type, @period_label, @file_name, @file_path, @generated_at, @sent_to_email)
    `).run({ ...row, generated_at: row.generated_at ?? now });
    return { ok: true };
  });
  ipcMain.handle("reports:pl", (_e, companyId, from, to) => {
    return db().prepare(`
      SELECT a.type, a.code, a.name,
        SUM(CASE WHEN jl.type = 'DEBIT'  THEN jl.amount ELSE 0 END) AS total_debit,
        SUM(CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE 0 END) AS total_credit
      FROM journal_lines jl
      JOIN accounts a ON a.id = jl.account_id
      JOIN journal_entries je ON je.id = jl.entry_id
      WHERE je.company_id = ? AND je.date BETWEEN ? AND ? AND a.type IN ('INCOME','EXPENSE')
      GROUP BY a.id
      ORDER BY a.code
    `).all(companyId, from, to);
  });
  ipcMain.handle("reports:trial-balance", (_e, companyId, from, to) => {
    return db().prepare(`
      SELECT a.code, a.name, a.type, a.normal_balance,
        SUM(CASE WHEN jl.type = 'DEBIT'  THEN jl.amount ELSE 0 END) AS total_debit,
        SUM(CASE WHEN jl.type = 'CREDIT' THEN jl.amount ELSE 0 END) AS total_credit
      FROM journal_lines jl
      JOIN accounts a ON a.id = jl.account_id
      JOIN journal_entries je ON je.id = jl.entry_id
      WHERE je.company_id = ? AND je.date BETWEEN ? AND ?
      GROUP BY a.id
      ORDER BY a.code
    `).all(companyId, from, to);
  });
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(() => {
  getDb();
  registerCompanyHandlers();
  registerAccountHandlers();
  registerJournalHandlers();
  registerReportHandlers();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
