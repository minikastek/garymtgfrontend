const API = 'http://localhost:3001/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de red');
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
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sesión inválida');
  return data;
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
  return request(`/decks/${id}`);
}

export async function updateDeck(id, payload) {
  return request(`/decks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteDeck(id) {
  return request(`/decks/${id}`, { method: 'DELETE' });
}

export async function addCardToDeck(deckId, card, quantity, board = 'main') {
  return request(`/decks/${deckId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ card, quantity, board }),
  });
}

export async function updateCardQuantity(deckId, cardId, quantity, board = 'main') {
  return request(`/decks/${deckId}/cards/${cardId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, board }),
  });
}

export async function removeCardFromDeck(deckId, cardId, board = 'main') {
  return request(`/decks/${deckId}/cards/${cardId}?board=${encodeURIComponent(board)}`, {
    method: 'DELETE',
  });
}
