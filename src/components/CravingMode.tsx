import { useEffect, useRef, useState } from "react";
import RewireMessageCard from "@/components/RewireMessageCard";
import { trackEvent } from "@/lib/analytics";
import { pickRewireMessage } from "@/lib/rewire-messages";
import type { CravingHelpStep, HelpedMethod, Trigger } from "@/types";

type CravingModeProps = {
  secondsLeft: number;
  timerDone: boolean;
  cravingHelpStep: CravingHelpStep;
  personalReason: string;
  triggers: Trigger[];
  helpedMethods: HelpedMethod[];
  selectedTrigger: string;
  onSelectTrigger: (name: string) => void;
  onDeclareWin: () => void;
  onSelectHelpedMethod: (method: string) => void;
  onCompleteWin: () => void;
  onRelapse: () => void;
};

const triggerButtonClass = (isSelected: boolean) =>
  `flex min-h-9 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-bold transition-colors active:scale-95 ${
    isSelected ? "bg-white text-red-500" : "bg-red-600 text-white"
  }`;

export default function CravingMode({
  secondsLeft,
  timerDone,
  cravingHelpStep,
  personalReason,
  triggers,
  helpedMethods,
  selectedTrigger,
  onSelectTrigger,
  onDeclareWin,
  onSelectHelpedMethod,
  onCompleteWin,
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

  useEffect(() => {
    if (cravingHelpStep !== "success") return;

    const timeout = window.setTimeout(() => {
      onCompleteWin();
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [cravingHelpStep, onCompleteWin]);

  if (cravingHelpStep === "pick_method") {
    return (
      <section className="w-full min-w-0 rounded-3xl bg-emerald-600 p-3 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-100/90">
          Победа
        </p>
        <h2 className="mt-2 text-xl font-extrabold leading-tight">
          Что помогло тебе справиться?
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {helpedMethods.map((method) => (
            <button
              key={method.name}
              type="button"
              onClick={() => onSelectHelpedMethod(method.name)}
              className="min-h-10 rounded-xl bg-emerald-700 px-2.5 py-2 text-left text-xs font-bold text-white transition-colors active:scale-95 active:bg-emerald-800"
            >
              {method.name}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (cravingHelpStep === "success") {
    return (
      <section className="w-full min-w-0 rounded-3xl bg-emerald-600 p-5 text-center">
        <p className="text-3xl">✓</p>
        <h2 className="mt-2 text-xl font-extrabold">Отлично.</h2>
        <p className="mt-2 text-sm font-medium leading-snug text-emerald-50">
          Ты пережил ещё одну волну тяги.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 rounded-3xl bg-red-500 p-3 text-center">
      {!timerDone ? (
        <>
          <p className="text-sm font-semibold">Что произошло?</p>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {triggers.map((trigger) => {
              const isSelected = selectedTrigger === trigger.name;

              return (
                <button
                  key={trigger.name}
                  type="button"
                  onClick={() => onSelectTrigger(trigger.name)}
                  className={triggerButtonClass(isSelected)}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-red-500 bg-red-500"
                        : "border-white/70 bg-transparent"
                    }`}
                    aria-hidden
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="leading-tight">{trigger.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5">
            <p className="text-[11px] opacity-90">Переживи ближайшие 10 минут</p>
            <p className="mt-0.5 text-4xl font-bold tabular-nums leading-none">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>

          {personalReason.trim() && (
            <div className="mt-2 rounded-2xl border border-white/20 bg-red-600/70 px-3 py-2 text-left">
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/75">
                Ты сам написал:
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white">
                &ldquo;{personalReason}&rdquo;
              </p>
            </div>
          )}

          <RewireMessageCard message={rewirePick.message} variant="craving" />

          <p className="mt-2 text-[10px] leading-tight opacity-75">
            Кнопки результата появятся, когда таймер дойдёт до нуля
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-medium uppercase tracking-widest opacity-90">
            Время вышло
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">0:00</p>
          <p className="mt-2 text-base font-semibold leading-snug">
            10 минут позади. Как ты?
          </p>

          {selectedTrigger && (
            <p className="mt-2 rounded-xl bg-red-600/50 px-3 py-2 text-xs">
              Триггер: {selectedTrigger}
            </p>
          )}

          <RewireMessageCard message={rewirePick.message} variant="craving" />

          <button
            type="button"
            onClick={onDeclareWin}
            className="mt-3 min-h-12 w-full rounded-2xl bg-white py-3 text-base font-bold text-red-500 active:scale-95"
          >
            Я справился
          </button>

          <button
            type="button"
            onClick={onRelapse}
            className="mt-2 min-h-12 w-full rounded-2xl bg-red-700 py-3 text-base font-bold text-white active:scale-95"
          >
            Я сорвался
          </button>
        </>
      )}
    </section>
  );
}
