import type { Company } from '../../../types/company.types'

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c-1',
    name: 'PT Maju Bersama',
    legal_name: 'PT Maju Bersama Indonesia',
    npwp: '01.234.567.8-901.000',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan 12190',
    phone: '+62 21 5555 1234',
    email: 'finance@majubersama.co.id',
    currency: 'IDR',
    fiscal_year_start: 1,
    tax_rate: 11,
    is_active: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'c-2',
    name: 'CV Berkah Jaya',
    legal_name: 'CV Berkah Jaya Mandiri',
    npwp: '09.876.543.2-012.000',
    address: 'Jl. Gatot Subroto No. 12, Bandung 40112',
    phone: '+62 22 7777 5678',
    email: 'admin@berkahjaya.com',
    currency: 'IDR',
    fiscal_year_start: 1,
    tax_rate: 11,
    is_active: 0,
    created_at: '2024-03-15T00:00:00.000Z',
    updated_at: '2024-03-15T00:00:00.000Z',
  },
]
