const BASIC_LAND_NAMES = new Set([
  'plains', 'island', 'swamp', 'mountain', 'forest',
  'snow-covered plains', 'snow-covered island', 'snow-covered swamp',
  'snow-covered mountain', 'snow-covered forest', 'wastes',
]);

export function normalizeCardName(name) {
  return String(name || '').trim().toLowerCase().split(' // ')[0];
}

export function isBasicLand(card) {
  if (/Basic Land/i.test(card?.type || card?.type_line || '')) return true;
  return BASIC_LAND_NAMES.has(normalizeCardName(card?.name));
}

export function countCards(cards) {
  return (cards || []).reduce((total, card) => total + (Number(card.quantity) || 0), 0);
}

export function evaluateDeckLegality(main = [], sideboard = [], constraints = {}) {
  const minMain = constraints.minMain || 60;
  const maxSideboard = constraints.maxSideboard || 15;
  const mainCount = countCards(main);
  const sideboardCount = countCards(sideboard);
  const mainNeeded = Math.max(0, minMain - mainCount);
  const sideboardOver = Math.max(0, sideboardCount - maxSideboard);
  const totals = new Map();

  for (const card of [...main, ...sideboard]) {
    const key = normalizeCardName(card.name);
    const current = totals.get(key) || { name: card.name, quantity: 0, sample: card };
    current.quantity += Number(card.quantity) || 0;
    totals.set(key, current);
  }

  const copyViolations = [...totals.values()]
    .filter(({ quantity, sample }) => !isBasicLand(sample) && quantity > 4)
    .map(({ name, quantity }) => ({ name, quantity, max: 4 }));
  const messages = [];
  if (mainNeeded) messages.push(`Agregá ${mainNeeded} carta${mainNeeded === 1 ? '' : 's'} al main.`);
  if (sideboardOver) messages.push(`Quitá ${sideboardOver} carta${sideboardOver === 1 ? '' : 's'} del sideboard.`);
  for (const item of copyViolations) {
    messages.push(`Reducí ${item.name} de ${item.quantity} a ${item.max} copias.`);
  }

  return {
    legal: !mainNeeded && !sideboardOver && !copyViolations.length,
    mainCount, sideboardCount, mainNeeded, sideboardOver, copyViolations,
    messages, minMain, maxSideboard,
  };
}

export function moveCardBetweenBoards(main, sideboard, cardId, sourceBoard) {
  const source = sourceBoard === 'sideboard' ? sideboard : main;
  const target = sourceBoard === 'sideboard' ? main : sideboard;
  const card = source.find((item) => item.id === cardId);
  if (!card) return { main, sideboard };

  const nextSource = source.filter((item) => item.id !== cardId);
  const existing = target.find((item) => item.id === cardId);
  const nextTarget = existing
    ? target.map((item) => item.id === cardId
      ? { ...item, quantity: Number(item.quantity) + Number(card.quantity) }
      : item)
    : [...target, card];

  return sourceBoard === 'sideboard'
    ? { main: nextTarget, sideboard: nextSource }
    : { main: nextSource, sideboard: nextTarget };
}
