export function formatCurrency(value) {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
  } catch (err) {
    return `$${num.toLocaleString()}`;
  }
}
