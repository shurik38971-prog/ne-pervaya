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
      <div className="mt-5 rounded-3xl border border-white/10 bg-zinc-900 px-5 py-7 text-left shadow-xl shadow-black/30">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Перепрошивка
        </p>
        <p className="mt-3 text-xl font-semibold leading-relaxed text-white sm:text-2xl">
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
