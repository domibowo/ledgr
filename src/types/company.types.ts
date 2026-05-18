export interface Company {
  id: string
  name: string
  legal_name?: string
  npwp?: string
  address?: string
  phone?: string
  email?: string
  logo_path?: string
  currency: string
  fiscal_year_start: number
  tax_rate: number
  created_at: string
  updated_at: string
  is_active: number
}
