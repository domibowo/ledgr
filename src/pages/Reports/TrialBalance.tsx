import { ReportShell } from './ReportShell'
import { MOCK_TRIAL_BALANCE } from './data/mockReportData'
import { formatIDR } from '../../utils/currency'

type Props = { period: string }

const ACCOUNT_TYPE: Record<string, string> = {
  '1': 'ASET', '2': 'KEWAJIBAN', '3': 'EKUITAS', '4': 'PENDAPATAN', '5': 'BEBAN',
}

const TYPE_COLOR: Record<string, string> = {
  ASET: 'var(--brand)', KEWAJIBAN: 'var(--expense)', EKUITAS: 'var(--pending)',
  PENDAPATAN: 'var(--income)', BEBAN: 'var(--expense)',
}

const TYPE_BG: Record<string, string> = {
  ASET: 'var(--brand-light)', KEWAJIBAN: 'var(--expense-bg)', EKUITAS: 'var(--pending-bg)',
  PENDAPATAN: 'var(--income-bg)', BEBAN: 'var(--expense-bg)',
}

export function TrialBalance({ period }: Props) {
  const rows = MOCK_TRIAL_BALANCE
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)
  const balanced = totalDebit === totalCredit

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-hint)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'var(--page-bg)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }

  let lastType = ''

  return (
    <ReportShell title="Neraca Saldo (Trial Balance)" period={period}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Kode</th>
              <th style={thStyle}>Nama Akun</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Kredit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const typeKey = ACCOUNT_TYPE[row.code[0]] ?? ''
              const showHeader = typeKey !== lastType
              if (showHeader) lastType = typeKey
              return (
                <>
                  {showHeader && (
                    <tr key={`header-${typeKey}`}>
                      <td
                        colSpan={4}
                        style={{
                          padding: '7px 14px',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: TYPE_COLOR[typeKey],
                          background: TYPE_BG[typeKey],
                          borderTop: '1px solid var(--border)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {typeKey}
                      </td>
                    </tr>
                  )}
                  <tr
                    key={row.code}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand)', whiteSpace: 'nowrap' }}>
                      {row.code}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 13, color: 'var(--text-primary)' }}>{row.name}</td>
                    <td style={{ padding: '9px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row.debit > 0 ? 'var(--income)' : 'var(--text-hint)' }}>
                      {row.debit > 0 ? formatIDR(row.debit) : '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row.credit > 0 ? 'var(--expense)' : 'var(--text-hint)' }}>
                      {row.credit > 0 ? formatIDR(row.credit) : '—'}
                    </td>
                  </tr>
                </>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--page-bg)' }}>
              <td colSpan={2} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                TOTAL
                {balanced && (
                  <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: 'var(--income)', background: 'var(--income-bg)', padding: '2px 8px', borderRadius: 10 }}>
                    ✓ Seimbang
                  </span>
                )}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--income)' }}>
                {formatIDR(totalDebit)}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--expense)' }}>
                {formatIDR(totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </ReportShell>
  )
}
