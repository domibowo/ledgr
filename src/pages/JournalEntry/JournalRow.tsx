import { Trash2 } from 'lucide-react'
import { Account } from '../../types/account.types'

export type FormLine = {
  id: string
  account_id: string
  type: 'DEBIT' | 'CREDIT'
  amount: string
  description: string
}

type Props = {
  line: FormLine
  accounts: Account[]
  onChange: (updated: FormLine) => void
  onRemove: () => void
  canRemove: boolean
}

export function JournalRow({ line, accounts, onChange, onRemove, canRemove }: Props) {
  const set = (patch: Partial<FormLine>) => onChange({ ...line, ...patch })

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '8px 10px' }}>
        <select
          value={line.account_id}
          onChange={e => set({ account_id: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
          }}
        >
          <option value="">— Pilih Akun —</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name}
            </option>
          ))}
        </select>
      </td>
      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {(['DEBIT', 'CREDIT'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set({ type: t })}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: line.type === t ? 'var(--brand)' : 'var(--card-bg)',
                color: line.type === t ? '#fff' : 'var(--text-secondary)',
                transition: 'background 0.15s',
              }}
            >
              {t === 'DEBIT' ? 'Debit' : 'Kredit'}
            </button>
          ))}
        </div>
      </td>
      <td style={{ padding: '8px 10px' }}>
        <input
          type="number"
          min={0}
          value={line.amount}
          onChange={e => set({ amount: e.target.value })}
          placeholder="0"
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
            textAlign: 'right',
            boxSizing: 'border-box',
          }}
        />
      </td>
      <td style={{ padding: '8px 10px' }}>
        <input
          type="text"
          value={line.description}
          onChange={e => set({ description: e.target.value })}
          placeholder="Keterangan baris (opsional)"
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </td>
      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          title="Hapus baris"
          style={{
            background: 'none',
            border: 'none',
            cursor: canRemove ? 'pointer' : 'not-allowed',
            color: canRemove ? 'var(--expense)' : 'var(--text-hint)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}
