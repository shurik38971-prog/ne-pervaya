type OnboardingProps = {
  quitDate: string;
  cigarettesPerDay: number;
  packPrice: number;
  personalReason: string;
  onQuitDateChange: (value: string) => void;
  onCigarettesPerDayChange: (value: number) => void;
  onPackPriceChange: (value: number) => void;
  onPersonalReasonChange: (value: string) => void;
  onComplete: () => void;
};

export default function Onboarding({
  quitDate,
  cigarettesPerDay,
  packPrice,
  personalReason,
  onQuitDateChange,
  onCigarettesPerDayChange,
  onPackPriceChange,
  onPersonalReasonChange,
  onComplete,
}: OnboardingProps) {
  const canStart = quitDate.length > 0 && cigarettesPerDay > 0;

  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-zinc-950 px-4 py-8 text-white sm:px-5">
      <div className="mx-auto w-full max-w-md min-w-0">
        <section className="rounded-3xl bg-zinc-900 p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-red-500">
              Не первая
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight">
              Начнём с сегодняшнего дня
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Не нужно бросать навсегда. Просто настрой свой первый день без
              первой сигареты.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-zinc-400">
                Дата отказа от курения
              </span>
              <input
                type="date"
                value={quitDate}
                onChange={(e) => onQuitDateChange(e.target.value)}
                className="mt-2 w-full rounded-2xl bg-zinc-800 p-4 text-white outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
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
                  onChange={(e) =>
                    onPackPriceChange(Number(e.target.value) || 0)
                  }
                  className="mt-2 w-full rounded-2xl bg-zinc-800 p-4 text-white outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-zinc-400">
                Почему я решил не курить?
              </span>
              <textarea
                value={personalReason}
                onChange={(e) => onPersonalReasonChange(e.target.value)}
                rows={4}
                placeholder="Например: хочу дышать свободно и не тратить деньги на сигареты"
                className="mt-2 w-full resize-none rounded-2xl bg-zinc-800 p-4 text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onComplete}
            disabled={!canStart}
            className="mt-6 min-h-14 w-full rounded-3xl bg-red-500 py-5 text-xl font-bold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Начать
          </button>
        </section>
      </div>
    </main>
  );
}
