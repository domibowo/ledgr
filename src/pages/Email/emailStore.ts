import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type EmailProvider = 'gmail' | 'outlook' | 'yahoo' | 'custom'

export type SmtpConfig = {
  provider: EmailProvider
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from_name: string
  from_email: string
}

const PROVIDER_PRESETS: Record<EmailProvider, Partial<SmtpConfig>> = {
  gmail:   { host: 'smtp.gmail.com',      port: 587, secure: false },
  outlook: { host: 'smtp.office365.com',  port: 587, secure: false },
  yahoo:   { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  custom:  { host: '',                    port: 587, secure: false },
}

export { PROVIDER_PRESETS }

type EmailStore = {
  config: SmtpConfig | null
  setConfig: (c: SmtpConfig) => void
  clearConfig: () => void
}

export const useEmailStore = create<EmailStore>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (c) => set({ config: c }),
      clearConfig: () => set({ config: null }),
    }),
    { name: 'ledgr-email-config' },
  ),
)
