import { useEffect, useState } from 'react'
import { PlusCircle, Pencil, CheckCircle2, Building2, Mail, Phone, MapPin } from 'lucide-react'
import type { Company } from '../../types/company.types'
import { useCompanyStore } from '../../store/company.store'
import { companyDb } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { MOCK_COMPANIES } from './data/mockCompanies'
import { CompanyFormModal } from './CompanyFormModal'

export function Companies() {
  const { companies, activeCompanyId, setCompanies, setActive } = useCompanyStore()
  const [modal, setModal] = useState<{ open: boolean; company?: Company }>({ open: false })

  useEffect(() => {
    if (isElectron) {
      companyDb.list().then(rows => {
        if (rows.length > 0) {
          setCompanies(rows)
          if (!activeCompanyId) setActive(rows[0].id)
        } else if (companies.length === 0) {
          // seed mock data into DB on first run
          Promise.all(MOCK_COMPANIES.map(c => companyDb.upsert(c))).then(() => {
            setCompanies(MOCK_COMPANIES)
            setActive(MOCK_COMPANIES[0].id)
          })
        }
      })
    } else if (companies.length === 0) {
      setCompanies(MOCK_COMPANIES)
      setActive(MOCK_COMPANIES[0].id)
    }
  }, [])

  async function handleSave(company: Company) {
    if (isElectron) await companyDb.upsert(company)
    const idx = companies.findIndex(c => c.id === company.id)
    if (idx >= 0) {
      const next = [...companies]; next[idx] = company; setCompanies(next)
    } else {
      setCompanies([...companies, company])
    }
    setModal({ open: false })
  }

  const list = companies.length > 0 ? companies : MOCK_COMPANIES

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Perusahaan</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
        Kelola profil perusahaan dan pilih perusahaan aktif
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setModal({ open: true })}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <PlusCircle size={15} />
          Tambah Perusahaan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {list.map(company => {
          const isActive = company.id === activeCompanyId
          return (
            <div
              key={company.id}
              style={{
                background: 'var(--card-bg)',
                border: `2px solid ${isActive ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
                transition: 'border-color 0.15s',
              }}
            >
              {isActive && (
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  <CheckCircle2 size={11} />
                  Aktif
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: isActive ? 'var(--brand-light)' : 'var(--page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={22} color={isActive ? 'var(--brand)' : 'var(--text-hint)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{company.name}</div>
                  {company.legal_name && company.legal_name !== company.name && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{company.legal_name}</div>
                  )}
                  {company.npwp && (
                    <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2, fontFamily: 'monospace' }}>NPWP: {company.npwp}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {company.address && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <MapPin size={13} color="var(--text-hint)" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{company.address}</span>
                  </div>
                )}
                {company.phone && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Phone size={13} color="var(--text-hint)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Mail size={13} color="var(--text-hint)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{company.email}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Mata Uang', value: company.currency },
                  { label: 'PPN', value: `${company.tax_rate}%` },
                  { label: 'Awal FY', value: `Bulan ${company.fiscal_year_start}` },
                ].map(item => (
                  <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => setActive(company.id)}
                    style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 7, background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Aktifkan
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModal({ open: true, company })}
                  style={{ flex: isActive ? 1 : 0, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Pencil size={13} /> Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {modal.open && (
        <CompanyFormModal
          company={modal.company}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
