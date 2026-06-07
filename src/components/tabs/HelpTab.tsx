"use client";

import { useState } from "react";
import RewireMessageCard from "@/components/RewireMessageCard";
import TodayPlan from "@/components/TodayPlan";
import { pickRewireMessage } from "@/lib/rewire-messages";

export default function HelpTab() {
  const [message] = useState(() => pickRewireMessage().message);

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Помощь</h1>
        <p className="mt-2 text-sm text-zinc-400">
          План на день и фраза, которая помогает пережить тягу
        </p>
      </header>

      <TodayPlan />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Перепрошивка
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Основные антисрыв-фразы показываются в режиме тяги. Здесь — ещё одна
          на случай, если нужна поддержка.
        </p>
        <div className="mt-3">
          <RewireMessageCard message={message} />
        </div>
      </section>
    </div>
  );
}
