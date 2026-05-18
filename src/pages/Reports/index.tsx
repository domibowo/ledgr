import { useState } from 'react'
import { ProfitLoss } from './ProfitLoss'
import { BalanceSheet } from './BalanceSheet'
import { CashFlow } from './CashFlow'
import { TrialBalance } from './TrialBalance'
import { AgingReport } from './AgingReport'

type Tab = 'pl' | 'bs' | 'cf' | 'tb' | 'aging'

const TABS: { key: Tab; label: string }[] = [
  { key: 'pl',    label: 'Laba Rugi' },
  { key: 'bs',    label: 'Neraca' },
  { key: 'cf',    label: 'Arus Kas' },
  { key: 'tb',    label: 'Trial Balance' },
  { key: 'aging', label: 'Aging Piutang' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function buildPeriodLabel(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`
}

export function Reports() {
  const [tab, setTab] = useState<Tab>('pl')
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(2025)

  const period = buildPeriodLabel(month, year)

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
        Laporan Keuangan
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: tab === t.key ? 'var(--brand)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Periode:</span>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={inputStyle}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={inputStyle}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {tab === 'pl'    && <ProfitLoss period={period} />}
      {tab === 'bs'    && <BalanceSheet period={period} />}
      {tab === 'cf'    && <CashFlow period={period} />}
      {tab === 'tb'    && <TrialBalance period={period} />}
      {tab === 'aging' && <AgingReport period={period} />}
    </div>
  )
}
