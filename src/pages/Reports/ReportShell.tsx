import { Download } from 'lucide-react'

type Props = {
  title: string
  period: string
  children: React.ReactNode
}

export const sectionHeaderStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--brand)',
  background: 'var(--brand-light)',
  borderTop: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
}

export const lineStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 16px 8px 32px',
  fontSize: 13,
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border)',
}

export const subtotalStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '9px 16px',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-primary)',
  background: 'var(--page-bg)',
  borderBottom: '1px solid var(--border)',
}

export const grandTotalStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--brand)',
  borderTop: '2px solid var(--brand)',
}

export function ReportShell({ title, period, children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--page-bg)' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{period}</div>
        </div>
        <button
          type="button"
          onClick={() => alert('Export Excel akan tersedia setelah integrasi ExcelJS')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <Download size={13} />
          Export Excel
        </button>
      </div>
      {children}
    </div>
  )
}
