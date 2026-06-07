"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import AdminFunnel from "@/components/AdminFunnel";
import AdminMetricCard from "@/components/AdminMetricCard";
import AdminRecentEvents from "@/components/AdminRecentEvents";
import AdminTriggersTable from "@/components/AdminTriggersTable";
import { useIsClient } from "@/hooks/useIsClient";
import { getAnonymousUserId, trackEvent } from "@/lib/analytics";
import {
  computeAdminMetrics,
  fetchAdminEvents,
  type AdminMetrics,
} from "@/lib/admin-analytics";
import { getSupabase } from "@/lib/supabase";

type AdminPageState = {
  status: "loading" | "error" | "empty" | "ready";
  errorMessage: string;
  metrics: AdminMetrics | null;
};

type AdminPageAction =
  | { type: "LOADING" }
  | { type: "ERROR"; message: string }
  | { type: "EMPTY" }
  | { type: "READY"; metrics: AdminMetrics };

const initialState: AdminPageState = {
  status: "loading",
  errorMessage: "",
  metrics: null,
};

function adminPageReducer(
  state: AdminPageState,
  action: AdminPageAction
): AdminPageState {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", errorMessage: "", metrics: null };
    case "ERROR":
      return {
        ...state,
        status: "error",
        errorMessage: action.message,
        metrics: null,
      };
    case "EMPTY":
      return { ...state, status: "empty", errorMessage: "", metrics: null };
    case "READY":
      return {
        ...state,
        status: "ready",
        errorMessage: "",
        metrics: action.metrics,
      };
    default:
      return state;
  }
}

export default function AdminPage() {
  const isClient = useIsClient();
  const [state, dispatch] = useReducer(adminPageReducer, initialState);
  const adminOpenedTracked = useRef(false);

  useEffect(() => {
    if (!isClient) return;

    let cancelled = false;

    async function loadAnalytics() {
      dispatch({ type: "LOADING" });

      const supabase = getSupabase();
      if (!supabase) {
        dispatch({
          type: "ERROR",
          message:
            "Supabase не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local",
        });
        return;
      }

      // Для production закрыть чтение events и делать admin через server-side + auth.
      const { events, error } = await fetchAdminEvents(supabase);

      if (cancelled) return;

      if (error) {
        dispatch({
          type: "ERROR",
          message: `Не удалось загрузить события: ${error}`,
        });
        return;
      }

      if (!events || events.length === 0) {
        dispatch({ type: "EMPTY" });
        return;
      }

      dispatch({
        type: "READY",
        metrics: computeAdminMetrics(events),
      });
    }

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  useEffect(() => {
    if (state.status === "loading" || adminOpenedTracked.current) return;

    getAnonymousUserId();
    trackEvent("admin_opened");
    adminOpenedTracked.current = true;
  }, [state.status]);

  if (!isClient || state.status === "loading") {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-red-500">
              Не первая
            </p>
            <h1 className="mt-2 text-3xl font-bold">Аналитика продукта</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
              Метрики по всем пользователям из Supabase. Последние 1000
              событий.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-red-500 px-5 text-sm font-bold text-white transition-transform active:scale-95"
          >
            На главный экран
          </Link>
        </header>

        {state.status === "error" && (
          <section className="rounded-3xl border border-red-500/30 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-red-400">Ошибка</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-300">
              {state.errorMessage}
            </p>
          </section>
        )}

        {state.status === "empty" && (
          <section className="rounded-3xl bg-zinc-900 p-8 text-center">
            <h2 className="text-xl font-semibold">Пока нет данных</h2>
            <p className="mt-3 text-zinc-400">
              События ещё не поступали в Supabase. Откройте приложение и
              выполните несколько действий.
            </p>
          </section>
        )}

        {state.status === "ready" && state.metrics && (
          <>
            <section className="rounded-3xl bg-zinc-900 p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Основные метрики</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <AdminMetricCard
                  label="Уникальных пользователей"
                  value={String(state.metrics.uniqueUsers)}
                  accent
                />
                <AdminMetricCard
                  label="Всего событий"
                  value={String(state.metrics.totalEvents)}
                />
                <AdminMetricCard
                  label="app_opened"
                  value={String(state.metrics.appOpened)}
                />
                <AdminMetricCard
                  label="onboarding_completed"
                  value={String(state.metrics.onboardingCompleted)}
                />
                <AdminMetricCard
                  label="craving_started"
                  value={String(state.metrics.cravingStarted)}
                />
                <AdminMetricCard
                  label="trigger_selected"
                  value={String(state.metrics.triggerSelected)}
                />
                <AdminMetricCard
                  label="craving_won"
                  value={String(state.metrics.cravingWon)}
                />
                <AdminMetricCard
                  label="craving_relapsed"
                  value={String(state.metrics.cravingRelapsed)}
                />
                <div className="col-span-2 lg:col-span-4">
                  <AdminMetricCard
                    label="Антисрыв-коэффициент"
                    value={`${state.metrics.antiRelapseRate}%`}
                    accent
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-zinc-900 p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Воронка</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Уникальные пользователи на каждом шаге
              </p>
              <div className="mt-4">
                <AdminFunnel steps={state.metrics.funnel} />
              </div>
            </section>

            <section className="rounded-3xl bg-zinc-900 p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Топ триггеров</h2>
              <div className="mt-4">
                <AdminTriggersTable triggers={state.metrics.topTriggers} />
              </div>
            </section>

            <section className="rounded-3xl bg-zinc-900 p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Последние события</h2>
              <p className="mt-2 text-sm text-zinc-400">30 последних записей</p>
              <div className="mt-4">
                <AdminRecentEvents events={state.metrics.recentEvents} />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
