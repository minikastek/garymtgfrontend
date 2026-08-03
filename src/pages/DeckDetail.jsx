import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addCardToDeck, getDeck, removeCardFromDeck, updateCardQuantity } from '../api';
import CardSearch from '../components/CardSearch';
import CardTile from '../components/CardTile';
import PageShell from '../components/PageShell';

export default function DeckDetail() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await getDeck(id);
    setDeck(data.deck);
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd(card, quantity) {
    setError('');
    try {
      const data = await addCardToDeck(id, card, quantity);
      setDeck(data.deck);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleQty(cardId, quantity) {
    setError('');
    try {
      const data = await updateCardQuantity(id, cardId, quantity);
      setDeck(data.deck);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(cardId) {
    try {
      const data = await removeCardFromDeck(id, cardId);
      setDeck(data.deck);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <p>Cargando deck…</p>
      </PageShell>
    );
  }

  if (!deck) {
    return (
      <PageShell>
        <p className="text-[#ffb4b4]">{error || 'Deck no encontrado'}</p>
        <Link to="/decks" className="text-accent">Volver</Link>
      </PageShell>
    );
  }

  const total = deck.cards.reduce((s, c) => s + c.quantity, 0);

  return (
    <PageShell>
      <Link to="/decks" className="mb-3 inline-block text-sm text-muted hover:text-accent">
        ← Mis decks
      </Link>
      <h1 className="mb-1 text-3xl font-bold">{deck.name}</h1>
      <p className="mb-6 text-muted">{total} cartas en el deck</p>

      {error && <p className="mb-4 text-sm text-[#ffb4b4]">{error}</p>}

      <div className="mb-8">
        <CardSearch onAdd={handleAdd} />
      </div>

      <h2 className="mb-3 text-xl font-semibold">Cartas del deck</h2>
      {!deck.cards.length ? (
        <p className="text-muted">Todavía no hay cartas. Buscá arriba y añadilas.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {deck.cards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              quantity={card.quantity}
              showQtyControls
              onQuantityChange={(q) => handleQty(card.id, q)}
              onRemove={() => handleRemove(card.id)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
