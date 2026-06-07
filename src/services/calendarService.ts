import type { CalendarEvent } from "../types/domain";
import { removeAssistantPrefix } from "./commandService";

export function buildCalendarEvent(
  title: string,
  timeText: string
): CalendarEvent | null {
  const cleanedTitle = title.trim();

  if (!cleanedTitle) {
    return null;
  }

  return {
    id: Date.now(),
    title: cleanedTitle,
    timeText: timeText.trim() || "No time set",
  };
}

export function findCalendarMatches(raw: string, events: CalendarEvent[]) {
  const cleanedQuery = removeAssistantPrefix(raw)
    .replace(/do i have/i, "")
    .replace(/anything scheduled/i, "")
    .replace(/am i free/i, "")
    .replace(/\b(on|at|for|around|during)\b/gi, " ")
    .trim()
    .toLowerCase();

  const ignoredWords = new Set([
    "anything",
    "scheduled",
    "have",
    "free",
    "today",
    "tomorrow",
  ]);

  const tokens = cleanedQuery
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !ignoredWords.has(token));

  if (tokens.length === 0) {
    return events;
  }

  return events.filter((event) => {
    const searchableText = `${event.title} ${event.timeText}`.toLowerCase();

    return tokens.some((token) => searchableText.includes(token));
  });
}