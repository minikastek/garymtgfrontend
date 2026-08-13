const API = (import.meta.env?.VITE_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');
export const SESSION_EXPIRED_EVENT = 'garymtg:session-expired';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function expireSession() {
  localStorage.removeItem('token');
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

async function request(path, options = {}) {
  const authorization = authHeaders();
  let res;

  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authorization,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Intentá nuevamente.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && authorization.Authorization) expireSession();
    const message = typeof data.error === 'string' ? data.error : 'Ocurrió un error inesperado.';
    throw new ApiError(message, res.status);
  }

  return data;
}

export async function register({ username, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function pingTest() {
  return request('/test/ping');
}

export async function echoTest(payload) {
  return request('/test/echo', { method: 'POST', body: JSON.stringify(payload) });
}

export async function sampleTest() {
  return request('/test/sample');
}

export async function searchCards(name) {
  return request(`/cards?name=${encodeURIComponent(name)}`);
}

export async function listDecks() {
  return request('/decks');
}

export async function createDeck(name) {
  return request('/decks', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function getDeck(id) {
  return request(`/decks/${encodeURIComponent(id)}`);
}

export async function updateDeck(id, payload) {
  return request(`/decks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteDeck(id) {
  return request(`/decks/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function addCardToDeck(deckId, card, quantity, board = 'main') {
  return request(`/decks/${encodeURIComponent(deckId)}/cards`, {
    method: 'POST',
    body: JSON.stringify({ card, quantity, board }),
  });
}

export async function updateCardQuantity(deckId, cardId, quantity, board = 'main') {
  return request(`/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, board }),
  });
}

export async function removeCardFromDeck(deckId, cardId, board = 'main') {
  return request(
    `/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}?board=${encodeURIComponent(board)}`,
    { method: 'DELETE' },
  );
}

export async function listBinders() {
  return request('/binders');
}

export async function createBinder(name, description = '') {
  return request('/binders', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function getBinder(id) {
  return request(`/binders/${encodeURIComponent(id)}`);
}

export async function updateBinder(id, payload) {
  return request(`/binders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteBinder(id) {
  return request(`/binders/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function addCardToBinder(binderId, card, quantity = 1) {
  return request(`/binders/${encodeURIComponent(binderId)}/cards`, {
    method: 'POST',
    body: JSON.stringify({ card, quantity }),
  });
}

export async function listWishlists() {
  return request('/wishlists');
}

export async function createWishlist(name, description = '') {
  return request('/wishlists', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function getWishlist(id) {
  return request(`/wishlists/${encodeURIComponent(id)}`);
}

export async function updateWishlist(id, payload) {
  return request(`/wishlists/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteWishlist(id) {
  return request(`/wishlists/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function addCardToWishlist(wishlistId, card, quantity = 1) {
  return request(`/wishlists/${encodeURIComponent(wishlistId)}/cards`, {
    method: 'POST',
    body: JSON.stringify({ card, quantity }),
  });
}

export async function searchTradeUsers(query) {
  return request(`/trade/users?q=${encodeURIComponent(query)}`);
}

export async function listTradeBinders(userId) {
  return request(`/trade/users/${encodeURIComponent(userId)}/binders`);
}

export async function compareTrade(payload) {
  return request('/trade/compare', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
