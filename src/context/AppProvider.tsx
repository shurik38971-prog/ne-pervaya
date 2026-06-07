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
import {
  clearCravingTimerInWorker,
  notifyCravingTimerComplete,
  requestCravingNotifications,
  scheduleCravingTimerInWorker,
  tryFocusApp,
} from "@/lib/craving-timer";
import { loadAppData, saveAppData } from "@/lib/storage";
import { CRAVING_DURATION_SECONDS } from "@/types";
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
  const [, setDayTick] = useState(0);
  const appOpenedTracked = useRef(false);
  const settingsBaselineSet = useRef(false);
  const timerCompletedRef = useRef(false);

  useEffect(() => {
    if (!isClient) return;
    dispatch({ type: "HYDRATE", payload: loadAppData() });
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const tick = () => setDayTick((value) => value + 1);
    const interval = window.setInterval(tick, 60_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
    if (!state.cravingMode) {
      timerCompletedRef.current = false;
      return;
    }

    if (state.cravingTimerDone || state.cravingEndsAt === null) return;

    const completeTimer = () => {
      if (timerCompletedRef.current) return;
      timerCompletedRef.current = true;
      clearCravingTimerInWorker();
      trackEvent("craving_timer_expired", {
        trigger: state.selectedTrigger || null,
        seconds_left: 0,
      });
      dispatch({ type: "TIMER_COMPLETE" });
      void notifyCravingTimerComplete();
    };

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((state.cravingEndsAt! - Date.now()) / 1000)
      );

      if (remaining <= 0) {
        completeTimer();
        return;
      }

      if (remaining !== state.secondsLeft) {
        dispatch({ type: "SET_SECONDS_LEFT", value: remaining });
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      tick();
      tryFocusApp();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    state.cravingMode,
    state.cravingTimerDone,
    state.cravingEndsAt,
    state.secondsLeft,
    state.selectedTrigger,
  ]);

  const smokeFreeDays = getSmokeFreeDays(state.quitDate, Date.now());
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
        const endsAt = Date.now() + CRAVING_DURATION_SECONDS * 1000;
        dispatch({ type: "START_CRAVING" });
        requestCravingNotifications();
        scheduleCravingTimerInWorker(endsAt);
        trackEvent("craving_started");
      },
      selectTrigger: (name) => {
        dispatch({ type: "SELECT_TRIGGER", name });
        trackEvent("trigger_selected", { trigger: name });
      },
      finishCraving: () => {
        clearCravingTimerInWorker();
        dispatch({ type: "FINISH_CRAVING" });
        trackEvent("craving_finished", {
          trigger: state.selectedTrigger || null,
          wins: state.wins + 1,
        });
      },
      relapse: () => {
        clearCravingTimerInWorker();
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
