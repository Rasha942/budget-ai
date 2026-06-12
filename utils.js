export const hebrewMonths = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export function getMonthLabel(dateString) {
  const parts = dateString.split("-");
  const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return `${hebrewMonths[date.getMonth()]} ${date.getFullYear()}`;
}
export function groupByMonth(transactions) {
  return transactions.reduce((acc, transaction) => {
    const month = getMonthLabel(transaction.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(transaction);
    return acc;
  }, {});
}

export function filterByDateRange(transactions, from, to) {
  if (!transactions) return [];
  return transactions.filter((t) => {
    const parts = t.date.split("-");
    const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    return date >= new Date(from) && date <= toDate;
  });
}

export function getDefaultDates() {
  const now = new Date();
  const fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const toDate = now.toISOString().split("T")[0];
  return { fromDate, toDate };
}

// Manual number formatting — avoids Hermes Intl (toLocaleString can throw
// "Cannot convert undefined value to object" on builds without Intl).
export function formatAmount(n, decimals = 2) {
  const num = Number(n);
  const safe = Number.isFinite(num) ? num : 0;
  const fixed = safe.toFixed(decimals);
  const [intPart, dec] = fixed.split(".");
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withSep}.${dec}` : withSep;
}

export function currentMonthLabel() {
  const d = new Date();
  return `${hebrewMonths[d.getMonth()]} ${d.getFullYear()}`;
}

// Format an arbitrary date value as DD.MM.YYYY (guards invalid dates).
export function formatDateShort(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
