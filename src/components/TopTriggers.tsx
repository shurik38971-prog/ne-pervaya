import type { Trigger } from "@/types";

type TopTriggersProps = {
  triggers: Trigger[];
};

export default function TopTriggers({ triggers }: TopTriggersProps) {
  if (triggers.length === 0) return null;

  return (
    <section className="rounded-3xl bg-zinc-900 p-5">
      <h2 className="text-xl font-bold">Твои частые триггеры</h2>

      <div className="mt-4 space-y-3">
        {triggers.map((trigger, index) => (
          <div
            key={trigger.name}
            className="flex items-center justify-between rounded-2xl bg-zinc-800 p-4"
          >
            <span className="flex items-center gap-3">
              <span className="text-sm font-bold text-red-500">
                #{index + 1}
              </span>
              {trigger.name}
            </span>
            <span className="font-bold">{trigger.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
