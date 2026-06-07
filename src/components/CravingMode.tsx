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

function TriggerChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-10 rounded-xl px-2 py-2 text-center text-xs font-bold leading-tight transition-colors active:scale-95 ${
        selected
          ? "bg-white text-red-600 shadow-sm"
          : "bg-red-700/70 text-white ring-1 ring-white/20"
      }`}
    >
      {label}
    </button>
  );
}

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
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

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
      <section className="flex h-full min-h-0 flex-col bg-emerald-600 px-4 pb-8 pt-6 text-white">
        <div className="shrink-0 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100/90">
            Победа
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">
            Что помогло?
          </h2>
        </div>

        <div className="mt-5 grid flex-1 grid-cols-2 content-start gap-2">
          {helpedMethods.map((method) => (
            <button
              key={method.name}
              type="button"
              onClick={() => onSelectHelpedMethod(method.name)}
              className="min-h-12 rounded-2xl bg-emerald-700 px-3 py-3 text-sm font-bold text-white active:scale-95 active:bg-emerald-800"
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
      <section className="flex h-full min-h-0 flex-col items-center justify-center bg-emerald-600 px-6 text-center text-white">
        <p className="text-5xl">✓</p>
        <h2 className="mt-4 text-3xl font-extrabold">Отлично.</h2>
        <p className="mt-3 max-w-xs text-base leading-relaxed text-emerald-50">
          Ты пережил ещё одну волну тяги.
        </p>
      </section>
    );
  }

  if (timerDone) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-red-600 px-4 pb-8 pt-8 text-white">
        <div className="shrink-0 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Время вышло
          </p>
          <p className="mt-2 text-5xl font-extrabold tabular-nums">0:00</p>
          <p className="mt-3 text-lg font-semibold">10 минут позади. Как ты?</p>
          {selectedTrigger && (
            <p className="mt-3 inline-block rounded-full bg-red-700/60 px-3 py-1 text-sm">
              {selectedTrigger}
            </p>
          )}
        </div>

        <div className="mt-5 shrink-0">
          <RewireMessageCard message={rewirePick.message} variant="craving" />
        </div>

        <div className="mt-auto flex shrink-0 flex-col gap-2 pt-6">
          <button
            type="button"
            onClick={onDeclareWin}
            className="min-h-14 w-full rounded-2xl bg-white py-4 text-lg font-bold text-red-600 active:scale-95"
          >
            Я справился
          </button>
          <button
            type="button"
            onClick={onRelapse}
            className="min-h-14 w-full rounded-2xl bg-red-800 py-4 text-lg font-bold text-white active:scale-95"
          >
            Я сорвался
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-red-600 text-white">
      <header className="shrink-0 px-4 pt-4">
        <p className="text-center text-sm font-semibold text-white/95">
          Что произошло?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {triggers.map((trigger) => (
            <TriggerChip
              key={trigger.name}
              label={trigger.name}
              selected={selectedTrigger === trigger.name}
              onSelect={() => onSelectTrigger(trigger.name)}
            />
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-2">
        <p className="text-5xl font-extrabold tabular-nums leading-none tracking-tight">
          {timeLabel}
        </p>
        <p className="mt-2 text-sm font-medium text-white/85">
          Переживи ближайшие 10 минут
        </p>
        {personalReason.trim() && (
          <p className="mt-3 line-clamp-2 max-w-sm text-center text-xs font-medium leading-snug text-white/80">
            &ldquo;{personalReason}&rdquo;
          </p>
        )}
      </div>

      <footer className="shrink-0 space-y-2 px-4 pb-6">
        <RewireMessageCard message={rewirePick.message} variant="craving" />
        <p className="text-center text-[11px] text-white/65">
          Кнопки результата появятся, когда таймер дойдёт до нуля
        </p>
      </footer>
    </section>
  );
}
