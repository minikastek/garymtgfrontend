import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTradeComparisonPayload,
  buildTradeProposalPayload,
  calculateTradeEstimate,
  setTradeSelectionQuantity,
} from '../src/tradeRules.js';

test('buildTradeComparisonPayload returns the backend contract when every selection exists', () => {
  assert.deepEqual(
    buildTradeComparisonPayload({
      targetUserId: ' user-2 ',
      binderId: ' binder-4 ',
      wishlistId: ' wishlist-7 ',
    }),
    {
      targetUserId: 'user-2',
      binderId: 'binder-4',
      wishlistId: 'wishlist-7',
    },
  );
});

test('buildTradeComparisonPayload rejects an incomplete selection', () => {
  assert.equal(
    buildTradeComparisonPayload({
      targetUserId: 'user-2',
      binderId: '',
      wishlistId: 'wishlist-7',
    }),
    null,
  );
});

test('setTradeSelectionQuantity clamps availability and removes zero quantities immutably', () => {
  const original = [];
  const card = {
    id: 'card-1', binderId: 'binder-1', name: 'Sol Ring', quantity: 2,
    prices: { cardkingdom: { retail: 3.5 }, scryfallUsd: 3.1 },
  };
  const selected = setTradeSelectionQuantity(original, card, 5);
  assert.equal(selected[0].quantity, 2);
  assert.deepEqual(original, []);
  assert.deepEqual(setTradeSelectionQuantity(selected, card, 0), []);
});

test('calculateTradeEstimate prefers Card Kingdom, falls back to Scryfall, and reports missing prices', () => {
  assert.deepEqual(calculateTradeEstimate({
    offeredItems: [
      { quantity: 2, prices: { cardkingdom: { retail: 2.25 }, scryfallUsd: 2 } },
      { quantity: 1, prices: null },
    ],
    requestedItems: [
      { quantity: 1, prices: { cardkingdom: null, scryfallUsd: 3.1 } },
    ],
  }), {
    currency: 'USD',
    offeredTotal: 4.5,
    requestedTotal: 3.1,
    offeredMinusRequested: 1.4,
    missingPriceCount: 1,
  });
});

test('buildTradeProposalPayload strips display metadata and client prices', () => {
  assert.deepEqual(buildTradeProposalPayload({
    recipientUserId: ' player-b ',
    offeredItems: [{ binderId: 'mine', cardId: 'card-a', quantity: 2, name: 'A', prices: { scryfallUsd: 99 } }],
    requestedItems: [{ binderId: 'theirs', id: 'card-b', quantity: 1, name: 'B' }],
  }), {
    recipientUserId: 'player-b',
    offeredItems: [{ binderId: 'mine', cardId: 'card-a', quantity: 2 }],
    requestedItems: [{ binderId: 'theirs', cardId: 'card-b', quantity: 1 }],
  });
});

test('buildTradeProposalPayload rejects proposals missing either side', () => {
  assert.equal(buildTradeProposalPayload({
    recipientUserId: 'player-b',
    offeredItems: [{ binderId: 'mine', cardId: 'card-a', quantity: 1 }],
    requestedItems: [],
  }), null);
});
