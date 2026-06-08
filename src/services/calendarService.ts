import type { CalendarEvent } from "../types/domain";
import { removeAssistantPrefix } from "./commandService";
import { extractDateISOFromText } from "./dateService";
import { extractTimeFromText } from "./timeService";

type CalendarEventUpdateInput = {
  title?: string;
  timeText?: string;
};

function getCalendarScheduleFields(title: string, timeText = "") {
  const combinedText = `${title} ${timeText}`;
  const parsedTime = extractTimeFromText(combinedText);

  return {
    dateISO: extractDateISOFromText(combinedText),
    timeOfDayText: parsedTime?.timeText ?? "",
    timeMinutes: parsedTime?.timeMinutes,
  };
}

export function buildCalendarEvent(
  title: string,
  timeText: string
): CalendarEvent | null {
  const cleanedTitle = title.trim();
  const cleanedTimeText = timeText.trim();

  if (!cleanedTitle) {
    return null;
  }

  return {
    id: Date.now(),
    title: cleanedTitle,
    timeText: cleanedTimeText || "No time set",
    ...getCalendarScheduleFields(cleanedTitle, cleanedTimeText),
  };
}

export function applyCalendarEventUpdate(
  event: CalendarEvent,
  updates: CalendarEventUpdateInput
): CalendarEvent {
  const title = (updates.title ?? event.title).trim();
  const timeText = (updates.timeText ?? event.timeText).trim() || "No time set";

  return {
    ...event,
    title,
    timeText,
    ...getCalendarScheduleFields(title, timeText),
  };
}

export function normalizeCalendarEvent(event: CalendarEvent): CalendarEvent {
  const title = event.title ?? "";
  const timeText = event.timeText || "No time set";
  const scheduleFields = getCalendarScheduleFields(title, timeText);

  return {
    ...event,
    title,
    timeText,
    dateISO: event.dateISO || scheduleFields.dateISO,
    timeOfDayText: event.timeOfDayText || scheduleFields.timeOfDayText,
    timeMinutes:
      typeof event.timeMinutes === "number"
        ? event.timeMinutes
        : scheduleFields.timeMinutes,
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
    const searchableText = `${event.title} ${event.timeText} ${
      event.dateISO ?? ""
    } ${event.timeOfDayText ?? ""}`.toLowerCase();

    return tokens.some((token) => searchableText.includes(token));
  });
}

export function findCalendarEventByQuery(
  events: CalendarEvent[],
  query: string
) {
  const cleanedQuery = query.trim().toLowerCase();

  if (!cleanedQuery) {
    return null;
  }

  return (
    events.find((event) =>
      `${event.title} ${event.timeText} ${event.dateISO ?? ""} ${
        event.timeOfDayText ?? ""
      }`
        .toLowerCase()
        .includes(cleanedQuery)
    ) ?? null
  );
}