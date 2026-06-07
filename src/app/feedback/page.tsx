"use client";

import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";
import { AppProvider, useApp } from "@/context/AppProvider";
import { useIsClient } from "@/hooks/useIsClient";

function FeedbackContent() {
  const isClient = useIsClient();
  const { state } = useApp();

  if (!isClient || !state.hydrated) {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  return (
    <main className="w-full min-w-0 bg-zinc-950 px-4 py-8 text-white sm:px-5">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Назад
        </Link>

        <header className="mt-6">
          <p className="text-sm font-medium uppercase tracking-widest text-red-500">
            Не первая
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight">
            Опрос для тестировщиков
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Помоги сделать приложение полезнее. Имя, телефон и email не
            собираем.
          </p>
        </header>

        <div className="mt-8">
          <FeedbackForm
            defaultCigarettesPerDay={state.cigarettesPerDay || 20}
          />
        </div>
      </div>
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <AppProvider>
      <FeedbackContent />
    </AppProvider>
  );
}
