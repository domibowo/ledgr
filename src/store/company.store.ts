import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company } from '../types/company.types'

interface CompanyState {
  companies: Company[]
  activeCompanyId: string | null
  setCompanies: (companies: Company[]) => void
  setActive: (id: string) => void
  activeCompany: () => Company | null
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      activeCompanyId: null,
      setCompanies: (companies) => set({ companies }),
      setActive: (id) => set({ activeCompanyId: id }),
      activeCompany: () => {
        const { companies, activeCompanyId } = get()
        return companies.find((c) => c.id === activeCompanyId) ?? null
      },
    }),
    { name: 'ledgr-company' }
  )
)
