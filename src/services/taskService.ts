import type {
  TaskCategory,
  TaskCategoryFilter,
  TaskItem,
  TaskStatusFilter,
} from "../types/domain";
import { extractDateISOFromText } from "./dateService";
import { extractTimeFromText } from "./timeService";

type TaskUpdateInput = {
  title?: string;
  category?: TaskCategory;
  dueText?: string;
};

function getTaskScheduleFields(title: string, dueText = "") {
  const combinedText = `${title} ${dueText}`;
  const parsedTime = extractTimeFromText(combinedText);

  return {
    dueDateISO: extractDateISOFromText(combinedText),
    dueTimeText: parsedTime?.timeText ?? "",
    dueTimeMinutes: parsedTime?.timeMinutes,
  };
}

export function buildTask(
  title: string,
  category: TaskCategory,
  dueText = ""
): TaskItem | null {
  const cleanedTitle = title.trim();
  const cleanedDueText = dueText.trim();

  if (!cleanedTitle) {
    return null;
  }

  return {
    id: Date.now(),
    title: cleanedTitle,
    category,
    status: "open",
    dueText: cleanedDueText,
    ...getTaskScheduleFields(cleanedTitle, cleanedDueText),
    createdAt: new Date().toLocaleString(),
  };
}

export function applyTaskUpdate(
  task: TaskItem,
  updates: TaskUpdateInput
): TaskItem {
  const title = (updates.title ?? task.title).trim();
  const category = updates.category ?? task.category;
  const dueText = (updates.dueText ?? task.dueText ?? "").trim();

  return {
    ...task,
    title,
    category,
    dueText,
    ...getTaskScheduleFields(title, dueText),
  };
}

export function normalizeTask(task: TaskItem): TaskItem {
  const title = task.title ?? "";
  const dueText = task.dueText ?? "";
  const scheduleFields = getTaskScheduleFields(title, dueText);

  return {
    ...task,
    title,
    category: task.category ?? "task",
    status: task.status === "completed" ? "completed" : "open",
    dueText,
    dueDateISO: task.dueDateISO || scheduleFields.dueDateISO,
    dueTimeText: task.dueTimeText || scheduleFields.dueTimeText,
    dueTimeMinutes:
      typeof task.dueTimeMinutes === "number"
        ? task.dueTimeMinutes
        : scheduleFields.dueTimeMinutes,
    createdAt: task.createdAt || new Date().toLocaleString(),
  };
}

export function findTaskByQuery(tasks: TaskItem[], query: string) {
  const cleanedQuery = query.trim().toLowerCase();

  if (!cleanedQuery) {
    return null;
  }

  return (
    tasks.find((task) =>
      `${task.title} ${task.category} ${task.dueText ?? ""} ${
        task.dueDateISO ?? ""
      } ${task.dueTimeText ?? ""}`
        .toLowerCase()
        .includes(cleanedQuery)
    ) ?? null
  );
}

export function filterTasks(
  tasks: TaskItem[],
  categoryFilter: TaskCategoryFilter,
  statusFilter: TaskStatusFilter
) {
  return tasks.filter((task) => {
    const categoryMatches =
      categoryFilter === "all" || task.category === categoryFilter;

    const statusMatches =
      statusFilter === "all" || task.status === statusFilter;

    return categoryMatches && statusMatches;
  });
}