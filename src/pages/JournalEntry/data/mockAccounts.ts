import { Account, AccountType, NormalBalance } from '../../../types/account.types'

function acc(
  id: string,
  code: string,
  name: string,
  type: AccountType,
  normal_balance: NormalBalance,
): Account {
  return {
    id,
    company_id: 'c-1',
    code,
    name,
    type,
    is_header: 0,
    normal_balance,
    is_active: 1,
    created_at: '2025-01-01T00:00:00.000Z',
  }
}

export const MOCK_ACCOUNTS: Account[] = [
  acc('a-1', '1-1001', 'Kas', 'ASSET', 'DEBIT'),
  acc('a-2', '1-1002', 'Bank BCA', 'ASSET', 'DEBIT'),
  acc('a-3', '1-1100', 'Piutang Usaha', 'ASSET', 'DEBIT'),
  acc('a-4', '1-1200', 'Persediaan Barang', 'ASSET', 'DEBIT'),
  acc('a-5', '1-2000', 'Peralatan Kantor', 'ASSET', 'DEBIT'),
  acc('a-6', '1-2100', 'Akumulasi Penyusutan Peralatan', 'ASSET', 'CREDIT'),
  acc('a-7', '2-1000', 'Utang Usaha', 'LIABILITY', 'CREDIT'),
  acc('a-8', '2-2000', 'Utang Bank Jangka Pendek', 'LIABILITY', 'CREDIT'),
  acc('a-9', '3-1000', 'Modal Pemilik', 'EQUITY', 'CREDIT'),
  acc('a-10', '4-1000', 'Pendapatan Jasa', 'INCOME', 'CREDIT'),
  acc('a-11', '5-1000', 'Harga Pokok Penjualan', 'EXPENSE', 'DEBIT'),
  acc('a-12', '5-2000', 'Beban Gaji', 'EXPENSE', 'DEBIT'),
  acc('a-13', '5-3000', 'Beban Sewa', 'EXPENSE', 'DEBIT'),
  acc('a-14', '5-4000', 'Beban Listrik & Air', 'EXPENSE', 'DEBIT'),
]
