"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  APP_OPENS_OPTIONS,
  HELPED_NOT_SMOKE_OPTIONS,
  MAIN_USAGE_MOMENT_OPTIONS,
  WILLINGNESS_TO_PAY_OPTIONS,
  submitFeedback,
  type FeedbackFormData,
} from "@/lib/feedback";

const fieldClassName =
  "mt-2 w-full rounded-2xl bg-zinc-800 p-4 text-white outline-none focus:ring-2 focus:ring-red-500/50";

type FeedbackFormProps = {
  defaultCigarettesPerDay?: number;
};

export default function FeedbackForm({
  defaultCigarettesPerDay = 20,
}: FeedbackFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [smokingYears, setSmokingYears] = useState("");
  const [cigarettesPerDay, setCigarettesPerDay] = useState(
    String(defaultCigarettesPerDay)
  );
  const [appOpens, setAppOpens] = useState<FeedbackFormData["appOpens"]>(
    APP_OPENS_OPTIONS[0]
  );
  const [mainUsageMoment, setMainUsageMoment] = useState<
    FeedbackFormData["mainUsageMoment"]
  >(MAIN_USAGE_MOMENT_OPTIONS[0]);
  const [helpedNotSmoke, setHelpedNotSmoke] = useState<
    FeedbackFormData["helpedNotSmoke"]
  >(HELPED_NOT_SMOKE_OPTIONS[0]);
  const [helpedSituation, setHelpedSituation] = useState("");
  const [likedMost, setLikedMost] = useState("");
  const [uselessOrExtra, setUselessOrExtra] = useState("");
  const [missingFeature, setMissingFeature] = useState("");
  const [willingnessToPay, setWillingnessToPay] = useState<
    FeedbackFormData["willingnessToPay"]
  >(WILLINGNESS_TO_PAY_OPTIONS[0]);
  const [retentionScore, setRetentionScore] = useState(7);
  const [mainImprovement, setMainImprovement] = useState("");

  if (submitted) {
    return (
      <section className="rounded-3xl bg-zinc-900 p-6 text-center sm:p-8">
        <p className="text-4xl">✓</p>
        <h2 className="mt-4 text-2xl font-bold">Спасибо.</h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          Это поможет сделать приложение полезнее.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-3xl bg-red-500 px-6 text-lg font-bold text-white active:scale-95"
        >
          На главный экран
        </Link>
      </section>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const years = Number(smokingYears);
    const cigarettes = Number(cigarettesPerDay);

    if (!Number.isFinite(years) || years < 0) {
      setError("Укажи, сколько лет ты куришь.");
      return;
    }

    if (!Number.isFinite(cigarettes) || cigarettes < 1) {
      setError("Укажи количество сигарет в день.");
      return;
    }

    setSubmitting(true);

    const result = await submitFeedback({
      smokingYears: years,
      cigarettesPerDay: cigarettes,
      appOpens,
      mainUsageMoment,
      helpedNotSmoke,
      helpedSituation,
      likedMost,
      uselessOrExtra,
      missingFeature,
      willingnessToPay,
      retentionScore,
      mainImprovement,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="text-sm text-zinc-400">1. Сколько лет ты куришь?</span>
        <input
          type="number"
          min={0}
          required
          value={smokingYears}
          onChange={(e) => setSmokingYears(e.target.value)}
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          2. Сколько сигарет в день обычно выкуриваешь?
        </span>
        <input
          type="number"
          min={1}
          required
          value={cigarettesPerDay}
          onChange={(e) => setCigarettesPerDay(e.target.value)}
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          3. Сколько раз ты открывал приложение?
        </span>
        <select
          value={appOpens}
          onChange={(e) =>
            setAppOpens(e.target.value as FeedbackFormData["appOpens"])
          }
          className={fieldClassName}
        >
          {APP_OPENS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          4. В какой момент ты чаще всего открывал приложение?
        </span>
        <select
          value={mainUsageMoment}
          onChange={(e) =>
            setMainUsageMoment(
              e.target.value as FeedbackFormData["mainUsageMoment"]
            )
          }
          className={fieldClassName}
        >
          {MAIN_USAGE_MOMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          5. Был ли момент, когда приложение реально помогло не закурить?
        </span>
        <select
          value={helpedNotSmoke}
          onChange={(e) =>
            setHelpedNotSmoke(
              e.target.value as FeedbackFormData["helpedNotSmoke"]
            )
          }
          className={fieldClassName}
        >
          {HELPED_NOT_SMOKE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {helpedNotSmoke === "Да" && (
        <label className="block">
          <span className="text-sm text-zinc-400">
            6. Если да — опиши ситуацию.
          </span>
          <textarea
            value={helpedSituation}
            onChange={(e) => setHelpedSituation(e.target.value)}
            rows={4}
            className={`${fieldClassName} resize-none`}
            placeholder="Что произошло и чем помогло приложение?"
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm text-zinc-400">
          7. Что понравилось больше всего?
        </span>
        <textarea
          value={likedMost}
          onChange={(e) => setLikedMost(e.target.value)}
          rows={3}
          className={`${fieldClassName} resize-none`}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          8. Что показалось бесполезным или лишним?
        </span>
        <textarea
          value={uselessOrExtra}
          onChange={(e) => setUselessOrExtra(e.target.value)}
          rows={3}
          className={`${fieldClassName} resize-none`}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          9. Какой функции тебе не хватило?
        </span>
        <textarea
          value={missingFeature}
          onChange={(e) => setMissingFeature(e.target.value)}
          rows={3}
          className={`${fieldClassName} resize-none`}
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-400">
          10. Если бы приложение стало платным, сколько ты был бы готов платить в
          месяц?
        </span>
        <select
          value={willingnessToPay}
          onChange={(e) =>
            setWillingnessToPay(
              e.target.value as FeedbackFormData["willingnessToPay"]
            )
          }
          className={fieldClassName}
        >
          {WILLINGNESS_TO_PAY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="block">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-400">
            11. Насколько вероятно, что ты продолжишь пользоваться приложением?
          </span>
          <span className="text-lg font-bold text-red-400">{retentionScore}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={retentionScore}
          onChange={(e) => setRetentionScore(Number(e.target.value))}
          className="mt-3 w-full accent-red-500"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>1 — маловероятно</span>
          <span>10 — точно да</span>
        </div>
      </div>

      <label className="block">
        <span className="text-sm text-zinc-400">
          12. Что нужно улучшить в первую очередь?
        </span>
        <textarea
          value={mainImprovement}
          onChange={(e) => setMainImprovement(e.target.value)}
          rows={4}
          className={`${fieldClassName} resize-none`}
        />
      </label>

      {error && (
        <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-14 w-full rounded-3xl bg-red-500 py-4 text-lg font-bold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Отправляем…" : "Отправить отзыв"}
      </button>
    </form>
  );
}
