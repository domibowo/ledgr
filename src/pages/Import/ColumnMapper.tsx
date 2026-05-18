import { useState } from 'react'
import type { ImportMode, RawRow, MappedRow } from './index'

type Props = {
  mode: ImportMode
  headers: string[]
  rawRows: RawRow[]
  onConfirm: (rows: MappedRow[]) => void
}

type JournalField = keyof MappedRow
type FieldDef = { key: JournalField; label: string; required: boolean }

const JOURNAL_FIELDS: FieldDef[] = [
  { key: 'date',         label: 'Tanggal',    required: true  },
  { key: 'entry_number', label: 'No. Jurnal', required: false },
  { key: 'description',  label: 'Keterangan', required: true  },
  { key: 'account_code', label: 'Kode Akun',  required: false },
  { key: 'account_name', label: 'Nama Akun',  required: true  },
  { key: 'debit',        label: 'Debit',      required: true  },
  { key: 'credit',       label: 'Kredit',     required: true  },
  { key: 'reference',    label: 'Referensi',  required: false },
]

function autoMap(headers: string[]): Record<JournalField, string> {
  const lower = headers.map(h => h.toLowerCase())
  function find(keywords: string[]): string {
    for (const kw of keywords) {
      const idx = lower.findIndex(h => h.includes(kw))
      if (idx !== -1) return headers[idx]
    }
    return ''
  }
  return {
    date:         find(['tanggal', 'date', 'tgl']),
    entry_number: find(['no. jurnal', 'jurnal', 'entry', 'nomor']),
    description:  find(['keterangan', 'deskripsi', 'description', 'narasi', 'memo']),
    account_code: find(['kode akun', 'kode', 'code', 'account code']),
    account_name: find(['nama akun', 'nama', 'account name', 'account']),
    debit:        find(['debit', 'db']),
    credit:       find(['kredit', 'credit', 'cr']),
    reference:    find(['referensi', 'reference', 'ref', 'invoice']),
  }
}

function toNum(v: string | number | null): number {
  if (v === null || v === '') return 0
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function toStr(v: string | number | null): string {
  return v === null ? '' : String(v).trim()
}

export function ColumnMapper({ headers, rawRows, onConfirm }: Props) {
  const [mapping, setMapping] = useState<Record<JournalField, string>>(() => autoMap(headers))
  const [errors, setErrors]   = useState<string[]>([])

  function setField(key: JournalField, value: string) {
    setMapping(prev => ({ ...prev, [key]: value }))
    setErrors([])
  }

  function validate(): string[] {
    return JOURNAL_FIELDS.filter(f => f.required && !mapping[f.key])
      .map(f => `"${f.label}" wajib dipetakan`)
  }

  function confirm() {
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }

    const rows: MappedRow[] = rawRows.map(raw => ({
      date:         toStr(raw[mapping.date]),
      entry_number: toStr(raw[mapping.entry_number]),
      description:  toStr(raw[mapping.description]),
      account_code: toStr(raw[mapping.account_code]),
      account_name: toStr(raw[mapping.account_name]),
      debit:        toNum(raw[mapping.debit]),
      credit:       toNum(raw[mapping.credit]),
      reference:    toStr(raw[mapping.reference]),
    })).filter(r => r.description || r.account_name)

    onConfirm(rows)
  }

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    minWidth: 180,
  }

  const preview = rawRows.slice(0, 3)

  return (
    <div style={{ padding: 20 }}>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Cocokkan kolom dari file Anda dengan field yang dibutuhkan Ledgr.
        Sistem mendeteksi {headers.length} kolom.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px', marginBottom: 24 }}>
        {JOURNAL_FIELDS.map(f => (
          <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {f.label}{f.required && <span style={{ color: 'var(--expense)', marginLeft: 2 }}>*</span>}
            </label>
            <select
              value={mapping[f.key]}
              onChange={e => setField(f.key, e.target.value)}
              style={selectStyle}
            >
              <option value="">— tidak dipetakan —</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Data preview */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preview 3 baris pertama
        </p>
        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
            <thead>
              <tr style={{ background: 'var(--page-bg)' }}>
                {headers.map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-hint)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {headers.map(h => (
                    <td key={h} style={{ padding: '5px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row[h] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--expense-bg)', border: '1px solid var(--expense)', borderRadius: 8, marginBottom: 16 }}>
          {errors.map((e, i) => (
            <p key={i} style={{ margin: 0, fontSize: 12, color: 'var(--expense)', fontWeight: 600 }}>{e}</p>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={confirm}
          style={{
            padding: '8px 22px', borderRadius: 8, border: 'none',
            background: 'var(--brand)', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Lanjut ke Preview →
        </button>
      </div>
    </div>
  )
}
