const KEY_PREFIX = 'wigoo_tokens_';

export const MONTHLY_TOKEN_LIMIT = 800_000;

function getMonthKey(): string {
  const n = new Date();
  return `${n.getFullYear()}_${n.getMonth() + 1}`;
}

export function addTokens(clientId: string, count: number): void {
  if (!clientId || !count) return;
  const key = `${KEY_PREFIX}${clientId}_${getMonthKey()}`;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, String(current + count));
  window.dispatchEvent(new CustomEvent('wigoo-tokens-updated', { detail: { clientId } }));
}

export function getMonthlyTokens(clientId: string): number {
  const key = `${KEY_PREFIX}${clientId}_${getMonthKey()}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}
