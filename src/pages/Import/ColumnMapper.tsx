import { useState } from 'react'
import { X, MousePointerClick, ArrowRight } from 'lucide-react'
import type { ImportMode, RawRow, MappedRow } from './index'
import type { FieldConfidence } from './heuristics'

export type JournalField = keyof MappedRow

type Props = {
  mode:       ImportMode
  headers:    string[]
  rawRows:    RawRow[]
  mapping:    Record<JournalField, string>
  confidence: Record<JournalField, FieldConfidence>
  onConfirm:  (rows: MappedRow[]) => void
}

type FieldDef = { key: JournalField; label: string; required: boolean; hint: string }

const JOURNAL_FIELDS: FieldDef[] = [
  { key: 'date',         label: 'Tanggal',    required: true,  hint: 'Tanggal transaksi (dd/mm/yyyy)'   },
  { key: 'entry_number', label: 'No. Jurnal', required: false, hint: 'Nomor atau kode jurnal'            },
  { key: 'description',  label: 'Keterangan', required: true,  hint: 'Narasi / deskripsi transaksi'     },
  { key: 'account_code', label: 'Kode Akun',  required: false, hint: 'Kode perkiraan (mis. 1-1100)'     },
  { key: 'account_name', label: 'Nama Akun',  required: true,  hint: 'Nama akun / perkiraan'            },
  { key: 'debit',        label: 'Debit',      required: true,  hint: 'Jumlah debit (angka)'             },
  { key: 'credit',       label: 'Kredit',     required: true,  hint: 'Jumlah kredit (angka)'            },
  { key: 'reference',    label: 'Referensi',  required: false, hint: 'No. faktur / bukti / referensi'   },
]

