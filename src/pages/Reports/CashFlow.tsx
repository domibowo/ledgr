import { ReportShell, sectionHeaderStyle, lineStyle, subtotalStyle, grandTotalStyle } from './ReportShell'
import { MOCK_CASH_FLOW } from './data/mockReportData'
import { formatIDR } from '../../utils/currency'

type Props = { period: string }

function amt(n: number) {
  return n < 0 ? `(${formatIDR(Math.abs(n))})` : formatIDR(n)
}

function amtColor(n: number) {
  return n < 0 ? 'var(--expense)' : n > 0 ? 'var(--income)' : 'var(--text-hint)'
}

export function CashFlow({ period }: Props) {
  const d = MOCK_CASH_FLOW
  return (
    <ReportShell title="Laporan Arus Kas" period={period}>
      <div style={sectionHeaderStyle}>Arus Kas dari Aktivitas Operasional</div>
      {d.operating.map((item, i) => (
        <div key={i} style={lineStyle}>
          <span>{item.name}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: amtColor(item.amount) }}>{amt(item.amount)}</span>
        </div>
      ))}
      <div style={subtotalStyle}>
        <span>Net Arus Kas Operasional</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: amtColor(d.totalOperating) }}>{amt(d.totalOperating)}</span>
      </div>

      <div style={sectionHeaderStyle}>Arus Kas dari Aktivitas Investasi</div>
      {d.investing.map((item, i) => (
        <div key={i} style={lineStyle}>
          <span>{item.name}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: amtColor(item.amount) }}>{amt(item.amount)}</span>
        </div>
      ))}
      <div style={subtotalStyle}>
        <span>Net Arus Kas Investasi</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: amtColor(d.totalInvesting) }}>{amt(d.totalInvesting)}</span>
      </div>

      <div style={sectionHeaderStyle}>Arus Kas dari Aktivitas Pendanaan</div>
      {d.financing.map((item, i) => (
        <div key={i} style={lineStyle}>
          <span>{item.name}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: amtColor(item.amount) }}>{amt(item.amount)}</span>
        </div>
      ))}
      <div style={subtotalStyle}>
        <span>Net Arus Kas Pendanaan</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-hint)' }}>—</span>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ ...lineStyle, fontWeight: 600 }}>
          <span>Kenaikan (Penurunan) Kas Bersih</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: amtColor(d.netChange) }}>{amt(d.netChange)}</span>
        </div>
        <div style={{ ...lineStyle }}>
          <span>Saldo Kas Awal Periode</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.openingBalance)}</span>
        </div>
      </div>
      <div style={grandTotalStyle}>
        <span>Saldo Kas Akhir Periode</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.closingBalance)}</span>
      </div>
    </ReportShell>
  )
}
