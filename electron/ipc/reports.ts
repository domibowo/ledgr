import { ipcMain, dialog } from 'electron'
import { getDb } from '../db'
import * as XLSX from 'xlsx'
import fs from 'node:fs'

// ── helpers ─────────────────────────────────────────────────────────────────

function idr(n: number) {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function ws(rows: (string | number | null)[][], colWidths: number[]): XLSX.WorkSheet {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = colWidths.map(w => ({ wch: w }))
  return sheet
}

function mergeRow(sheet: XLSX.WorkSheet, row: number, fromCol: number, toCol: number) {
  if (!sheet['!merges']) sheet['!merges'] = []
  sheet['!merges'].push({ s: { r: row, c: fromCol }, e: { r: row, c: toCol } })
}

// ── CaLK sheet ───────────────────────────────────────────────────────────────

function buildCalk(companyName: string, reportTitle: string, period: string): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [
    [companyName],
    [`CATATAN ATAS LAPORAN KEUANGAN (CaLK)`],
    [reportTitle],
    [`Periode: ${period}`],
    [null],
    ['1. GAMBARAN UMUM PERUSAHAAN'],
    [null],
    ['   Perusahaan didirikan berdasarkan akta pendirian yang sah dan bergerak di bidang usaha'],
    ['   sesuai dengan anggaran dasar perusahaan. Laporan keuangan ini disusun sesuai dengan'],
    ['   Standar Akuntansi Keuangan (SAK) yang berlaku di Indonesia.'],
    [null],
    ['2. IKHTISAR KEBIJAKAN AKUNTANSI SIGNIFIKAN'],
    [null],
    ['   a. Dasar Penyusunan Laporan Keuangan'],
    ['      Laporan keuangan disusun berdasarkan konsep biaya historis (historical cost) dan'],
    ['      menggunakan dasar akrual (accrual basis), kecuali untuk laporan arus kas yang'],
    ['      menggunakan dasar kas (cash basis).'],
    [null],
    ['   b. Pengakuan Pendapatan'],
    ['      Pendapatan diakui pada saat jasa telah diselesaikan atau barang telah diserahkan'],
    ['      kepada pelanggan dan jumlahnya dapat diukur secara andal.'],
    [null],
    ['   c. Pengakuan Beban'],
    ['      Beban diakui pada saat terjadinya (accrual basis) dan dicocokkan dengan pendapatan'],
    ['      yang dihasilkan pada periode yang sama.'],
    [null],
    ['   d. Aset Tetap & Penyusutan'],
    ['      Aset tetap dicatat berdasarkan biaya perolehan dikurangi akumulasi penyusutan.'],
    ['      Penyusutan dihitung menggunakan metode garis lurus (straight-line method).'],
    [null],
    ['   e. Piutang Usaha'],
    ['      Piutang usaha diakui sebesar nilai nominal. Penyisihan piutang tak tertagih'],
    ['      dibentuk berdasarkan analisis umur piutang dan estimasi manajemen.'],
    [null],
    ['   f. Persediaan'],
    ['      Persediaan dinilai berdasarkan harga perolehan atau nilai realisasi bersih, mana'],
    ['      yang lebih rendah. Metode penilaian persediaan menggunakan FIFO (First In First Out).'],
    [null],
    ['3. PENJELASAN POS-POS LAPORAN KEUANGAN'],
    [null],
    ['   Penjelasan rinci mengenai pos-pos material dalam laporan keuangan disajikan sebagai'],
    ['   bagian dari catatan ini. Manajemen bertanggung jawab atas penyusunan dan penyajian'],
    ['   wajar laporan keuangan sesuai dengan SAK yang berlaku.'],
    [null],
    ['4. PERISTIWA SETELAH TANGGAL NERACA'],
    [null],
    ['   Tidak ada peristiwa signifikan yang terjadi setelah tanggal neraca yang memerlukan'],
    ['   penyesuaian atau pengungkapan dalam laporan keuangan ini.'],
    [null],
    ['5. INFORMASI LAINNYA'],
    [null],
    ['   Laporan keuangan ini telah disetujui oleh manajemen untuk diterbitkan.'],
    ['   Tanggal penyusunan: ' + new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
  ]
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = [{ wch: 90 }]
  mergeRow(sheet, 0, 0, 0)
  mergeRow(sheet, 1, 0, 0)
  return sheet
}

// ── Laba Rugi ────────────────────────────────────────────────────────────────

function buildProfitLoss(companyName: string, period: string, data: {
  income: { code: string; name: string; amount: number }[]
  totalIncome: number
  expenses: { code: string; name: string; amount: number }[]
  totalExpenses: number
  netIncome: number
}): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [
    [companyName, null, null],
    ['LAPORAN LABA RUGI', null, null],
    [`Periode: ${period}`, null, null],
    ['(Dalam Rupiah)', null, null],
    [null, null, null],
    ['Uraian', 'Catatan', 'Jumlah (Rp)'],
    [null, null, null],
    ['PENDAPATAN', null, null],
  ]

  data.income.forEach(i => {
    rows.push([`  ${i.code} - ${i.name}`, null, i.amount])
  })

  rows.push([null, null, null])
  rows.push(['TOTAL PENDAPATAN', null, data.totalIncome])
  rows.push([null, null, null])
  rows.push(['BEBAN USAHA', null, null])

  data.expenses.forEach(e => {
    rows.push([`  ${e.code} - ${e.name}`, null, e.amount])
  })

  rows.push([null, null, null])
  rows.push(['TOTAL BEBAN USAHA', null, data.totalExpenses])
  rows.push([null, null, null])

  const grossProfit = data.totalIncome - data.totalExpenses
  rows.push(['LABA (RUGI) KOTOR', null, grossProfit])
  rows.push([null, null, null])
  rows.push(['Beban Lain-lain', null, null])
  rows.push(['  Beban Bunga & Keuangan', null, 0])
  rows.push(['  Pendapatan Bunga', null, 0])
  rows.push([null, null, null])
  rows.push(['LABA (RUGI) SEBELUM PAJAK', null, data.netIncome])
  rows.push(['  Pajak Penghasilan (25%)', null, data.netIncome > 0 ? Math.round(data.netIncome * 0.25) : 0])
  rows.push([null, null, null])
  rows.push(['LABA (RUGI) BERSIH', null, data.netIncome > 0 ? Math.round(data.netIncome * 0.75) : data.netIncome])

  const sheet = ws(rows, [48, 12, 22])
  // Merge header rows
  for (let r = 0; r <= 3; r++) mergeRow(sheet, r, 0, 2)

  // Format currency column
  const ref = sheet['!ref']!
  const range = XLSX.utils.decode_range(ref)
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: 2 })]
    if (cell && typeof cell.v === 'number') cell.z = '#,##0'
  }

  return sheet
}

