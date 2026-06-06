const REWIRE_ITEMS = [
  "Сигарета = одышка",
  "Сигарета = запах",
  "Сигарета = деньги на ветер",
  "Сигарета = зависимость",
  "Сигарета = не отдых, а ловушка",
];

export default function RewireCards() {
  return (
    <section>
      <h2 className="text-xl font-bold">Перепрошивка</h2>

      <div className="mt-4 space-y-3">
        {REWIRE_ITEMS.map((text) => (
          <div
            key={text}
            className="rounded-3xl bg-zinc-900 p-4 text-lg font-medium"
          >
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}
