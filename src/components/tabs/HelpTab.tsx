"use client";

import RewireCards from "@/components/RewireCards";
import TodayPlan from "@/components/TodayPlan";

export default function HelpTab() {
  return (
    <div className="flex flex-col gap-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Помощь</h1>
        <p className="mt-2 text-sm text-zinc-400">
          План на день и фразы, которые помогают пережить тягу
        </p>
      </header>

      <TodayPlan />
      <RewireCards />
    </div>
  );
}
