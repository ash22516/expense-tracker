import { formatMoney } from '../utils/format.js';

export default function Summary({ summary }) {
  const s = summary || { income: 0, expense: 0, balance: 0 };
  return (
    <section className="summary" aria-label="Monthly summary">
      <div className="balance">
        <span className="muted">Left this month</span>
        <strong className={s.balance < 0 ? 'neg' : ''}>{formatMoney(s.balance)}</strong>
      </div>
      <div>
        <span className="muted">Money in</span>
        <strong className="pos">{formatMoney(s.income)}</strong>
      </div>
      <div>
        <span className="muted">Money out</span>
        <strong className="neg">{formatMoney(s.expense)}</strong>
      </div>
    </section>
  );
}
