import { getAnonymousUserId, trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/supabase";

export const APP_OPENS_OPTIONS = [
  "1–2 раза",
  "3–5 раз",
  "Более 5 раз",
] as const;

export const MAIN_USAGE_MOMENT_OPTIONS = [
  "Просто посмотреть",
  "Когда хотелось курить",
  "После кофе",
  "После еды",
  "Во время стресса",
  "Другое",
] as const;

export const HELPED_NOT_SMOKE_OPTIONS = ["Да", "Нет", "Не уверен"] as const;

export const WILLINGNESS_TO_PAY_OPTIONS = [
  "Не стал бы платить",
  "До 2 €",
  "2–5 €",
  "5–10 €",
  "Более 10 €",
] as const;

export type FeedbackFormData = {
  smokingYears: number;
  cigarettesPerDay: number;
  appOpens: (typeof APP_OPENS_OPTIONS)[number];
  mainUsageMoment: (typeof MAIN_USAGE_MOMENT_OPTIONS)[number];
  helpedNotSmoke: (typeof HELPED_NOT_SMOKE_OPTIONS)[number];
  helpedSituation: string;
  likedMost: string;
  uselessOrExtra: string;
  missingFeature: string;
  willingnessToPay: (typeof WILLINGNESS_TO_PAY_OPTIONS)[number];
  retentionScore: number;
  mainImprovement: string;
};

export type FeedbackRow = {
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

export async function submitFeedback(data: FeedbackFormData) {
  const supabase = getSupabase();

  if (!supabase) {
    return { ok: false as const, error: "Supabase не настроен" };
  }

  const userId = getAnonymousUserId();

  const { error } = await supabase.from("feedback").insert({
    user_id: userId,
    smoking_years: data.smokingYears,
    cigarettes_per_day: data.cigarettesPerDay,
    app_opens: data.appOpens,
    main_usage_moment: data.mainUsageMoment,
    helped_not_smoke: data.helpedNotSmoke,
    helped_situation: data.helpedSituation.trim() || null,
    liked_most: data.likedMost.trim() || null,
    useless_or_extra: data.uselessOrExtra.trim() || null,
    missing_feature: data.missingFeature.trim() || null,
    willingness_to_pay: data.willingnessToPay,
    retention_score: data.retentionScore,
    main_improvement: data.mainImprovement.trim() || null,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  trackEvent("feedback_submitted", {
    retention_score: data.retentionScore,
    helped_not_smoke: data.helpedNotSmoke,
  });

  return { ok: true as const };
}
