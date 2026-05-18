import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/Layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { JournalEntry } from './pages/JournalEntry'
import { Ledger } from './pages/Ledger'
import { Reports } from './pages/Reports'
import { ReportHistory } from './pages/ReportHistory'
import { Companies } from './pages/Companies'
import { Import } from './pages/Import'
import { Email } from './pages/Email'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<JournalEntry />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="reports" element={<Reports />} />
          <Route path="report-history" element={<ReportHistory />} />
          <Route path="companies" element={<Companies />} />
          <Route path="import" element={<Import />} />
          <Route path="email" element={<Email />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
