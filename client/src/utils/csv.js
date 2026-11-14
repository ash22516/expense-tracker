const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function downloadCsv(items, filename) {
  const rows = [['Date', 'Type', 'Category', 'Note', 'Amount']];
  items.forEach((t) => rows.push([t.date.slice(0, 10), t.type, t.category, t.note, t.amount]));
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
