"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("db", {
  // Companies
  listCompanies: () => electron.ipcRenderer.invoke("companies:list"),
  getCompany: (id) => electron.ipcRenderer.invoke("companies:get", id),
  upsertCompany: (row) => electron.ipcRenderer.invoke("companies:upsert", row),
  deleteCompany: (id) => electron.ipcRenderer.invoke("companies:delete", id),
  // Accounts
  listAccounts: (companyId) => electron.ipcRenderer.invoke("accounts:list", companyId),
  upsertAccount: (row) => electron.ipcRenderer.invoke("accounts:upsert", row),
  deleteAccount: (id) => electron.ipcRenderer.invoke("accounts:delete", id),
  bulkAccounts: (rows) => electron.ipcRenderer.invoke("accounts:bulk-insert", rows),
  // Journal
  listJournal: (companyId, filters) => electron.ipcRenderer.invoke("journal:list", companyId, filters),
  getEntry: (id) => electron.ipcRenderer.invoke("journal:get", id),
  upsertEntry: (entry, lines) => electron.ipcRenderer.invoke("journal:upsert", entry, lines),
  deleteEntry: (id) => electron.ipcRenderer.invoke("journal:delete", id),
  bulkJournal: (entries, lines) => electron.ipcRenderer.invoke("journal:bulk-insert", entries, lines),
  getLedger: (companyId, accountId, from, to) => electron.ipcRenderer.invoke("journal:ledger", companyId, accountId, from, to),
  // Reports
  listReportHistory: (companyId) => electron.ipcRenderer.invoke("reports:history-list", companyId),
  addReportHistory: (row) => electron.ipcRenderer.invoke("reports:history-add", row),
  getPL: (companyId, from, to) => electron.ipcRenderer.invoke("reports:pl", companyId, from, to),
  getTrialBalance: (companyId, from, to) => electron.ipcRenderer.invoke("reports:trial-balance", companyId, from, to)
});
