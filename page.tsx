export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Voom AI Sniper</h1>
      <p className="mt-4">AI Trading Dashboard</p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">Market Signal</div>
        <div className="rounded-xl border p-4">AI Prediction</div>
        <div className="rounded-xl border p-4">Sniper Engine</div>
      </section>
    </main>
  );
}
