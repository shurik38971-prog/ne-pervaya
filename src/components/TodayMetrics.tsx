type TodayMetricsProps = {
  smokeFreeDays: number;
  wins: number;
  relapses: number;
};

export default function TodayMetrics({
  smokeFreeDays,
  wins,
  relapses,
}: TodayMetricsProps) {
  return (
    <section className="rounded-3xl bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">Сегодня</p>
      <h2 className="mt-1 text-2xl font-semibold">Я не курю</h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-zinc-800 p-3 text-center">
          <p className="text-xs text-zinc-400">Дней</p>
          <p className="mt-1 text-2xl font-bold">{smokeFreeDays}</p>
        </div>
        <div className="rounded-2xl bg-zinc-800 p-3 text-center">
          <p className="text-xs text-zinc-400">Побед</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{wins}</p>
        </div>
        <div className="rounded-2xl bg-zinc-800 p-3 text-center">
          <p className="text-xs text-zinc-400">Срывов</p>
          <p className="mt-1 text-2xl font-bold">{relapses}</p>
        </div>
      </div>
    </section>
  );
}
