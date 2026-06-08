const weekdayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const weekdayNames = Object.keys(weekdayMap);

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function nextWeekdayDate(targetWeekday: number, forceNextWeek: boolean) {
  const today = new Date();
  const currentWeekday = today.getDay();

  let daysUntilTarget = targetWeekday - currentWeekday;

  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  }

  if (forceNextWeek && daysUntilTarget === 0) {
    daysUntilTarget = 7;
  }

  return addDays(today, daysUntilTarget);
}

export function getTodayISODate() {
  return toLocalISODate(new Date());
}

export function extractDateISOFromText(value = "") {
  const lower = value.toLowerCase();

  const explicitDateMatch = lower.match(/\b\d{4}-\d{2}-\d{2}\b/);

  if (explicitDateMatch) {
    return explicitDateMatch[0];
  }

  if (/\b(today|tonight)\b/i.test(lower)) {
    return getTodayISODate();
  }

  if (/\btomorrow\b/i.test(lower)) {
    return toLocalISODate(addDays(new Date(), 1));
  }

  for (const weekdayName of weekdayNames) {
    const targetWeekday = weekdayMap[weekdayName];

    if (new RegExp(`\\bnext\\s+${weekdayName}\\b`, "i").test(lower)) {
      return toLocalISODate(nextWeekdayDate(targetWeekday, true));
    }

    if (
      new RegExp(`\\b(this|on|by)\\s+${weekdayName}\\b`, "i").test(lower) ||
      new RegExp(`\\b${weekdayName}\\b`, "i").test(lower)
    ) {
      return toLocalISODate(nextWeekdayDate(targetWeekday, false));
    }
  }

  return "";
}

export function getDateLabelForISO(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);

  if (!year || !month || !day) {
    return dateISO;
  }

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDateISOFromPlanCommand(raw: string) {
  const extractedDate = extractDateISOFromText(raw);

  if (extractedDate) {
    return extractedDate;
  }

  return getTodayISODate();
}

export function addDaysToISODate(dateISO: string, days: number) {
  const [year, month, day] = dateISO.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return toLocalISODate(date);
}