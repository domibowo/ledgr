import { useState, useEffect } from 'react'
import { PlusCircle, Pencil, Search } from 'lucide-react'
import type { Account, AccountType } from '../../types/account.types'
import { MOCK_ACCOUNTS } from '../JournalEntry/data/mockAccounts'
import { AccountFormModal } from './AccountFormModal'
import { accountDb } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { useCompanyStore } from '../../store/company.store'

const TYPE_META: Record<AccountType, { label: string; color: string; bg: string }> = {
  ASSET:     { label: 'Aset',        color: 'var(--brand)',   bg: 'var(--brand-light)' },
  LIABILITY: { label: 'Kewajiban',   color: 'var(--expense)', bg: 'var(--expense-bg)' },
  EQUITY:    { label: 'Ekuitas',     color: 'var(--pending)', bg: 'var(--pending-bg)' },
  INCOME:    { label: 'Pendapatan',  color: 'var(--income)',  bg: 'var(--income-bg)' },
  EXPENSE:   { label: 'Beban',       color: 'var(--expense)', bg: 'var(--expense-bg)' },
}

const TYPE_ORDER: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']

export function ChartOfAccounts() {
  const { activeCompanyId } = useCompanyStore()
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState<{ open: boolean; account?: Account }>({ open: false })

  useEffect(() => {
    if (!isElectron || !activeCompanyId) return
    accountDb.list(activeCompanyId).then(rows => {
      if (rows.length > 0) {
        setAccounts(rows)
      } else {
        // seed mock accounts into DB on first run
        const seeded = MOCK_ACCOUNTS.map(a => ({ ...a, company_id: activeCompanyId }))
        accountDb.bulkInsert(seeded).then(() => accountDb.list(activeCompanyId).then(setAccounts))
      }
    })
  }, [activeCompanyId])

  async function saveAccount(account: Account) {
    if (isElectron && activeCompanyId) {
      await accountDb.upsert({ ...account, company_id: activeCompanyId })
      const rows = await accountDb.list(activeCompanyId)
      setAccounts(rows)
    } else {
      const idx = accounts.findIndex(a => a.id === account.id)
      if (idx >= 0) { const next = [...accounts]; next[idx] = account; setAccounts(next) }
      else setAccounts(prev => [...prev, account])
    }
  }

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase()
    return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
  })

  const grouped = TYPE_ORDER.reduce<Record<AccountType, Account[]>>((acc, type) => {
    acc[type] = filtered.filter(a => a.type === type)
    return acc
  }, {} as Record<AccountType, Account[]>)

  async function handleSave(account: Account) {
    await saveAccount(account)
    setModal({ open: false })
  }

  async function toggleActive(id: string) {
    const account = accounts.find(a => a.id === id)
    if (!account) return
    const updated = { ...account, is_active: account.is_active === 1 ? 0 : 1 }
    await saveAccount(updated)
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
    padding: '11px 14px',
    fontSize: 13,
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Daftar Akun</h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            {accounts.length} akun terdaftar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ open: true })}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <PlusCircle size={15} />
          Tambah Akun
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
        <Search size={15} color="var(--text-hint)" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari berdasarkan kode atau nama akun…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)' }}
        />
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Kode</th>
                <th style={thStyle}>Nama Akun</th>
                <th style={thStyle}>Tipe</th>
                <th style={thStyle}>Saldo Normal</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_ORDER.map(type => {
                const rows = grouped[type]
                if (rows.length === 0) return null
                const meta = TYPE_META[type]
                return (
                  <>
                    <tr key={`header-${type}`}>
                      <td
                        colSpan={6}
                        style={{
                          padding: '8px 14px',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: meta.color,
                          background: meta.bg,
                          borderBottom: '1px solid var(--border)',
                          borderTop: '1px solid var(--border)',
                        }}
                      >
                        {meta.label}
                      </td>
                    </tr>
                    {rows.map(account => (
                      <tr
                        key={account.id}
                        style={{ borderBottom: '1px solid var(--border)', opacity: account.is_active ? 1 : 0.5 }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand)' }}>
                          {account.code}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: account.is_header ? 700 : 400 }}>{account.name}</span>
                          {account.description && (
                            <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>{account.description}</div>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                          {account.normal_balance === 'DEBIT' ? 'Debit' : 'Kredit'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                              background: account.is_active ? 'var(--income-bg)' : 'var(--border)',
                              color: account.is_active ? 'var(--income)' : 'var(--text-secondary)',
                            }}
                          >
                            {account.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setModal({ open: true, account })}
                              title="Edit"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(account.id)}
                              title={account.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                              style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card-bg)', color: account.is_active ? 'var(--expense)' : 'var(--income)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              {account.is_active ? 'Nonaktif' : 'Aktifkan'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-hint)', padding: 40 }}>
                    Tidak ada akun ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <AccountFormModal
          account={modal.account}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
