# Ledgr

A desktop accounting application for Indonesian small businesses, built with Electron, React, and SQLite.

## Demo

https://github.com/user-attachments/assets/36d40eff-22bb-4849-a63b-1740424ccc2c

## Features

- **Journal Entry** — create, view, and export double-entry journal entries to Excel
- **General Ledger** — per-account transaction history
- **Reports** — financial statements and report history
- **Import** — bulk import journal data
- **Multi-company** — manage multiple companies with isolated data
- **Dark / light theme**

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 30 |
| Frontend | React 18, React Router 7, Zustand 5 |
| Database | SQLite via `better-sqlite3` |
| Charts | Recharts |
| Excel export | `xlsx` |
| Build | Vite 5, `vite-plugin-electron`, TypeScript 5 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

The `postinstall` script rebuilds `better-sqlite3` native bindings for Electron automatically.

### Development

```bash
npm run dev
```

Starts Vite dev server with Electron. The app opens automatically.

### Production Build

```bash
npm run build
```

Outputs a distributable in `dist/` via `electron-builder`.

## Project Structure

```
electron/          # Main process & preload
  ipc/             # IPC handlers (journal, accounts, companies, …)
  db.ts            # SQLite connection & schema setup
  preload.ts       # contextBridge API surface

src/
  pages/           # Route-level components
    JournalEntry/
    Ledger/
    Reports/
    Companies/
    Dashboard/
    Import/
    Settings/
  components/      # Shared UI (Layout, Sidebar, Topbar, …)
  lib/             # db bridge, hooks
  store/           # Zustand stores (company, UI)
  types/           # Shared TypeScript types
  utils/           # Currency, date formatters
```

## Database

SQLite database is stored in the user's app data directory. The schema is created automatically on first launch. Foreign key constraints are enforced; the `companies` and `accounts` tables are seeded with defaults on first run.

## License

Private — all rights reserved.
