import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatIDR } from '../../../utils/currency'
import type { DateRange } from '../index'

const MOCK_DATA: Record<DateRange, { label: string; pendapatan: number; pengeluaran: number }[]> = {
  month: [
    { label: 'M1', pendapatan: 3200000,  pengeluaran: 1100000 },
    { label: 'M2', pendapatan: 4100000,  pengeluaran: 1400000 },
    { label: 'M3', pendapatan: 2800000,  pengeluaran:  900000 },
    { label: 'M4', pendapatan: 2300000,  pengeluaran:  800000 },
  ],
  quarter: [
    { label: 'Jan', pendapatan: 12400000, pengeluaran: 4200000 },
    { label: 'Feb', pendapatan:  9800000, pengeluaran: 5100000 },
    { label: 'Mar', pendapatan: 16400000, pengeluaran: 5800000 },
  ],
  year: [
    { label: 'Q1', pendapatan: 38600000, pengeluaran: 14200000 },
    { label: 'Q2', pendapatan: 42100000, pengeluaran: 15800000 },
    { label: 'Q3', pendapatan: 31400000, pengeluaran: 13600000 },
    { label: 'Q4', pendapatan: 29900000, pengeluaran: 14700000 },
  ],
}

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

export function IncomeExpenseChart({ range }: { range: DateRange }) {
  const data = MOCK_DATA[range]
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 24px',
    }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
        Pendapatan vs Pengeluaran
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
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
