export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
export type NormalBalance = 'DEBIT' | 'CREDIT'

export interface Account {
  id: string
  company_id: string
  code: string
  name: string
  name_en?: string
  type: AccountType
  sub_type?: string
  parent_id?: string
  is_header: number
  normal_balance: NormalBalance
  description?: string
  is_active: number
  created_at: string
}
