"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getAnonymousUserId, trackEvent } from "@/lib/analytics";
import {
  appReducer,
  getSmokeFreeDays,
  getTopTriggers,
  initialAppState,
  type AppAction,
  type AppState,
} from "@/lib/app-reducer";
import { loadAppData, saveAppData } from "@/lib/storage";
import { useIsClient } from "@/hooks/useIsClient";

type AppContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  smokeFreeDays: number;
  savedMoney: number;
  topTriggers: ReturnType<typeof getTopTriggers>;
  startCraving: () => void;
  selectTrigger: (name: string) => void;
  finishCraving: () => void;
  relapse: () => void;
  completeOnboarding: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const [state, dispatch] = useReducer(appReducer, initialAppState);
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
  const topTriggers = useMemo(
    () => getTopTriggers(state.triggers),
    [state.triggers]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      smokeFreeDays,
      savedMoney,
      topTriggers,
      startCraving: () => {
        dispatch({ type: "START_CRAVING" });
        trackEvent("craving_started");
      },
      selectTrigger: (name) => {
        dispatch({ type: "SELECT_TRIGGER", name });
        trackEvent("trigger_selected", { trigger: name });
      },
      finishCraving: () => {
        dispatch({ type: "FINISH_CRAVING" });
        trackEvent("craving_finished", {
          trigger: state.selectedTrigger || null,
          wins: state.wins + 1,
        });
      },
      relapse: () => {
        dispatch({ type: "RELAPSE" });
        trackEvent("craving_relapse", {
          trigger: state.selectedTrigger || null,
          relapses: state.relapses + 1,
        });
      },
      completeOnboarding: () => {
        dispatch({ type: "COMPLETE_ONBOARDING" });
        trackEvent("onboarding_completed", {
          quit_date: state.quitDate || new Date().toISOString().split("T")[0],
          cigarettes_per_day: state.cigarettesPerDay,
          pack_price: state.packPrice,
          has_personal_reason: Boolean(state.personalReason.trim()),
        });
      },
    }),
    [
      state,
      smokeFreeDays,
      savedMoney,
      topTriggers,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