// ── Neraca ───────────────────────────────────────────────────────────────────

function buildBalanceSheet(companyName: string, period: string, data: {
  currentAssets: { code: string; name: string; amount: number }[]
  totalCurrentAssets: number
  nonCurrentAssets: { code: string; name: string; amount: number }[]
  totalNonCurrentAssets: number
  totalAssets: number
  currentLiabilities: { code: string; name: string; amount: number }[]
  totalCurrentLiabilities: number
  nonCurrentLiabilities: { code: string; name: string; amount: number }[]
  totalNonCurrentLiabilities: number
  totalLiabilities: number
  equity: { code?: string; name: string; amount: number }[]
  totalEquity: number
  totalLiabilitiesEquity: number
}): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [
    [companyName, null, null],
    ['LAPORAN NERACA (POSISI KEUANGAN)', null, null],
    [`Per Tanggal: ${period}`, null, null],
    ['(Dalam Rupiah)', null, null],
    [null, null, null],
    ['ASET', null, null],
    [null, null, null],
    ['Aset Lancar', null, null],
  ]

  data.currentAssets.forEach(a => rows.push([`  ${a.code} - ${a.name}`, null, a.amount]))
  rows.push(['Jumlah Aset Lancar', null, data.totalCurrentAssets])
  rows.push([null, null, null])
  rows.push(['Aset Tidak Lancar', null, null])
  data.nonCurrentAssets.forEach(a => rows.push([`  ${a.code} - ${a.name}`, null, a.amount]))
  rows.push(['Jumlah Aset Tidak Lancar', null, data.totalNonCurrentAssets])
  rows.push([null, null, null])
  rows.push(['TOTAL ASET', null, data.totalAssets])
  rows.push([null, null, null])
  rows.push(['LIABILITAS DAN EKUITAS', null, null])
  rows.push([null, null, null])
  rows.push(['Liabilitas Jangka Pendek', null, null])
  data.currentLiabilities.forEach(l => rows.push([`  ${l.code} - ${l.name}`, null, l.amount]))
  rows.push(['Jumlah Liabilitas Jangka Pendek', null, data.totalCurrentLiabilities])
  rows.push([null, null, null])
  rows.push(['Liabilitas Jangka Panjang', null, null])
  data.nonCurrentLiabilities.forEach(l => rows.push([`  ${l.code} - ${l.name}`, null, l.amount]))
  rows.push(['Jumlah Liabilitas Jangka Panjang', null, data.totalNonCurrentLiabilities])
  rows.push([null, null, null])
  rows.push(['TOTAL LIABILITAS', null, data.totalLiabilities])
  rows.push([null, null, null])
  rows.push(['Ekuitas', null, null])
  data.equity.forEach(e => rows.push([`  ${e.code ? e.code + ' - ' : ''}${e.name}`, null, e.amount]))
  rows.push(['TOTAL EKUITAS', null, data.totalEquity])
  rows.push([null, null, null])
  rows.push(['TOTAL LIABILITAS DAN EKUITAS', null, data.totalLiabilitiesEquity])

  const sheet = ws(rows, [48, 12, 22])
  for (let r = 0; r <= 3; r++) mergeRow(sheet, r, 0, 2)
  const range = XLSX.utils.decode_range(sheet['!ref']!)
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: 2 })]
    if (cell && typeof cell.v === 'number') cell.z = '#,##0'
  }
  return sheet
}

