import Link from "next/link";
import type { AdminAccessResult } from "@/lib/admin-auth";

type AdminForbiddenProps = {
  reason: Exclude<AdminAccessResult, { ok: true }>["reason"];
};

const MESSAGES: Record<AdminForbiddenProps["reason"], string> = {
  no_secret:
    "ADMIN_SECRET не задан при сборке. Локально: .env.local + npm run dev. На Vercel: Settings → Environment Variables → ADMIN_SECRET → Redeploy.",
  missing_key:
    "Нужен ключ в адресе. Откройте /admin?key=ВАШ_СЕКРЕТ — значение key должно совпадать с ADMIN_SECRET из .env.local.",
  invalid_key:
    "Неверный ключ. Проверьте параметр ?key= в адресе — он должен точно совпадать с ADMIN_SECRET.",
};

export default function AdminForbidden({ reason }: AdminForbiddenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 p-8 text-center">
        <p className="text-5xl font-bold text-red-500">403</p>
        <h1 className="mt-4 text-2xl font-bold">Доступ запрещён</h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          {MESSAGES[reason]}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-red-500 px-6 text-sm font-bold text-white transition-transform active:scale-95"
        >
          На главный экран
        </Link>
      </div>
    </main>
  );
}
