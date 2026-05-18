import { useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { ImportMode, MappedRow } from './index'
import { formatIDR } from '../../utils/currency'

type Props = {
  mode: ImportMode
  mappedRows: MappedRow[]
  onBack: () => void
  onSuccess: () => void
}

type RowState = 'ok' | 'warn'

function validateRow(row: MappedRow): { state: RowState; issues: string[] } {
  const issues: string[] = []
  if (!row.date)          issues.push('Tanggal kosong')
  if (!row.account_name)  issues.push('Nama akun kosong')
  if (row.debit === 0 && row.credit === 0) issues.push('Debit & kredit keduanya 0')
  if (row.debit > 0 && row.credit > 0)     issues.push('Debit & kredit keduanya > 0')
  return { state: issues.length > 0 ? 'warn' : 'ok', issues }
}

export function ImportPreview({ mappedRows, onBack, onSuccess }: Props) {
  const [importing, setImporting] = useState(false)
  const [done, setDone]           = useState(false)

  const validations = mappedRows.map(validateRow)
  const okCount     = validations.filter(v => v.state === 'ok').length
  const warnCount   = validations.filter(v => v.state === 'warn').length

  const totalDebit  = mappedRows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = mappedRows.reduce((s, r) => s + r.credit, 0)
  const balanced    = Math.abs(totalDebit - totalCredit) < 0.01

  function doImport() {
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setDone(true)
    }, 1200)
  }

  if (done) {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <CheckCircle2 size={56} color="var(--income)" />
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Import Berhasil!</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          {okCount} baris berhasil diimpor ke jurnal.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
        >
          Import File Lain
        </button>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
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

  const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 12,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <SummaryCard label="Total Baris" value={String(mappedRows.length)} color="var(--brand)" />
        <SummaryCard label="Valid" value={String(okCount)} color="var(--income)" />
        {warnCount > 0 && <SummaryCard label="Peringatan" value={String(warnCount)} color="var(--pending)" />}
        <SummaryCard label="Total Debit"  value={formatIDR(totalDebit)}  color="var(--income)" />
        <SummaryCard label="Total Kredit" value={formatIDR(totalCredit)} color="var(--expense)" />
        {!balanced && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--expense-bg)', border: '1px solid var(--expense)', borderRadius: 8 }}>
            <AlertTriangle size={13} color="var(--expense)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--expense)' }}>Tidak seimbang</span>
          </div>
        )}
        {balanced && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--income-bg)', border: '1px solid var(--income)', borderRadius: 8 }}>
            <CheckCircle2 size={13} color="var(--income)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--income)' }}>Seimbang</span>
          </div>
        )}
      </div>

      {/* Preview table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Tanggal</th>
              <th style={thStyle}>No. Jurnal</th>
              <th style={thStyle}>Keterangan</th>
              <th style={thStyle}>Kode Akun</th>
              <th style={thStyle}>Nama Akun</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Kredit</th>
              <th style={thStyle}>Ref</th>
            </tr>
          </thead>
          <tbody>
            {mappedRows.map((row, i) => {
              const v = validations[i]
              return (
                <tr
                  key={i}
                  style={{ background: v.state === 'warn' ? 'var(--pending-bg)' : 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = v.state === 'warn' ? 'var(--pending-bg)' : 'var(--page-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = v.state === 'warn' ? 'var(--pending-bg)' : 'transparent')}
                  title={v.issues.join(', ')}
                >
                  <td style={{ ...tdStyle, color: 'var(--text-hint)', width: 32 }}>{i + 1}</td>
                  <td style={tdStyle}>
                    {v.state === 'ok'
                      ? <CheckCircle2 size={13} color="var(--income)" />
                      : <AlertTriangle size={13} color="var(--pending)" />
                    }
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{row.date || '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: 'var(--brand)' }}>{row.entry_number || '—'}</td>
                  <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description || '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{row.account_code || '—'}</td>
                  <td style={{ ...tdStyle, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.account_name || '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row.debit > 0 ? 'var(--income)' : 'var(--text-hint)' }}>
                    {row.debit > 0 ? formatIDR(row.debit) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row.credit > 0 ? 'var(--expense)' : 'var(--text-hint)' }}>
                    {row.credit > 0 ? formatIDR(row.credit) : '—'}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontSize: 11 }}>{row.reference || '—'}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--page-bg)' }}>
              <td colSpan={7} style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                TOTAL ({okCount} baris valid)
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--income)' }}>
                {formatIDR(totalDebit)}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--expense)' }}>
                {formatIDR(totalCredit)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          ← Kembali
        </button>
        <button
          type="button"
          onClick={doImport}
          disabled={importing || okCount === 0}
          style={{
            padding: '8px 22px', borderRadius: 8, border: 'none',
            background: okCount === 0 ? 'var(--border)' : 'var(--brand)',
            color: okCount === 0 ? 'var(--text-hint)' : '#fff',
            fontSize: 13, fontWeight: 700,
            cursor: okCount === 0 ? 'not-allowed' : 'pointer',
            opacity: importing ? 0.7 : 1,
          }}
        >
          {importing ? 'Mengimpor…' : `Import ${okCount} Baris`}
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '8px 14px', background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}