// ── Arus Kas ─────────────────────────────────────────────────────────────────

function buildCashFlow(companyName: string, period: string, data: {
  operating: { name: string; amount: number }[]
  totalOperating: number
  investing: { name: string; amount: number }[]
  totalInvesting: number
  financing: { name: string; amount: number }[]
  totalFinancing: number
  netChange: number
  openingBalance: number
  closingBalance: number
}): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [
    [companyName, null, null],
    ['LAPORAN ARUS KAS', null, null],
    [`Periode: ${period}`, null, null],
    ['(Metode Tidak Langsung — Dalam Rupiah)', null, null],
    [null, null, null],
    ['Uraian', null, 'Jumlah (Rp)'],
    [null, null, null],
    ['I. ARUS KAS DARI AKTIVITAS OPERASI', null, null],
  ]
  data.operating.forEach(o => rows.push([`   ${o.name}`, null, o.amount]))
  rows.push(['Kas Bersih dari Aktivitas Operasi', null, data.totalOperating])
  rows.push([null, null, null])
  rows.push(['II. ARUS KAS DARI AKTIVITAS INVESTASI', null, null])
  data.investing.forEach(i => rows.push([`   ${i.name}`, null, i.amount]))
  rows.push(['Kas Bersih dari Aktivitas Investasi', null, data.totalInvesting])
  rows.push([null, null, null])
  rows.push(['III. ARUS KAS DARI AKTIVITAS PENDANAAN', null, null])
  data.financing.forEach(f => rows.push([`   ${f.name}`, null, f.amount]))
  rows.push(['Kas Bersih dari Aktivitas Pendanaan', null, data.totalFinancing])
  rows.push([null, null, null])
  rows.push(['KENAIKAN (PENURUNAN) KAS BERSIH', null, data.netChange])
  rows.push(['Saldo Kas Awal Periode', null, data.openingBalance])
  rows.push(['SALDO KAS AKHIR PERIODE', null, data.closingBalance])

  const sheet = ws(rows, [52, 12, 22])
  for (let r = 0; r <= 3; r++) mergeRow(sheet, r, 0, 2)
  const range = XLSX.utils.decode_range(sheet['!ref']!)
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: 2 })]
    if (cell && typeof cell.v === 'number') cell.z = '#,##0'
  }
  return sheet
}

