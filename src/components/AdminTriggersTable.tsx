import type { Trigger } from "@/types";

type AdminTriggersTableProps = {
  triggers: Trigger[];
};

export default function AdminTriggersTable({
  triggers,
}: AdminTriggersTableProps) {
  const totalCount = triggers.reduce((sum, trigger) => sum + trigger.count, 0);
  const sortedTriggers = [...triggers].sort((a, b) => b.count - a.count);

  if (totalCount === 0) {
    return (
      <p className="text-base text-zinc-400">Пока нет данных по триггерам.</p>
    );
  }

  return (
    <div className="space-y-3">
      {sortedTriggers.map((trigger) => {
        const percent = Math.round((trigger.count / totalCount) * 100);

        return (
          <div
            key={trigger.name}
            className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-800 p-4"
          >
            <div className="min-w-0">
              <p className="font-medium">{trigger.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{percent}% от всех</p>
            </div>
            <span className="shrink-0 text-xl font-bold text-red-500">
              {trigger.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
