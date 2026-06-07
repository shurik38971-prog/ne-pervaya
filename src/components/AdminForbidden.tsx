import Link from "next/link";

export default function AdminForbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 p-8 text-center">
        <p className="text-5xl font-bold text-red-500">403</p>
        <h1 className="mt-4 text-2xl font-bold">Доступ запрещён</h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          У вас нет доступа к этой странице.
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
