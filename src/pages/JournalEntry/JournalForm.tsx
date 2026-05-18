import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'
import { Account } from '../../types/account.types'
import { JournalEntry, EntryType } from '../../types/transaction.types'
import { formatIDR } from '../../utils/currency'
import { JournalRow, FormLine } from './JournalRow'
import { MOCK_ACCOUNTS } from './data/mockAccounts'
import { accountDb } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { useCompanyStore } from '../../store/company.store'

type Props = {
  onSave: (entry: JournalEntry) => void
  onCancel: () => void
  nextNumber: string
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

function emptyLine(): FormLine {
  return { id: makeId(), account_id: '', type: 'DEBIT', amount: '', description: '' }
}

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'RECURRING', label: 'Berulang' },
  { value: 'ADJUSTMENT', label: 'Penyesuaian' },
]

export function JournalForm({ onSave, onCancel, nextNumber }: Props) {
  const { activeCompanyId } = useCompanyStore()
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS)

  useEffect(() => {
    if (isElectron && activeCompanyId) {
      accountDb.list(activeCompanyId).then(rows => {
        if (rows.length > 0) setAccounts(rows)
      })
    }
  }, [activeCompanyId])
  const todayStr = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(todayStr)
  const [entryNumber] = useState(nextNumber)
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [entryType, setEntryType] = useState<EntryType>('MANUAL')
  const [lines, setLines] = useState<FormLine[]>([emptyLine(), emptyLine()])

  const totalDebit = lines.reduce((s, l) => s + (l.type === 'DEBIT' ? parseFloat(l.amount) || 0 : 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (l.type === 'CREDIT' ? parseFloat(l.amount) || 0 : 0), 0)
  const diff = totalDebit - totalCredit
  const balanced = diff === 0 && totalDebit > 0
  const canSave = balanced && description.trim() !== '' && lines.every(l => l.account_id !== '')

  function updateLine(id: string, updated: FormLine) {
    setLines(prev => prev.map(l => (l.id === id ? updated : l)))
  }

  function removeLine(id: string) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  function addLine() {
    setLines(prev => [...prev, emptyLine()])
  }

  function handleSave() {
    if (!canSave) return
    const now = new Date().toISOString()
    const entry: JournalEntry = {
      id: makeId(),
      company_id: 'c-1',
      period_id: 'p-1',
      entry_number: entryNumber,
      date,
      description: description.trim(),
      reference: reference.trim() || undefined,
      entry_type: entryType,
      is_posted: 0,
      created_at: now,
      updated_at: now,
      total_debit: totalDebit,
      total_credit: totalCredit,
      lines: lines.map((l, i) => {
        const acc = accounts.find(a => a.id === l.account_id)
        return {
          id: makeId(),
          entry_id: '',
          account_id: l.account_id,
          account_name: acc?.name,
          account_code: acc?.code,
          type: l.type,
          amount: parseFloat(l.amount) || 0,
          description: l.description || undefined,
          sort_order: i + 1,
        }
      }),
    }
    onSave(entry)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Entri Jurnal Baru
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            {entryNumber}
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 20,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <label style={labelStyle}>Tanggal *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>No. Jurnal</label>
          <input type="text" value={entryNumber} readOnly style={{ ...inputStyle, color: 'var(--text-hint)', cursor: 'default' }} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Keterangan *</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Deskripsi entri jurnal"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Referensi</label>
          <input
            type="text"
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="No. invoice / PO (opsional)"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Tipe Entri</label>
          <select value={entryType} onChange={e => setEntryType(e.target.value as EntryType)} style={inputStyle}>
            {ENTRY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Baris Jurnal</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '48px' }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>
                {['Akun', 'Tipe', 'Jumlah', 'Keterangan Baris', ''].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 10px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-hint)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <JournalRow
                  key={line.id}
                  line={line}
                  accounts={accounts}
                  onChange={updated => updateLine(line.id, updated)}
                  onRemove={() => removeLine(line.id)}
                  canRemove={lines.length > 2}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px' }}>
          <button
            type="button"
            onClick={addLine}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: '1px dashed var(--brand)',
              borderRadius: 6,
              padding: '6px 14px',
              color: 'var(--brand)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={15} />
            Tambah Baris
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Total Debit
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--income)' }}>{formatIDR(totalDebit)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Total Kredit
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--expense)' }}>{formatIDR(totalCredit)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Selisih
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: balanced ? 'var(--income)' : diff !== 0 ? 'var(--expense)' : 'var(--text-hint)',
              }}
            >
              {balanced ? '✓ Seimbang' : formatIDR(Math.abs(diff))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              border: '1px solid var(--border)',
              borderRadius: 7,
              background: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 7,
              background: canSave ? 'var(--brand)' : 'var(--border)',
              color: canSave ? '#fff' : 'var(--text-hint)',
              fontSize: 13,
              fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
