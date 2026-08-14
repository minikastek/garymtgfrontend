export function countBinderCards(cards = []) {
  return cards.reduce((total, card) => total + (Number(card.quantity) || 0), 0);
}

export function setBinderCardQuantity(cards, cardId, quantity) {
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  return cards.map((card) =>
    card.id === cardId ? { ...card, quantity: nextQuantity } : card,
  );
}

export function removeBinderCard(cards, cardId) {
  return cards.filter((card) => card.id !== cardId);
}

export function normalizeBinderMetadata(name, description) {
  return {
    name: String(name || '').trim(),
    description: String(description || '').trim().slice(0, 280),
  };
}
