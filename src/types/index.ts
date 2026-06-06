export type Trigger = {
  name: string;
  count: number;
};

export const DEFAULT_TRIGGERS: Trigger[] = [
  { name: "Стресс", count: 0 },
  { name: "Кофе", count: 0 },
  { name: "После еды", count: 0 },
  { name: "Скука", count: 0 },
  { name: "Алкоголь", count: 0 },
  { name: "Злость", count: 0 },
  { name: "За компанию", count: 0 },
  { name: "Привычка", count: 0 },
];

export const STORAGE_KEYS = {
  quitDate: "quitDate",
  cigarettesPerDay: "cigarettesPerDay",
  packPrice: "packPrice",
  personalReason: "personalReason",
  onboardingCompleted: "onboardingCompleted",
  wins: "wins",
  relapses: "relapses",
  triggers: "triggers",
} as const;

export const CRAVING_DURATION_SECONDS = 600;
