type SignalCardProps = {
  symbol: string;
  signal: string;
  confidence: number;
};

export default function SignalCard({ symbol, signal, confidence }: SignalCardProps) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-xl font-bold">{symbol}</h3>
      <p>Signal: {signal}</p>
      <p>Confidence: {confidence}%</p>
    </div>
  );
}
