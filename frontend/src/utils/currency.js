export const CURRENCY_SYMBOL = '₹';

/**
 * Format a numeric amount as Indian Rupees (₹) with en-IN numbering system (e.g. ₹1,23,456.78)
 */
export function formatCurrency(amount, options = {}) {
  const num = parseFloat(amount || 0);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 2,
    maximumFractionDigits: options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2,
  });
  return `${CURRENCY_SYMBOL}${formatted}`;
}

/**
 * Format large amounts in compact form (e.g. ₹10k, ₹5.5L, ₹1.2Cr)
 */
export function formatCompactCurrency(val) {
  const num = parseFloat(val || 0);
  if (Math.abs(num) >= 10000000) {
    return `${CURRENCY_SYMBOL}${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `${CURRENCY_SYMBOL}${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `${CURRENCY_SYMBOL}${(num / 1000).toFixed(0)}k`;
  }
  return `${CURRENCY_SYMBOL}${num}`;
}
