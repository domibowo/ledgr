export type JournalLineType = 'DEBIT' | 'CREDIT'
export type EntryType = 'MANUAL' | 'IMPORT' | 'RECURRING' | 'ADJUSTMENT'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'
export type InvoiceType = 'AR' | 'AP'

export interface JournalLine {
  id: string
  entry_id: string
  account_id: string
  account_name?: string
  account_code?: string
  type: JournalLineType
  amount: number
  description?: string
  sort_order: number
}

export interface JournalEntry {
  id: string
  company_id: string
  period_id: string
  entry_number: string
  date: string
  description: string
  reference?: string
  entry_type: EntryType
  is_posted: number
  posted_at?: string
  created_by?: string
  created_at: string
  updated_at: string
  lines?: JournalLine[]
  total_debit?: number
  total_credit?: number
}

export interface Invoice {
  id: string
  company_id: string
  type: InvoiceType
  invoice_number: string
  contact_name: string
  contact_email?: string
  date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total: number
  paid_amount: number
  status: InvoiceStatus
  notes?: string
  journal_entry_id?: string
  created_at: string
  updated_at: string
}
