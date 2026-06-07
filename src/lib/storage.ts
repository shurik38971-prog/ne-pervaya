import { DEFAULT_TRIGGERS, STORAGE_KEYS, type Trigger } from "@/types";

export type AppData = {
  quitDate: string;
  cigarettesPerDay: number;
  packPrice: number;
  personalReason: string;
  onboardingCompleted: boolean;
  wins: number;
  relapses: number;
  triggers: Trigger[];
};

export const DEFAULT_APP_DATA: AppData = {
  quitDate: "",
  cigarettesPerDay: 20,
  packPrice: 250,
  personalReason: "",
  onboardingCompleted: false,
  wins: 0,
  relapses: 0,
  triggers: DEFAULT_TRIGGERS,
};

export function loadAppData(): AppData {
  if (typeof window === "undefined") return DEFAULT_APP_DATA;

  const savedQuitDate = localStorage.getItem(STORAGE_KEYS.quitDate);
  const savedCigarettesPerDay = localStorage.getItem(
    STORAGE_KEYS.cigarettesPerDay
  );
  const savedPackPrice = localStorage.getItem(STORAGE_KEYS.packPrice);
  const savedPersonalReason = localStorage.getItem(STORAGE_KEYS.personalReason);
  const savedOnboardingCompleted = localStorage.getItem(
    STORAGE_KEYS.onboardingCompleted
  );
  const savedWins = localStorage.getItem(STORAGE_KEYS.wins);
  const savedRelapses = localStorage.getItem(STORAGE_KEYS.relapses);
  const savedTriggers = localStorage.getItem(STORAGE_KEYS.triggers);

  let onboardingCompleted = savedOnboardingCompleted === "true";
  if (!onboardingCompleted && savedQuitDate) {
    onboardingCompleted = true;
    localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
  }

  return {
    quitDate: savedQuitDate ?? "",
    cigarettesPerDay: savedCigarettesPerDay
      ? Number(savedCigarettesPerDay)
      : DEFAULT_APP_DATA.cigarettesPerDay,
    packPrice: savedPackPrice
      ? Number(savedPackPrice)
      : DEFAULT_APP_DATA.packPrice,
    personalReason: savedPersonalReason ?? "",
    onboardingCompleted,
    wins: savedWins ? Number(savedWins) : 0,
    relapses: savedRelapses ? Number(savedRelapses) : 0,
    triggers: savedTriggers ? parseTriggers(savedTriggers) : DEFAULT_TRIGGERS,
  };
}

function parseTriggers(raw: string): Trigger[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TRIGGERS;
    return parsed;
  } catch {
    return DEFAULT_TRIGGERS;
  }
}

export function clearAppData() {
  if (typeof window === "undefined") return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") return;

  if (data.quitDate) {
    localStorage.setItem(STORAGE_KEYS.quitDate, data.quitDate);
  }
  localStorage.setItem(
    STORAGE_KEYS.cigarettesPerDay,
    String(data.cigarettesPerDay)
  );
  localStorage.setItem(STORAGE_KEYS.packPrice, String(data.packPrice));
  localStorage.setItem(STORAGE_KEYS.personalReason, data.personalReason);
  localStorage.setItem(
    STORAGE_KEYS.onboardingCompleted,
    String(data.onboardingCompleted)
  );
  localStorage.setItem(STORAGE_KEYS.wins, String(data.wins));
  localStorage.setItem(STORAGE_KEYS.relapses, String(data.relapses));
  localStorage.setItem(STORAGE_KEYS.triggers, JSON.stringify(data.triggers));
}
