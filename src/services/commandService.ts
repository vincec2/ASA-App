import type { TaskCategory } from "../types/domain";

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
    /\b(schedule|add|create)\b.*\b(meeting|event|appointment)\b/i.test(lower) ||
    /\bbook\b.*\b(meeting|event|appointment)\b/i.test(lower)
  );
}

export function parseCalendarCommand(raw: string) {
  let cleaned = removeAssistantPrefix(raw);

  cleaned = cleaned
    .replace(/^(schedule|add|create|book)\s+/i, "")
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

export function parseTaskLikeCommand(raw: string, category: TaskCategory) {
  let cleaned = removeAssistantPrefix(raw);

  if (category === "reminder") {
    cleaned = cleaned.replace(/remind me to/i, "").trim();
  }

  if (category === "follow-up") {
    cleaned = cleaned
      .replace(/create a/i, "")
      .replace(/create/i, "")
      .replace(/add a/i, "")
      .replace(/add/i, "")
      .replace(/follow up/i, "Follow up")
      .trim();
  }

  if (category === "task") {
    cleaned = cleaned
      .replace(/add a task to/i, "")
      .replace(/create a task to/i, "")
      .replace(/add task to/i, "")
      .replace(/create task to/i, "")
      .replace(/add a task/i, "")
      .replace(/create a task/i, "")
      .trim();
  }

  const temporalMatch = cleaned.match(
    /\b(today|tomorrow|tonight|next\s+\w+|this\s+\w+|on\s+\w+|by\s+\w+|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|in\s+\d+\s+\w+)\b/i
  );

  let title = cleaned;
  let dueText = "";

  if (temporalMatch?.index !== undefined) {
    title = cleaned.slice(0, temporalMatch.index).trim();
    dueText = cleaned.slice(temporalMatch.index).trim();
  }

  if (!title && category === "reminder") {
    title = "Reminder";
  }

  if (!title && category === "follow-up") {
    title = "Follow up";
  }

  if (!title && category === "task") {
    title = "Task";
  }

  return {
    title,
    dueText,
  };
}

export function getTaskActionQuery(raw: string) {
  return removeAssistantPrefix(raw)
    .replace(/complete task/i, "")
    .replace(/complete reminder/i, "")
    .replace(/complete follow-up/i, "")
    .replace(/complete follow up/i, "")
    .replace(/mark task complete/i, "")
    .replace(/mark reminder complete/i, "")
    .replace(/delete task/i, "")
    .replace(/delete reminder/i, "")
    .replace(/delete follow-up/i, "")
    .replace(/delete follow up/i, "")
    .trim();
}

export function getCalendarDeleteQuery(raw: string) {
  return removeAssistantPrefix(raw)
    .replace(/delete calendar event/i, "")
    .replace(/delete event/i, "")
    .replace(/delete meeting/i, "")
    .replace(/delete appointment/i, "")
    .replace(/cancel calendar event/i, "")
    .replace(/cancel event/i, "")
    .replace(/cancel meeting/i, "")
    .replace(/cancel appointment/i, "")
    .trim();
}

function splitCommandQueryAndValue(value: string) {
  const match = value.match(/^(.+?)\s+to\s+(.+)$/i);

  if (!match) {
    return null;
  }

  return {
    query: match[1].trim(),
    value: match[2].trim(),
  };
}

export function parseTaskRenameCommand(raw: string) {
  const cleaned = removeAssistantPrefix(raw)
    .replace(/^rename\s+/i, "")
    .replace(/^(task|reminder|follow-up|follow up)\s+/i, "")
    .trim();

  return splitCommandQueryAndValue(cleaned);
}

export function parseTaskMoveCommand(raw: string) {
  const cleaned = removeAssistantPrefix(raw)
    .replace(/^(move|reschedule)\s+/i, "")
    .replace(/^(task|reminder|follow-up|follow up)\s+/i, "")
    .trim();

  const result = splitCommandQueryAndValue(cleaned);

  if (!result) return null;

  return {
    query: result.query,
    dueText: result.value,
  };
}

export function parseCalendarRenameCommand(raw: string) {
  const cleaned = removeAssistantPrefix(raw)
    .replace(/^rename\s+/i, "")
    .replace(/^(calendar event|event|meeting|appointment)\s+/i, "")
    .trim();

  return splitCommandQueryAndValue(cleaned);
}

export function parseCalendarMoveCommand(raw: string) {
  const cleaned = removeAssistantPrefix(raw)
    .replace(/^(move|reschedule)\s+/i, "")
    .replace(/^(calendar event|event|meeting|appointment)\s+/i, "")
    .trim();

  const result = splitCommandQueryAndValue(cleaned);

  if (!result) return null;

  return {
    query: result.query,
    timeText: result.value,
  };
}

export function looksLikeUndoCommand(raw: string) {
  const cleaned = removeAssistantPrefix(raw).toLowerCase();

  return (
    cleaned === "undo" ||
    cleaned === "undo that" ||
    cleaned === "undo last action" ||
    cleaned === "undo the last action" ||
    cleaned === "go back" ||
    cleaned === "revert" ||
    cleaned === "revert last action"
  );
}