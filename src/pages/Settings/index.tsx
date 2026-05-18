import { useState } from 'react'
import {
  Globe, Moon, Sun,
  Building2, Trash2, RotateCcw, Info,
  ChevronRight, CheckCircle2,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import { useCompanyStore } from '../../store/company.store'
import { useNavigate } from 'react-router-dom'

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 8 }}>
      <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {title}
      </h2>
      {description && <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-hint)' }}>{description}</p>}
    </div>
  )
}

function SettingRow({
  icon, label, description, children,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 7,
          background: 'var(--page-bg)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          {description && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{description}</div>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SegmentedControl<T extends string>({
  value, options, onChange,
}: {
  value: T
  options: { key: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', background: 'var(--page-bg)', borderRadius: 7, padding: 3, border: '1px solid var(--border)' }}>
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          style={{
            background: value === o.key ? 'var(--brand)' : 'transparent',
            color: value === o.key ? '#fff' : 'var(--text-secondary)',
            border: 'none', borderRadius: 5, padding: '5px 13px',
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Settings() {
  const { theme, toggleTheme, language, setLanguage, sidebarCollapsed, toggleSidebar } = useUIStore()
  const { companies, activeCompanyId } = useCompanyStore()
  const navigate = useNavigate()

  const [clearDone,  setClearDone]  = useState(false)
  const [resetModal, setResetModal] = useState(false)

  const activeCompany = companies.find(c => c.id === activeCompanyId)

  function clearCache() {
    localStorage.removeItem('ledgr-email-config')
    setClearDone(true)
    setTimeout(() => setClearDone(false), 2500)
  }

  function resetAll() {
    localStorage.clear()
    window.location.reload()
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 13px', borderRadius: 7, border: '1px solid var(--border)',
    background: 'var(--card-bg)', color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Pengaturan</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 28px 0' }}>Preferensi tampilan, perusahaan, dan data</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 540 }}>

        {/* ── Tampilan ── */}
        <SectionHeader title="Tampilan" />

        <SettingRow
          icon={theme === 'light'
            ? <Sun size={15} color="var(--pending)" />
            : <Moon size={15} color="var(--brand)" />}
          label="Tema"
          description={theme === 'light' ? 'Mode Terang aktif' : 'Mode Gelap aktif'}
        >
          <SegmentedControl
            value={theme}
            options={[
              { key: 'light', label: '☀ Terang' },
              { key: 'dark',  label: '🌙 Gelap'  },
            ]}
            onChange={(v) => { if (v !== theme) toggleTheme() }}
          />
        </SettingRow>

        <SettingRow
          icon={<Globe size={15} color="var(--brand)" />}
          label="Bahasa"
          description="Bahasa antarmuka aplikasi"
        >
          <SegmentedControl
            value={language}
            options={[
              { key: 'id', label: '🇮🇩 ID' },
              { key: 'en', label: '🇺🇸 EN' },
            ]}
            onChange={setLanguage}
          />
        </SettingRow>

        <SettingRow
          icon={sidebarCollapsed
            ? <PanelLeftOpen  size={15} color="var(--brand)" />
            : <PanelLeftClose size={15} color="var(--brand)" />}
          label="Sidebar"
          description={sidebarCollapsed ? 'Sidebar sedang diciutkan' : 'Sidebar sedang terbuka'}
        >
          <button type="button" onClick={toggleSidebar} style={btnBase}>
            {sidebarCollapsed
              ? <><PanelLeftOpen  size={12} /> Tampilkan</>
              : <><PanelLeftClose size={12} /> Ciutkan</>}
          </button>
        </SettingRow>

        {/* ── Perusahaan ── */}
        <div style={{ marginTop: 12 }}>
          <SectionHeader title="Perusahaan" description="Perusahaan aktif saat ini" />
        </div>

        <SettingRow
          icon={<Building2 size={15} color="var(--brand)" />}
          label={activeCompany?.name ?? 'Belum ada perusahaan'}
          description={activeCompany
            ? `${activeCompany.currency ?? 'IDR'} · ${companies.length} perusahaan terdaftar`
            : 'Tambah perusahaan untuk memulai'}
        >
          <button
            type="button"
            onClick={() => navigate('/companies')}
            style={{ ...btnBase, color: 'var(--brand)', borderColor: 'var(--brand)' }}
          >
            Kelola <ChevronRight size={12} />
          </button>
        </SettingRow>

        {/* ── Data ── */}
        <div style={{ marginTop: 12 }}>
          <SectionHeader title="Data & Cache" description="Kelola data lokal yang tersimpan di browser" />
        </div>

        <SettingRow
          icon={<Trash2 size={15} color="var(--pending)" />}
          label="Hapus Cache Email"
          description="Menghapus konfigurasi SMTP yang tersimpan"
        >
          <button type="button" onClick={clearCache} style={btnBase}>
            {clearDone
              ? <><CheckCircle2 size={12} color="var(--income)" /> Terhapus</>
              : <><Trash2 size={12} /> Hapus</>}
          </button>
        </SettingRow>

        <SettingRow
          icon={<RotateCcw size={15} color="var(--expense)" />}
          label="Reset Semua Data"
          description="Hapus seluruh data lokal dan muat ulang aplikasi"
        >
          <button
            type="button"
            onClick={() => setResetModal(true)}
            style={{ ...btnBase, color: 'var(--expense)', borderColor: 'var(--expense)' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </SettingRow>

        {/* ── Tentang ── */}
        <div style={{ marginTop: 12 }}>
          <SectionHeader title="Tentang" />
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {([
            { label: 'Aplikasi',    value: 'Ledgr' },
            { label: 'Versi',       value: '0.1.0-alpha' },
            { label: 'Platform',    value: 'Electron + Vite + React' },
            { label: 'Dibuat oleh', value: 'Dominikus Aditya' },
          ] as const).map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 2px' }}>
          <Info size={11} color="var(--text-hint)" />
          <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
            Data disimpan secara lokal. SQLite akan diintegrasikan pada versi berikutnya.
          </span>
        </div>

      </div>

      {/* Reset confirmation modal */}
      {resetModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setResetModal(false)}
        >
          <div
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, maxWidth: 380, width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <RotateCcw size={20} color="var(--expense)" />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Reset Semua Data?</h2>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Seluruh data lokal — perusahaan, jurnal, konfigurasi email, tema — akan{' '}
              <strong style={{ color: 'var(--expense)' }}>dihapus permanen</strong> dan aplikasi akan dimuat ulang.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setResetModal(false)}
                style={{ padding: '7px 18px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={resetAll}
                style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: 'var(--expense)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
