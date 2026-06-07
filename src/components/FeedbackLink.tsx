import Link from "next/link";

type FeedbackLinkProps = {
  variant?: "primary" | "secondary";
};

export default function FeedbackLink({ variant = "secondary" }: FeedbackLinkProps) {
  const className =
    variant === "primary"
      ? "flex min-h-14 w-full items-center justify-center rounded-3xl bg-zinc-900 py-4 text-base font-bold text-white ring-1 ring-zinc-700 transition-transform active:scale-95"
      : "flex min-h-12 w-full items-center justify-center rounded-2xl bg-zinc-800 py-3 text-sm font-semibold text-zinc-200 transition-transform active:scale-95";

  return (
    <Link href="/feedback" className={className}>
      Оставить отзыв
    </Link>
  );
}
