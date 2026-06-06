"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import AdminMetricCard from "@/components/AdminMetricCard";
import AdminTriggersTable from "@/components/AdminTriggersTable";
import { useIsClient } from "@/hooks/useIsClient";
import { getAnonymousUserId, trackEvent } from "@/lib/analytics";
import { clearAppData, loadAppData, type AppData } from "@/lib/storage";

type AdminState = {
  loaded: boolean;
  data: AppData | null;
  referenceTime: number;
};

type AdminAction = {
  type: "HYDRATE";
  payload: { data: AppData; referenceTime: number };
};

const initialAdminState: AdminState = {
  loaded: false,
  data: null,
  referenceTime: 0,
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  if (action.type === "HYDRATE") {
    return {
      loaded: true,
      data: action.payload.data,
      referenceTime: action.payload.referenceTime,
    };
  }

  return state;
}

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getSmokeFreeDays(quitDate: string, referenceTime: number) {
  if (!quitDate) return 0;

  return Math.max(
    0,
    Math.floor(
      (referenceTime - new Date(quitDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
}

function getAntiRelapseRate(wins: number, relapses: number) {
  const total = wins + relapses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

function getConclusion(wins: number, relapses: number) {
  const total = wins + relapses;
  if (total === 0) return "Недостаточно данных для вывода.";

  const rate = getAntiRelapseRate(wins, relapses);

  if (rate >= 80) {
    return "Пользователь хорошо справляется с тягой. Продукт помогает удерживать поведение.";
  }

  if (rate >= 50) {
    return "Есть прогресс, но нужны более сильные антисрыв-сценарии.";
  }

  return "Пользователь часто срывается. Нужно усилить режим помощи в момент тяги.";
}

export default function AdminPage() {
  const isClient = useIsClient();
  const [state, dispatch] = useReducer(adminReducer, initialAdminState);
  const adminOpenedTracked = useRef(false);

  useEffect(() => {
    if (!isClient) return;

    dispatch({
      type: "HYDRATE",
      payload: { data: loadAppData(), referenceTime: Date.now() },
    });
  }, [isClient]);

  useEffect(() => {
    if (!state.loaded || adminOpenedTracked.current) return;

    getAnonymousUserId();
    trackEvent("admin_opened");
    adminOpenedTracked.current = true;
  }, [state.loaded]);

  const handleReset = () => {
    const confirmed = window.confirm("Точно удалить все локальные данные?");
    if (!confirmed) return;

    trackEvent("admin_data_reset");
    clearAppData();
    window.location.reload();
  };

  if (!isClient || !state.loaded || !state.data) {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  const { data, referenceTime } = state;
  const smokeFreeDays = getSmokeFreeDays(data.quitDate, referenceTime);
  const savedMoney = Math.round(
    smokeFreeDays * data.cigarettesPerDay * (data.packPrice / 20)
  );
  const totalCravings = data.wins + data.relapses;
  const antiRelapseRate = getAntiRelapseRate(data.wins, data.relapses);
  const conclusion = getConclusion(data.wins, data.relapses);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-4 py-6 text-white sm:px-5">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pb-10">
        <header>
          <p className="text-sm font-medium uppercase tracking-widest text-red-500">
            Не первая
          </p>
          <h1 className="mt-2 text-3xl font-bold">Админка MVP</h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Локальная аналитика пользователя. Данные хранятся только в этом
            браузере.
          </p>
        </header>

        <section className="rounded-3xl bg-zinc-900 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Основные метрики</h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <AdminMetricCard
              label="Дата старта"
              value={formatDate(data.quitDate)}
            />
            <AdminMetricCard
              label="Дней без курения"
              value={String(smokeFreeDays)}
            />
            <AdminMetricCard
              label="Сигарет в день"
              value={String(data.cigarettesPerDay)}
            />
            <AdminMetricCard
              label="Цена пачки"
              value={`${data.packPrice} ₽`}
            />
            <AdminMetricCard
              label="Сэкономлено"
              value={`${savedMoney} ₽`}
              accent
            />
            <AdminMetricCard
              label="Побед над тягой"
              value={String(data.wins)}
            />
            <AdminMetricCard label="Срывов" value={String(data.relapses)} />
            <AdminMetricCard
              label="Всего приступов тяги"
              value={String(totalCravings)}
            />
            <div className="col-span-2">
              <AdminMetricCard
                label="Антисрыв-коэффициент"
                value={`${antiRelapseRate}%`}
                accent
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-zinc-900 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Триггеры</h2>
          <div className="mt-4">
            <AdminTriggersTable triggers={data.triggers} />
          </div>
        </section>

        <section className="rounded-3xl border border-red-500/20 bg-zinc-900 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Вывод</h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-200">
            {conclusion}
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex min-h-14 w-full items-center justify-center rounded-3xl bg-red-500 text-lg font-bold text-white transition-transform active:scale-95"
          >
            На главный экран
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="min-h-14 w-full rounded-3xl border border-zinc-700 bg-zinc-900 py-4 text-lg font-bold text-zinc-200 transition-transform active:scale-95"
          >
            Сбросить данные
          </button>
        </div>
      </div>
    </main>
  );
}
