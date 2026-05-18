import { useState } from 'react'
import { X } from 'lucide-react'
import type { Account, AccountType, NormalBalance } from '../../types/account.types'

type Props = {
  account?: Account
  onSave: (account: Account) => void
  onClose: () => void
}

const ACCOUNT_TYPES: { value: AccountType; label: string; normal: NormalBalance }[] = [
  { value: 'ASSET', label: 'Aset', normal: 'DEBIT' },
  { value: 'LIABILITY', label: 'Kewajiban', normal: 'CREDIT' },
  { value: 'EQUITY', label: 'Ekuitas', normal: 'CREDIT' },
  { value: 'INCOME', label: 'Pendapatan', normal: 'CREDIT' },
  { value: 'EXPENSE', label: 'Beban', normal: 'DEBIT' },
]

function makeId() {
  return 'a-' + Math.random().toString(36).slice(2)
}

export function AccountFormModal({ account, onSave, onClose }: Props) {
  const [code, setCode] = useState(account?.code ?? '')
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>(account?.type ?? 'ASSET')
  const [description, setDescription] = useState(account?.description ?? '')
  const [isActive, setIsActive] = useState(account ? account.is_active === 1 : true)

  const normalBalance = ACCOUNT_TYPES.find(t => t.value === type)?.normal ?? 'DEBIT'
  const canSave = code.trim() !== '' && name.trim() !== ''

  function handleSave() {
    if (!canSave) return
    onSave({
      id: account?.id ?? makeId(),
      company_id: 'c-1',
      code: code.trim(),
      name: name.trim(),
      type,
      normal_balance: normalBalance,
      description: description.trim() || undefined,
      is_header: account?.is_header ?? 0,
      is_active: isActive ? 1 : 0,
      created_at: account?.created_at ?? new Date().toISOString(),
    })
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 12, width: 480, padding: 24,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {account ? 'Edit Akun' : 'Tambah Akun Baru'}
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Kode Akun *</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="1-1001" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipe Akun *</label>
            <select value={type} onChange={e => setType(e.target.value as AccountType)} style={inputStyle}>
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nama Akun *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama akun" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Saldo Normal</label>
            <input type="text" value={normalBalance === 'DEBIT' ? 'Debit' : 'Kredit'} readOnly style={{ ...inputStyle, color: 'var(--text-hint)', cursor: 'default' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
            <input
              type="checkbox"
              id="is-active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }}
            />
            <label htmlFor="is-active" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Akun Aktif</label>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Deskripsi</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi akun (opsional)" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: canSave ? 'var(--brand)' : 'var(--border)', color: canSave ? '#fff' : 'var(--text-hint)', fontSize: 13, fontWeight: 600, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
