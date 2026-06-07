import type { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseEvent = {
  id: string;
  user_id: string;
  event_name: string;
  properties: Record<string, unknown> | null;
  created_at: string;
};

export type FunnelStep = {
  label: string;
  users: number;
};

export type TriggerStat = {
  name: string;
  count: number;
  percent: number;
};

export type AdminMetrics = {
  uniqueUsers: number;
  totalEvents: number;
  appOpened: number;
  onboardingCompleted: number;
  cravingStarted: number;
  triggerSelected: number;
  cravingWon: number;
  cravingRelapsed: number;
  antiRelapseRate: number;
  funnel: FunnelStep[];
  topTriggers: TriggerStat[];
  recentEvents: SupabaseEvent[];
};

const EVENT_ALIASES = {
  cravingWon: ["craving_won", "craving_finished"],
  cravingRelapsed: ["craving_relapsed", "craving_relapse"],
} as const;

function matchesEvent(eventName: string, names: readonly string[]) {
  return names.includes(eventName);
}

function countEvents(events: SupabaseEvent[], eventName: string) {
  return events.filter((event) => event.event_name === eventName).length;
}

function countEventsAny(events: SupabaseEvent[], names: readonly string[]) {
  return events.filter((event) => matchesEvent(event.event_name, names)).length;
}

function countUniqueUsers(events: SupabaseEvent[], eventName: string) {
  return new Set(
    events.filter((event) => event.event_name === eventName).map((e) => e.user_id)
  ).size;
}

function countUniqueUsersAny(events: SupabaseEvent[], names: readonly string[]) {
  return new Set(
    events
      .filter((event) => matchesEvent(event.event_name, names))
      .map((e) => e.user_id)
  ).size;
}

function getTriggerName(properties: Record<string, unknown> | null) {
  if (!properties) return null;

  const triggerName = properties.triggerName ?? properties.trigger;
  return typeof triggerName === "string" && triggerName.trim()
    ? triggerName.trim()
    : null;
}

function buildTopTriggers(events: SupabaseEvent[]): TriggerStat[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.event_name !== "trigger_selected") continue;

    const name = getTriggerName(event.properties);
    if (!name) continue;

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeAdminMetrics(events: SupabaseEvent[]): AdminMetrics {
  const cravingWon = countEventsAny(events, EVENT_ALIASES.cravingWon);
  const cravingRelapsed = countEventsAny(events, EVENT_ALIASES.cravingRelapsed);
  const cravingOutcomes = cravingWon + cravingRelapsed;

  return {
    uniqueUsers: new Set(events.map((event) => event.user_id)).size,
    totalEvents: events.length,
    appOpened: countEvents(events, "app_opened"),
    onboardingCompleted: countEvents(events, "onboarding_completed"),
    cravingStarted: countEvents(events, "craving_started"),
    triggerSelected: countEvents(events, "trigger_selected"),
    cravingWon,
    cravingRelapsed,
    antiRelapseRate:
      cravingOutcomes === 0
        ? 0
        : Math.round((cravingWon / cravingOutcomes) * 100),
    funnel: [
      {
        label: "Открыли приложение",
        users: countUniqueUsers(events, "app_opened"),
      },
      {
        label: "Завершили онбординг",
        users: countUniqueUsers(events, "onboarding_completed"),
      },
      {
        label: "Запустили режим тяги",
        users: countUniqueUsers(events, "craving_started"),
      },
      {
        label: "Победили тягу",
        users: countUniqueUsersAny(events, EVENT_ALIASES.cravingWon),
      },
      {
        label: "Сорвались",
        users: countUniqueUsersAny(events, EVENT_ALIASES.cravingRelapsed),
      },
    ],
    topTriggers: buildTopTriggers(events),
    recentEvents: events.slice(0, 30),
  };
}

// Для production закрыть чтение events и делать admin через server-side + auth.
export async function fetchAdminEvents(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("events")
    .select("id, user_id, event_name, properties, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return { events: null, error: error.message };
  }

  return {
    events: (data ?? []) as SupabaseEvent[],
    error: null,
  };
}

export type FeedbackEntry = {
  id: number;
  user_id: string;
  smoking_years: number | null;
  cigarettes_per_day: number | null;
  app_opens: string | null;
  main_usage_moment: string | null;
  helped_not_smoke: string | null;
  helped_situation: string | null;
  liked_most: string | null;
  useless_or_extra: string | null;
  missing_feature: string | null;
  willingness_to_pay: string | null;
  retention_score: number | null;
  main_improvement: string | null;
  created_at: string;
};

export async function fetchAdminFeedback(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("feedback")
    .select(
      "id, user_id, smoking_years, cigarettes_per_day, app_opens, main_usage_moment, helped_not_smoke, helped_situation, liked_most, useless_or_extra, missing_feature, willingness_to_pay, retention_score, main_improvement, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return { feedback: null, error: error.message };
  }

  return {
    feedback: (data ?? []) as FeedbackEntry[],
    error: null,
  };
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortenUserId(userId: string) {
  return userId.slice(0, 8);
}

export function formatProperties(properties: Record<string, unknown> | null) {
  if (!properties || Object.keys(properties).length === 0) return "—";

  const text = JSON.stringify(properties);
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}
