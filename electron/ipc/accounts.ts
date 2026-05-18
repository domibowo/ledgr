import { ipcMain } from 'electron'
import { getDb } from '../db'

export function registerAccountHandlers() {
  const db = () => getDb()

  ipcMain.handle('accounts:list', (_e, companyId: string) => {
    return db()
      .prepare('SELECT * FROM accounts WHERE company_id = ? ORDER BY code')
      .all(companyId)
  })

  ipcMain.handle('accounts:upsert', (_e, row: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const exists = db().prepare('SELECT id FROM accounts WHERE id = ?').get(row.id)
    if (exists) {
      db().prepare(`
        UPDATE accounts SET
          code=@code, name=@name, name_en=@name_en, type=@type,
          sub_type=@sub_type, parent_id=@parent_id, is_header=@is_header,
          normal_balance=@normal_balance, description=@description, is_active=@is_active
        WHERE id=@id
      `).run(row)
    } else {
      db().prepare(`
        INSERT INTO accounts
          (id, company_id, code, name, name_en, type, sub_type, parent_id,
           is_header, normal_balance, description, is_active, created_at)
        VALUES
          (@id, @company_id, @code, @name, @name_en, @type, @sub_type, @parent_id,
           @is_header, @normal_balance, @description, @is_active, @created_at)
      `).run({ name_en: null, sub_type: null, parent_id: null, description: null, ...row, created_at: now })
    }
    return { ok: true }
  })

  ipcMain.handle('accounts:delete', (_e, id: string) => {
    db().prepare('DELETE FROM accounts WHERE id = ?').run(id)
    return { ok: true }
  })

  ipcMain.handle('accounts:bulk-insert', (_e, rows: Record<string, unknown>[]) => {
    const now = new Date().toISOString()
    const stmt = db().prepare(`
      INSERT OR REPLACE INTO accounts
        (id, company_id, code, name, name_en, type, sub_type, parent_id,
         is_header, normal_balance, description, is_active, created_at)
      VALUES
        (@id, @company_id, @code, @name, @name_en, @type, @sub_type, @parent_id,
         @is_header, @normal_balance, @description, @is_active, @created_at)
    `)
    const insert = db().transaction((items: Record<string, unknown>[]) => {
      for (const r of items) stmt.run({ name_en: null, sub_type: null, parent_id: null, description: null, ...r, created_at: now })
    })
    insert(rows)
    return { ok: true, count: rows.length }
  })
}
