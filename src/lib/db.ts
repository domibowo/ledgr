import type { Company } from '../types/company.types'
import type { Account } from '../types/account.types'
import type { JournalEntry, JournalLine } from '../types/transaction.types'

// Detect whether we're running inside Electron with the db bridge available.
const isElectron = typeof window !== 'undefined' && 'db' in window

function bridge() {
  if (!isElectron) throw new Error('db bridge not available (not running in Electron)')
  return window.db
}

// ── Companies ──────────────────────────────────────────────────────────────

export const companyDb = {
  list:   ()                  => bridge().listCompanies() as Promise<Company[]>,
  get:    (id: string)        => bridge().getCompany(id)  as Promise<Company | null>,
  upsert: (row: Company)      => bridge().upsertCompany(row),
  delete: (id: string)        => bridge().deleteCompany(id),
}

// ── Accounts ───────────────────────────────────────────────────────────────

export const accountDb = {
  list:       (companyId: string)   => bridge().listAccounts(companyId)   as Promise<Account[]>,
  upsert:     (row: Account)        => bridge().upsertAccount(row),
  delete:     (id: string)          => bridge().deleteAccount(id),
  bulkInsert: (rows: Account[])     => bridge().bulkAccounts(rows),
}

// ── Journal ────────────────────────────────────────────────────────────────

export type JournalFilters = { from?: string; to?: string; search?: string }

export const journalDb = {
  list:   (companyId: string, filters?: JournalFilters) =>
            bridge().listJournal(companyId, filters) as Promise<JournalEntry[]>,
  get:    (id: string) =>
            bridge().getEntry(id) as Promise<(JournalEntry & { lines: JournalLine[] }) | null>,
  upsert: (entry: Omit<JournalEntry, 'lines'>, lines: Omit<JournalLine, 'account_name' | 'account_code'>[]) =>
            bridge().upsertEntry(entry, lines),
  delete: (id: string) =>
            bridge().deleteEntry(id),
  bulk:   (entries: Omit<JournalEntry, 'lines'>[], lines: Omit<JournalLine, 'account_name' | 'account_code'>[]) =>
            bridge().bulkJournal(entries, lines),
  ledger: (companyId: string, accountId: string, from?: string, to?: string) =>
            bridge().getLedger(companyId, accountId, from, to) as Promise<(JournalLine & {
              date: string; entry_number: string; entry_desc: string; reference?: string
            })[]>,
  exportExcel: (companyId: string, filters?: JournalFilters) =>
            bridge().exportJournal(companyId, filters) as Promise<{ ok: boolean; filePath?: string }>,
}

// ── Reports ────────────────────────────────────────────────────────────────

export type ReportHistoryRow = {
  id: string; company_id: string; report_type: string; period_label: string
  file_name?: string; file_path?: string; generated_at: string; sent_to_email?: string
}

export const reportDb = {
  listHistory:  (companyId: string)                       => bridge().listReportHistory(companyId) as Promise<ReportHistoryRow[]>,
  addHistory:   (row: ReportHistoryRow)                   => bridge().addReportHistory(row),
  getPL:           (companyId: string, from: string, to: string) => bridge().getPL(companyId, from, to),
  getTrialBalance: (companyId: string, from: string, to: string) => bridge().getTrialBalance(companyId, from, to),
  exportReport:    (companyId: string, reportType: string, periodLabel: string) =>
                     bridge().exportReport(companyId, reportType, periodLabel) as Promise<{ ok: boolean; filePath?: string }>,
}
