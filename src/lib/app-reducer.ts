import { DEFAULT_APP_DATA, type AppData } from "@/lib/storage";
import {
  CRAVING_DURATION_SECONDS,
  type CravingHelpStep,
  type HelpedMethod,
  type Trigger,
} from "@/types";

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export type UIState = {
  hydrated: boolean;
  cravingMode: boolean;
  cravingTimerDone: boolean;
  cravingHelpStep: CravingHelpStep;
  cravingEndsAt: number | null;
  secondsLeft: number;
  selectedTrigger: string;
};

export type AppState = AppData & UIState;

export type AppAction =
  | { type: "HYDRATE"; payload: AppData }
  | { type: "SET_QUIT_DATE"; value: string }
  | { type: "SET_CIGARETTES_PER_DAY"; value: number }
  | { type: "SET_PACK_PRICE"; value: number }
  | { type: "SET_PERSONAL_REASON"; value: string }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "START_CRAVING" }
  | { type: "SET_SECONDS_LEFT"; value: number }
  | { type: "TIMER_COMPLETE" }
  | { type: "SELECT_TRIGGER"; name: string }
  | { type: "DECLARE_CRAVING_WIN" }
  | { type: "SELECT_HELPED_METHOD"; name: string }
  | { type: "CLOSE_CRAVING" }
  | { type: "RELAPSE" };

export const initialAppState: AppState = {
  ...DEFAULT_APP_DATA,
  hydrated: false,
  cravingMode: false,
  cravingTimerDone: false,
  cravingHelpStep: "none",
  cravingEndsAt: null,
  secondsLeft: CRAVING_DURATION_SECONDS,
  selectedTrigger: "",
};

export function appReducer(state: AppState, action: AppAction): AppState {
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
        cravingTimerDone: false,
        cravingHelpStep: "none",
        cravingEndsAt: Date.now() + CRAVING_DURATION_SECONDS * 1000,
        secondsLeft: CRAVING_DURATION_SECONDS,
        selectedTrigger: "",
      };
    case "SET_SECONDS_LEFT":
      return { ...state, secondsLeft: action.value };
    case "TIMER_COMPLETE":
      return {
        ...state,
        cravingTimerDone: true,
        secondsLeft: 0,
      };
    case "SELECT_TRIGGER":
      return {
        ...state,
        selectedTrigger: action.name,
      };
    case "DECLARE_CRAVING_WIN":
      return {
        ...state,
        wins: state.wins + 1,
        cravingHelpStep: "pick_method",
        triggers: incrementTriggerIfSelected(state.triggers, state.selectedTrigger),
      };
    case "SELECT_HELPED_METHOD":
      return {
        ...state,
        cravingHelpStep: "success",
        helpedMethods: incrementHelpedMethod(state.helpedMethods, action.name),
      };
    case "CLOSE_CRAVING":
      return {
        ...state,
        cravingMode: false,
        cravingTimerDone: false,
        cravingHelpStep: "none",
        cravingEndsAt: null,
        secondsLeft: CRAVING_DURATION_SECONDS,
        selectedTrigger: "",
      };
    case "RELAPSE":
      return {
        ...state,
        relapses: state.relapses + 1,
        cravingMode: false,
        cravingTimerDone: false,
        cravingHelpStep: "none",
        cravingEndsAt: null,
        secondsLeft: CRAVING_DURATION_SECONDS,
        triggers: incrementTriggerIfSelected(state.triggers, state.selectedTrigger),
        selectedTrigger: "",
      };
    default:
      return state;
  }
}

function incrementTriggerIfSelected(triggers: Trigger[], name: string) {
  if (!name) return triggers;

  return triggers.map((trigger) =>
    trigger.name === name
      ? { ...trigger, count: trigger.count + 1 }
      : trigger
  );
}

function incrementHelpedMethod(methods: HelpedMethod[], name: string) {
  return methods.map((method) =>
    method.name === name ? { ...method, count: method.count + 1 } : method
  );
}

export function getSmokeFreeDays(quitDate: string, referenceTime: number) {
  if (!quitDate) return 0;

  return Math.max(
    0,
    Math.floor(
      (referenceTime - new Date(quitDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
}

export function getTopTriggers(triggers: Trigger[]) {
  return [...triggers]
    .filter((trigger) => trigger.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

export function getTopHelpedMethods(methods: HelpedMethod[]) {
  return [...methods]
    .filter((method) => method.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
