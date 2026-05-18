import { useState, useMemo, useEffect } from 'react'
import type { Account } from '../../types/account.types'
import { MOCK_ACCOUNTS } from '../JournalEntry/data/mockAccounts'
import { MOCK_ENTRIES } from '../JournalEntry/data/mockEntries'
import { formatIDR } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { accountDb, journalDb } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { useCompanyStore } from '../../store/company.store'

type LedgerRow = { date: string; entryNumber: string; description: string; reference?: string; debit: number; credit: number }

const OPENING_BALANCES: Record<string, number> = {
  'a-1': 15000000, 'a-2': 85000000, 'a-3': 12500000,
  'a-4': 8000000,  'a-5': 25000000, 'a-6': 5000000,
  'a-7': 7500000,  'a-8': 20000000, 'a-9': 100000000,
}

export function GeneralLedger() {
  const { activeCompanyId } = useCompanyStore()
  const [accounts,   setAccounts]   = useState<Account[]>(MOCK_ACCOUNTS)
  const [rows,       setRows]       = useState<LedgerRow[]>([])
  const [accountId,  setAccountId]  = useState(MOCK_ACCOUNTS[0]?.id ?? '')
  const [dateFrom,   setDateFrom]   = useState('2025-01-01')
  const [dateTo,     setDateTo]     = useState('2025-12-31')
  const [loading,    setLoading]    = useState(false)

  // Load accounts list
  useEffect(() => {
    if (!isElectron || !activeCompanyId) return
    accountDb.list(activeCompanyId).then(dbAccounts => {
      if (dbAccounts.length > 0) {
        setAccounts(dbAccounts)
        setAccountId(dbAccounts[0].id)
      }
    })
  }, [activeCompanyId])

  // Load ledger rows when account/date range changes
  useEffect(() => {
    if (!accountId) return

    if (isElectron && activeCompanyId) {
      setLoading(true)
      journalDb.ledger(activeCompanyId, accountId, dateFrom, dateTo).then(lines => {
        setRows(lines.map(l => ({
          date:        l.date,
          entryNumber: l.entry_number,
          description: l.description ?? l.entry_desc,
          reference:   l.reference,
          debit:       l.type === 'DEBIT'  ? l.amount : 0,
          credit:      l.type === 'CREDIT' ? l.amount : 0,
        })))
        setLoading(false)
      })
    } else {
      // mock fallback
      const lines: LedgerRow[] = []
      for (const entry of MOCK_ENTRIES) {
        if (entry.date < dateFrom || entry.date > dateTo) continue
        for (const line of entry.lines ?? []) {
          if (line.account_id !== accountId) continue
          lines.push({
            date:        entry.date,
            entryNumber: entry.entry_number,
            description: line.description ?? entry.description,
            reference:   entry.reference,
            debit:       line.type === 'DEBIT'  ? line.amount : 0,
            credit:      line.type === 'CREDIT' ? line.amount : 0,
          })
        }
      }
      lines.sort((a, b) => a.date.localeCompare(b.date))
      setRows(lines)
    }
  }, [accountId, dateFrom, dateTo, activeCompanyId])

  const account: Account | undefined = accounts.find(a => a.id === accountId)
  const opening      = OPENING_BALANCES[accountId] ?? 0
  const isDebitNormal = account?.normal_balance === 'DEBIT'

  const rowsWithBalance = useMemo(() => {
    let balance = opening
    return rows.map(row => {
      balance = isDebitNormal
        ? balance + row.debit - row.credit
        : balance + row.credit - row.debit
      return { ...row, balance }
    })
  }, [rows, opening, isDebitNormal])

  const totalDebit  = rows.reduce((s, r) => s + r.debit,  0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)
  const closing     = isDebitNormal
    ? opening + totalDebit - totalCredit
    : opening + totalCredit - totalDebit

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6,
    background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em',
    background: 'var(--page-bg)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)',
    verticalAlign: 'middle', borderBottom: '1px solid var(--border)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Buku Besar</h2>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>Riwayat transaksi per akun</p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 240px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Akun</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Dari</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Sampai</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {account && (
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Saldo Awal',    value: formatIDR(opening),      color: 'var(--text-primary)' },
            { label: 'Total Debit',   value: formatIDR(totalDebit),   color: 'var(--income)' },
            { label: 'Total Kredit',  value: formatIDR(totalCredit),  color: 'var(--expense)' },
            { label: 'Saldo Akhir',   value: formatIDR(closing),      color: 'var(--brand)' },
          ].map(card => (
            <div key={card.label} style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>No. Jurnal</th>
                <th style={thStyle}>Keterangan</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Kredit</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: 'var(--page-bg)' }}>
                <td colSpan={3} style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>Saldo Awal</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>—</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>—</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                  {formatIDR(opening)}
                </td>
              </tr>
              {loading ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-hint)', padding: 32 }}>Memuat…</td></tr>
              ) : rowsWithBalance.length === 0 ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-hint)', padding: 40, borderBottom: 'none' }}>Tidak ada transaksi dalam periode ini</td></tr>
              ) : rowsWithBalance.map((row, i) => (
                <tr
                  key={i}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{formatDate(row.date)}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand)', whiteSpace: 'nowrap' }}>{row.entryNumber}</td>
                  <td style={tdStyle}>
                    <div>{row.description}</div>
                    {row.reference && <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>{row.reference}</div>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row.debit > 0 ? 'var(--income)' : 'var(--text-hint)' }}>
                    {row.debit > 0 ? formatIDR(row.debit) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: row.credit > 0 ? 'var(--expense)' : 'var(--text-hint)' }}>
                    {row.credit > 0 ? formatIDR(row.credit) : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatIDR(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            {rowsWithBalance.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--page-bg)' }}>
                  <td colSpan={3} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saldo Akhir</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--income)' }}>{formatIDR(totalDebit)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--expense)' }}>{formatIDR(totalCredit)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--brand)' }}>{formatIDR(closing)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
