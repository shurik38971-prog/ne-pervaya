import type { FunnelStep } from "@/lib/admin-analytics";

type AdminFunnelProps = {
  steps: FunnelStep[];
};

export default function AdminFunnel({ steps }: AdminFunnelProps) {
  const maxUsers = Math.max(...steps.map((step) => step.users), 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step) => {
        const width = Math.max(12, Math.round((step.users / maxUsers) * 100));

        return (
          <div
            key={step.label}
            className="rounded-2xl bg-zinc-800 p-4"
          >
            <p className="text-sm text-zinc-400">{step.label}</p>
            <p className="mt-2 text-2xl font-bold text-red-500">{step.users}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-700">
              <div
                className="h-full rounded-full bg-red-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">уник. пользователей</p>
          </div>
        );
      })}
    </div>
  );
}
