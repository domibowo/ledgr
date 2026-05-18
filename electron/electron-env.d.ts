/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  db: {
    // Companies
    listCompanies:     ()                                                        => Promise<unknown[]>
    getCompany:        (id: string)                                              => Promise<unknown>
    upsertCompany:     (row: unknown)                                            => Promise<{ ok: boolean }>
    deleteCompany:     (id: string)                                              => Promise<{ ok: boolean }>
    // Accounts
    listAccounts:      (companyId: string)                                       => Promise<unknown[]>
    upsertAccount:     (row: unknown)                                            => Promise<{ ok: boolean }>
    deleteAccount:     (id: string)                                              => Promise<{ ok: boolean }>
    bulkAccounts:      (rows: unknown[])                                         => Promise<{ ok: boolean; count: number }>
    // Journal
    listJournal:       (companyId: string, filters?: unknown)                    => Promise<unknown[]>
    getEntry:          (id: string)                                              => Promise<unknown>
    upsertEntry:       (entry: unknown, lines: unknown[])                        => Promise<{ ok: boolean }>
    deleteEntry:       (id: string)                                              => Promise<{ ok: boolean }>
    bulkJournal:       (entries: unknown[], lines: unknown[])                    => Promise<{ ok: boolean; count: number }>
    getLedger:         (companyId: string, accountId: string, from?: string, to?: string) => Promise<unknown[]>
    // Reports
    listReportHistory: (companyId: string)                                       => Promise<unknown[]>
    addReportHistory:  (row: unknown)                                            => Promise<{ ok: boolean }>
    getPL:             (companyId: string, from: string, to: string)             => Promise<unknown[]>
    getTrialBalance:   (companyId: string, from: string, to: string)             => Promise<unknown[]>
  }
}
