import * as XLSX from 'xlsx'
import type { JournalField } from './ColumnMapper'

// Keywords per field — ordered by specificity (most specific first)
const FIELD_KEYWORDS: Record<JournalField, string[][]> = {
  date:         [['tanggal transaksi'], ['tgl transaksi'], ['tanggal', 'date', 'tgl', 'posting date']],
  entry_number: [['no. jurnal', 'nomor jurnal'], ['no jurnal', 'kode jurnal'], ['jurnal', 'entry', 'nomor', 'no.', 'voucher']],
  description:  [['keterangan transaksi'], ['deskripsi transaksi'], ['keterangan', 'deskripsi', 'description', 'narasi', 'memo', 'uraian', 'remark']],
  account_code: [['kode akun', 'kode perkiraan', 'account code'], ['kode', 'code', 'no akun', 'no. akun', 'account no']],
  account_name: [['nama akun', 'nama perkiraan', 'account name'], ['nama', 'perkiraan', 'account', 'akun']],
  debit:        [['jumlah debit', 'sisi debit'], ['debit', 'db', 'd/b', 'dr']],
  credit:       [['jumlah kredit', 'sisi kredit'], ['kredit', 'credit', 'cr', 'k/b', 'cr.']],
  reference:    [['referensi', 'reference', 'no. referensi', 'no referensi'], ['ref', 'invoice', 'faktur', 'bukti']],
}

// Normalized cell value — lowercase, collapse whitespace
function norm(v: unknown): string {
  return String(v ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// Score how likely a cell value matches a field.
// Returns: 2 = phrase match, 1 = keyword match, 0 = no match
function matchScore(cell: string, keywords: string[][]): number {
  for (let tier = 0; tier < keywords.length; tier++) {
    for (const kw of keywords[tier]) {
      if (cell.includes(kw)) return 2 - tier  // tier 0 → 2, tier 1 → 1
    }
  }
  return 0
}

// Score a row for "looks like a header row".
// Returns total keyword hits across all fields.
function scoreHeaderRow(cells: string[]): number {
  let total = 0
  for (const keywords of Object.values(FIELD_KEYWORDS)) {
    const best = Math.max(...cells.map(c => matchScore(c, keywords)))
    total += best
  }
  return total
}

// Detect the most likely header row within the first maxScan rows.
// Returns the 0-based row index and normalized cell values.
export function detectHeaderRow(
  ws: XLSX.WorkSheet,
  maxScan = 12,
): { rowIndex: number; cells: string[] } {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

  let bestScore = -1
  let bestRow   = 0
  let bestCells: string[] = []

  for (let i = 0; i < Math.min(maxScan, aoa.length); i++) {
    const cells = (aoa[i] as unknown[]).map(norm)
    // Skip rows that are mostly empty
    const nonEmpty = cells.filter(c => c.length > 0)
    if (nonEmpty.length < 2) continue

    const score = scoreHeaderRow(cells)
    if (score > bestScore) {
      bestScore = score
      bestRow   = i
      bestCells = cells
    }
    // Early exit — a high-confidence hit is unlikely to be beaten
    if (score >= 8) break
  }

  return { rowIndex: bestRow, cells: bestCells }
}

export type FieldConfidence = 'auto' | 'partial' | 'none'

export type DetectionResult = {
  mapping:    Record<JournalField, string>
  confidence: Record<JournalField, FieldConfidence>
  // Original header strings (preserving case) at their detected positions
  headers:    string[]
  // Row index where data actually starts (header row + 1)
  dataStartRow: number
}

// Given the full worksheet, detect headers and produce a mapping with confidence.
export function detectMapping(ws: XLSX.WorkSheet): DetectionResult {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const { rowIndex } = detectHeaderRow(ws)

  // Original-case header strings
  const rawHeaders = (aoa[rowIndex] as unknown[]).map(v =>
    String(v ?? '').replace(/\s+/g, ' ').trim()
  ).filter(h => h.length > 0)

  // Build non-empty header list and map norm→original
  const normToOriginal: Record<string, string> = {}
  rawHeaders.forEach(h => { normToOriginal[norm(h)] = h })
  const normCells = rawHeaders.map(norm)

  const mapping: Record<JournalField, string>     = {} as Record<JournalField, string>
  const confidence: Record<JournalField, FieldConfidence> = {} as Record<JournalField, FieldConfidence>

  // Track which headers have already been claimed to avoid double-mapping
  const claimed = new Set<string>()

  for (const field of Object.keys(FIELD_KEYWORDS) as JournalField[]) {
    const keywords = FIELD_KEYWORDS[field]
    let bestMatch  = ''
    let bestScore  = 0

    for (const cell of normCells) {
      if (claimed.has(cell)) continue
      const s = matchScore(cell, keywords)
      if (s > bestScore) {
        bestScore = s
        bestMatch = cell
      }
    }

    if (bestScore >= 2) {
      mapping[field]    = normToOriginal[bestMatch] ?? bestMatch
      confidence[field] = 'auto'
      claimed.add(bestMatch)
    } else if (bestScore === 1) {
      mapping[field]    = normToOriginal[bestMatch] ?? bestMatch
      confidence[field] = 'partial'
      claimed.add(bestMatch)
    } else {
      mapping[field]    = ''
      confidence[field] = 'none'
    }
  }

  return { mapping, confidence, headers: rawHeaders, dataStartRow: rowIndex + 1 }
}

// Extract data rows starting from dataStartRow, using rawHeaders as keys.
export function extractRows(ws: XLSX.WorkSheet, dataStartRow: number, headers: string[]) {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return aoa.slice(dataStartRow)
    .map(row => {
      const record: Record<string, unknown> = {}
      headers.forEach((h, i) => { record[h] = (row as unknown[])[i] ?? '' })
      return record
    })
    .filter(r => Object.values(r).some(v => String(v ?? '').trim().length > 0))
}
