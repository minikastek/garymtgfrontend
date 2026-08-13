import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteDeck, getDeck, updateDeck } from '../api';
import { useAuth } from '../auth';
import Button from '../components/Button';
import CardSearch from '../components/CardSearch';
import CardTile from '../components/CardTile';
import DeckLegalityTag from '../components/DeckLegalityTag';
import PageShell from '../components/PageShell';

function isBasicLand(card) {
  if (/Basic Land/i.test(card?.type || '')) return true;
  const name = String(card?.name || '').toLowerCase().split(' // ')[0];
  return ['plains', 'island', 'swamp', 'mountain', 'forest', 'wastes'].includes(name);
}

function totalByName(main, sideboard, cardName) {
  const key = String(cardName || '').toLowerCase().split(' // ')[0];
  let total = 0;
  for (const list of [main, sideboard]) {
    for (const c of list) {
      if (String(c.name || '').toLowerCase().split(' // ')[0] === key) {
        total += Number(c.quantity) || 0;
      }
    }
  }
  return total;
}

function BoardSection({ title, cards, count, hint, board, onQty, onRemove }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-xl font-semibold">{title}</h2>
        <span className="text-sm text-muted">{count} cartas{hint ? ` · ${hint}` : ''}</span>
      </div>
      {!cards.length ? (
        <p className="text-muted">Vacío.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {cards.map((card) => (
            <CardTile
              key={`${board}-${card.id}`}
              card={card}
              quantity={card.quantity}
              showQtyControls
              onQuantityChange={(q) => onQty(card.id, q, board)}
              onRemove={() => onRemove(card.id, board)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function DeckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [main, setMain] = useState([]);
  const [sideboard, setSideboard] = useState([]);
  const [legality, setLegality] = useState(null);
  const [board, setBoard] = useState('main');
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getDeck(id)
      .then(({ deck }) => {
        setName(deck.name);
        setMain(deck.main || []);
        setSideboard(deck.sideboard || []);
        setLegality(deck.legality);
        setDirty(false);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const mainCount = useMemo(
    () => main.reduce((s, c) => s + (Number(c.quantity) || 0), 0),
    [main],
  );
  const sideCount = useMemo(
    () => sideboard.reduce((s, c) => s + (Number(c.quantity) || 0), 0),
    [sideboard],
  );

  function touch() {
    setDirty(true);
    setSavedMsg('');
  }

  function handleAdd(card, quantity, targetBoard) {
    setError('');
    const max = isBasicLand(card) ? 999 : 4;
    const currentTotal = totalByName(main, sideboard, card.name);
    if (!isBasicLand(card) && currentTotal + quantity > max) {
      setError(`Máximo ${max} copias de "${card.name}" entre main y sideboard`);
      return;
    }

    const setter = targetBoard === 'sideboard' ? setSideboard : setMain;
    setter((list) => {
      const existing = list.find((c) => c.id === card.id);
      if (existing) {
        return list.map((c) =>
          c.id === card.id ? { ...c, quantity: c.quantity + quantity } : c,
        );
      }
      return [
        ...list,
        {
          id: card.id,
          name: card.name,
          set: card.set,
          collectorNumber: card.collectorNumber,
          rarity: card.rarity,
          type: card.type,
          image: card.image,
          imageLarge: card.imageLarge,
          prices: card.prices,
          quantity,
        },
      ];
    });
    touch();
  }

  function handleQty(cardId, quantity, targetBoard) {
    setError('');
    const setter = targetBoard === 'sideboard' ? setSideboard : setMain;
    const list = targetBoard === 'sideboard' ? sideboard : main;
    const entry = list.find((c) => c.id === cardId);
    if (!entry) return;

    if (quantity <= 0) {
      setter((prev) => prev.filter((c) => c.id !== cardId));
      touch();
      return;
    }

    const max = isBasicLand(entry) ? 999 : 4;
    const otherBoardQty = (targetBoard === 'sideboard' ? main : sideboard)
      .filter(
        (c) =>
          String(c.name).toLowerCase().split(' // ')[0] ===
          String(entry.name).toLowerCase().split(' // ')[0],
      )
      .reduce((s, c) => s + c.quantity, 0);

    if (!isBasicLand(entry) && otherBoardQty + quantity > max) {
      setError(`Máximo ${max} copias entre main y sideboard`);
      return;
    }

    setter((prev) => prev.map((c) => (c.id === cardId ? { ...c, quantity } : c)));
    touch();
  }

  function handleRemove(cardId, targetBoard) {
    const setter = targetBoard === 'sideboard' ? setSideboard : setMain;
    setter((prev) => prev.filter((c) => c.id !== cardId));
    touch();
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('El nombre del deck es obligatorio');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { deck } = await updateDeck(id, {
        name: name.trim(),
        main,
        sideboard,
      });
      setName(deck.name);
      setMain(deck.main || []);
      setSideboard(deck.sideboard || []);
      setLegality(deck.legality);
      setDirty(false);
      setSavedMsg(`Decklist guardada en la cuenta de ${user?.username || 'tu usuario'}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este deck de tu cuenta?')) return;
    try {
      await deleteDeck(id);
      navigate('/decks');
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

  if (error && !name && !main.length) {
    return (
      <PageShell>
        <p className="text-[#ffb4b4]">{error || 'Deck no encontrado'}</p>
        <Link to="/decks" className="text-accent">Volver</Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/decks" className="text-sm text-muted hover:text-accent">
          ← Mis decks
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? 'Guardando…' : dirty ? 'Guardar decklist' : 'Guardado'}
          </Button>
        </div>
      </div>

      <label className="mb-3 block text-sm text-muted">
        Nombre del deck
        <input
          className="mt-1.5 w-full max-w-xl rounded-lg border border-white/10 bg-surface px-3 py-2.5 text-xl font-bold text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            touch();
          }}
        />
      </label>

      {user && (
        <p className="mb-3 text-sm text-muted">
          Asociado a <span className="text-accent">{user.username}</span>
          {dirty ? ' · cambios sin guardar' : ''}
        </p>
      )}

      <DeckLegalityTag
        legality={
          legality
            ? {
                ...legality,
                mainCount,
                sideboardCount: sideCount,
                mainNeeded: Math.max(0, (legality.minMain || 60) - mainCount),
                sideboardOver: Math.max(0, sideCount - (legality.maxSideboard || 15)),
                legal:
                  mainCount >= (legality.minMain || 60) &&
                  sideCount <= (legality.maxSideboard || 15) &&
                  !(legality.copyViolations?.length),
              }
            : {
                legal: mainCount >= 60 && sideCount <= 15,
                mainCount,
                sideboardCount: sideCount,
                mainNeeded: Math.max(0, 60 - mainCount),
                sideboardOver: Math.max(0, sideCount - 15),
                copyViolations: [],
                messages: [],
                minMain: 60,
                maxSideboard: 15,
              }
        }
      />

      {savedMsg && <p className="mb-4 text-sm text-emerald-400">{savedMsg}</p>}
      {error && <p className="mb-4 text-sm text-[#ffb4b4]">{error}</p>}

      <div className="mb-8">
        <CardSearch onAdd={handleAdd} board={board} onBoardChange={setBoard} />
      </div>

      <BoardSection
        title="Main"
        board="main"
        cards={main}
        count={mainCount}
        hint="mín. 60"
        onQty={handleQty}
        onRemove={handleRemove}
      />

      <BoardSection
        title="Sideboard"
        board="sideboard"
        cards={sideboard}
        count={sideCount}
        hint="máx. 15"
        onQty={handleQty}
        onRemove={handleRemove}
      />

      <div className="sticky bottom-4 z-10 flex justify-end gap-2">
        <Button type="button" variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? 'Guardando…' : 'Guardar decklist'}
        </Button>
      </div>
    </PageShell>
  );
}
