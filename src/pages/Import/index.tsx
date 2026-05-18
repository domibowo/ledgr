import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, X, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { ColumnMapper } from './ColumnMapper'
import { ImportPreview } from './ImportPreview'

export type ImportMode = 'journal' | 'accounts'

export type RawRow = Record<string, string | number | null>

export type MappedRow = {
  date: string
  entry_number: string
  description: string
  account_code: string
  account_name: string
  debit: number
  credit: number
  reference: string
}

type Step = 'upload' | 'map' | 'preview'

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: 'upload',  label: '1. Upload File' },
  { key: 'map',     label: '2. Petakan Kolom' },
  { key: 'preview', label: '3. Preview & Import' },
]

export function Import() {
  const [step, setStep]             = useState<Step>('upload')
  const [mode, setMode]             = useState<ImportMode>('journal')
  const [fileName, setFileName]     = useState('')
  const [headers, setHeaders]       = useState<string[]>([])
  const [rawRows, setRawRows]       = useState<RawRow[]>([])
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([])
  const [dragOver, setDragOver]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const wb   = XLSX.read(data, { type: 'array' })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: null })
      if (json.length === 0) return
      setHeaders(Object.keys(json[0]))
      setRawRows(json)
      setStep('map')
    }
    reader.readAsArrayBuffer(file)
  }, [])

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      processFile(file)
    }
  }

  function reset() {
    setStep('upload')
    setFileName('')
    setHeaders([])
    setRawRows([])
    setMappedRows([])
    if (inputRef.current) inputRef.current.value = ''
  }

  const activeStep = STEP_LABELS.findIndex(s => s.key === step)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Import Excel</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
        Upload file Excel atau CSV, petakan kolom, lalu import data jurnal ke Ledgr
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {STEP_LABELS.map((s, i) => {
          const done    = i < activeStep
          const current = i === activeStep
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 20,
                background: current ? 'var(--brand)' : done ? 'var(--income-bg)' : 'var(--card-bg)',
                border: `1px solid ${current ? 'var(--brand)' : done ? 'var(--income)' : 'var(--border)'}`,
                fontSize: 12, fontWeight: 700,
                color: current ? '#fff' : done ? 'var(--income)' : 'var(--text-hint)',
                transition: 'all 0.2s',
              }}>
                {done && <CheckCircle2 size={13} />}
                {s.label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <ChevronRight size={14} color="var(--text-hint)" style={{ margin: '0 4px' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mode selector (upload step only) */}
      {step === 'upload' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['journal', 'accounts'] as ImportMode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: '6px 18px', borderRadius: 8, border: '1px solid',
                borderColor: mode === m ? 'var(--brand)' : 'var(--border)',
                background: mode === m ? 'var(--brand-light)' : 'var(--card-bg)',
                color: mode === m ? 'var(--brand)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {m === 'journal' ? 'Jurnal / Transaksi' : 'Daftar Akun (CoA)'}
            </button>
          ))}
        </div>
      )}

      {/* Upload drop zone */}
      {step === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            background: dragOver ? 'var(--brand-light)' : 'var(--card-bg)',
            border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '64px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Upload size={44} color={dragOver ? 'var(--brand)' : 'var(--text-hint)'} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              Drag & drop file di sini, atau klik untuk memilih
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-hint)' }}>
              Mendukung .xlsx, .xls, .csv
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={onFileInput}
          />
          <TemplateHint mode={mode} />
        </div>
      )}

      {/* Map / Preview steps */}
      {step !== 'upload' && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--page-bg)' }}>
            <FileSpreadsheet size={15} color="var(--income)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{fileName}</span>
            <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>{rawRows.length} baris data</span>
            <button
              type="button"
              onClick={reset}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', padding: 4 }}
            >
              <X size={15} />
            </button>
          </div>

          {step === 'map' && (
            <ColumnMapper
              mode={mode}
              headers={headers}
              rawRows={rawRows}
              onConfirm={(rows) => { setMappedRows(rows); setStep('preview') }}
            />
          )}
          {step === 'preview' && (
            <ImportPreview
              mode={mode}
              mappedRows={mappedRows}
              onBack={() => setStep('map')}
              onSuccess={reset}
            />
          )}
        </div>
      )}
    </div>
  )
}

function TemplateHint({ mode }: { mode: ImportMode }) {
  const cols = mode === 'journal'
    ? 'Tanggal | No. Jurnal | Keterangan | Kode Akun | Nama Akun | Debit | Kredit | Referensi'
    : 'Kode | Nama Akun | Tipe | Normal Balance | Aktif'
  return (
    <div style={{ marginTop: 8, padding: '10px 16px', background: 'var(--page-bg)', borderRadius: 8, border: '1px solid var(--border)', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <AlertCircle size={13} color="var(--pending)" style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Format kolom yang disarankan:</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{cols}</p>
        </div>
      </div>
    </div>
  )
}
