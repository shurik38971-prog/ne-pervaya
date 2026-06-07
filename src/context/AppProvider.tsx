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
  getTopHelpedMethods,
  getTopTriggers,
  initialAppState,
  type AppAction,
  type AppState,
} from "@/lib/app-reducer";
import {
  clearCravingBackgrounded,
  markCravingBackgrounded,
  notifyCravingTimerComplete,
  requestCravingNotifications,
  setupNativeNotificationListeners,
} from "@/lib/craving-notifications";
import {
  clearCravingTimerInWorker,
  registerCravingBackgroundChecks,
  resyncCravingTimerInWorker,
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
  topHelpedMethods: ReturnType<typeof getTopHelpedMethods>;
  startCraving: () => void;
  selectTrigger: (name: string) => void;
  declareCravingWin: () => void;
  selectHelpedMethod: (method: string) => void;
  completeCravingWin: () => void;
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
      helpedMethods: state.helpedMethods,
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
    state.helpedMethods,
  ]);

  useEffect(() => {
    return setupNativeNotificationListeners();
  }, []);

  useEffect(() => {
    if (!state.cravingMode) {
      timerCompletedRef.current = false;
      clearCravingBackgrounded();
      return;
    }

    if (state.cravingTimerDone || state.cravingEndsAt === null) return;

    const completeTimer = () => {
      if (timerCompletedRef.current) return;
      timerCompletedRef.current = true;
      const endsAt = state.cravingEndsAt;
      trackEvent("craving_timer_expired", {
        trigger: state.selectedTrigger || null,
        seconds_left: 0,
      });
      dispatch({ type: "TIMER_COMPLETE" });
      void (async () => {
        await notifyCravingTimerComplete(endsAt);
        await clearCravingTimerInWorker();
      })();
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
      if (document.visibilityState === "visible") {
        tick();
        tryFocusApp();
        return;
      }

      if (!state.cravingEndsAt) return;

      markCravingBackgrounded();
      void resyncCravingTimerInWorker(state.cravingEndsAt);
      void registerCravingBackgroundChecks();
    };

    const onPageHide = () => {
      if (!state.cravingEndsAt) return;
      markCravingBackgrounded();
      void resyncCravingTimerInWorker(state.cravingEndsAt);
      void registerCravingBackgroundChecks();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
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
  const topHelpedMethods = useMemo(
    () => getTopHelpedMethods(state.helpedMethods),
    [state.helpedMethods]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      smokeFreeDays,
      savedMoney,
      topTriggers,
      topHelpedMethods,
      startCraving: () => {
        const endsAt = Date.now() + CRAVING_DURATION_SECONDS * 1000;
        dispatch({ type: "START_CRAVING" });
        clearCravingBackgrounded();
        void (async () => {
          await requestCravingNotifications();
          await scheduleCravingTimerInWorker(endsAt);
        })();
        trackEvent("craving_started");
      },
      selectTrigger: (name) => {
        dispatch({ type: "SELECT_TRIGGER", name });
        trackEvent("trigger_selected", { trigger: name });
      },
      declareCravingWin: () => {
        void clearCravingTimerInWorker();
        dispatch({ type: "DECLARE_CRAVING_WIN" });
        trackEvent("craving_finished", {
          trigger: state.selectedTrigger || null,
          wins: state.wins + 1,
        });
      },
      selectHelpedMethod: (method) => {
        dispatch({ type: "SELECT_HELPED_METHOD", name: method });
        trackEvent("helped_method_selected", {
          method,
          selectedTrigger: state.selectedTrigger || null,
        });
      },
      completeCravingWin: () => {
        dispatch({ type: "CLOSE_CRAVING" });
      },
      relapse: () => {
        void clearCravingTimerInWorker();
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
      topHelpedMethods,
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
