"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { getAnonymousUserId, trackEvent } from "@/lib/analytics";
import CravingMode from "@/components/CravingMode";
import Header from "@/components/Header";
import Onboarding from "@/components/Onboarding";
import PersonalReason from "@/components/PersonalReason";
import RewireCards from "@/components/RewireCards";
import StartSettings from "@/components/StartSettings";
import StatsPanel from "@/components/StatsPanel";
import TodayPlan from "@/components/TodayPlan";
import TopTriggers from "@/components/TopTriggers";
import { useIsClient } from "@/hooks/useIsClient";
import {
  DEFAULT_APP_DATA,
  loadAppData,
  saveAppData,
  type AppData,
} from "@/lib/storage";
import { CRAVING_DURATION_SECONDS, type Trigger } from "@/types";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

type UIState = {
  hydrated: boolean;
  cravingMode: boolean;
  secondsLeft: number;
  selectedTrigger: string;
};

type State = AppData & UIState;

type Action =
  | { type: "HYDRATE"; payload: AppData }
  | { type: "SET_QUIT_DATE"; value: string }
  | { type: "SET_CIGARETTES_PER_DAY"; value: number }
  | { type: "SET_PACK_PRICE"; value: number }
  | { type: "SET_PERSONAL_REASON"; value: string }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "START_CRAVING" }
  | { type: "TICK_CRAVING" }
  | { type: "END_CRAVING" }
  | { type: "SELECT_TRIGGER"; name: string }
  | { type: "FINISH_CRAVING" }
  | { type: "RELAPSE" };

const initialState: State = {
  ...DEFAULT_APP_DATA,
  hydrated: false,
  cravingMode: false,
  secondsLeft: CRAVING_DURATION_SECONDS,
  selectedTrigger: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };
    case "SET_QUIT_DATE":
      return { ...state, quitDate: action.value };
    case "SET_CIGARETTES_PER_DAY":
      return { ...state, cigarettesPerDay: action.value };
    case "SET_PACK_PRICE":
      return { ...state, packPrice: action.value };
    case "SET_PERSONAL_REASON":
      return { ...state, personalReason: action.value };
    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        quitDate: state.quitDate || todayISO(),
        onboardingCompleted: true,
      };
    case "START_CRAVING":
      return {
        ...state,
        cravingMode: true,
        secondsLeft: CRAVING_DURATION_SECONDS,
        selectedTrigger: "",
      };
    case "TICK_CRAVING":
      return { ...state, secondsLeft: state.secondsLeft - 1 };
    case "END_CRAVING":
      return {
        ...state,
        cravingMode: false,
        secondsLeft: CRAVING_DURATION_SECONDS,
        selectedTrigger: "",
      };
    case "SELECT_TRIGGER":
      return {
        ...state,
        selectedTrigger: action.name,
        triggers: state.triggers.map((trigger) =>
          trigger.name === action.name
            ? { ...trigger, count: trigger.count + 1 }
            : trigger
        ),
      };
    case "FINISH_CRAVING":
      return {
        ...state,
        wins: state.wins + 1,
        cravingMode: false,
        secondsLeft: CRAVING_DURATION_SECONDS,
        selectedTrigger: "",
      };
    case "RELAPSE":
      return {
        ...state,
        relapses: state.relapses + 1,
        cravingMode: false,
        secondsLeft: CRAVING_DURATION_SECONDS,
        selectedTrigger: "",
      };
    default:
      return state;
  }
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

