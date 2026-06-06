type AdminMetricCardProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export default function AdminMetricCard({
  label,
  value,
  accent = false,
}: AdminMetricCardProps) {
  return (
    <div className="rounded-2xl bg-zinc-800 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold sm:text-3xl ${
          accent ? "text-red-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
