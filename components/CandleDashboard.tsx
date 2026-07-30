type Props = {
  symbol: string;
  data: number[];
};

export default function CandleDashboard({ symbol, data }: Props) {
  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-xl font-bold">{symbol} Chart</h2>
      <p>{data.length} price points</p>
    </div>
  );
}
