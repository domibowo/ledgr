import { useState, useEffect } from 'react'
import { FileSpreadsheet, Mail, Download } from 'lucide-react'
import { MOCK_REPORT_HISTORY } from '../Reports/data/mockReportData'
import { reportDb } from '../../lib/db'
import type { ReportHistoryRow } from '../../lib/db'
import { isElectron } from '../../lib/useDb'
import { useCompanyStore } from '../../store/company.store'

const REPORT_TYPE_LABEL: Record<string, string> = {
  PROFIT_LOSS:   'Laba Rugi',
  BALANCE_SHEET: 'Neraca',
  CASH_FLOW:     'Arus Kas',
  TRIAL_BALANCE: 'Trial Balance',
  AGING:         'Aging Piutang',
  LEDGER:        'Buku Besar',
}

const REPORT_TYPE_COLOR: Record<string, { color: string; bg: string }> = {
  PROFIT_LOSS:   { color: 'var(--income)',  bg: 'var(--income-bg)' },
  BALANCE_SHEET: { color: 'var(--brand)',   bg: 'var(--brand-light)' },
  CASH_FLOW:     { color: 'var(--pending)', bg: 'var(--pending-bg)' },
  TRIAL_BALANCE: { color: 'var(--brand)',   bg: 'var(--brand-light)' },
  AGING:         { color: 'var(--expense)', bg: 'var(--expense-bg)' },
  LEDGER:        { color: 'var(--pending)', bg: 'var(--pending-bg)' },
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ReportHistory() {
  const { activeCompanyId } = useCompanyStore()
  const [history, setHistory] = useState<ReportHistoryRow[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)

  async function handleDownload(item: ReportHistoryRow) {
    if (!isElectron || !activeCompanyId) return
    setDownloading(item.id)
    try {
      await reportDb.exportReport(activeCompanyId, item.report_type, item.period_label)
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    if (isElectron && activeCompanyId) {
      reportDb.listHistory(activeCompanyId).then(rows => {
        setHistory(rows.length > 0 ? rows : MOCK_REPORT_HISTORY as unknown as ReportHistoryRow[])
      })
    } else {
      setHistory(MOCK_REPORT_HISTORY as unknown as ReportHistoryRow[])
    }
  }, [activeCompanyId])

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-hint)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'var(--page-bg)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: 13,
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
    borderBottom: '1px solid var(--border)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Riwayat Laporan</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
        Laporan yang pernah dibuat, diekspor, dan dikirim via email
      </p>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Jenis Laporan</th>
                <th style={thStyle}>Periode</th>
                <th style={thStyle}>File</th>
                <th style={thStyle}>Dibuat</th>
                <th style={thStyle}>Dikirim ke</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => {
                const meta = REPORT_TYPE_COLOR[item.report_type] ?? { color: 'var(--text-secondary)', bg: 'var(--border)' }
                return (
                  <tr
                    key={item.id}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--page-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg }}>
                        {REPORT_TYPE_LABEL[item.report_type] ?? item.report_type}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{item.period_label}</td>
                    <td style={tdStyle}>
                      {item.file_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileSpreadsheet size={14} color="var(--income)" />
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.file_name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-hint)' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {formatDateTime(item.generated_at)}
                    </td>
                    <td style={tdStyle}>
                      {item.sent_to_email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={13} color="var(--brand)" />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.sent_to_email}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-hint)', fontSize: 12 }}>Belum dikirim</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        disabled={downloading === item.id}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: downloading === item.id ? 'wait' : 'pointer', opacity: downloading === item.id ? 0.6 : 1 }}
                      >
                        <Download size={12} />
                        {downloading === item.id ? '…' : 'Unduh'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
