import { ReportShell } from './ReportShell'
import { MOCK_AGING } from './data/mockReportData'
import { formatIDR } from '../../utils/currency'
import { formatDate } from '../../utils/date'

type Props = { period: string }

const COLUMNS = [
  { key: 'current',  label: 'Belum Jatuh Tempo', color: 'var(--income)' },
  { key: 'd1_30',    label: '1–30 Hari',          color: 'var(--pending)' },
  { key: 'd31_60',   label: '31–60 Hari',         color: 'var(--pending)' },
  { key: 'd61_90',   label: '61–90 Hari',         color: 'var(--expense)' },
  { key: 'd90plus',  label: '> 90 Hari',           color: 'var(--expense)' },
] as const

function ageBadge(days: number) {
  if (days === 0) return { label: 'Belum jatuh tempo', color: 'var(--income)', bg: 'var(--income-bg)' }
  if (days <= 30)  return { label: `${days} hari`,     color: 'var(--pending)', bg: 'var(--pending-bg)' }
  if (days <= 60)  return { label: `${days} hari`,     color: 'var(--pending)', bg: 'var(--pending-bg)' }
  if (days <= 90)  return { label: `${days} hari`,     color: 'var(--expense)', bg: 'var(--expense-bg)' }
  return               { label: `${days} hari`,        color: 'var(--expense)', bg: 'var(--expense-bg)' }
}

export function AgingReport({ period }: Props) {
  const d = MOCK_AGING

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-hint)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'var(--page-bg)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    verticalAlign: 'middle',
    borderBottom: '1px solid var(--border)',
  }

  return (
    <ReportShell title="Aging Piutang Usaha" period={period}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>Pelanggan</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>No. Invoice</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Tgl Jatuh Tempo</th>
              <th style={{ ...thStyle }}>Keterlambatan</th>
              <th style={{ ...thStyle }}>Total Tagihan</th>
              {COLUMNS.map(c => (
                <th key={c.key} style={{ ...thStyle, color: c.color }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.receivables.map((row, i) => {
              const badge = ageBadge(row.daysOverdue)
              return (
                <tr
                  key={i}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)' }}>{row.customer}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12, color: 'var(--brand)' }}>{row.invoice}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(row.due)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {formatIDR(row.amount)}
                  </td>
                  {COLUMNS.map(c => (
                    <td key={c.key} style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row[c.key] > 0 ? c.color : 'var(--text-hint)' }}>
                      {row[c.key] > 0 ? formatIDR(row[c.key]) : '—'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--page-bg)' }}>
              <td colSpan={4} style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>TOTAL</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--brand)' }}>
                {formatIDR(d.grandTotal)}
              </td>
              {([d.totalCurrent, d.totalD1_30, d.totalD31_60, d.totalD61_90, d.totalD90Plus] as number[]).map((total, i) => (
                <td key={i} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: total > 0 ? COLUMNS[i].color : 'var(--text-hint)' }}>
                  {total > 0 ? formatIDR(total) : '—'}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </ReportShell>
  )
}
