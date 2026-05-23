import { ipcMain, dialog } from 'electron'
import { getDb } from '../db'
import * as XLSX from 'xlsx'
import fs from 'node:fs'

export function registerJournalHandlers() {
  const db = () => getDb()

  ipcMain.handle('journal:list', (_e, companyId: string, filters?: { from?: string; to?: string; search?: string }) => {
    let sql = `
      SELECT je.*,
        (SELECT SUM(amount) FROM journal_lines WHERE entry_id = je.id AND type = 'DEBIT')  AS total_debit,
        (SELECT SUM(amount) FROM journal_lines WHERE entry_id = je.id AND type = 'CREDIT') AS total_credit
      FROM journal_entries je
      WHERE je.company_id = ?
    `
    const params: unknown[] = [companyId]
    if (filters?.from)   { sql += ' AND je.date >= ?'; params.push(filters.from) }
    if (filters?.to)     { sql += ' AND je.date <= ?'; params.push(filters.to) }
    if (filters?.search) { sql += ' AND (je.description LIKE ? OR je.entry_number LIKE ?)'; params.push(`%${filters.search}%`, `%${filters.search}%`) }
    sql += ' ORDER BY je.date DESC, je.entry_number DESC'
    return db().prepare(sql).all(...params)
  })

  ipcMain.handle('journal:get', (_e, id: string) => {
    const entry = db().prepare('SELECT * FROM journal_entries WHERE id = ?').get(id)
    if (!entry) return null
    const lines = db().prepare(`
      SELECT jl.*, a.code AS account_code, a.name AS account_name
      FROM journal_lines jl
      LEFT JOIN accounts a ON a.id = jl.account_id
      WHERE jl.entry_id = ?
      ORDER BY jl.sort_order
    `).all(id)
    return { ...entry as object, lines }
  })

  ipcMain.handle('journal:upsert', (_e, entry: Record<string, unknown>, lines: Record<string, unknown>[]) => {
    const now = new Date().toISOString()
    const exists = db().prepare('SELECT id FROM journal_entries WHERE id = ?').get(entry.id)

    const upsertEntry = db().transaction(() => {
      if (exists) {
        db().prepare(`
          UPDATE journal_entries SET
            period_id=@period_id, entry_number=@entry_number, date=@date,
            description=@description, reference=@reference, entry_type=@entry_type,
            is_posted=@is_posted, posted_at=@posted_at, updated_at=@updated_at
          WHERE id=@id
        `).run({ posted_at: null, ...entry, updated_at: now })
        db().prepare('DELETE FROM journal_lines WHERE entry_id = ?').run(entry.id)
      } else {
        db().prepare(`
          INSERT INTO journal_entries
            (id, company_id, period_id, entry_number, date, description, reference,
             entry_type, is_posted, posted_at, created_by, created_at, updated_at)
          VALUES
            (@id, @company_id, @period_id, @entry_number, @date, @description, @reference,
             @entry_type, @is_posted, @posted_at, @created_by, @created_at, @updated_at)
        `).run({ posted_at: null, created_by: null, ...entry, created_at: now, updated_at: now })
      }

      const lineStmt = db().prepare(`
        INSERT INTO journal_lines (id, entry_id, account_id, type, amount, description, sort_order)
        VALUES (@id, @entry_id, @account_id, @type, @amount, @description, @sort_order)
      `)
      for (const line of lines) lineStmt.run(line)
    })

    upsertEntry()
    return { ok: true }
  })

  ipcMain.handle('journal:delete', (_e, id: string) => {
    db().prepare('DELETE FROM journal_entries WHERE id = ?').run(id)
    return { ok: true }
  })

  ipcMain.handle('journal:bulk-insert', (_e, entries: Record<string, unknown>[], lines: Record<string, unknown>[]) => {
    const now = new Date().toISOString()
    db().pragma('foreign_keys = OFF')
    const bulk = db().transaction(() => {
      const eStmt = db().prepare(`
        INSERT OR IGNORE INTO journal_entries
          (id, company_id, period_id, entry_number, date, description, reference,
           entry_type, is_posted, created_at, updated_at)
        VALUES
          (@id, @company_id, @period_id, @entry_number, @date, @description, @reference,
           @entry_type, @is_posted, @created_at, @updated_at)
      `)
      for (const e of entries) eStmt.run({ ...e, created_at: now, updated_at: now })

      const lStmt = db().prepare(`
        INSERT OR IGNORE INTO journal_lines (id, entry_id, account_id, type, amount, description, sort_order)
        VALUES (@id, @entry_id, @account_id, @type, @amount, @description, @sort_order)
      `)
      for (const l of lines) lStmt.run(l)
    })
    try {
      bulk()
    } finally {
      db().pragma('foreign_keys = ON')
    }
    return { ok: true, count: entries.length }
  })

  ipcMain.handle('journal:ledger', (_e, companyId: string, accountId: string, from?: string, to?: string) => {
    let sql = `
      SELECT jl.*, je.date, je.entry_number, je.description AS entry_desc, je.reference
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.entry_id
      WHERE je.company_id = ? AND jl.account_id = ?
    `
    const params: unknown[] = [companyId, accountId]
    if (from) { sql += ' AND je.date >= ?'; params.push(from) }
    if (to)   { sql += ' AND je.date <= ?'; params.push(to) }
    sql += ' ORDER BY je.date, je.entry_number'
    return db().prepare(sql).all(...params)
  })

  ipcMain.handle('journal:export-excel', async (_e, companyId: string, filters?: { from?: string; to?: string; search?: string }) => {
    let sql = `
      SELECT je.*,
        (SELECT SUM(amount) FROM journal_lines WHERE entry_id = je.id AND type = 'DEBIT')  AS total_debit,
        (SELECT SUM(amount) FROM journal_lines WHERE entry_id = je.id AND type = 'CREDIT') AS total_credit
      FROM journal_entries je
      WHERE je.company_id = ?
    `
    const params: unknown[] = [companyId]
    if (filters?.from)   { sql += ' AND je.date >= ?'; params.push(filters.from) }
    if (filters?.to)     { sql += ' AND je.date <= ?'; params.push(filters.to) }
    if (filters?.search) { sql += ' AND (je.description LIKE ? OR je.entry_number LIKE ?)'; params.push(`%${filters.search}%`, `%${filters.search}%`) }
    sql += ' ORDER BY je.date DESC, je.entry_number DESC'
    const entries = db().prepare(sql).all(...params) as Record<string, unknown>[]

    const lines = db().prepare(`
      SELECT jl.*, a.code AS account_code, a.name AS account_name,
             je.entry_number, je.date
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.entry_id
      LEFT JOIN accounts a ON a.id = jl.account_id
      WHERE je.company_id = ?
      ORDER BY je.date DESC, je.entry_number DESC, jl.sort_order
    `).all(companyId) as Record<string, unknown>[]

    const entrySheet = XLSX.utils.json_to_sheet(entries.map(e => ({
      'No. Jurnal':    e.entry_number,
      'Tanggal':       e.date,
      'Keterangan':    e.description,
      'Referensi':     e.reference ?? '',
      'Tipe':          e.entry_type,
      'Status':        e.is_posted ? 'Diposting' : 'Draft',
      'Total Debit':   e.total_debit ?? 0,
      'Total Kredit':  e.total_credit ?? 0,
    })))

    const lineSheet = XLSX.utils.json_to_sheet(lines.map(l => ({
      'No. Jurnal':    l.entry_number,
      'Tanggal':       l.date,
      'Kode Akun':     l.account_code ?? '',
      'Nama Akun':     l.account_name ?? '',
      'Tipe':          l.type,
      'Jumlah':        l.amount,
      'Keterangan':    l.description ?? '',
    })))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, entrySheet, 'Jurnal')
    XLSX.utils.book_append_sheet(wb, lineSheet, 'Baris Jurnal')

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Ekspor Jurnal ke Excel',
      defaultPath: `jurnal-${new Date().toISOString().slice(0, 10)}.xlsx`,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    })

    if (canceled || !filePath) return { ok: false }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    fs.writeFileSync(filePath, buf)
    return { ok: true, filePath }
  })
}
