import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Typed db bridge — thin wrapper so renderer code stays clean
contextBridge.exposeInMainWorld('db', {
  // Companies
  listCompanies:  ()                                          => ipcRenderer.invoke('companies:list'),
  getCompany:     (id: string)                               => ipcRenderer.invoke('companies:get', id),
  upsertCompany:  (row: unknown)                             => ipcRenderer.invoke('companies:upsert', row),
  deleteCompany:  (id: string)                               => ipcRenderer.invoke('companies:delete', id),

  // Accounts
  listAccounts:   (companyId: string)                        => ipcRenderer.invoke('accounts:list', companyId),
  upsertAccount:  (row: unknown)                             => ipcRenderer.invoke('accounts:upsert', row),
  deleteAccount:  (id: string)                               => ipcRenderer.invoke('accounts:delete', id),
  bulkAccounts:   (rows: unknown[])                          => ipcRenderer.invoke('accounts:bulk-insert', rows),

  // Journal
  listJournal:    (companyId: string, filters?: unknown)     => ipcRenderer.invoke('journal:list', companyId, filters),
  getEntry:       (id: string)                               => ipcRenderer.invoke('journal:get', id),
  upsertEntry:    (entry: unknown, lines: unknown[])         => ipcRenderer.invoke('journal:upsert', entry, lines),
  deleteEntry:    (id: string)                               => ipcRenderer.invoke('journal:delete', id),
  bulkJournal:    (entries: unknown[], lines: unknown[])     => ipcRenderer.invoke('journal:bulk-insert', entries, lines),
  getLedger:      (companyId: string, accountId: string, from?: string, to?: string) =>
                    ipcRenderer.invoke('journal:ledger', companyId, accountId, from, to),
  exportJournal:  (companyId: string, filters?: unknown) =>
                    ipcRenderer.invoke('journal:export-excel', companyId, filters),

  // Reports
  exportReport:   (companyId: string, reportType: string, periodLabel: string) =>
                    ipcRenderer.invoke('reports:export', companyId, reportType, periodLabel),
  listReportHistory: (companyId: string)                     => ipcRenderer.invoke('reports:history-list', companyId),
  addReportHistory:  (row: unknown)                          => ipcRenderer.invoke('reports:history-add', row),
  getPL:             (companyId: string, from: string, to: string) => ipcRenderer.invoke('reports:pl', companyId, from, to),
  getTrialBalance:   (companyId: string, from: string, to: string) => ipcRenderer.invoke('reports:trial-balance', companyId, from, to),
})