// ── Trial Balance ─────────────────────────────────────────────────────────────

function buildTrialBalance(companyName: string, period: string, rows_data: {
  code: string; name: string; debit: number; credit: number
}[]): XLSX.WorkSheet {
  const totalDebit  = rows_data.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows_data.reduce((s, r) => s + r.credit, 0)

  const rows: (string | number | null)[][] = [
    [companyName, null, null, null],
    ['NERACA SALDO (TRIAL BALANCE)', null, null, null],
    [`Periode: ${period}`, null, null, null],
    ['(Dalam Rupiah)', null, null, null],
    [null, null, null, null],
    ['Kode Akun', 'Nama Akun', 'Debit (Rp)', 'Kredit (Rp)'],
    ...rows_data.map(r => [r.code, r.name, r.debit || null, r.credit || null]),
    [null, null, null, null],
    ['', 'TOTAL', totalDebit, totalCredit],
  ]

  const sheet = ws(rows, [14, 40, 20, 20])
  for (let r = 0; r <= 3; r++) mergeRow(sheet, r, 0, 3)
  const range = XLSX.utils.decode_range(sheet['!ref']!)
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (const c of [2, 3]) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })]
      if (cell && typeof cell.v === 'number') cell.z = '#,##0'
    }
  }
  return sheet
}

// ── Aging Piutang ─────────────────────────────────────────────────────────────

function buildAging(companyName: string, period: string, data: {
  receivables: { customer: string; invoice: string; date: string; due: string; amount: number; daysOverdue: number; current: number; d1_30: number; d31_60: number; d61_90: number; d90plus: number }[]
  totalCurrent: number; totalD1_30: number; totalD31_60: number; totalD61_90: number; totalD90Plus: number; grandTotal: number
}): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [
    [companyName, null, null, null, null, null, null, null, null],
    ['LAPORAN AGING PIUTANG USAHA', null, null, null, null, null, null, null, null],
    [`Per Tanggal: ${period}`, null, null, null, null, null, null, null, null],
    ['(Dalam Rupiah)', null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    ['Pelanggan', 'No. Invoice', 'Tgl Invoice', 'Jatuh Tempo', 'Hari Jatuh Tempo', 'Belum Jatuh Tempo', '1-30 Hari', '31-60 Hari', '61-90 Hari', '> 90 Hari'],
    ...data.receivables.map(r => [
      r.customer, r.invoice, r.date, r.due,
      r.daysOverdue > 0 ? r.daysOverdue : 0,
      r.current || null, r.d1_30 || null, r.d31_60 || null, r.d61_90 || null, r.d90plus || null,
    ]),
    [null, null, null, null, null, null, null, null, null, null],
    ['TOTAL', null, null, null, null, data.totalCurrent, data.totalD1_30, data.totalD31_60, data.totalD61_90, data.totalD90Plus],
    ['Grand Total Piutang', null, null, null, null, null, null, null, null, data.grandTotal],
  ]

  const sheet = ws(rows, [28, 18, 14, 14, 16, 22, 16, 16, 16, 16])
  for (let r = 0; r <= 3; r++) mergeRow(sheet, r, 0, 9)
  const range = XLSX.utils.decode_range(sheet['!ref']!)
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (const c of [5, 6, 7, 8, 9]) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })]
      if (cell && typeof cell.v === 'number') cell.z = '#,##0'
    }
  }
  return sheet
}

// ── Perubahan Modal ───────────────────────────────────────────────────────────

