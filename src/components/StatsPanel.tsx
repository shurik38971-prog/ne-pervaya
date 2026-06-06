type StatsPanelProps = {
  smokeFreeDays: number;
  savedMoney: number;
  wins: number;
  relapses: number;
};

export default function StatsPanel({
  smokeFreeDays,
  savedMoney,
  wins,
  relapses,
}: StatsPanelProps) {
  return (
    <section className="w-full min-w-0 rounded-3xl bg-zinc-900 p-4 sm:p-5">
      <p className="text-sm text-zinc-400">Сегодня</p>
      <h2 className="mt-2 text-2xl font-semibold">Я не курю</h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Дней без курения</p>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">{smokeFreeDays}</p>
        </div>

        <div className="rounded-2xl bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Сэкономлено</p>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">{savedMoney} ₽</p>
        </div>

        <div className="rounded-2xl bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Побед над тягой</p>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">{wins}</p>
        </div>

        <div className="rounded-2xl bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Срывов</p>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">{relapses}</p>
        </div>
      </div>
    </section>
  );
}
