import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countBinderCards,
  normalizeBinderMetadata,
  removeBinderCard,
  setBinderCardQuantity,
} from '../src/binderRules.js';

test('counts binder copies instead of unique printings', () => {
  assert.equal(countBinderCards([{ quantity: 4 }, { quantity: 2 }]), 6);
});

test('updates one printing without mutating the confirmed cards', () => {
  const confirmed = [{ id: 'a', quantity: 2 }, { id: 'b', quantity: 1 }];
  const next = setBinderCardQuantity(confirmed, 'a', 5);

  assert.equal(confirmed[0].quantity, 2);
  assert.equal(next[0].quantity, 5);
  assert.equal(next[1], confirmed[1]);
});

test('keeps persisted quantities at one or above', () => {
  const next = setBinderCardQuantity([{ id: 'a', quantity: 2 }], 'a', 0);
  assert.equal(next[0].quantity, 1);
});

test('removes only the selected printing', () => {
  const next = removeBinderCard([{ id: 'a' }, { id: 'b' }], 'a');
  assert.deepEqual(next, [{ id: 'b' }]);
});

test('normalizes metadata and caps descriptions at 280 characters', () => {
  const result = normalizeBinderMetadata('  Trade Binder  ', `  ${'a'.repeat(300)}  `);
  assert.equal(result.name, 'Trade Binder');
  assert.equal(result.description.length, 280);
});
