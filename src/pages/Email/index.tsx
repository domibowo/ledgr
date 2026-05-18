import { useState } from 'react'
import { Settings, Send } from 'lucide-react'
import { SmtpConfigPanel } from './SmtpConfig'
import { SendReport } from './SendReport'
import { useEmailStore } from './emailStore'

type Tab = 'config' | 'send'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'config', label: 'Konfigurasi SMTP', icon: <Settings size={13} /> },
  { key: 'send',   label: 'Kirim Laporan',    icon: <Send size={13} /> },
]

export function Email() {
  const [tab, setTab] = useState<Tab>('config')
  const { config }    = useEmailStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Email</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
        Kirim laporan keuangan via Gmail, Outlook, atau SMTP kustom
      </p>

      {/* Tab bar with config status dot */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, alignSelf: 'flex-start', marginBottom: 4 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 6, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === t.key ? 'var(--brand)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s', position: 'relative',
            }}
          >
            {t.icon}
            {t.label}
            {t.key === 'config' && config && (
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--income)',
                border: `1.5px solid ${tab === 'config' ? 'var(--brand)' : 'var(--card-bg)'}`,
                position: 'absolute', top: 5, right: 5,
              }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {tab === 'config' && <SmtpConfigPanel />}
        {tab === 'send'   && <SendReport />}
      </div>
    </div>
  )
}
