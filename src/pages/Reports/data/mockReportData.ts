export const MOCK_PROFIT_LOSS = {
  income: [
    { code: '4-1000', name: 'Pendapatan Jasa', amount: 25000000 },
    { code: '4-2000', name: 'Pendapatan Lain-lain', amount: 1500000 },
  ],
  totalIncome: 26500000,
  expenses: [
    { code: '5-1000', name: 'Harga Pokok Penjualan', amount: 212500 },
    { code: '5-2000', name: 'Beban Gaji', amount: 32000000 },
    { code: '5-3000', name: 'Beban Sewa', amount: 4500000 },
    { code: '5-4000', name: 'Beban Listrik & Air', amount: 1000000 },
    { code: '5-5000', name: 'Beban Penyusutan', amount: 212500 },
    { code: '5-6000', name: 'Beban Lain-lain', amount: 575000 },
  ],
  totalExpenses: 38500000,
  netIncome: -12000000,
}

export const MOCK_BALANCE_SHEET = {
  currentAssets: [
    { code: '1-1001', name: 'Kas', amount: 15000000 },
    { code: '1-1002', name: 'Bank BCA', amount: 62500000 },
    { code: '1-1100', name: 'Piutang Usaha', amount: 22500000 },
    { code: '1-1200', name: 'Persediaan Barang', amount: 8000000 },
    { code: '1-1300', name: 'Uang Muka & Biaya Dibayar Dimuka', amount: 2000000 },
  ],
  totalCurrentAssets: 110000000,
  nonCurrentAssets: [
    { code: '1-2000', name: 'Peralatan Kantor', amount: 33500000 },
    { code: '1-2100', name: 'Akumulasi Penyusutan Peralatan', amount: -5212500 },
    { code: '1-2200', name: 'Aset Tidak Berwujud', amount: 5000000 },
  ],
  totalNonCurrentAssets: 33287500,
  totalAssets: 143287500,

  currentLiabilities: [
    { code: '2-1000', name: 'Utang Usaha', amount: 16000000 },
    { code: '2-1100', name: 'Utang Gaji', amount: 0 },
    { code: '2-1200', name: 'Pendapatan Diterima Dimuka', amount: 3000000 },
  ],
  totalCurrentLiabilities: 19000000,
  nonCurrentLiabilities: [
    { code: '2-2000', name: 'Utang Bank Jangka Panjang', amount: 20000000 },
  ],
  totalNonCurrentLiabilities: 20000000,
  totalLiabilities: 39000000,

  equity: [
    { code: '3-1000', name: 'Modal Pemilik', amount: 116287500 },
    { name: 'Laba (Rugi) Tahun Berjalan', amount: -12000000 },
  ],
  totalEquity: 104287500,
  totalLiabilitiesEquity: 143287500,
}

export const MOCK_CASH_FLOW = {
  operating: [
    { name: 'Penerimaan dari pelanggan', amount: 15000000 },
    { name: 'Pembayaran kepada karyawan', amount: -32000000 },
    { name: 'Pembayaran beban sewa', amount: -4500000 },
    { name: 'Pembayaran beban listrik & air', amount: -1000000 },
    { name: 'Penerimaan bunga bank', amount: 250000 },
  ],
  totalOperating: -22250000,
  investing: [
    { name: 'Pembelian peralatan kantor', amount: -8500000 },
  ],
  totalInvesting: -8500000,
  financing: [
    { name: 'Penerimaan modal dari pemilik', amount: 0 },
  ],
  totalFinancing: 0,
  netChange: -30750000,
  openingBalance: 100000000,
  closingBalance: 69250000,
}

