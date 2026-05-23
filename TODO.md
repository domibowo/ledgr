# Ledgr — TODO

## In Progress
_Nothing currently in progress._

---

## Backlog

### Import / Upload Reports
- [ ] **Heuristic header detection** — scan first ~10 rows for Indonesian accounting keywords to auto-detect columns (Debit, Kredit, Saldo, Uraian, Kode Akun, etc.)
- [ ] **Column mapping UI** — when headers can't be auto-matched, show a preview table and let user assign columns to expected fields
- [ ] **Mapping profiles** — save column mappings keyed by structural fingerprint (headers hash + sheet name + first-data-row); auto-apply on next upload of same template
- [ ] **Staging / diff preview** — parsed rows go into draft table first; show green=new, yellow=changed, gray=duplicate before committing
- [ ] **Smart deduplication** — match incoming rows by natural key (date + account code + amount + description) before insert; skip exact duplicates, flag near-duplicates
- [ ] **Partial field inference** — infer debit/credit from signed "Jumlah" column when individual columns are empty/merged
- [ ] **Correction memory** — store manual corrections tied to original raw string; auto-apply same correction on future uploads
- [ ] **Download Template button** — offer official import template so users can skip mapping entirely

### Reports
- [ ] Test Excel export (Unduh) for all report types after dev server restart
- [ ] Verify CaLK and Perubahan Modal sheets render correctly in Excel

### Dashboard
- [ ] Replace mock data with real data from SQLite once journal entries exist
- [ ] Dashboard summary cards (income/expense/pending) should derive from actual journal entries

### Journal Entry
- [ ] Bulk import from Excel (journal entries)

### General / UX
- [ ] Empty state illustrations for pages with no data
- [ ] Loading skeletons for async data fetches

---

## Completed
- [x] README with project description, tech stack, setup instructions
- [x] Demo video embedded in README
- [x] Dashboard range filter (Bulan Ini / Kuartal Ini / Tahun Ini) — mock data per range
- [x] Report History "Unduh" button — real Excel export with structured sheets per report type
- [x] Excel report templates: Laba Rugi, Neraca, Arus Kas, Trial Balance, Aging Piutang, Buku Besar
- [x] CaLK (Catatan Atas Laporan Keuangan) sheet included in relevant reports
- [x] Perubahan Modal sheet for P&L and Balance Sheet exports
