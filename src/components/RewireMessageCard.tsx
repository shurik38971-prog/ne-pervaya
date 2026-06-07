type RewireMessageCardProps = {
  message: string;
  variant?: "default" | "craving";
};

export default function RewireMessageCard({
  message,
  variant = "default",
}: RewireMessageCardProps) {
  if (variant === "craving") {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-900 px-6 py-7 text-left shadow-xl shadow-black/35">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
          Перепрошивка
        </p>
        <p className="mt-4 text-xl font-semibold leading-relaxed text-white">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-zinc-900 px-5 py-5">
      <p className="text-xl font-medium leading-relaxed text-zinc-100">
        {message}
      </p>
    </div>
  );
}
