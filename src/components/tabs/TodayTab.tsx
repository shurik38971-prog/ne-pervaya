"use client";

import { useApp } from "@/context/AppProvider";
import TodayMetrics from "@/components/TodayMetrics";

export default function TodayTab() {
  const { state, smokeFreeDays, startCraving } = useApp();

  return (
    <div className="flex min-h-[calc(100dvh-6.5rem)] w-full min-w-0 flex-col">
      <header className="w-full min-w-0 pt-1">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
          Не первая
        </p>

        <h1 className="mt-3 text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl sm:leading-tight">
          Сегодня я не курю.
        </h1>

        <div className="mt-5 max-w-[20rem] text-base leading-relaxed text-zinc-400 sm:max-w-md sm:text-lg">
          <p>
            Антисрыв-приложение для тех,
            <br />
            кто решил не закурить первую сигарету сегодня.
          </p>
          <p className="mt-3">Потому что срыв начинается с первой.</p>
        </div>
      </header>

      <div className="mt-14 sm:mt-16">
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
