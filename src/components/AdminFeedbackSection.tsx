import {
  formatEventTime,
  shortenUserId,
  type FeedbackEntry,
} from "@/lib/admin-analytics";

type AdminFeedbackSectionProps = {
  feedback: FeedbackEntry[];
  error?: string | null;
};

export default function AdminFeedbackSection({
  feedback,
  error,
}: AdminFeedbackSectionProps) {
  return (
    <section className="rounded-3xl bg-zinc-900 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Отзывы тестировщиков</h2>
      <p className="mt-2 text-sm text-zinc-400">Последние 20 отзывов</p>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Не удалось загрузить отзывы: {error}
        </p>
      )}

      {!error && feedback.length === 0 && (
        <p className="mt-6 text-center text-zinc-400">Пока нет отзывов.</p>
      )}

      {feedback.length > 0 && (
        <div className="mt-4 space-y-3">
          {feedback.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-zinc-800 p-4 text-sm leading-relaxed"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-zinc-400">
                  {shortenUserId(item.user_id)}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatEventTime(item.created_at)}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-500">Стаж курения</dt>
                  <dd className="font-medium">
                    {item.smoking_years ?? "—"} лет
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Помогло не закурить</dt>
                  <dd className="font-medium">{item.helped_not_smoke ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">
                    Вероятность продолжить
                  </dt>
                  <dd className="font-medium text-red-400">
                    {item.retention_score ?? "—"}/10
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Сигарет в день</dt>
                  <dd className="font-medium">
                    {item.cigarettes_per_day ?? "—"}
                  </dd>
                </div>
              </dl>

              {item.main_improvement && (
                <div className="mt-3 rounded-xl bg-zinc-900/80 p-3">
                  <p className="text-xs text-zinc-500">Улучшить в первую очередь</p>
                  <p className="mt-1 text-zinc-200">{item.main_improvement}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
