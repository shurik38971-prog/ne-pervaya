type PersonalReasonProps = {
  reason: string;
  onReasonChange?: (value: string) => void;
};

export default function PersonalReason({
  reason,
  onReasonChange,
}: PersonalReasonProps) {
  if (!onReasonChange && !reason.trim()) return null;

  return (
    <section className="rounded-3xl border border-red-500/20 bg-zinc-900 p-5">
      <h2 className="text-sm font-medium uppercase tracking-wide text-red-500">
        Почему я решил не курить?
      </h2>

      {onReasonChange ? (
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={4}
          placeholder="Например: хочу дышать свободно"
          className="mt-3 w-full resize-none rounded-2xl bg-zinc-800 p-4 text-base leading-relaxed text-zinc-200 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-red-500/50"
        />
      ) : (
        <p className="mt-3 text-base leading-relaxed text-zinc-200">{reason}</p>
      )}
    </section>
  );
}
