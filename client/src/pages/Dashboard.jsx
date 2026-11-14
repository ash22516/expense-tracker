import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { currentMonth, monthLabel, shiftMonth } from '../utils/format.js';
import { downloadCsv } from '../utils/csv.js';
import Summary from '../components/Summary.jsx';
import Charts from '../components/Charts.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Wait a moment after typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const refresh = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams({ month });
      if (type) params.set('type', type);
      if (query) params.set('q', query);
      const [list, sum] = await Promise.all([
        api.get(`/transactions?${params}`),
        api.get(`/transactions/summary?month=${month}`),
      ]);
      setItems(list.items);
      setSummary(sum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, type, query]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save(data) {
    if (editing) {
      await api.put(`/transactions/${editing._id}`, data);
      setEditing(null);
    } else {
      await api.post('/transactions', data);
    }
    // Jump to the month of the saved date so the person sees it.
    const savedMonth = data.date.slice(0, 7);
    if (savedMonth !== month) setMonth(savedMonth);
    else await refresh();
  }

  async function remove(item) {
    if (!window.confirm(`Delete this ${item.type} of ${item.amount}?`)) return;
    try {
      await api.del(`/transactions/${item._id}`);
      if (editing && editing._id === item._id) setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="top">
        <h1>Expense Tracker</h1>
        <div className="who">
          <span className="muted">{user.name}</span>
          <button onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className="monthbar">
        <button aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <h2>{monthLabel(month)}</h2>
        <button aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
        {month !== currentMonth() && (
          <button className="small" onClick={() => setMonth(currentMonth())}>This month</button>
        )}
      </div>

      <Summary summary={summary} />

      {error && <p className="error banner" role="alert">{error}</p>}

      <div className="grid">
        <div className="col">
          <TransactionForm editing={editing} onSave={save} onCancel={() => setEditing(null)} />
          <Charts summary={summary} />
        </div>

        <section className="panel list">
          <div className="list-head">
            <h2>Transactions</h2>
            <div className="filters">
              <input
                type="search"
                placeholder="Search notes or categories"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search transactions"
              />
              <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
                <option value="">All</option>
                <option value="expense">Money out</option>
                <option value="income">Money in</option>
              </select>
              <button className="small" disabled={items.length === 0} onClick={() => downloadCsv(items, `transactions-${month}.csv`)}>
                Export CSV
              </button>
            </div>
          </div>
          {loading ? <p className="empty">Loading…</p> : <TransactionList items={items} onEdit={setEditing} onDelete={remove} />}
        </section>
      </div>
    </div>
  );
}
