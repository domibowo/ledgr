import { Link } from 'react-router-dom'
import { formatIDR } from '../../../utils/currency'
import { formatDate } from '../../../utils/date'
import type { DateRange } from '../index'

type TxStatus = 'Lunas' | 'Menunggu' | 'Jatuh Tempo'

interface Tx {
  id: string
  name: string
  amount: number
  type: 'income' | 'expense' | 'pending'
  status: TxStatus
  date: string
}

const MOCK: Record<DateRange, Tx[]> = {
  month: [
    { id: '1', name: 'Client Budi – Invoice #001',  amount:  5000000, type: 'income',  status: 'Lunas',        date: '2025-05-01' },
    { id: '2', name: 'Biaya Operasional Kantor',    amount:  -320000, type: 'expense', status: 'Lunas',        date: '2025-05-03' },
    { id: '3', name: 'Client Sari – Invoice #002',  amount:  2400000, type: 'pending', status: 'Menunggu',     date: '2025-05-05' },
    { id: '4', name: 'Tagihan Internet',            amount:  -450000, type: 'expense', status: 'Jatuh Tempo',  date: '2025-05-06' },
    { id: '5', name: 'Client Dito – Invoice #003',  amount:  3800000, type: 'income',  status: 'Lunas',        date: '2025-05-08' },
  ],
  quarter: [
    { id: '1', name: 'Proyek Renovasi – Invoice #010', amount: 14500000, type: 'income',  status: 'Lunas',       date: '2025-03-15' },
    { id: '2', name: 'Gaji Karyawan Maret',            amount: -8200000, type: 'expense', status: 'Lunas',       date: '2025-03-31' },
    { id: '3', name: 'Client Rina – Invoice #011',     amount:  6300000, type: 'pending', status: 'Menunggu',    date: '2025-04-02' },
    { id: '4', name: 'Sewa Gedung Q1',                 amount: -3500000, type: 'expense', status: 'Lunas',       date: '2025-04-05' },
    { id: '5', name: 'Client Hasan – Invoice #012',    amount:  9200000, type: 'income',  status: 'Jatuh Tempo', date: '2025-04-20' },
  ],
  year: [
    { id: '1', name: 'Kontrak Tahunan – PT Maju',  amount: 48000000, type: 'income',  status: 'Lunas',       date: '2025-01-10' },
    { id: '2', name: 'Pembelian Aset Komputer',    amount: -12400000, type: 'expense', status: 'Lunas',       date: '2025-02-14' },
    { id: '3', name: 'Proyek Branding – CV Sinar', amount: 22500000, type: 'income',  status: 'Lunas',       date: '2025-03-20' },
    { id: '4', name: 'Client Nadia – Invoice #050',amount: 11000000, type: 'pending', status: 'Menunggu',    date: '2025-04-18' },
    { id: '5', name: 'Biaya Pajak Tahunan',        amount: -9800000, type: 'expense', status: 'Jatuh Tempo', date: '2025-04-30' },
  ],
}

const STATUS_STYLE: Record<TxStatus, { color: string; bg: string }> = {
  Lunas:         { color: 'var(--income)',  bg: 'var(--income-bg)'  },
  Menunggu:      { color: 'var(--pending)', bg: 'var(--pending-bg)' },
  'Jatuh Tempo': { color: 'var(--expense)', bg: 'var(--expense-bg)' },
}

export function RecentTransactions({ range }: { range: DateRange }) {
  const transactions = MOCK[range]
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Transaksi Terbaru</h2>
        <Link to="/journal" style={{ fontSize: 13, color: 'var(--brand-mid)', textDecoration: 'none', fontWeight: 500 }}>
          Lihat semua →
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Tanggal', 'Keterangan', 'Status', 'Jumlah'].map((h) => (
              <th key={h} style={{
                textAlign: h === 'Jumlah' ? 'right' : 'left',
                padding: '0 0 10px 0', fontWeight: 600,
                color: 'var(--text-hint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px',
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => {
            const s = STATUS_STYLE[tx.status]
            return (
              <tr key={tx.id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '11px 0', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatDate(tx.date)}
                </td>
                <td style={{ padding: '11px 8px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {tx.name}
                </td>
                <td style={{ padding: '11px 8px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                    background: s.bg, color: s.color,
                  }}>
                    {tx.status}
                  </span>
                </td>
                <td style={{
                  padding: '11px 0', textAlign: 'right', fontWeight: 600,
                  color: tx.amount >= 0 ? 'var(--income)' : 'var(--expense)',
                }}>
                  {tx.amount >= 0 ? '+' : ''}{formatIDR(Math.abs(tx.amount))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
