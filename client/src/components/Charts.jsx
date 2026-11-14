import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '../utils/format.js';

const COLORS = ['#274690', '#1E7B5A', '#B8433A', '#C58B1B', '#6B4E9B', '#2A8CA0', '#7A8794', '#A65F2A', '#4F7A28'];

export default function Charts({ summary }) {
  if (!summary) return null;
  const { byCategory, monthly } = summary;
  const hasMonthly = monthly.some((m) => m.income || m.expense);

  return (
    <>
      <section className="panel">
        <h2>Where the money went</h2>
        {byCategory.length === 0 ? (
          <p className="empty">No expenses this month yet.</p>
        ) : (
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="total" nameKey="category" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {byCategory.map((c, i) => (
                    <Cell key={c.category} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Last 6 months</h2>
        {!hasMonthly ? (
          <p className="empty">Add some transactions to see the trend.</p>
        ) : (
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9E0E7" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" name="Money in" fill="#1E7B5A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Money out" fill="#B8433A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </>
  );
}
