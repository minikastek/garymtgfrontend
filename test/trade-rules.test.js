import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTradeComparisonPayload } from '../src/tradeRules.js';

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
