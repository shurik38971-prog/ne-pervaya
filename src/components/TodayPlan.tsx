const PLAN_ITEMS = [
  "Сегодня я не курю.",
  'Когда тянет — жму "Хочу курить".',
  "Моя цель — не закурить первую.",
];

export default function TodayPlan() {
  return (
    <section className="rounded-3xl bg-zinc-900 p-5">
      <h2 className="text-xl font-bold">Мой план на сегодня</h2>

      <ul className="mt-4 space-y-3">
        {PLAN_ITEMS.map((item, index) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl bg-zinc-800 p-4"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold">
              {index + 1}
            </span>
            <span className="pt-0.5 text-base leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
