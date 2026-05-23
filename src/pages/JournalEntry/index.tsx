import { useEffect, useState } from 'react'
import type { JournalEntry } from '../../types/transaction.types'
import { MOCK_ENTRIES } from './data/mockEntries'
import { JournalList } from './JournalList'
import { JournalForm } from './JournalForm'
import { journalDb } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { useCompanyStore } from '../../store/company.store'

type View = 'list' | 'form'

function buildNextNumber(entries: JournalEntry[]): string {
  const year = new Date().getFullYear()
  const max = entries
    .map(e => {
      const match = e.entry_number.match(/JE-\d{4}-(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    .reduce((a, b) => Math.max(a, b), 0)
  return `JE-${year}-${String(max + 1).padStart(3, '0')}`
}

export function JournalEntry() {
  const { activeCompanyId } = useCompanyStore()
  const [view,    setView]    = useState<View>('list')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isElectron || !activeCompanyId) {
      setEntries(MOCK_ENTRIES)
      setLoading(false)
      return
    }
    journalDb.list(activeCompanyId).then(rows => {
      if (rows.length > 0) {
        setEntries(rows)
      } else {
        // seed mock entries on first run
        const entriesToSeed = MOCK_ENTRIES.map(e => ({ ...e, company_id: activeCompanyId }))
        const linesToSeed = MOCK_ENTRIES.flatMap(e => (e.lines ?? []).map(l => ({
          id: l.id, entry_id: e.id, account_id: l.account_id,
          type: l.type, amount: l.amount, description: l.description ?? undefined, sort_order: l.sort_order,
        })))
        journalDb.bulk(entriesToSeed, linesToSeed).then(() =>
          journalDb.list(activeCompanyId).then(setEntries)
        )
      }
      setLoading(false)
    })
  }, [activeCompanyId])

  async function handleSave(entry: JournalEntry) {
    try {
      if (isElectron && activeCompanyId) {
        const entryRow = { ...entry, company_id: activeCompanyId }
        const lines = (entry.lines ?? []).map(l => ({
          id: l.id, entry_id: entry.id, account_id: l.account_id,
          type: l.type, amount: l.amount, description: l.description ?? undefined, sort_order: l.sort_order,
        }))
        await journalDb.upsert(entryRow, lines)
        const fresh = await journalDb.list(activeCompanyId)
        setEntries(fresh)
      } else {
        setEntries(prev => [entry, ...prev])
      }
      setView('list')
    } catch (err) {
      console.error('Failed to save journal entry:', err)
      alert(`Gagal menyimpan entri jurnal: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
        Jurnal Umum
      </h1>
      {loading ? (
        <p style={{ color: 'var(--text-hint)', fontSize: 13 }}>Memuat data…</p>
      ) : view === 'list' ? (
        <JournalList
          entries={entries}
          onNew={() => setView('form')}
          onView={() => {}}
          companyId={activeCompanyId ?? undefined}
        />
      ) : (
        <JournalForm
          nextNumber={buildNextNumber(entries)}
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  )
}
