import type { EventItem } from "@/content/data";

/** Date-only deadlines include the whole named day in Africa/Lagos (UTC+1). */
export function registrationCutoff(date?: string): number | null {
  if (!date) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const calendarDate = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== date) return null;
  }
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? Date.parse(`${date}T00:00:00+01:00`) + 86_400_000
    : Date.parse(date);
  return Number.isFinite(value) ? value : null;
}
export function eventState(event: EventItem, now = Date.now()): "open" | "pending" | "closed" | "results" {
  if (event.registrationStatus === "results") return "results";
  const cutoff = registrationCutoff(event.registrationCloses);
  if (event.registrationStatus === "closed" || (cutoff !== null && now >= cutoff)) return "closed";
  if (event.registrationStatus !== "open" || cutoff === null) return "pending";
  return "open";
}
export function eventStatusLabel(event: EventItem, now = Date.now()) {
  const state = eventState(event, now);
  return state === "open" ? "Registration open" : state === "results" ? "Results published" : state === "closed" ? "Registration closed — awaiting results" : "Registration schedule awaiting confirmation";
}
export function safeEventUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return /^\/(?!\/)/.test(url) || /^https:\/\//.test(url) ? url : undefined;
}
