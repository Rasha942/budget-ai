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
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= new Date(from) && date <= new Date(to);
  });
}
