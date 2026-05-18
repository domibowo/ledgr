import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatIDR } from '../../../utils/currency'

const MOCK_DATA = [
  { month: 'Jan', pendapatan: 12400000, pengeluaran: 4200000 },
  { month: 'Feb', pendapatan: 9800000,  pengeluaran: 5100000 },
  { month: 'Mar', pendapatan: 15200000, pengeluaran: 6300000 },
  { month: 'Apr', pendapatan: 11000000, pengeluaran: 4800000 },
  { month: 'Mei', pendapatan: 13600000, pengeluaran: 5500000 },
  { month: 'Jun', pendapatan: 16200000, pengeluaran: 7100000 },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill, marginBottom: 2 }}>
          {p.name}: {formatIDR(p.value)}
        </div>
      ))}
    </div>
  )
}

export function IncomeExpenseChart() {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 24px',
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
        Pendapatan vs Pengeluaran
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={MOCK_DATA} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)', opacity: 0.3 }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="pendapatan" name="Pendapatan" fill="var(--income)" radius={[4,4,0,0]} />
          <Bar dataKey="pengeluaran" name="Pengeluaran" fill="var(--expense)" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
