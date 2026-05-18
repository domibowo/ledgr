import { useState } from 'react'
import { SummaryCards } from './components/SummaryCards'
import { IncomeExpenseChart } from './components/IncomeExpenseChart'
import { RecentTransactions } from './components/RecentTransactions'

const RANGES = [
  { label: 'Bulan Ini', value: 'month' },
  { label: 'Kuartal Ini', value: 'quarter' },
  { label: 'Tahun Ini', value: 'year' },
]

export function Dashboard() {
  const [range, setRange] = useState('month')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Ringkasan keuangan perusahaan Anda
          </p>
        </div>
        {/* Range filter */}
        <div style={{
          display: 'flex', gap: 4, background: 'var(--card-bg)',
          border: '1px solid var(--border)', borderRadius: 8, padding: 4,
        }}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{
                background: range === r.value ? 'var(--brand)' : 'transparent',
                color: range === r.value ? '#fff' : 'var(--text-secondary)',
                border: 'none', borderRadius: 6, padding: '5px 14px',
                cursor: 'pointer', fontSize: 13, fontWeight: range === r.value ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <SummaryCards
        income={12400000}
        expense={4200000}
        pending={1800000}
        netProfit={8200000}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <IncomeExpenseChart />
        {/* Quick actions card */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 24px',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Aksi Cepat
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Buat Jurnal Baru', to: '/journal', color: 'var(--brand)' },
              { label: 'Buat Invoice AR', to: '/journal', color: 'var(--income)' },
              { label: 'Lihat Laporan L/R', to: '/reports', color: 'var(--brand-mid)' },
              { label: 'Import dari Excel', to: '/import', color: 'var(--pending)' },
            ].map((a) => (
              <a
                key={a.label}
                href={a.to}
                style={{
                  display: 'block', padding: '10px 14px', borderRadius: 8,
                  border: `1px solid ${a.color}20`,
                  background: `${a.color}08`,
                  color: a.color, fontSize: 13.5, fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                {a.label} →
              </a>
            ))}
          </div>
        </div>
      </div>

      <RecentTransactions />
    </div>
  )
}
