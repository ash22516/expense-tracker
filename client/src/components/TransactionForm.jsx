import { useEffect, useState } from 'react';
import { CATEGORIES, today } from '../utils/format.js';

const blank = (type = 'expense') => ({
  type,
  amount: '',
  category: CATEGORIES[type][0],
  date: today(),
  note: '',
});

export default function TransactionForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(blank());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Fill the form when "Edit" is clicked, empty it when editing stops.
  useEffect(() => {
    setError('');
    if (editing) {
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        category: editing.category,
        date: editing.date.slice(0, 10),
        note: editing.note || '',
      });
    } else {
      setForm(blank());
    }
  }, [editing]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function chooseType(type) {
    setForm({ ...form, type, category: CATEGORIES[type][0] });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    setBusy(true);
    try {
      await onSave({ ...form, amount });
      if (!editing) setForm(blank(form.type));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h2>{editing ? 'Edit transaction' : 'Add a transaction'}</h2>

      <div className="toggle" role="group" aria-label="Type">
        <button type="button" className={form.type === 'expense' ? 'on out' : ''} onClick={() => chooseType('expense')}>
          Money out
        </button>
        <button type="button" className={form.type === 'income' ? 'on in' : ''} onClick={() => chooseType('income')}>
          Money in
        </button>
      </div>

      <label>
        Amount
        <input type="number" step="0.01" min="0" inputMode="decimal" value={form.amount} onChange={set('amount')} placeholder="0.00" required />
      </label>

      <div className="two">
        <label>
          Category
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES[form.type].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={form.date} onChange={set('date')} required />
        </label>
      </div>

      <label>
        Note (optional)
        <input value={form.note} onChange={set('note')} maxLength={200} placeholder="What was it for?" />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="row">
        <button className="primary" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : form.type === 'income' ? 'Add income' : 'Add expense'}
        </button>
        {editing && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
