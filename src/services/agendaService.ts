import type { AgendaItem, CalendarEvent, TaskItem } from "../types/domain";
import { addDaysToISODate, getTodayISODate } from "./dateService";
import { getTimeSortValue } from "./timeService";

function compareAgendaItems(a: AgendaItem, b: AgendaItem) {
  if (a.dateISO !== b.dateISO) {
    return a.dateISO.localeCompare(b.dateISO);
  }

  const timeDifference =
    getTimeSortValue(a.timeMinutes) - getTimeSortValue(b.timeMinutes);

  if (timeDifference !== 0) {
    return timeDifference;
  }

  return a.title.localeCompare(b.title);
}

export function buildAgendaItemsForDateRange(
  tasks: TaskItem[],
  events: CalendarEvent[],
  startDateISO: string,
  endDateISO: string
) {
  const calendarItems: AgendaItem[] = events
    .filter((event) => {
      if (!event.dateISO) return false;

      return event.dateISO >= startDateISO && event.dateISO <= endDateISO;
    })
    .map((event) => ({
      id: `calendar-${event.id}`,
      kind: "calendar",
      title: event.title,
      dateISO: event.dateISO || "",
      timeText: event.timeOfDayText || event.timeText,
      timeMinutes: event.timeMinutes,
      sourceId: event.id,
    }));

  const taskItems: AgendaItem[] = tasks
    .filter((task) => {
      if (!task.dueDateISO) return false;
      if (task.status !== "open") return false;

      return task.dueDateISO >= startDateISO && task.dueDateISO <= endDateISO;
    })
    .map((task) => ({
      id: `task-${task.id}`,
      kind: "task",
      title: task.title,
      dateISO: task.dueDateISO || "",
      timeText: task.dueTimeText || task.dueText,
      timeMinutes: task.dueTimeMinutes,
      category: task.category,
      status: task.status,
      sourceId: task.id,
    }));

  return [...calendarItems, ...taskItems].sort(compareAgendaItems);
}

export function buildUpcomingAgendaItems(
  tasks: TaskItem[],
  events: CalendarEvent[],
  numberOfDays: number
) {
  const todayISO = getTodayISODate();
  const endDateISO = addDaysToISODate(todayISO, numberOfDays - 1);

  return buildAgendaItemsForDateRange(tasks, events, todayISO, endDateISO);
}

export function buildNextAgendaItem(tasks: TaskItem[], events: CalendarEvent[]) {
  const upcomingItems = buildUpcomingAgendaItems(tasks, events, 30);

  return upcomingItems[0] ?? null;
}