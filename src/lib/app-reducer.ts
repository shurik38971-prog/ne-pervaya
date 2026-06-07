import { DEFAULT_APP_DATA, type AppData } from "@/lib/storage";
import { CRAVING_DURATION_SECONDS, type Trigger } from "@/types";

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export type UIState = {
  hydrated: boolean;
  cravingMode: boolean;
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
  | { type: "TICK_CRAVING" }
  | { type: "END_CRAVING" }
  | { type: "SELECT_TRIGGER"; name: string }
  | { type: "FINISH_CRAVING" }
  | { type: "RELAPSE" };

export const initialAppState: AppState = {
  ...DEFAULT_APP_DATA,
  hydrated: false,
  cravingMode: false,
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
