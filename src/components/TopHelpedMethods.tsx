import type { HelpedMethod } from "@/types";

type TopHelpedMethodsProps = {
  methods: HelpedMethod[];
};

export default function TopHelpedMethods({ methods }: TopHelpedMethodsProps) {
  if (methods.length === 0) return null;

  return (
    <section className="rounded-3xl bg-zinc-900 p-5">
      <h2 className="text-xl font-bold">Что помогает чаще всего</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Топ способов после успешных побед над тягой
      </p>

      <div className="mt-4 space-y-3">
        {methods.map((method, index) => (
          <div
            key={method.name}
            className="flex items-center justify-between rounded-2xl bg-zinc-800 p-4"
          >
            <span className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald-400">
                #{index + 1}
              </span>
              {method.name}
            </span>
            <span className="font-bold">{method.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
