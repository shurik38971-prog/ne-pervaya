import { getSupabase } from "@/lib/supabase";
import { ANALYTICS_USER_ID_KEY, type AnalyticsEventName } from "@/types";

export function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "";

  const existingId = localStorage.getItem(ANALYTICS_USER_ID_KEY);
  if (existingId) return existingId;

  const newId = crypto.randomUUID();
  localStorage.setItem(ANALYTICS_USER_ID_KEY, newId);
  return newId;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {}
) {
  void sendEvent(eventName, payload);
}

async function sendEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown>
) {
  try {
    const supabase = getSupabase();

    if (!supabase) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[analytics]", eventName, payload);
      }
      return;
    }

    const { error } = await supabase.from("events").insert({
      user_id: getAnonymousUserId(),
      event_name: eventName,
      payload,
    });

    if (error) {
      console.warn("[analytics] failed to send event:", error.message);
    }
  } catch (error) {
    console.warn("[analytics] unexpected error:", error);
  }
}
