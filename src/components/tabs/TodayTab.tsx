"use client";

import { useApp } from "@/context/AppProvider";
import TodayMetrics from "@/components/TodayMetrics";

export default function TodayTab() {
  const { state, smokeFreeDays, startCraving } = useApp();

  return (
    <div className="flex min-h-[calc(100dvh-6.5rem)] flex-col">
      <header className="pt-1">
        <p className="text-sm font-medium uppercase tracking-widest text-red-500">
          Не первая
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Сегодня я не курю.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
          Срыв начинается с первой сигареты.
        </p>
      </header>

      <div className="mt-10">
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
