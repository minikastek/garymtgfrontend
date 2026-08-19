export function buildTradeComparisonPayload({ targetUserId, binderId, wishlistId }) {
  const payload = {
    targetUserId: String(targetUserId || '').trim(),
    binderId: String(binderId || '').trim(),
    wishlistId: String(wishlistId || '').trim(),
  };

  return Object.values(payload).every(Boolean) ? payload : null;
}

function selectionKey(item) {
  return `${String(item.binderId || '').trim()}:${String(item.cardId || item.id || '').trim()}`;
}

function positiveInteger(value) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function setTradeSelectionQuantity(items, card, quantity, availableQuantity = card?.quantity) {
  const cardId = String(card?.cardId || card?.id || '').trim();
  const binderId = String(card?.binderId || '').trim();
  if (!cardId || !binderId) return items;

  const key = `${binderId}:${cardId}`;
  const available = positiveInteger(availableQuantity);
  const nextQuantity = Math.min(positiveInteger(quantity), available);
  const remaining = items.filter((item) => selectionKey(item) !== key);
  if (!nextQuantity) return remaining;

  return [...remaining, {
    binderId,
    cardId,
    name: card.name,
    set: card.set || null,
    collectorNumber: card.collectorNumber || null,
    image: card.image || null,
    prices: card.prices || null,
    quantity: nextQuantity,
  }];
}

export function getTradeUnitPrice(card) {
  const candidate = card?.prices?.cardkingdom?.retail ?? card?.prices?.scryfallUsd;
  const price = Number(candidate);
  return candidate !== null && candidate !== undefined && Number.isFinite(price) && price >= 0
    ? price
    : null;
}

export function calculateTradeEstimate({ offeredItems = [], requestedItems = [] }) {
  const summarize = (items) => items.reduce((summary, item) => {
    const unitPrice = getTradeUnitPrice(item);
    if (unitPrice === null) return { ...summary, missingPriceCount: summary.missingPriceCount + 1 };
    return { ...summary, total: summary.total + (unitPrice * positiveInteger(item.quantity)) };
  }, { total: 0, missingPriceCount: 0 });

  const offered = summarize(offeredItems);
  const requested = summarize(requestedItems);
  const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const offeredTotal = roundCurrency(offered.total);
  const requestedTotal = roundCurrency(requested.total);

  return {
    currency: 'USD',
    offeredTotal,
    requestedTotal,
    offeredMinusRequested: roundCurrency(offeredTotal - requestedTotal),
    missingPriceCount: offered.missingPriceCount + requested.missingPriceCount,
  };
}

export function buildTradeProposalPayload({ recipientUserId, offeredItems, requestedItems }) {
  const recipientId = String(recipientUserId || '').trim();
  const normalizeItems = (items) => Array.isArray(items) ? items.map((item) => ({
    binderId: String(item.binderId || '').trim(),
    cardId: String(item.cardId || item.id || '').trim(),
    quantity: positiveInteger(item.quantity),
  })) : [];
  const offered = normalizeItems(offeredItems);
  const requested = normalizeItems(requestedItems);
  const validItems = (items) => items.length > 0
    && items.every((item) => item.binderId && item.cardId && item.quantity > 0);

  if (!recipientId || !validItems(offered) || !validItems(requested)) return null;
  return { recipientUserId: recipientId, offeredItems: offered, requestedItems: requested };
}