function toNum(v: string | number | null): number {
  if (v === null || v === '') return 0
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function toStr(v: string | number | null): string {
  return v === null ? '' : String(v).trim()
}

function sampleValues(header: string, rawRows: RawRow[]): string[] {
  return rawRows
    .slice(0, 3)
    .map(r => toStr(r[header] as string | number | null))
    .filter(v => v.length > 0)
}

export function ColumnMapper({ headers, rawRows, mapping: initialMapping, confidence, onConfirm }: Props) {
  const [mapping, setMapping]       = useState<Record<JournalField, string>>(initialMapping)
  const [selectedCol, setSelectedCol] = useState<string | null>(null)
  const [errors, setErrors]         = useState<string[]>([])

  // Which field is each header currently mapped to?
  const headerToField = Object.fromEntries(
    (Object.entries(mapping) as [JournalField, string][])
      .filter(([, h]) => h)
      .map(([f, h]) => [h, f])
  ) as Record<string, JournalField>

  function assignField(fieldKey: JournalField) {
    if (!selectedCol) return
    // If this header was already mapped elsewhere, free it
    setMapping(prev => {
      const next = { ...prev }
      // Remove from any field that had it
      for (const k of Object.keys(next) as JournalField[]) {
        if (next[k] === selectedCol) next[k] = ''
      }
      next[fieldKey] = selectedCol
      return next
    })
    setSelectedCol(null)
    setErrors([])
  }

  function unassignField(fieldKey: JournalField, e: React.MouseEvent) {
    e.stopPropagation()
    setMapping(prev => ({ ...prev, [fieldKey]: '' }))
    setErrors([])
  }

  function toggleCol(header: string) {
    setSelectedCol(prev => prev === header ? null : header)
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

  const mappedCount   = JOURNAL_FIELDS.filter(f => mapping[f.key]).length
  const requiredDone  = JOURNAL_FIELDS.filter(f => f.required && mapping[f.key]).length
  const requiredTotal = JOURNAL_FIELDS.filter(f => f.required).length
  const allRequiredOk = requiredDone === requiredTotal

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(mappedCount / JOURNAL_FIELDS.length) * 100}%`, background: allRequiredOk ? 'var(--income)' : 'var(--brand)', borderRadius: 99, transition: 'width 0.2s' }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {mappedCount}/{JOURNAL_FIELDS.length} kolom dipetakan
          {allRequiredOk && <span style={{ color: 'var(--income)', marginLeft: 6 }}>✓ Wajib lengkap</span>}
        </span>
      </div>

      {/* Instruction hint */}
      {selectedCol ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 8 }}>
          <MousePointerClick size={14} color="var(--brand)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>
            Kolom <strong>"{selectedCol}"</strong> dipilih — klik field tujuan di kanan untuk memetakan
          </span>
          <button type="button" onClick={() => setSelectedCol(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <MousePointerClick size={14} color="var(--text-hint)" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Klik kolom dari file di kiri, lalu klik field tujuan di kanan untuk memetakan.
          </span>
        </div>
      )}

      {/* Two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'start' }}>

        {/* LEFT — source columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kolom dari File ({headers.length})
          </p>
          {headers.map(h => {
            const isSelected  = selectedCol === h
            const mappedField = headerToField[h]
            const fieldDef    = mappedField ? JOURNAL_FIELDS.find(f => f.key === mappedField) : null
            const samples     = sampleValues(h, rawRows)

            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleCol(h)}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${isSelected ? 'var(--brand)' : mappedField ? 'var(--income)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--brand-light)' : mappedField ? 'var(--income-bg)' : 'var(--card-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  opacity: mappedField && !isSelected ? 0.75 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: samples.length ? 4 : 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? 'var(--brand)' : mappedField ? 'var(--income)' : 'var(--text-primary)', flex: 1 }}>
                    {h}
                  </span>
                  {mappedField && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: 'var(--income)', color: '#fff' }}>
                      → {fieldDef?.label ?? mappedField}
                    </span>
                  )}
                </div>
                {samples.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {samples.map((s, i) => (
                      <span key={i} style={{ fontSize: 10, color: 'var(--text-hint)', background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 28 }}>
          <ArrowRight size={18} color="var(--text-hint)" />
        </div>

        {/* RIGHT — target fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Field Ledgr
          </p>
          {JOURNAL_FIELDS.map(f => {
            const mapped  = mapping[f.key]
            const conf    = confidence[f.key]
            const isEmpty = !mapped
            const isError = errors.some(e => e.includes(f.label))
            const canAssign = !!selectedCol

            let borderColor = 'var(--border)'
            let bg          = 'var(--card-bg)'
            if (mapped)                           { borderColor = 'var(--income)'; bg = 'var(--income-bg)' }
            if (isError)                          { borderColor = 'var(--expense)'; bg = 'var(--expense-bg)' }
            if (canAssign && !mapped)             { borderColor = 'var(--brand)'; bg = 'var(--brand-light)' }

            return (
              <div
                key={f.key}
                onClick={() => canAssign && assignField(f.key)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${borderColor}`,
                  background: bg,
                  cursor: canAssign ? 'pointer' : 'default',
                  transition: 'all 0.12s',
                  minHeight: 52,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                    {f.label}
                    {f.required && <span style={{ color: 'var(--expense)', marginLeft: 2 }}>*</span>}
                  </span>
                  {/* Confidence badge only when unmapped */}
                  {isEmpty && conf !== 'none' && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6,
                      color: conf === 'auto' ? 'var(--income)' : 'var(--pending)',
                      background: conf === 'auto' ? 'var(--income-bg)' : 'var(--pending-bg)',
                    }}>
                      {conf === 'auto' ? 'Auto' : 'Parsial'}
                    </span>
                  )}
                </div>

                {mapped ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--income)', fontFamily: 'monospace' }}>
                      {mapped}
                    </span>
                    <button
                      type="button"
                      onClick={e => unassignField(f.key, e)}
                      title="Hapus pemetaan"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', padding: 2, borderRadius: 4 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: canAssign ? 'var(--brand)' : 'var(--text-hint)', fontStyle: canAssign ? 'normal' : 'italic' }}>
                    {canAssign ? `Klik untuk petakan "${selectedCol}"` : f.hint}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Live mapped preview */}
      {mappedCount > 0 && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preview hasil pemetaan (3 baris)
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--page-bg)' }}>
                  {JOURNAL_FIELDS.filter(f => mapping[f.key]).map(f => (
                    <th key={f.key} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-hint)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawRows.slice(0, 3).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {JOURNAL_FIELDS.filter(f => mapping[f.key]).map(f => (
                      <td key={f.key} style={{ padding: '5px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {toStr(row[mapping[f.key]] as string | number | null) || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--expense-bg)', border: '1px solid var(--expense)', borderRadius: 8 }}>
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
            background: allRequiredOk ? 'var(--brand)' : 'var(--border)',
            color: allRequiredOk ? '#fff' : 'var(--text-hint)',
            fontSize: 13, fontWeight: 700,
            cursor: allRequiredOk ? 'pointer' : 'not-allowed',
          }}
        >
          Lanjut ke Preview →
        </button>
      </div>
    </div>
  )
}
