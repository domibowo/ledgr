import { ReportShell, sectionHeaderStyle, lineStyle, subtotalStyle, grandTotalStyle } from './ReportShell'
import { MOCK_PROFIT_LOSS } from './data/mockReportData'
import { formatIDR } from '../../utils/currency'

type Props = { period: string }

export function ProfitLoss({ period }: Props) {
  const d = MOCK_PROFIT_LOSS
  return (
    <ReportShell title="Laporan Laba Rugi" period={period}>
      <div style={sectionHeaderStyle}>Pendapatan</div>
      {d.income.map(item => (
        <div key={item.code} style={lineStyle}>
          <span style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-hint)', fontSize: 12 }}>{item.code}</span>
            {item.name}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(item.amount)}</span>
        </div>
      ))}
      <div style={subtotalStyle}>
        <span>Total Pendapatan</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--income)' }}>{formatIDR(d.totalIncome)}</span>
      </div>

      <div style={sectionHeaderStyle}>Beban Usaha</div>
      {d.expenses.map(item => (
        <div key={item.code} style={lineStyle}>
          <span style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-hint)', fontSize: 12 }}>{item.code}</span>
            {item.name}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(item.amount)}</span>
        </div>
      ))}
      <div style={subtotalStyle}>
        <span>Total Beban</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--expense)' }}>{formatIDR(d.totalExpenses)}</span>
      </div>

      <div style={grandTotalStyle}>
        <span>Laba (Rugi) Bersih</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: d.netIncome >= 0 ? 'var(--income)' : 'var(--expense)' }}>
          {d.netIncome < 0 ? `(${formatIDR(Math.abs(d.netIncome))})` : formatIDR(d.netIncome)}
        </span>
      </div>
    </ReportShell>
  )
}