function buildEquityChanges(companyName: string, period: string, data: {
  openingRetained: number; netIncome: number; dividends: number; closingRetained: number; totalEquity: number
}): XLSX.WorkSheet {
  const rows: (string | number | null)[][] = [
    [companyName, null, null],
    ['LAPORAN PERUBAHAN EKUITAS (MODAL)', null, null],
    [`Periode: ${period}`, null, null],
    ['(Dalam Rupiah)', null, null],
    [null, null, null],
    ['Uraian', null, 'Jumlah (Rp)'],
    [null, null, null],
    ['Saldo Laba Ditahan Awal Periode', null, data.openingRetained],
    [null, null, null],
    ['Laba (Rugi) Bersih Periode Berjalan', null, data.netIncome],
    [null, null, null],
    ['Dividen yang Diumumkan', null, data.dividends < 0 ? data.dividends : -data.dividends],
    [null, null, null],
    ['Saldo Laba Ditahan Akhir Periode', null, data.closingRetained],
    [null, null, null],
    ['Modal Disetor', null, data.totalEquity - data.closingRetained],
    [null, null, null],
    ['TOTAL EKUITAS', null, data.totalEquity],
  ]

  const sheet = ws(rows, [48, 12, 22])
  for (let r = 0; r <= 3; r++) mergeRow(sheet, r, 0, 2)
  const range = XLSX.utils.decode_range(sheet['!ref']!)
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: 2 })]
    if (cell && typeof cell.v === 'number') cell.z = '#,##0'
  }
  return sheet
}

// ── Mock data fallbacks ───────────────────────────────────────────────────────

