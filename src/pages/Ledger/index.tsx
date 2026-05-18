import { useState } from 'react'
import { ChartOfAccounts } from './ChartOfAccounts'
import { GeneralLedger } from './GeneralLedger'

type Tab = 'accounts' | 'ledger'

export function Ledger() {
  const [tab, setTab] = useState<Tab>('accounts')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
        Buku Besar
      </h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {([['accounts', 'Daftar Akun'], ['ledger', 'Buku Besar']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              padding: '6px 20px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: tab === key ? 'var(--brand)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'accounts' ? <ChartOfAccounts /> : <GeneralLedger />}
    </div>
  )
}
