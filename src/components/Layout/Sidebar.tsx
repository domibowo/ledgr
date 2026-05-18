import { NavLink } from 'react-router-dom'
import { useUIStore } from '../../store/ui.store'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart2,
  History,
  Building2,
  Upload,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',          labelEn: 'Dashboard' },
  { to: '/journal',        icon: BookOpen,         label: 'Jurnal',             labelEn: 'Journal' },
  { to: '/ledger',         icon: FileText,         label: 'Buku Besar',         labelEn: 'Ledger' },
  { to: '/reports',        icon: BarChart2,        label: 'Laporan',            labelEn: 'Reports' },
  { to: '/report-history', icon: History,          label: 'Riwayat Laporan',    labelEn: 'Report History' },
  { to: '/companies',      icon: Building2,        label: 'Perusahaan',         labelEn: 'Companies' },
  { to: '/import',         icon: Upload,           label: 'Import Excel',       labelEn: 'Import Excel' },
  { to: '/email',          icon: Mail,             label: 'Email',              labelEn: 'Email' },
  { to: '/settings',       icon: Settings,         label: 'Pengaturan',         labelEn: 'Settings' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, language } = useUIStore()

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 64 : 220,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo area */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        padding: sidebarCollapsed ? 0 : '0 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {!sidebarCollapsed && (
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--brand)', letterSpacing: '-0.5px' }}>
            Ledgr
          </span>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label, labelEn }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: sidebarCollapsed ? '9px 0' : '9px 12px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              borderRadius: 7,
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 400,
              background: isActive ? 'var(--brand-light)' : 'transparent',
              color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                {!sidebarCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {language === 'id' ? label : labelEn}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
