"use client";

import { useApp } from "@/context/AppProvider";
import TodayMetrics from "@/components/TodayMetrics";

export default function TodayTab() {
  const { state, smokeFreeDays, startCraving } = useApp();

  return (
    <div className="flex min-h-[calc(100dvh-6.5rem)] flex-col">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-red-500">
          Не первая
        </p>
        <h1 className="mt-2 text-2xl font-bold">Сегодня</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Не закури первую сигарету — только этот день
        </p>
      </header>

      <div className="mt-5">
        <TodayMetrics
          smokeFreeDays={smokeFreeDays}
          wins={state.wins}
          relapses={state.relapses}
        />
      </div>

      <div className="flex flex-1 items-end pb-2 pt-8">
        <button
          type="button"
          onClick={startCraving}
          className="min-h-16 w-full rounded-3xl bg-red-500 py-5 text-xl font-bold text-white shadow-lg shadow-red-500/20 transition-transform active:scale-95"
        >
          Меня тянет курить
        </button>
      </div>
    </div>
  );
}
