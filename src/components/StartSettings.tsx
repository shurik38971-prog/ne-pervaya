type StartSettingsProps = {
  quitDate: string;
  cigarettesPerDay: number;
  packPrice: number;
  onQuitDateChange: (value: string) => void;
  onCigarettesPerDayChange: (value: number) => void;
  onPackPriceChange: (value: number) => void;
};

export default function StartSettings({
  quitDate,
  cigarettesPerDay,
  packPrice,
  onQuitDateChange,
  onCigarettesPerDayChange,
  onPackPriceChange,
}: StartSettingsProps) {
  return (
    <section className="rounded-3xl bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold">Настройки старта</h2>

      <label className="mt-4 block">
        <span className="text-sm text-zinc-400">Дата отказа от курения</span>
        <input
          type="date"
          value={quitDate}
          onChange={(e) => onQuitDateChange(e.target.value)}
          className="mt-2 w-full rounded-2xl bg-zinc-800 p-4 text-white outline-none focus:ring-2 focus:ring-red-500/50"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-zinc-400">Сигарет в день</span>
          <input
            type="number"
            min={1}
            value={cigarettesPerDay}
            onChange={(e) =>
              onCigarettesPerDayChange(Number(e.target.value) || 0)
            }
            className="mt-2 w-full rounded-2xl bg-zinc-800 p-4 text-white outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Цена пачки, ₽</span>
          <input
            type="number"
            min={0}
            value={packPrice}
            onChange={(e) => onPackPriceChange(Number(e.target.value) || 0)}
            className="mt-2 w-full rounded-2xl bg-zinc-800 p-4 text-white outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </label>
      </div>
    </section>
  );
}
