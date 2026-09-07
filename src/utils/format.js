export function formatINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export function toMillis(ts) {
  if (!ts) return 0;
  return ts.seconds ? ts.seconds * 1000 : new Date(ts).getTime();
}

export function formatDateTime(ts) {
  const ms = toMillis(ts);
  if (!ms) return '';
  return new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
