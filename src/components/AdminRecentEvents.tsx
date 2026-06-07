import {
  formatEventTime,
  formatProperties,
  shortenUserId,
  type SupabaseEvent,
} from "@/lib/admin-analytics";

type AdminRecentEventsProps = {
  events: SupabaseEvent[];
};

export default function AdminRecentEvents({ events }: AdminRecentEventsProps) {
  if (events.length === 0) {
    return (
      <p className="text-base text-zinc-400">Событий пока нет.</p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl bg-zinc-800 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-400">{formatEventTime(event.created_at)}</p>
            <p className="font-mono text-xs text-zinc-500">
              {shortenUserId(event.user_id)}
            </p>
          </div>
          <p className="mt-2 font-medium text-red-400">{event.event_name}</p>
          <p className="mt-1 break-all font-mono text-xs leading-relaxed text-zinc-300">
            {formatProperties(event.properties)}
          </p>
        </div>
      ))}
    </div>
  );
}