export default function Home() {
  const isClient = useIsClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [referenceTime] = useState(() => Date.now());
  const appOpenedTracked = useRef(false);
  const settingsBaselineSet = useRef(false);

  useEffect(() => {
    if (!isClient) return;
    dispatch({ type: "HYDRATE", payload: loadAppData() });
  }, [isClient]);

  useEffect(() => {
    if (!state.hydrated || appOpenedTracked.current) return;

    getAnonymousUserId();
    trackEvent("app_opened", {
      onboarding_completed: state.onboardingCompleted,
    });
    appOpenedTracked.current = true;
  }, [state.hydrated, state.onboardingCompleted]);

  useEffect(() => {
    if (!state.hydrated || !state.onboardingCompleted) return;

    if (!settingsBaselineSet.current) {
      settingsBaselineSet.current = true;
      return;
    }

    trackEvent("settings_updated", {
      quit_date: state.quitDate,
      cigarettes_per_day: state.cigarettesPerDay,
      pack_price: state.packPrice,
    });
  }, [
    state.hydrated,
    state.onboardingCompleted,
    state.quitDate,
    state.cigarettesPerDay,
    state.packPrice,
  ]);

  useEffect(() => {
    if (!state.hydrated) return;

    saveAppData({
      quitDate: state.quitDate,
      cigarettesPerDay: state.cigarettesPerDay,
      packPrice: state.packPrice,
      personalReason: state.personalReason,
      onboardingCompleted: state.onboardingCompleted,
      wins: state.wins,
      relapses: state.relapses,
      triggers: state.triggers,
    });
  }, [
    state.hydrated,
    state.quitDate,
    state.cigarettesPerDay,
    state.packPrice,
    state.personalReason,
    state.onboardingCompleted,
    state.wins,
    state.relapses,
    state.triggers,
  ]);

  useEffect(() => {
    if (!state.cravingMode || state.secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      if (state.secondsLeft <= 1) {
        trackEvent("craving_timer_expired", {
          trigger: state.selectedTrigger || null,
          seconds_left: state.secondsLeft,
        });
        dispatch({ type: "END_CRAVING" });
      } else {
        dispatch({ type: "TICK_CRAVING" });
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [state.cravingMode, state.secondsLeft, state.selectedTrigger]);

  const smokeFreeDays = getSmokeFreeDays(state.quitDate, referenceTime);
  const savedMoney = Math.round(
    smokeFreeDays * state.cigarettesPerDay * (state.packPrice / 20)
  );

  const topTriggers = [...state.triggers]
    .filter((trigger: Trigger) => trigger.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (!isClient || !state.hydrated) {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  if (!state.onboardingCompleted) {
    return (
      <Onboarding
        quitDate={state.quitDate || todayISO()}
        cigarettesPerDay={state.cigarettesPerDay}
        packPrice={state.packPrice}
        personalReason={state.personalReason}
        onQuitDateChange={(value) =>
          dispatch({ type: "SET_QUIT_DATE", value })
        }
        onCigarettesPerDayChange={(value) =>
          dispatch({ type: "SET_CIGARETTES_PER_DAY", value })
        }
        onPackPriceChange={(value) =>
          dispatch({ type: "SET_PACK_PRICE", value })
        }
        onPersonalReasonChange={(value) =>
          dispatch({ type: "SET_PERSONAL_REASON", value })
        }
        onComplete={() => {
          const quitDate = state.quitDate || todayISO();
          dispatch({ type: "COMPLETE_ONBOARDING" });
          trackEvent("onboarding_completed", {
            quit_date: quitDate,
            cigarettes_per_day: state.cigarettesPerDay,
            pack_price: state.packPrice,
            has_personal_reason: Boolean(state.personalReason.trim()),
          });
        }}
      />
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-4 py-6 text-white sm:px-5">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pb-10">
        <Header />

        <PersonalReason reason={state.personalReason} />

        <StartSettings
          quitDate={state.quitDate}
          cigarettesPerDay={state.cigarettesPerDay}
          packPrice={state.packPrice}
          onQuitDateChange={(value) =>
            dispatch({ type: "SET_QUIT_DATE", value })
          }
          onCigarettesPerDayChange={(value) =>
            dispatch({ type: "SET_CIGARETTES_PER_DAY", value })
          }
          onPackPriceChange={(value) =>
            dispatch({ type: "SET_PACK_PRICE", value })
          }
        />

        <StatsPanel
          smokeFreeDays={smokeFreeDays}
          savedMoney={savedMoney}
          wins={state.wins}
          relapses={state.relapses}
        />

        {!state.cravingMode ? (
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "START_CRAVING" });
              trackEvent("craving_started");
            }}
            className="min-h-14 w-full rounded-3xl bg-red-500 py-5 text-xl font-bold text-white transition-transform active:scale-95"
          >
            Хочу курить
          </button>
        ) : (
          <CravingMode
            secondsLeft={state.secondsLeft}
            personalReason={state.personalReason}
            triggers={state.triggers}
            selectedTrigger={state.selectedTrigger}
            onSelectTrigger={(name) => {
              dispatch({ type: "SELECT_TRIGGER", name });
              trackEvent("trigger_selected", { trigger: name });
            }}
            onFinish={() => {
              dispatch({ type: "FINISH_CRAVING" });
              trackEvent("craving_finished", {
                trigger: state.selectedTrigger || null,
                wins: state.wins + 1,
              });
            }}
            onRelapse={() => {
              dispatch({ type: "RELAPSE" });
              trackEvent("craving_relapse", {
                trigger: state.selectedTrigger || null,
                relapses: state.relapses + 1,
              });
            }}
          />
        )}

        <TodayPlan />
        <RewireCards />
        <TopTriggers triggers={topTriggers} />
      </div>
    </main>
  );
}
