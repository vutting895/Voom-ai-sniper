type Props = {
  prices: number[];
};

export default function PriceChart({ prices }: Props) {
  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-xl font-bold">Market Chart</h2>
      <p>{prices.length} candles loaded</p>
    </div>
  );
}
