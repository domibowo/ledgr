import { useState } from 'react'
import { Send, Paperclip, CheckCircle2, AlertCircle, X, Plus } from 'lucide-react'
import { useEmailStore } from './emailStore'
import { MOCK_REPORT_HISTORY } from '../Reports/data/mockReportData'

const REPORT_TYPE_LABEL: Record<string, string> = {
  PROFIT_LOSS:   'Laba Rugi',
  BALANCE_SHEET: 'Neraca',
  CASH_FLOW:     'Arus Kas',
  TRIAL_BALANCE: 'Trial Balance',
  AGING:         'Aging Piutang',
  LEDGER:        'Buku Besar',
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error'

export function SendReport() {
  const { config } = useEmailStore()

  const [to,          setTo]          = useState('')
  const [toList,      setToList]      = useState<string[]>([])
  const [cc,          setCc]          = useState('')
  const [subject,     setSubject]     = useState('Laporan Keuangan')
  const [body,        setBody]        = useState('Terlampir laporan keuangan periode terbaru.\n\nSalam,')
  const [attachments, setAttachments] = useState<string[]>([])
  const [status,      setStatus]      = useState<SendStatus>('idle')
  const [errors,      setErrors]      = useState<string[]>([])

  const availableReports = MOCK_REPORT_HISTORY.filter(r => r.file_name)

  function addRecipient() {
    const email = to.trim()
    if (!email || toList.includes(email)) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(['Format email tidak valid: ' + email])
      return
    }
    setToList(prev => [...prev, email])
    setTo('')
    setErrors([])
  }

  function removeRecipient(email: string) {
    setToList(prev => prev.filter(e => e !== email))
  }

  function toggleAttachment(fileName: string) {
    setAttachments(prev =>
      prev.includes(fileName) ? prev.filter(f => f !== fileName) : [...prev, fileName]
    )
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!config) errs.push('Konfigurasi SMTP belum diatur')
    if (toList.length === 0 && !to.trim()) errs.push('Minimal satu penerima wajib diisi')
    if (!subject.trim()) errs.push('Subjek email wajib diisi')
    return errs
  }

  function send() {
    let list = toList
    if (to.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
        setErrors(['Format email tidak valid: ' + to.trim()])
        return
      }
      list = [...toList, to.trim()]
    }
    const errs = validate()
    if (list.length === 0) errs.push('Minimal satu penerima wajib diisi')
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setStatus('sending')
    setTimeout(() => setStatus('sent'), 1800)
  }

  function reset() {
    setTo('')
    setToList([])
    setCc('')
    setSubject('Laporan Keuangan')
    setBody('Terlampir laporan keuangan periode terbaru.\n\nSalam,')
    setAttachments([])
    setStatus('idle')
    setErrors([])
  }

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px',
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
    fontSize: 11, fontWeight: 700, color: 'var(--text-hint)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    display: 'block', marginBottom: 5,
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <CheckCircle2 size={56} color="var(--income)" />
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Email Terkirim!</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
          Laporan berhasil dikirim ke {toList.join(', ')}.
          {attachments.length > 0 && ` (${attachments.length} lampiran)`}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
        >
          Kirim Email Lain
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 680 }}>
      {!config && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--pending-bg)', border: '1px solid var(--pending)', borderRadius: 8, marginBottom: 20 }}>
          <AlertCircle size={14} color="var(--pending)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pending)' }}>
            SMTP belum dikonfigurasi. Atur di tab Konfigurasi terlebih dahulu.
          </span>
        </div>
      )}

      {/* Recipients */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Kepada <span style={{ color: 'var(--expense)' }}>*</span></label>
        <div style={{ display: 'flex', gap: 6, marginBottom: toList.length > 0 ? 8 : 0 }}>
          <input
            style={{ ...inputStyle }}
            type="email"
            value={to}
            onChange={e => setTo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
            placeholder="email@contoh.com — Enter untuk tambah"
          />
          <button
            type="button"
            onClick={addRecipient}
            style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Plus size={14} />
          </button>
        </div>
        {toList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {toList.map(email => (
              <span
                key={email}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 14, background: 'var(--brand-light)', border: '1px solid var(--brand)', fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}
              >
                {email}
                <X size={11} style={{ cursor: 'pointer' }} onClick={() => removeRecipient(email)} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>CC</label>
        <input style={inputStyle} type="email" value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@contoh.com (opsional)" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Subjek <span style={{ color: 'var(--expense)' }}>*</span></label>
        <input style={inputStyle} value={subject} onChange={e => setSubject(e.target.value)} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Pesan</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 110, fontFamily: 'inherit', lineHeight: 1.6 }}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </div>

      {/* Attachments */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Paperclip size={11} /> Lampiran Laporan
        </label>
        {availableReports.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-hint)', margin: 0 }}>Belum ada laporan yang pernah diekspor.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {availableReports.map(r => {
              const checked = attachments.includes(r.file_name!)
              return (
                <label
                  key={r.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${checked ? 'var(--brand)' : 'var(--border)'}`, background: checked ? 'var(--brand-light)' : 'var(--card-bg)', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAttachment(r.file_name!)}
                    style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--brand)' }}
                  />
                  <span style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', color: checked ? 'var(--brand)' : 'var(--text-secondary)' }}>{r.file_name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
                    {REPORT_TYPE_LABEL[r.report_type] ?? r.report_type} · {r.period_label}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--expense-bg)', border: '1px solid var(--expense)', borderRadius: 8, marginBottom: 16 }}>
          {errors.map((e, i) => <p key={i} style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--expense)' }}>{e}</p>)}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={send}
          disabled={status === 'sending'}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 24px', borderRadius: 8, border: 'none',
            background: 'var(--brand)', color: '#fff',
            fontSize: 13, fontWeight: 700,
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            opacity: status === 'sending' ? 0.7 : 1,
          }}
        >
          <Send size={14} />
          {status === 'sending' ? 'Mengirim…' : 'Kirim Email'}
        </button>
      </div>
    </div>
  )
}
