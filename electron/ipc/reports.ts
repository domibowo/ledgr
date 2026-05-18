import { ipcMain } from 'electron'
import { getDb } from '../db'

export function registerReportHandlers() {
  const db = () => getDb()

  ipcMain.handle('reports:history-list', (_e, companyId: string) => {
    return db()
      .prepare('SELECT * FROM report_history WHERE company_id = ? ORDER BY generated_at DESC')
      .all(companyId)
  })

  ipcMain.handle('reports:history-add', (_e, row: Record<string, unknown>) => {
    const now = new Date().toISOString()
    db().prepare(`
      INSERT INTO report_history (id, company_id, report_type, period_label, file_name, file_path, generated_at, sent_to_email)
      VALUES (@id, @company_id, @report_type, @period_label, @file_name, @file_path, @generated_at, @sent_to_email)
    `).run({ ...row, generated_at: (row.generated_at as string | undefined) ?? now })
    return { ok: true }
  })

  ipcMain.handle('reports:pl', (_e, companyId: string, from: string, to: string) => {
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
    `).all(companyId, from, to)
  })

  ipcMain.handle('reports:trial-balance', (_e, companyId: string, from: string, to: string) => {
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
    `).all(companyId, from, to)
  })
}
