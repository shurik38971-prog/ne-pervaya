import { useEffect, useRef, useState } from "react";
import RewireMessageCard from "@/components/RewireMessageCard";
import { trackEvent } from "@/lib/analytics";
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
  const [rewirePick] = useState(() => pickRewireMessage());
  const rewireTrackedRef = useRef(false);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (rewireTrackedRef.current) return;

    trackEvent("rewire_message_shown", {
      messageIndex: rewirePick.index,
      triggerName: selectedTrigger || null,
    });

    if (selectedTrigger) {
      rewireTrackedRef.current = true;
    }
  }, [rewirePick.index, selectedTrigger]);

  return (
    <section className="w-full min-w-0 rounded-3xl bg-red-500 p-4 text-center sm:p-5">
      {!timerDone ? (
        <>
          <p className="text-lg font-semibold">Что произошло?</p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {triggers.map((trigger) => {
              const isSelected = selectedTrigger === trigger.name;

              return (
                <button
                  key={trigger.name}
                  type="button"
                  onClick={() => onSelectTrigger(trigger.name)}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors active:scale-95 ${
                    isSelected
                      ? "bg-white text-red-500"
                      : "bg-red-600 text-white"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-red-500 bg-red-500"
                        : "border-white/70 bg-transparent"
                    }`}
                    aria-hidden
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  {trigger.name}
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-sm opacity-90">Переживи ближайшие 10 минут</p>

          <p className="mt-4 text-5xl font-bold tabular-nums sm:text-6xl">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>

          {personalReason.trim() && (
            <div className="mt-6 rounded-3xl border-2 border-white/25 bg-red-600/70 px-5 py-6 text-left shadow-lg shadow-black/25">
              <p className="text-xs font-medium uppercase tracking-widest text-white/80">
                Ты сам написал:
              </p>
              <p className="mt-3 text-xl font-semibold leading-relaxed text-white sm:text-2xl">
                &ldquo;{personalReason}&rdquo;
              </p>
            </div>
          )}

          <RewireMessageCard message={rewirePick.message} variant="craving" />

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

          <RewireMessageCard message={rewirePick.message} variant="craving" />

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
