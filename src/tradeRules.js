export function buildTradeComparisonPayload({ targetUserId, binderId, wishlistId }) {
  const payload = {
    targetUserId: String(targetUserId || '').trim(),
    binderId: String(binderId || '').trim(),
    wishlistId: String(wishlistId || '').trim(),
  };

  return Object.values(payload).every(Boolean) ? payload : null;
}
