import { APP_NAME, SUPPORTED_BROKERS } from '@voom/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const capabilities = ['WebSocket tick streams', 'Real-time ticks', 'Historical candles'];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-cyan-950/40">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Market data foundation</p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{APP_NAME}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Next.js, FastAPI, PostgreSQL, Redis, shared utilities, and broker-ready market data APIs are ready for product development.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="font-semibold text-white">Brokers</h2>
            <p className="mt-2 text-sm text-slate-400">{SUPPORTED_BROKERS.join(' • ')}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="font-semibold text-white">Data</h2>
            <p className="mt-2 text-sm text-slate-400">{capabilities.join(' • ')}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
          <a className="rounded-full bg-cyan-400 px-5 py-3 text-slate-950 transition hover:bg-cyan-300" href={`${apiUrl}/docs`}>
            Open Swagger
          </a>
          <a className="rounded-full border border-slate-700 px-5 py-3 text-slate-200 transition hover:border-cyan-300" href={`${apiUrl}/market/brokers`}>
            View brokers
          </a>
          <a className="rounded-full border border-slate-700 px-5 py-3 text-slate-200 transition hover:border-cyan-300" href={`${apiUrl}/health`}>
            Check API health
          </a>
        </div>
      </section>
    </main>
  );
}
