import { useState, useRef, useEffect } from 'react'
import { Moon, Sun, Globe, Building2, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/ui.store'
import { useCompanyStore } from '../../store/company.store'

export function Topbar() {
  const { theme, toggleTheme, language, setLanguage } = useUIStore()
  const { companies, activeCompanyId, setActive, activeCompany } = useCompanyStore()
  const active = activeCompany()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header style={{
      height: 56,
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      {/* Company switcher */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '5px 12px',
            cursor: 'pointer',
            color: active ? 'var(--text-primary)' : 'var(--text-hint)',
          }}
        >
          <Building2 size={15} color={active ? 'var(--brand)' : 'var(--text-hint)'} />
          <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>
            {active?.name ?? (language === 'id' ? 'Pilih perusahaan' : 'Select company')}
          </span>
          <ChevronDown size={13} color="var(--text-hint)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 240,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            overflow: 'hidden',
          }}>
            {companies.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setActive(c.id); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: c.id === activeCompanyId ? 'var(--brand-light)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (c.id !== activeCompanyId) e.currentTarget.style.background = 'var(--page-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.background = c.id === activeCompanyId ? 'var(--brand-light)' : 'transparent' }}
              >
                <Building2 size={14} color={c.id === activeCompanyId ? 'var(--brand)' : 'var(--text-hint)'} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.id === activeCompanyId ? 'var(--brand)' : 'var(--text-primary)' }}>
                  {c.name}
                </span>
                {c.id === activeCompanyId && <CheckCircle2 size={14} color="var(--brand)" />}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { navigate('/companies'); setOpen(false) }}
              style={{
                width: '100%',
                padding: '9px 14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--brand)',
                textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--page-bg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              + Kelola perusahaan
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} style={btnStyle} title="Toggle language">
          <Globe size={16} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>{language.toUpperCase()}</span>
        </button>
        <button onClick={toggleTheme} style={btnStyle} title="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  )
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 7,
  padding: '5px 10px',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontSize: 13,
}
