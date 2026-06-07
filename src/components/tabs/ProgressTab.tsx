"use client";

import { useApp } from "@/context/AppProvider";
import StatsPanel from "@/components/StatsPanel";
import TopHelpedMethods from "@/components/TopHelpedMethods";
import TopTriggers from "@/components/TopTriggers";

export default function ProgressTab() {
  const { state, smokeFreeDays, savedMoney, topTriggers, topHelpedMethods } =
    useApp();

  const totalCravings = state.wins + state.relapses;
  const antiRelapseRate =
    totalCravings === 0
      ? 0
      : Math.round((state.wins / totalCravings) * 100);

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Прогресс</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Твоя статистика и паттерны тяги
        </p>
      </header>

      <StatsPanel
        smokeFreeDays={smokeFreeDays}
        savedMoney={savedMoney}
        wins={state.wins}
        relapses={state.relapses}
      />

      <section className="rounded-3xl bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">Антисрыв-коэффициент</p>
        <p className="mt-2 text-3xl font-bold text-red-500">
          {antiRelapseRate}%
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Побед над тягой из {totalCravings} приступов
        </p>
      </section>

      <TopTriggers triggers={topTriggers} />

      <TopHelpedMethods methods={topHelpedMethods} />
    </div>
  );
}
