import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUIStore } from '../../store/ui.store'
import { useCompanyStore } from '../../store/company.store'
import { companyDb } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { MOCK_COMPANIES } from '../../pages/Companies/data/mockCompanies'

export function AppLayout() {
  const theme = useUIStore((s) => s.theme)
  const { companies, activeCompanyId, setCompanies, setActive } = useCompanyStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
  }, [theme])

  useEffect(() => {
    if (!isElectron) return
    companyDb.list().then(rows => {
      if (rows.length > 0) {
        // SQLite is authoritative — sync to store
        setCompanies(rows)
        if (!activeCompanyId || !rows.find(r => r.id === activeCompanyId)) {
          setActive(rows[0].id)
        }
      } else {
        // SQLite empty — seed from store or mock, then re-read
        const toSeed = companies.length > 0 ? companies : MOCK_COMPANIES
        Promise.all(toSeed.map(c => companyDb.upsert(c))).then(() =>
          companyDb.list().then(seeded => {
            setCompanies(seeded)
            if (!activeCompanyId || !seeded.find(r => r.id === activeCompanyId)) {
              setActive(seeded[0].id)
            }
          })
        )
      }
    })
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--page-bg)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
