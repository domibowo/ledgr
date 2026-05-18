import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, PlusCircle, Search } from 'lucide-react'
import { JournalEntry, EntryType } from '../../types/transaction.types'
import { formatIDR } from '../../utils/currency'
import { formatDate } from '../../utils/date'

type Props = {
  entries: JournalEntry[]
  onNew: () => void
  onView: (entry: JournalEntry) => void
}

const ENTRY_TYPE_LABEL: Record<EntryType, string> = {
  MANUAL: 'Manual',
  IMPORT: 'Import',
  RECURRING: 'Berulang',
  ADJUSTMENT: 'Penyesuaian',
}

function EntryTypeBadge({ type }: { type: EntryType }) {
  const styles: Record<EntryType, React.CSSProperties> = {
    MANUAL: { background: 'var(--brand-light)', color: 'var(--brand)' },
    IMPORT: { background: 'var(--pending-bg)', color: 'var(--pending)' },
    RECURRING: { background: 'var(--income-bg)', color: 'var(--income)' },
    ADJUSTMENT: { background: 'var(--expense-bg)', color: 'var(--expense)' },
  }
  return (
    <span
      style={{
        ...styles[type],
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
      }}
    >
      {ENTRY_TYPE_LABEL[type]}
    </span>
  )
}

function StatusBadge({ isPosted }: { isPosted: number }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        background: isPosted ? 'var(--income-bg)' : 'var(--border)',
        color: isPosted ? 'var(--income)' : 'var(--text-secondary)',
      }}
    >
      {isPosted ? 'Diposting' : 'Draft'}
    </span>
  )
}

export function JournalList({ entries, onNew, onView }: Props) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (
      e.description.toLowerCase().includes(q) ||
      e.entry_number.toLowerCase().includes(q) ||
      (e.reference ?? '').toLowerCase().includes(q)
    )
  })

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

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

  const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: 13,
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Entri Jurnal
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            {entries.length} entri ditemukan
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: 'var(--brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <PlusCircle size={15} />
          Jurnal Baru
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 12px',
        }}
      >
        <Search size={15} color="var(--text-hint)" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari berdasarkan keterangan, no. jurnal, atau referensi…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13,
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 32 }} />
                <th style={thStyle}>No. Jurnal</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Keterangan</th>
                <th style={thStyle}>Tipe</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total Debit</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-hint)', padding: 40 }}>
                    Tidak ada entri ditemukan
                  </td>
                </tr>
              )}
              {filtered.map(entry => (
                <>
                  <tr
                    key={entry.id}
                    onClick={() => toggleExpand(entry.id)}
                    style={{
                      borderBottom: expandedId === entry.id ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...tdStyle, color: 'var(--text-hint)', paddingRight: 0 }}>
                      {expandedId === entry.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--brand)', fontFamily: 'monospace' }}>
                      {entry.entry_number}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{entry.description}</div>
                      {entry.reference && (
                        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>{entry.reference}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <EntryTypeBadge type={entry.entry_type} />
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge isPosted={entry.is_posted} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {formatIDR(entry.total_debit ?? 0)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onView(entry) }}
                        title="Lihat detail"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          background: 'var(--card-bg)',
                          color: 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        Lihat
                      </button>
                    </td>
                  </tr>
                  {expandedId === entry.id && (
                    <tr key={`${entry.id}-expand`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div style={{ background: 'var(--page-bg)', borderTop: '1px solid var(--border)', padding: '12px 20px 16px 48px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                {['Akun', 'Debit', 'Kredit'].map(h => (
                                  <th
                                    key={h}
                                    style={{
                                      padding: '6px 10px',
                                      textAlign: h !== 'Akun' ? 'right' : 'left',
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: 'var(--text-hint)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      borderBottom: '1px solid var(--border)',
                                    }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(entry.lines ?? []).map(line => (
                                <tr key={line.id}>
                                  <td style={{ padding: '6px 10px', fontSize: 12, color: 'var(--text-primary)' }}>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--text-hint)', marginRight: 8 }}>
                                      {line.account_code}
                                    </span>
                                    {line.account_name}
                                    {line.description && (
                                      <span style={{ color: 'var(--text-hint)', marginLeft: 8 }}>— {line.description}</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '6px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: line.type === 'DEBIT' ? 'var(--income)' : 'var(--text-hint)' }}>
                                    {line.type === 'DEBIT' ? formatIDR(line.amount) : '—'}
                                  </td>
                                  <td style={{ padding: '6px 10px', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: line.type === 'CREDIT' ? 'var(--expense)' : 'var(--text-hint)' }}>
                                    {line.type === 'CREDIT' ? formatIDR(line.amount) : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase' }}>
                                  Total
                                </td>
                                <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, textAlign: 'right', color: 'var(--income)' }}>
                                  {formatIDR(entry.total_debit ?? 0)}
                                </td>
                                <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, textAlign: 'right', color: 'var(--expense)' }}>
                                  {formatIDR(entry.total_credit ?? 0)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
