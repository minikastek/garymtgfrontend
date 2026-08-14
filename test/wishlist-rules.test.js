import test from 'node:test';
import assert from 'node:assert/strict';
import { countWishlistCards, normalizeWishlistMetadata, removeWishlistCard, setWishlistCardQuantity } from '../src/wishlistRules.js';

test('countWishlistCards totals wanted copies', () => {
  assert.equal(countWishlistCards([{ quantity: 2 }, { quantity: 3 }]), 5);
});

test('setWishlistCardQuantity updates immutably', () => {
  const cards = [{ id: 'a', quantity: 1 }, { id: 'b', quantity: 2 }];
  const next = setWishlistCardQuantity(cards, 'a', 4);
  assert.deepEqual(next, [{ id: 'a', quantity: 4 }, { id: 'b', quantity: 2 }]);
  assert.notEqual(next, cards);
  assert.equal(cards[0].quantity, 1);
});

test('setWishlistCardQuantity clamps invalid quantities to one', () => {
  assert.equal(setWishlistCardQuantity([{ id: 'a', quantity: 3 }], 'a', 0)[0].quantity, 1);
});

test('removeWishlistCard removes only the selected printing', () => {
  assert.deepEqual(removeWishlistCard([{ id: 'a' }, { id: 'b' }], 'a'), [{ id: 'b' }]);
});

test('normalizeWishlistMetadata trims and caps descriptions', () => {
  const result = normalizeWishlistMetadata('  Cambios  ', `  ${'x'.repeat(300)}  `);
  assert.equal(result.name, 'Cambios');
  assert.equal(result.description.length, 280);
});