export const MOCK_TRIAL_BALANCE = [
  { code: '1-1001', name: 'Kas',                              debit: 15000000,   credit: 0 },
  { code: '1-1002', name: 'Bank BCA',                         debit: 62500000,   credit: 0 },
  { code: '1-1100', name: 'Piutang Usaha',                    debit: 22500000,   credit: 0 },
  { code: '1-1200', name: 'Persediaan Barang',                debit: 8000000,    credit: 0 },
  { code: '1-1300', name: 'Uang Muka',                        debit: 2000000,    credit: 0 },
  { code: '1-2000', name: 'Peralatan Kantor',                 debit: 33500000,   credit: 0 },
  { code: '1-2100', name: 'Akumulasi Penyusutan Peralatan',   debit: 0,          credit: 5212500 },
  { code: '1-2200', name: 'Aset Tidak Berwujud',             debit: 5000000,    credit: 0 },
  { code: '2-1000', name: 'Utang Usaha',                      debit: 0,          credit: 16000000 },
  { code: '2-1200', name: 'Pendapatan Diterima Dimuka',       debit: 0,          credit: 3000000 },
  { code: '2-2000', name: 'Utang Bank Jangka Panjang',        debit: 0,          credit: 20000000 },
  { code: '3-1000', name: 'Modal Pemilik',                    debit: 0,          credit: 116287500 },
  { code: '4-1000', name: 'Pendapatan Jasa',                  debit: 0,          credit: 25000000 },
  { code: '4-2000', name: 'Pendapatan Lain-lain',             debit: 0,          credit: 1500000 },
  { code: '5-1000', name: 'Harga Pokok Penjualan',            debit: 212500,     credit: 0 },
  { code: '5-2000', name: 'Beban Gaji',                       debit: 32000000,   credit: 0 },
  { code: '5-3000', name: 'Beban Sewa',                       debit: 4500000,    credit: 0 },
  { code: '5-4000', name: 'Beban Listrik & Air',              debit: 1000000,    credit: 0 },
  { code: '5-5000', name: 'Beban Penyusutan',                 debit: 212500,     credit: 0 },
  { code: '5-6000', name: 'Beban Lain-lain',                  debit: 575000,     credit: 0 },
]

export const MOCK_AGING = {
  receivables: [
    { customer: 'PT Berkah Jaya',       invoice: 'INV-2025-001', date: '2025-01-15', due: '2025-02-14', amount: 25000000, daysOverdue: 0,  current: 25000000, d1_30: 0,        d31_60: 0,       d61_90: 0,      d90plus: 0 },
    { customer: 'CV Sukses Mandiri',    invoice: 'INV-2024-098', date: '2024-11-20', due: '2024-12-20', amount: 8500000,  daysOverdue: 42, current: 0,        d1_30: 0,        d31_60: 8500000, d61_90: 0,      d90plus: 0 },
    { customer: 'PT Karya Utama',       invoice: 'INV-2024-087', date: '2024-10-05', due: '2024-11-04', amount: 12000000, daysOverdue: 87, current: 0,        d1_30: 0,        d31_60: 0,       d61_90: 12000000, d90plus: 0 },
    { customer: 'UD Makmur Sejahtera',  invoice: 'INV-2024-071', date: '2024-09-01', due: '2024-10-01', amount: 5750000,  daysOverdue: 121,current: 0,        d1_30: 0,        d31_60: 0,       d61_90: 0,      d90plus: 5750000 },
    { customer: 'PT Nusantara Prima',   invoice: 'INV-2025-003', date: '2025-01-28', due: '2025-02-27', amount: 18000000, daysOverdue: 0,  current: 18000000, d1_30: 0,        d31_60: 0,       d61_90: 0,      d90plus: 0 },
  ],
  totalCurrent: 43000000,
  totalD1_30: 0,
  totalD31_60: 8500000,
  totalD61_90: 12000000,
  totalD90Plus: 5750000,
  grandTotal: 69250000,
}

export const MOCK_REPORT_HISTORY = [
  { id: 'rh-1', report_type: 'PROFIT_LOSS',   period_label: 'Januari 2025',     generated_at: '2025-02-01T08:00:00Z', file_name: 'LabRugi_Jan2025.xlsx', sent_to_email: 'finance@majubersama.co.id', sent_at: '2025-02-01T08:05:00Z', language: 'id' },
  { id: 'rh-2', report_type: 'BALANCE_SHEET',  period_label: 'Januari 2025',     generated_at: '2025-02-01T08:10:00Z', file_name: 'Neraca_Jan2025.xlsx',  sent_to_email: null, language: 'id' },
  { id: 'rh-3', report_type: 'TRIAL_BALANCE',  period_label: 'Januari 2025',     generated_at: '2025-02-01T09:00:00Z', file_name: 'TrialBalance_Jan2025.xlsx', sent_to_email: null, language: 'id' },
  { id: 'rh-4', report_type: 'PROFIT_LOSS',   period_label: 'Desember 2024',    generated_at: '2025-01-03T10:00:00Z', file_name: 'LabRugi_Des2024.xlsx', sent_to_email: 'owner@majubersama.co.id', sent_at: '2025-01-03T10:30:00Z', language: 'id' },
  { id: 'rh-5', report_type: 'AGING',         period_label: 'Per 31 Jan 2025',  generated_at: '2025-02-02T07:45:00Z', file_name: 'Aging_Jan2025.xlsx',   sent_to_email: null, language: 'id' },
  { id: 'rh-6', report_type: 'CASH_FLOW',     period_label: 'Januari 2025',     generated_at: '2025-02-03T11:00:00Z', file_name: 'ArusKas_Jan2025.xlsx', sent_to_email: null, language: 'id' },
]
