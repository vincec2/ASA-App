export type Page =
  | "assistant"
  | "calendar"
  | "tasks"
  | "meeting-notes"
  | "settings";

export type TaskCategory = "task" | "reminder" | "follow-up";

export type TaskStatus = "open" | "completed";

export type TaskCategoryFilter = "all" | TaskCategory;

export type TaskStatusFilter = "all" | TaskStatus;

export type TaskItem = {
  id: number;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  dueText?: string;
  dueDateISO?: string;
  dueTimeText?: string;
  dueTimeMinutes?: number;
  createdAt: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  timeText: string;
  dateISO?: string;
  timeOfDayText?: string;
  timeMinutes?: number;
};

export type MeetingNote = {
  id: number;
  title: string;
  fileName: string;
  filePath?: string;
  createdAt: string;
};

export type StoredData = {
  tasks: TaskItem[];
  events: CalendarEvent[];
  meetingNotes: MeetingNote[];
};

export type AgendaItemKind = "calendar" | "task";

export type AgendaItem = {
  id: string;
  kind: AgendaItemKind;
  title: string;
  dateISO: string;
  timeText?: string;
  timeMinutes?: number;
  category?: TaskCategory;
  status?: TaskStatus;
  sourceId: number;
};