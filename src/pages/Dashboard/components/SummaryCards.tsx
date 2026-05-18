import { TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-react'
import { formatIDR } from '../../../utils/currency'

interface Props {
  income: number
  expense: number
  pending: number
  netProfit: number
}

interface CardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bg: string
  trend?: number
}

function StatCard({ label, value, icon, color, bg, trend }: CardProps) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color }}>
            {formatIDR(value)}
          </div>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ fontSize: 12, color: trend >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 500 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs bulan lalu
        </div>
      )}
    </div>
  )
}

export function SummaryCards({ income, expense, pending, netProfit }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      <StatCard
        label="Total Pendapatan"
        value={income}
        icon={<TrendingUp size={20} />}
        color="var(--income)"
        bg="var(--income-bg)"
        trend={12}
      />
      <StatCard
        label="Total Pengeluaran"
        value={expense}
        icon={<TrendingDown size={20} />}
        color="var(--expense)"
        bg="var(--expense-bg)"
        trend={-5}
      />
      <StatCard
        label="Menunggu Pembayaran"
        value={pending}
        icon={<Clock size={20} />}
        color="var(--pending)"
        bg="var(--pending-bg)"
      />
      <StatCard
        label="Laba Bersih"
        value={netProfit}
        icon={<Wallet size={20} />}
        color={netProfit >= 0 ? 'var(--income)' : 'var(--expense)'}
        bg={netProfit >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)'}
        trend={8}
      />
    </div>
  )
}
