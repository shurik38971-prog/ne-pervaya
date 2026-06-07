import { useState } from "react";
import RewireMessageCard from "@/components/RewireMessageCard";
import { pickRewireMessage } from "@/lib/rewire-messages";
import type { Trigger } from "@/types";

type CravingModeProps = {
  secondsLeft: number;
  timerDone: boolean;
  personalReason: string;
  triggers: Trigger[];
  selectedTrigger: string;
  onSelectTrigger: (name: string) => void;
  onFinish: () => void;
  onRelapse: () => void;
};

export default function CravingMode({
  secondsLeft,
  timerDone,
  personalReason,
  triggers,
  selectedTrigger,
  onSelectTrigger,
  onFinish,
  onRelapse,
}: CravingModeProps) {
  const [rewireMessage] = useState(() => pickRewireMessage());
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <section className="w-full min-w-0 rounded-3xl bg-red-500 p-4 text-center sm:p-5">
      {!timerDone ? (
        <>
          <p className="text-sm opacity-90">Переживи ближайшие 10 минут</p>

          <p className="mt-4 text-5xl font-bold tabular-nums sm:text-6xl">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>

          {personalReason.trim() && (
            <p className="mt-5 rounded-2xl bg-red-600/50 px-4 py-3 text-base font-medium leading-relaxed">
              Ты сам написал: {personalReason}
            </p>
          )}

          <RewireMessageCard message={rewireMessage} variant="craving" />

          <p className="mt-5 text-lg font-semibold">Что вызвало тягу?</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {triggers.map((trigger) => (
              <button
                key={trigger.name}
                type="button"
                onClick={() => onSelectTrigger(trigger.name)}
                className={`min-h-12 rounded-2xl px-3 py-3 text-sm font-bold transition-colors active:scale-95 ${
                  selectedTrigger === trigger.name
                    ? "bg-white text-red-500"
                    : "bg-red-600 text-white"
                }`}
              >
                {trigger.name}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm opacity-90">
            Кнопки результата появятся, когда таймер дойдёт до нуля
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium uppercase tracking-widest opacity-90">
            Время вышло
          </p>
          <p className="mt-4 text-4xl font-extrabold sm:text-5xl">0:00</p>
          <p className="mt-5 text-lg font-semibold leading-relaxed">
            10 минут позади. Как ты?
          </p>

          {selectedTrigger && (
            <p className="mt-4 rounded-2xl bg-red-600/50 px-4 py-3 text-sm">
              Триггер: {selectedTrigger}
            </p>
          )}

          <button
            type="button"
            onClick={onFinish}
            className="mt-8 min-h-14 w-full rounded-2xl bg-white py-4 text-lg font-bold text-red-500 active:scale-95"
          >
            Я справился
          </button>

          <button
            type="button"
            onClick={onRelapse}
            className="mt-3 min-h-14 w-full rounded-2xl bg-red-700 py-4 text-lg font-bold text-white active:scale-95"
          >
            Я сорвался
          </button>
        </>
      )}
    </section>
  );
}
