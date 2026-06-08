export type ParsedTime = {
  timeText: string;
  timeMinutes: number;
};

function formatTime(hour24: number, minute: number) {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const displayHour = hour24 % 12 || 12;
  const displayMinute = String(minute).padStart(2, "0");

  return `${displayHour}:${displayMinute} ${suffix}`;
}

function buildParsedTime(hour24: number, minute: number): ParsedTime | null {
  if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return {
    timeText: formatTime(hour24, minute),
    timeMinutes: hour24 * 60 + minute,
  };
}

export function extractTimeFromText(value = ""): ParsedTime | null {
  const lower = value.toLowerCase();

  if (/\bnoon\b/.test(lower)) {
    return buildParsedTime(12, 0);
  }

  if (/\bmidnight\b/.test(lower)) {
    return buildParsedTime(0, 0);
  }

  const meridiemMatch = lower.match(
    /\b(?:at|by|around)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i
  );

  if (meridiemMatch) {
    const rawHour = Number(meridiemMatch[1]);
    const minute = Number(meridiemMatch[2] ?? "0");
    const meridiem = meridiemMatch[3].toLowerCase();

    if (rawHour < 1 || rawHour > 12) {
      return null;
    }

    let hour24 = rawHour;

    if (meridiem === "am" && rawHour === 12) {
      hour24 = 0;
    }

    if (meridiem === "pm" && rawHour !== 12) {
      hour24 = rawHour + 12;
    }

    return buildParsedTime(hour24, minute);
  }

  const twentyFourHourMatch = lower.match(
    /\b(?:at|by|around)?\s*([01]?\d|2[0-3]):([0-5]\d)\b/i
  );

  if (twentyFourHourMatch) {
    const hour24 = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    return buildParsedTime(hour24, minute);
  }

  return null;
}

export function getTimeSortValue(timeMinutes?: number) {
  return typeof timeMinutes === "number" ? timeMinutes : Number.MAX_SAFE_INTEGER;
}