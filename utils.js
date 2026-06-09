const hebrewMonths = [
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