const MOCK_PL = {
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

const MOCK_BS = {
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

const MOCK_CF = {
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

const MOCK_TB = [
  { code: '1-1001', name: 'Kas',                             debit: 15000000,  credit: 0 },
  { code: '1-1002', name: 'Bank BCA',                        debit: 62500000,  credit: 0 },
  { code: '1-1100', name: 'Piutang Usaha',                   debit: 22500000,  credit: 0 },
  { code: '1-1200', name: 'Persediaan Barang',               debit: 8000000,   credit: 0 },
  { code: '1-2000', name: 'Peralatan Kantor',                debit: 33500000,  credit: 0 },
  { code: '1-2100', name: 'Akumulasi Penyusutan',            debit: 0,         credit: 5212500 },
  { code: '2-1000', name: 'Utang Usaha',                     debit: 0,         credit: 16000000 },
  { code: '2-2000', name: 'Utang Bank Jangka Panjang',       debit: 0,         credit: 20000000 },
  { code: '3-1000', name: 'Modal Pemilik',                   debit: 0,         credit: 116287500 },
  { code: '4-1000', name: 'Pendapatan Jasa',                 debit: 0,         credit: 25000000 },
  { code: '5-2000', name: 'Beban Gaji',                      debit: 32000000,  credit: 0 },
  { code: '5-3000', name: 'Beban Sewa',                      debit: 4500000,   credit: 0 },
]

const MOCK_AGING_DATA = {
  receivables: [
    { customer: 'PT Berkah Jaya',      invoice: 'INV-2025-001', date: '2025-01-15', due: '2025-02-14', amount: 25000000, daysOverdue: 0,   current: 25000000, d1_30: 0,       d31_60: 0,       d61_90: 0,        d90plus: 0 },
    { customer: 'CV Sukses Mandiri',   invoice: 'INV-2024-098', date: '2024-11-20', due: '2024-12-20', amount: 8500000,  daysOverdue: 42,  current: 0,        d1_30: 0,       d31_60: 8500000, d61_90: 0,        d90plus: 0 },
    { customer: 'PT Karya Utama',      invoice: 'INV-2024-087', date: '2024-10-05', due: '2024-11-04', amount: 12000000, daysOverdue: 87,  current: 0,        d1_30: 0,       d31_60: 0,       d61_90: 12000000, d90plus: 0 },
    { customer: 'UD Makmur Sejahtera', invoice: 'INV-2024-071', date: '2024-09-01', due: '2024-10-01', amount: 5750000,  daysOverdue: 121, current: 0,        d1_30: 0,       d31_60: 0,       d61_90: 0,        d90plus: 5750000 },
  ],
  totalCurrent: 25000000, totalD1_30: 0, totalD31_60: 8500000, totalD61_90: 12000000, totalD90Plus: 5750000, grandTotal: 51250000,
}

// ── IPC handlers ──────────────────────────────────────────────────────────────

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

  ipcMain.handle('reports:export', async (_e, companyId: string, reportType: string, periodLabel: string) => {
    // Look up company name for header
    const company = db().prepare('SELECT name FROM companies WHERE id = ?').get(companyId) as { name: string } | undefined
    const companyName = company?.name ?? 'Perusahaan'

    const wb = XLSX.utils.book_new()

    switch (reportType) {
      case 'PROFIT_LOSS': {
        XLSX.utils.book_append_sheet(wb, buildProfitLoss(companyName, periodLabel, MOCK_PL), 'Laba Rugi')
        XLSX.utils.book_append_sheet(wb, buildCalk(companyName, 'Laporan Laba Rugi', periodLabel), 'CaLK')
        break
      }
      case 'BALANCE_SHEET': {
        XLSX.utils.book_append_sheet(wb, buildBalanceSheet(companyName, periodLabel, MOCK_BS), 'Neraca')
        XLSX.utils.book_append_sheet(wb, buildCalk(companyName, 'Laporan Neraca', periodLabel), 'CaLK')
        break
      }
      case 'CASH_FLOW': {
        XLSX.utils.book_append_sheet(wb, buildCashFlow(companyName, periodLabel, MOCK_CF), 'Arus Kas')
        XLSX.utils.book_append_sheet(wb, buildCalk(companyName, 'Laporan Arus Kas', periodLabel), 'CaLK')
        break
      }
      case 'TRIAL_BALANCE': {
        XLSX.utils.book_append_sheet(wb, buildTrialBalance(companyName, periodLabel, MOCK_TB), 'Neraca Saldo')
        break
      }
      case 'AGING': {
        XLSX.utils.book_append_sheet(wb, buildAging(companyName, periodLabel, MOCK_AGING_DATA), 'Aging Piutang')
        break
      }
      case 'LEDGER': {
        // Buku Besar — one sheet per major account group
        XLSX.utils.book_append_sheet(wb, buildTrialBalance(companyName, periodLabel, MOCK_TB), 'Ringkasan Akun')
        XLSX.utils.book_append_sheet(wb, buildCalk(companyName, 'Buku Besar', periodLabel), 'CaLK')
        break
      }
      default: {
        XLSX.utils.book_append_sheet(wb, buildTrialBalance(companyName, periodLabel, MOCK_TB), 'Laporan')
        break
      }
    }

    // Always append equity changes as a bonus sheet for P&L and Balance Sheet
    if (reportType === 'PROFIT_LOSS' || reportType === 'BALANCE_SHEET') {
      XLSX.utils.book_append_sheet(wb, buildEquityChanges(companyName, periodLabel, {
        openingRetained: 128287500,
        netIncome: MOCK_PL.netIncome,
        dividends: 0,
        closingRetained: 116287500,
        totalEquity: MOCK_BS.totalEquity,
      }), 'Perubahan Modal')
    }

    const typeLabels: Record<string, string> = {
      PROFIT_LOSS: 'LabaRugi', BALANCE_SHEET: 'Neraca', CASH_FLOW: 'ArusKas',
      TRIAL_BALANCE: 'NercSaldo', AGING: 'Aging', LEDGER: 'BukuBesar',
    }
    const slug = periodLabel.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
    const defaultName = `${typeLabels[reportType] ?? reportType}_${slug}.xlsx`

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Simpan Laporan',
      defaultPath: defaultName,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    })

    if (canceled || !filePath) return { ok: false }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    fs.writeFileSync(filePath, buf)
    return { ok: true, filePath }
  })
}
