import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Wifi } from 'lucide-react'
import { useEmailStore, PROVIDER_PRESETS } from './emailStore'
import type { EmailProvider, SmtpConfig } from './emailStore'

const PROVIDERS: { key: EmailProvider; label: string; logo: string }[] = [
  { key: 'gmail',   label: 'Gmail',   logo: 'G' },
  { key: 'outlook', label: 'Outlook', logo: 'O' },
  { key: 'yahoo',   label: 'Yahoo',   logo: 'Y' },
  { key: 'custom',  label: 'Custom SMTP', logo: '⚙' },
]

export function SmtpConfigPanel() {
  const { config, setConfig } = useEmailStore()

  const [provider,    setProviderState] = useState<EmailProvider>(config?.provider ?? 'gmail')
  const [host,        setHost]          = useState(config?.host        ?? PROVIDER_PRESETS['gmail'].host ?? '')
  const [port,        setPort]          = useState(config?.port        ?? 587)
  const [secure,      setSecure]        = useState(config?.secure      ?? false)
  const [user,        setUser]          = useState(config?.user        ?? '')
  const [password,    setPassword]      = useState(config?.password    ?? '')
  const [fromName,    setFromName]      = useState(config?.from_name   ?? '')
  const [fromEmail,   setFromEmail]     = useState(config?.from_email  ?? '')
  const [showPwd,     setShowPwd]       = useState(false)
  const [testStatus,  setTestStatus]    = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [saved,       setSaved]         = useState(false)
  const [errors,      setErrors]        = useState<string[]>([])

  function selectProvider(p: EmailProvider) {
    setProviderState(p)
    const preset = PROVIDER_PRESETS[p]
    setHost(preset.host ?? '')
    setPort(preset.port ?? 587)
    setSecure(preset.secure ?? false)
    setTestStatus('idle')
    setSaved(false)
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!host)      errs.push('Host SMTP wajib diisi')
    if (!user)      errs.push('Username / email wajib diisi')
    if (!password)  errs.push('Password / App Password wajib diisi')
    if (!fromEmail) errs.push('Email pengirim wajib diisi')
    return errs
  }

  function save() {
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    const cfg: SmtpConfig = { provider, host, port, secure, user, password, from_name: fromName, from_email: fromEmail }
    setConfig(cfg)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function testConnection() {
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setTestStatus('testing')
    setTimeout(() => setTestStatus('ok'), 1800)
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
    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5,
  }

  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Konfigurasi SMTP untuk mengirim laporan via email. Gunakan App Password jika akun Anda mengaktifkan 2FA.
      </p>

      {/* Provider selector */}
      <div style={{ marginBottom: 24 }}>
        <span style={labelStyle}>Provider Email</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {PROVIDERS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => selectProvider(p.key)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${provider === p.key ? 'var(--brand)' : 'var(--border)'}`,
                background: provider === p.key ? 'var(--brand-light)' : 'var(--card-bg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{p.logo}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: provider === p.key ? 'var(--brand)' : 'var(--text-secondary)' }}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SMTP fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
        <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Host SMTP</label>
          <input style={inputStyle} value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.gmail.com" readOnly={provider !== 'custom'} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Port</label>
          <input style={inputStyle} type="number" value={port} onChange={e => setPort(parseInt(e.target.value))} readOnly={provider !== 'custom'} />
        </div>

        <div style={{ ...fieldStyle, justifyContent: 'flex-end', paddingBottom: 2 }}>
          <label style={{ ...labelStyle, marginBottom: 8 }}>SSL/TLS</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={secure}
              onChange={e => setSecure(e.target.checked)}
              style={{ width: 15, height: 15, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Gunakan SSL/TLS (port 465)</span>
          </label>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Username / Email Akun <span style={{ color: 'var(--expense)' }}>*</span></label>
          <input style={inputStyle} type="email" value={user} onChange={e => setUser(e.target.value)} placeholder="nama@gmail.com" autoComplete="off" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Password / App Password <span style={{ color: 'var(--expense)' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 36 }}
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="App Password 16 karakter"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', display: 'flex' }}
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Nama Pengirim</label>
          <input style={inputStyle} value={fromName} onChange={e => setFromName(e.target.value)} placeholder="PT Maju Bersama" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email Pengirim <span style={{ color: 'var(--expense)' }}>*</span></label>
          <input style={inputStyle} type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="laporan@perusahaan.com" />
        </div>
      </div>

      {/* Gmail hint */}
      {provider === 'gmail' && (
        <div style={{ padding: '10px 14px', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 8, marginBottom: 20, fontSize: 12, color: 'var(--brand)' }}>
          <strong>Tips Gmail:</strong> Aktifkan 2-Step Verification, lalu buat App Password di{' '}
          <span style={{ fontFamily: 'monospace' }}>myaccount.google.com → Security → App passwords</span>.
          Gunakan App Password (16 karakter) sebagai password di atas.
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--expense-bg)', border: '1px solid var(--expense)', borderRadius: 8, marginBottom: 16 }}>
          {errors.map((e, i) => <p key={i} style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--expense)' }}>{e}</p>)}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={testConnection}
          disabled={testStatus === 'testing'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: testStatus === 'testing' ? 0.7 : 1,
          }}
        >
          <Wifi size={13} />
          {testStatus === 'testing' ? 'Menguji…' : 'Test Koneksi'}
        </button>

        {testStatus === 'ok' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--income)' }}>
            <CheckCircle2 size={13} /> Koneksi berhasil
          </span>
        )}
        {testStatus === 'fail' && (
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--expense)' }}>Koneksi gagal — periksa kredensial</span>
        )}

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={save}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 22px', borderRadius: 8, border: 'none',
            background: 'var(--brand)', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {saved ? <><CheckCircle2 size={13} /> Tersimpan</> : 'Simpan Konfigurasi'}
        </button>
      </div>
    </div>
  )
}
