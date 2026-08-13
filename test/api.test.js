import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addCardToBinder,
  addCardToWishlist,
  compareTrade,
  createBinder,
  createWishlist,
  listBinders,
  listTradeBinders,
  listWishlists,
  searchTradeUsers,
} from '../src/api.js';

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function jsonResponse(data, { status = 200 } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function installBrowser({ token = 'test-token' } = {}) {
  globalThis.localStorage = createStorage(token ? { token } : {});
  globalThis.window = new EventTarget();
}

test.beforeEach(() => {
  installBrowser();
});

test.afterEach(() => {
  delete globalThis.fetch;
  delete globalThis.localStorage;
  delete globalThis.window;
});

test('private requests include the bearer token', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return jsonResponse({ binders: [] });
  };

  await listBinders();

  assert.equal(request.url, 'http://localhost:3001/api/binders');
  assert.equal(request.options.headers.Authorization, 'Bearer test-token');
});

test('API errors expose a safe message and HTTP status', async () => {
  globalThis.fetch = async () => jsonResponse({ error: 'Nombre requerido' }, { status: 400 });

  await assert.rejects(
    createBinder(''),
    (error) => error.name === 'ApiError' && error.status === 400 && error.message === 'Nombre requerido',
  );
});

test('unauthorized responses clear credentials and notify the auth provider', async () => {
  let expiredEvents = 0;
  window.addEventListener('garymtg:session-expired', () => {
    expiredEvents += 1;
  });
  globalThis.fetch = async () => jsonResponse({ error: 'Token inválido' }, { status: 401 });

  await assert.rejects(listBinders(), (error) => error.status === 401);

  assert.equal(localStorage.getItem('token'), null);
  assert.equal(expiredEvents, 1);
});

test('binder helpers send backend-compatible payloads', async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return jsonResponse({ binder: { id: 'binder-1' } });
  };

  await createBinder('Cambios', 'Cartas para cambiar');
  await addCardToBinder('binder-1', { id: 'card-1', name: 'Sol Ring' }, 2);

  assert.deepEqual(JSON.parse(requests[0].options.body), {
    name: 'Cambios',
    description: 'Cartas para cambiar',
  });
  assert.equal(requests[1].url, 'http://localhost:3001/api/binders/binder-1/cards');
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    card: { id: 'card-1', name: 'Sol Ring' },
    quantity: 2,
  });
});

test('wishlist helpers send backend-compatible payloads', async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return jsonResponse({ wishlist: { id: 'wishlist-1' } });
  };

  await listWishlists();
  await createWishlist('Busco', 'Prioridad alta');
  await addCardToWishlist('wishlist-1', { id: 'card-2', name: 'Mox Amber' }, 1);

  assert.equal(requests[0].url, 'http://localhost:3001/api/wishlists');
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    name: 'Busco',
    description: 'Prioridad alta',
  });
  assert.deepEqual(JSON.parse(requests[2].options.body), {
    card: { id: 'card-2', name: 'Mox Amber' },
    quantity: 1,
  });
});

test('trade helpers encode user searches and comparison payloads', async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return jsonResponse({ users: [], binders: [], matches: [] });
  };

  await searchTradeUsers('Ana María');
  await listTradeBinders('user/2');
  await compareTrade({ targetUserId: 'user-2', binderId: 'binder-2', wishlistId: 'wishlist-1' });

  assert.equal(
    requests[0].url,
    'http://localhost:3001/api/trade/users?q=Ana%20Mar%C3%ADa',
  );
  assert.equal(
    requests[1].url,
    'http://localhost:3001/api/trade/users/user%2F2/binders',
  );
  assert.deepEqual(JSON.parse(requests[2].options.body), {
    targetUserId: 'user-2',
    binderId: 'binder-2',
    wishlistId: 'wishlist-1',
  });
});
