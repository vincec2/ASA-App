export function removeAssistantPrefix(value: string) {
  return value
    .replace(/^hey asa,?\s*/i, "")
    .replace(/^asa,?\s*/i, "")
    .replace(/^can you\s*/i, "")
    .replace(/^please\s*/i, "")
    .trim();
}

export function looksLikeCalendarCreationCommand(value: string) {
  const lower = value.toLowerCase();

  return (
    lower.includes("schedule a meeting") ||
    lower.includes("schedule meeting") ||
    lower.includes("schedule an event") ||
    lower.includes("schedule event") ||
    lower.includes("schedule an appointment") ||
    lower.includes("schedule appointment") ||
    lower.includes("add a meeting") ||
    lower.includes("add meeting") ||
    lower.includes("add an event") ||
    lower.includes("add event") ||
    lower.includes("add an appointment") ||
    lower.includes("add appointment") ||
    lower.includes("create a meeting") ||
    lower.includes("create meeting") ||
    lower.includes("create an event") ||
    lower.includes("create event") ||
    lower.includes("create an appointment") ||
    lower.includes("create appointment")
  );
}

export function parseCalendarCommand(raw: string) {
  let cleaned = removeAssistantPrefix(raw);

  cleaned = cleaned
    .replace(/^schedule\s+/i, "")
    .replace(/^add\s+/i, "")
    .replace(/^create\s+/i, "")
    .replace(/^(a|an)\s+/i, "")
    .trim();

  let eventType = "Event";

  if (/^meeting\b/i.test(cleaned)) {
    eventType = "Meeting";
    cleaned = cleaned.replace(/^meeting\s*/i, "").trim();
  } else if (/^event\b/i.test(cleaned)) {
    eventType = "Event";
    cleaned = cleaned.replace(/^event\s*/i, "").trim();
  } else if (/^appointment\b/i.test(cleaned)) {
    eventType = "Appointment";
    cleaned = cleaned.replace(/^appointment\s*/i, "").trim();
  }

  cleaned = cleaned
    .replace(/^called\s+/i, "")
    .replace(/^titled\s+/i, "")
    .trim();

  const temporalMatch = cleaned.match(
    /\b(today|tomorrow|tonight|next\s+\w+|this\s+\w+|on\s+\w+|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|for\s+\w+)/i
  );

  let title = cleaned;
  let timeText = "No time set";

  if (temporalMatch?.index !== undefined) {
    title = cleaned.slice(0, temporalMatch.index).trim();
    timeText = cleaned.slice(temporalMatch.index).trim();
  }

  if (!title) {
    title = eventType;
  }

  if (eventType === "Meeting" && title.toLowerCase().startsWith("with ")) {
    title = `Meeting ${title}`;
  }

  return {
    title,
    timeText,
  };
}

export function getReminderTitle(raw: string) {
  return raw
    .replace(/^hey asa,?\s*/i, "")
    .replace(/^can you\s*/i, "")
    .replace(/remind me to/i, "")
    .trim();
}

export function getFollowUpTitle(raw: string) {
  return raw
    .replace(/^hey asa,?\s*/i, "")
    .replace(/^can you\s*/i, "")
    .replace(/create a/i, "")
    .replace(/follow up/i, "Follow up")
    .trim();
}

export function getTaskTitle(raw: string) {
  return raw
    .replace(/^hey asa,?\s*/i, "")
    .replace(/^can you\s*/i, "")
    .replace(/add a task to/i, "")
    .replace(/create a task to/i, "")
    .replace(/add a task/i, "")
    .replace(/create a task/i, "")
    .trim();
}

export function getMeetingNoteQuery(raw: string) {
  return raw
    .replace(/^hey asa,?\s*/i, "")
    .replace(/^can you\s*/i, "")
    .replace(/pull up meeting notes from/i, "")
    .replace(/open meeting notes from/i, "")
    .replace(/pull up meeting notes/i, "")
    .replace(/open meeting notes/i, "")
    .trim()
    .toLowerCase();
}