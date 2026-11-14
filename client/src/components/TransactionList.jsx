import { formatMoney, shortDate } from '../utils/format.js';

export default function TransactionList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return <p className="empty">Nothing here yet. Add a transaction, or change the month or filters.</p>;
  }

  return (
    <ul className="ledger">
      {items.map((t) => (
        <li key={t._id}>
          <span className="date">{shortDate(t.date)}</span>
          <span className="what">
            <strong>{t.category}</strong>
            {t.note && <small className="muted">{t.note}</small>}
          </span>
          <span className={`amount ${t.type === 'income' ? 'pos' : 'neg'}`}>
            {t.type === 'income' ? '+' : '−'}
            {formatMoney(t.amount)}
          </span>
          <span className="actions">
            <button type="button" className="small" onClick={() => onEdit(t)} aria-label={`Edit ${t.category} on ${shortDate(t.date)}`}>
              Edit
            </button>
            <button type="button" className="small danger" onClick={() => onDelete(t)} aria-label={`Delete ${t.category} on ${shortDate(t.date)}`}>
              Delete
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
