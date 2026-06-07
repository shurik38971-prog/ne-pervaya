export type Trigger = {
  name: string;
  count: number;
};

export type HelpedMethod = {
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

export const DEFAULT_HELPED_METHODS: HelpedMethod[] = [
  { name: "Выпил воды", count: 0 },
  { name: "Прогулялся", count: 0 },
  { name: "Подышал", count: 0 },
  { name: "Помогла карточка", count: 0 },
  { name: "Отвлёкся на другое", count: 0 },
  { name: "Просто переждал", count: 0 },
  { name: "Другое", count: 0 },
];

export type CravingHelpStep = "none" | "pick_method" | "success";

export const STORAGE_KEYS = {
  quitDate: "quitDate",
  cigarettesPerDay: "cigarettesPerDay",
  packPrice: "packPrice",
  personalReason: "personalReason",
  onboardingCompleted: "onboardingCompleted",
  wins: "wins",
  relapses: "relapses",
  triggers: "triggers",
  helpedMethods: "helpedMethods",
} as const;

export const CRAVING_DURATION_SECONDS = 600;

export const ANALYTICS_USER_ID_KEY = "anonymous_user_id";

export type AnalyticsEventName =
  | "app_opened"
  | "onboarding_completed"
  | "settings_updated"
  | "craving_started"
  | "trigger_selected"
  | "craving_finished"
  | "craving_relapse"
  | "craving_timer_expired"
  | "rewire_message_shown"
  | "helped_method_selected"
  | "feedback_submitted"
  | "admin_opened"
  | "admin_data_reset";

export type AnalyticsEventRow = {
  id?: string;
  user_id: string;
  event_name: AnalyticsEventName;
  properties: Record<string, unknown>;
  created_at?: string;
};
