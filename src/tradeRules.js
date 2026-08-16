export function buildTradeComparisonPayload({ targetUserId, binderId, wishlistId }) {
  const payload = {
    targetUserId: String(targetUserId || '').trim(),
    binderId: String(binderId || '').trim(),
    wishlistId: String(wishlistId || '').trim(),
  };

  return Object.values(payload).every(Boolean) ? payload : null;
}

export function getTradeSearchEmptyMessage({ hasSearched, query, resultCount }) {
  if (!String(query || '').trim() || resultCount > 0) return '';

  return hasSearched
    ? 'No encontramos jugadores con ese nombre.'
    : 'Presioná Buscar para ver jugadores. Tu propia cuenta no aparece en los resultados.';
}
