type Props = {
  score: number;
  rating: string;
};

export default function SniperPanel({ score, rating }: Props) {
  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-2xl font-bold">Sniper AI</h2>
      <p>Score: {score}</p>
      <p>Rating: {rating}</p>
    </div>
  );
}
