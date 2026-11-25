import BridgePanel from "@/components/BridgePanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <h1 className="text-3xl font-bold md:text-4xl">Voom AI Sniper</h1>
      <p className="mt-2 text-slate-400">AI Trading Dashboard</p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Market Signal</div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">AI Prediction</div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Sniper Engine</div>
      </section>

      <BridgePanel />
    </main>
  );
}
