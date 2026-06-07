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
      <div className="mt-2 rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-left shadow-lg shadow-black/20">
        <p className="text-[10px] font-medium uppercase tracking-widest text-red-400">
          Перепрошивка
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-white">
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
