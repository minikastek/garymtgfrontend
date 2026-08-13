import assert from 'node:assert/strict';
import test from 'node:test';
import { countCards, evaluateDeckLegality, isBasicLand, moveCardBetweenBoards } from '../src/deckRules.js';

test('counts quantities rather than unique printings', () => {
  assert.equal(countCards([{ quantity: 3 }, { quantity: 2 }]), 5);
});

test('detects copy violations across both boards', () => {
  const result = evaluateDeckLegality(
    [{ id: 'a', name: 'Lightning Bolt', quantity: 3 }],
    [{ id: 'b', name: 'Lightning Bolt', quantity: 2 }],
  );
  assert.deepEqual(result.copyViolations, [{ name: 'Lightning Bolt', quantity: 5, max: 4 }]);
  assert.match(result.messages.at(-1), /Reducí Lightning Bolt/);
});

test('allows unlimited basic and snow-covered basic lands', () => {
  const main = [
    { id: 'a', name: 'Mountain', type: 'Basic Land — Mountain', quantity: 30 },
    { id: 'b', name: 'Snow-Covered Island', quantity: 30 },
  ];
  assert.equal(isBasicLand(main[0]), true);
  assert.equal(isBasicLand(main[1]), true);
  assert.equal(evaluateDeckLegality(main, []).legal, true);
});

test('explains main and sideboard corrections', () => {
  const result = evaluateDeckLegality(
    [{ name: 'Island', type: 'Basic Land', quantity: 59 }],
    [{ name: 'Swamp', type: 'Basic Land', quantity: 16 }],
  );
  assert.deepEqual(result.messages, ['Agregá 1 carta al main.', 'Quitá 1 carta del sideboard.']);
});

test('moves and merges the same printing between boards', () => {
  const result = moveCardBetweenBoards(
    [{ id: 'bolt', name: 'Lightning Bolt', quantity: 2 }],
    [{ id: 'bolt', name: 'Lightning Bolt', quantity: 1 }],
    'bolt',
    'main',
  );
  assert.deepEqual(result.main, []);
  assert.equal(result.sideboard[0].quantity, 3);
});
