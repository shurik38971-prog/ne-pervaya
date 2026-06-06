type PersonalReasonProps = {
  reason: string;
};

export default function PersonalReason({ reason }: PersonalReasonProps) {
  if (!reason.trim()) return null;

  return (
    <section className="rounded-3xl border border-red-500/20 bg-zinc-900 p-5">
      <h2 className="text-sm font-medium uppercase tracking-wide text-red-500">
        Моя причина
      </h2>
      <p className="mt-3 text-base leading-relaxed text-zinc-200">{reason}</p>
    </section>
  );
}
