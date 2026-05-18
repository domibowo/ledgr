import { ReportShell, sectionHeaderStyle, lineStyle, subtotalStyle, grandTotalStyle } from './ReportShell'
import { MOCK_BALANCE_SHEET } from './data/mockReportData'
import { formatIDR } from '../../utils/currency'

type Props = { period: string }

function Line({ code, name, amount }: { code?: string; name: string; amount: number }) {
  return (
    <div style={lineStyle}>
      <span style={{ display: 'flex', gap: 12 }}>
        {code && <span style={{ fontFamily: 'monospace', color: 'var(--text-hint)', fontSize: 12 }}>{code}</span>}
        <span style={{ marginLeft: code ? 0 : 0 }}>{name}</span>
      </span>
      <span style={{ fontVariantNumeric: 'tabular-nums', color: amount < 0 ? 'var(--expense)' : 'var(--text-primary)' }}>
        {amount < 0 ? `(${formatIDR(Math.abs(amount))})` : formatIDR(amount)}
      </span>
    </div>
  )
}

export function BalanceSheet({ period }: Props) {
  const d = MOCK_BALANCE_SHEET
  return (
    <ReportShell title="Neraca" period={period}>
      <div style={sectionHeaderStyle}>ASET</div>

      <div style={{ padding: '6px 16px 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
        Aset Lancar
      </div>
      {d.currentAssets.map(item => <Line key={item.code} {...item} />)}
      <div style={subtotalStyle}>
        <span style={{ paddingLeft: 16 }}>Total Aset Lancar</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalCurrentAssets)}</span>
      </div>

      <div style={{ padding: '6px 16px 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
        Aset Tidak Lancar
      </div>
      {d.nonCurrentAssets.map(item => <Line key={item.code} {...item} />)}
      <div style={subtotalStyle}>
        <span style={{ paddingLeft: 16 }}>Total Aset Tidak Lancar</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalNonCurrentAssets)}</span>
      </div>

      <div style={{ ...subtotalStyle, background: 'var(--brand-light)', color: 'var(--brand)' }}>
        <span>TOTAL ASET</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalAssets)}</span>
      </div>

      <div style={sectionHeaderStyle}>KEWAJIBAN</div>

      <div style={{ padding: '6px 16px 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
        Kewajiban Jangka Pendek
      </div>
      {d.currentLiabilities.map(item => <Line key={item.code} {...item} />)}
      <div style={subtotalStyle}>
        <span style={{ paddingLeft: 16 }}>Total Kewajiban Jangka Pendek</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalCurrentLiabilities)}</span>
      </div>

      <div style={{ padding: '6px 16px 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
        Kewajiban Jangka Panjang
      </div>
      {d.nonCurrentLiabilities.map(item => <Line key={item.code} {...item} />)}
      <div style={subtotalStyle}>
        <span style={{ paddingLeft: 16 }}>Total Kewajiban Jangka Panjang</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalNonCurrentLiabilities)}</span>
      </div>

      <div style={{ ...subtotalStyle, background: 'var(--expense-bg)', color: 'var(--expense)' }}>
        <span>TOTAL KEWAJIBAN</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalLiabilities)}</span>
      </div>

      <div style={sectionHeaderStyle}>EKUITAS</div>
      {d.equity.map((item, i) => (
        <div key={i} style={lineStyle}>
          <span style={{ display: 'flex', gap: 12 }}>
            {'code' in item && <span style={{ fontFamily: 'monospace', color: 'var(--text-hint)', fontSize: 12 }}>{(item as { code: string }).code}</span>}
            {item.name}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: item.amount < 0 ? 'var(--expense)' : 'var(--text-primary)' }}>
            {item.amount < 0 ? `(${formatIDR(Math.abs(item.amount))})` : formatIDR(item.amount)}
          </span>
        </div>
      ))}
      <div style={{ ...subtotalStyle, background: 'var(--income-bg)', color: 'var(--income)' }}>
        <span>TOTAL EKUITAS</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalEquity)}</span>
      </div>

      <div style={grandTotalStyle}>
        <span>TOTAL KEWAJIBAN & EKUITAS</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatIDR(d.totalLiabilitiesEquity)}</span>
      </div>
    </ReportShell>
  )
}
