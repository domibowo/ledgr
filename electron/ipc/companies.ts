import { ipcMain } from 'electron'
import { getDb } from '../db'

export function registerCompanyHandlers() {
  const db = () => getDb()

  ipcMain.handle('companies:list', () => {
    return db().prepare('SELECT * FROM companies ORDER BY name').all()
  })

  ipcMain.handle('companies:get', (_e, id: string) => {
    return db().prepare('SELECT * FROM companies WHERE id = ?').get(id) ?? null
  })

  ipcMain.handle('companies:upsert', (_e, row: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const exists = db().prepare('SELECT id FROM companies WHERE id = ?').get(row.id)
    if (exists) {
      db().prepare(`
        UPDATE companies SET
          name=@name, legal_name=@legal_name, npwp=@npwp, address=@address,
          phone=@phone, email=@email, currency=@currency,
          fiscal_year_start=@fiscal_year_start, tax_rate=@tax_rate,
          is_active=@is_active, updated_at=@updated_at
        WHERE id=@id
      `).run({ ...row, updated_at: now })
    } else {
      db().prepare(`
        INSERT INTO companies
          (id, name, legal_name, npwp, address, phone, email, currency,
           fiscal_year_start, tax_rate, is_active, created_at, updated_at)
        VALUES
          (@id, @name, @legal_name, @npwp, @address, @phone, @email, @currency,
           @fiscal_year_start, @tax_rate, @is_active, @created_at, @updated_at)
      `).run({ ...row, created_at: now, updated_at: now })
    }
    return { ok: true }
  })

  ipcMain.handle('companies:delete', (_e, id: string) => {
    db().prepare('DELETE FROM companies WHERE id = ?').run(id)
    return { ok: true }
  })
}
