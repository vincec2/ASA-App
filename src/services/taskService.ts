import type { TaskCategory, TaskItem } from "../types/domain";

export function buildTask(title: string, category: TaskCategory): TaskItem | null {
  const cleanedTitle = title.trim();

  if (!cleanedTitle) {
    return null;
  }

  return {
    id: Date.now(),
    title: cleanedTitle,
    category,
    status: "open",
    createdAt: new Date().toLocaleString(),
  };
}