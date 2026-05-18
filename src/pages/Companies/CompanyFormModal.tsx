import { useState } from 'react'
import { X } from 'lucide-react'
import type { Company } from '../../types/company.types'

type Props = {
  company?: Company
  onSave: (company: Company) => void
  onClose: () => void
}

function makeId() {
  return 'c-' + Math.random().toString(36).slice(2)
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export function CompanyFormModal({ company, onSave, onClose }: Props) {
  const [name, setName] = useState(company?.name ?? '')
  const [legalName, setLegalName] = useState(company?.legal_name ?? '')
  const [npwp, setNpwp] = useState(company?.npwp ?? '')
  const [address, setAddress] = useState(company?.address ?? '')
  const [phone, setPhone] = useState(company?.phone ?? '')
  const [email, setEmail] = useState(company?.email ?? '')
  const [currency, setCurrency] = useState(company?.currency ?? 'IDR')
  const [fiscalYearStart, setFiscalYearStart] = useState(company?.fiscal_year_start ?? 1)
  const [taxRate, setTaxRate] = useState(String(company?.tax_rate ?? 11))

  const canSave = name.trim() !== ''

  function handleSave() {
    if (!canSave) return
    const now = new Date().toISOString()
    onSave({
      id: company?.id ?? makeId(),
      name: name.trim(),
      legal_name: legalName.trim() || undefined,
      npwp: npwp.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      currency,
      fiscal_year_start: fiscalYearStart,
      tax_rate: parseFloat(taxRate) || 0,
      is_active: company?.is_active ?? 0,
      created_at: company?.created_at ?? now,
      updated_at: now,
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
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, width: 560, maxHeight: '90vh', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {company ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nama Perusahaan *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="PT Contoh Indonesia" style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nama Legal</label>
            <input type="text" value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Nama lengkap sesuai akta" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>NPWP</label>
            <input type="text" value={npwp} onChange={e => setNpwp(e.target.value)} placeholder="00.000.000.0-000.000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="finance@perusahaan.com" style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Alamat</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Jl. Nama Jalan No. 1, Kota" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telepon</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+62 21 1234 5678" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mata Uang</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
              <option value="IDR">IDR — Rupiah</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Awal Tahun Fiskal</label>
            <select value={fiscalYearStart} onChange={e => setFiscalYearStart(parseInt(e.target.value))} style={inputStyle}>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tarif PPN (%)</label>
            <input type="number" min={0} max={100} value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="11" style={{ ...inputStyle, textAlign: 'right' }} />
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
