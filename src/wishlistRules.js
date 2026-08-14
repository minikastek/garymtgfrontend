export function countWishlistCards(cards = []) {
  return cards.reduce((total, card) => total + (Number(card.quantity) || 0), 0);
}

export function setWishlistCardQuantity(cards = [], cardId, quantity) {
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  return cards.map((card) => card.id === cardId ? { ...card, quantity: nextQuantity } : card);
}

export function removeWishlistCard(cards = [], cardId) {
  return cards.filter((card) => card.id !== cardId);
}

export function normalizeWishlistMetadata(name, description = '') {
  return {
    name: String(name || '').trim(),
    description: String(description || '').trim().slice(0, 280),
  };
}
