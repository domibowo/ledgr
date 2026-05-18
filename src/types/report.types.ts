export type ReportType =
  | 'PROFIT_LOSS'
  | 'BALANCE_SHEET'
  | 'CASH_FLOW'
  | 'TRIAL_BALANCE'
  | 'AGING'
  | 'LEDGER'

export interface ReportHistory {
  id: string
  company_id: string
  report_type: ReportType
  period_label: string
  date_from: string
  date_to: string
  file_path?: string
  file_name?: string
  generated_by?: string
  generated_at: string
  sent_to_email?: string
  sent_at?: string
  language: string
}
