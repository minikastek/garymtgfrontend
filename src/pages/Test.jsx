import { useState } from 'react';
import { echoTest, pingTest, sampleTest } from '../api';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import TestResultCard from '../components/TestResultCard';

export default function Test() {
  const [ping, setPing] = useState({ status: 'idle', body: '' });
  const [echo, setEcho] = useState({ status: 'idle', body: '' });
  const [sample, setSample] = useState({ status: 'idle', body: '' });
  const [echoText, setEchoText] = useState('hola desde el front');
  const [busy, setBusy] = useState('');

  async function run(name, fn, setResult, payload) {
    setBusy(name);
    try {
      const data = await fn(payload);
      setResult({ status: 'ok', body: JSON.stringify(data, null, 2) });
    } catch (err) {
      setResult({ status: 'error', body: err.message });
    } finally {
      setBusy('');
    }
  }

  return (
    <PageShell>
      <h1 className="mb-2 text-3xl font-bold">Sector de test</h1>
      <p className="mb-8 max-w-xl text-muted">
        Probá los endpoints de <code className="text-accent">/api/test</code> del backend.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={busy === 'ping'}
          onClick={() => run('ping', pingTest, setPing)}
        >
          {busy === 'ping' ? 'Ping…' : 'GET /ping'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy === 'sample'}
          onClick={() => run('sample', sampleTest, setSample)}
        >
          {busy === 'sample' ? 'Sample…' : 'GET /sample'}
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-sm text-muted">
          Payload echo
          <input
            className="rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
            value={echoText}
            onChange={(e) => setEchoText(e.target.value)}
          />
        </label>
        <Button
          type="button"
          disabled={busy === 'echo'}
          onClick={() => run('echo', echoTest, setEcho, { message: echoText })}
        >
          {busy === 'echo' ? 'Echo…' : 'POST /echo'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TestResultCard title="Ping" status={ping.status} body={ping.body} />
        <TestResultCard title="Echo" status={echo.status} body={echo.body} />
        <TestResultCard title="Sample cards" status={sample.status} body={sample.body} />
      </div>
    </PageShell>
  );
}
