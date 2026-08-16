import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTradeComparisonPayload, getTradeSearchEmptyMessage } from '../src/tradeRules.js';

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

test('getTradeSearchEmptyMessage distinguishes instructions from no results', () => {
  assert.equal(
    getTradeSearchEmptyMessage({ hasSearched: false, query: 'ari', resultCount: 0 }),
    'Presioná Buscar para ver jugadores. Tu propia cuenta no aparece en los resultados.',
  );
  assert.equal(
    getTradeSearchEmptyMessage({ hasSearched: true, query: 'ari', resultCount: 0 }),
    'No encontramos jugadores con ese nombre.',
  );
  assert.equal(
    getTradeSearchEmptyMessage({ hasSearched: true, query: 'ari', resultCount: 1 }),
    '',
  );
});
