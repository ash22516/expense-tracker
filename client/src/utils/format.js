const DEFAULT_CURRENCY = 'NZD';
const FALLBACK = ['NZD', 'NPR', 'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CNY', 'AED', 'SGD', 'CHF'];

// The chosen currency is remembered in the browser.
export const getCurrency = () => localStorage.getItem('currency') || DEFAULT_CURRENCY;
export const setCurrency = (code) => localStorage.setItem('currency', code);

export const CURRENCY_LIST = (() => {
  try {
    const list = Intl.supportedValuesOf('currency');
    return list.length ? list : FALLBACK;
  } catch {
    return FALLBACK;
  }
})();

export function currencyName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) || code;
  } catch {
    return code;
  }
}

export function formatMoney(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: getCurrency() }).format(n || 0);
}

export const CATEGORIES = {
  expense: ['Food', 'Rent', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Gift', 'Other'],
};

const pad = (n) => String(n).padStart(2, '0');

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// Dates are stored as UTC midnight, so we read them back as UTC.
export function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}